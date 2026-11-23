const RESOURCE_HEADER = /^[ \t]*resource\s+"([^"]+)"\s+"([^"]+)"\s*\{/gm;

export function terraformResources(content) {
  const resources = [];
  for (const header of content.matchAll(RESOURCE_HEADER)) {
    const bodyStart = header.index + header[0].length;
    const bodyEnd = closingBraceIndex(content, bodyStart);
    if (bodyEnd === -1) continue;
    resources.push({
      type: header[1],
      name: header[2],
      body: content.slice(bodyStart, bodyEnd),
      bodyStart,
      bodyEnd,
      line: content.slice(0, header.index).split('\n').length,
      indent: header[0].match(/^[ \t]*/)[0]
    });
  }
  return resources;
}

export function hasCompanionResource(content, companionType, bucketName) {
  const reference = new RegExp(`\\baws_s3_bucket\\.${escapeRegExp(bucketName)}\\.`);
  return terraformResources(content).some(r => r.type === companionType && reference.test(r.body));
}

export function setTopLevelAttribute(content, resourceType, resourceName, attribute, value) {
  const resource = terraformResources(content).find(r => r.type === resourceType && r.name === resourceName);
  if (!resource) return content;

  const assignment = new RegExp(`^([ \\t]*${escapeRegExp(attribute)}[ \\t]*=[ \\t]*).*$`);
  for (const line of topLevelLines(content, resource)) {
    const text = content.slice(line.start, line.end);
    if (assignment.test(text)) {
      return content.slice(0, line.start) + text.replace(assignment, `$1${value}`) + content.slice(line.end);
    }
  }

  const inserted = `\n${resource.indent}  ${attribute} = ${value}`;
  return content.slice(0, resource.bodyStart) + inserted + content.slice(resource.bodyStart);
}

export function appendResource(content, block) {
  const separator = content.endsWith('\n\n') || content === '' ? '' : content.endsWith('\n') ? '\n' : '\n\n';
  return `${content}${separator}${block}\n`;
}

function topLevelLines(content, resource) {
  const braces = [...codeBraces(content, resource.bodyStart, resource.bodyEnd)];
  const lines = [];
  let start = resource.bodyStart;
  while (start < resource.bodyEnd) {
    let end = content.indexOf('\n', start);
    if (end === -1 || end > resource.bodyEnd) end = resource.bodyEnd;
    const depth = braces.reduce((d, b) => (b.index < start ? d + (b.char === '{' ? 1 : -1) : d), 0);
    if (depth === 0) lines.push({ start, end });
    start = end + 1;
  }
  return lines;
}

function closingBraceIndex(content, bodyStart) {
  let depth = 1;
  for (const brace of codeBraces(content, bodyStart, content.length)) {
    depth += brace.char === '{' ? 1 : -1;
    if (depth === 0) return brace.index;
  }
  return -1;
}

function* codeBraces(content, from, to) {
  let i = from;
  while (i < to) {
    const char = content[i];
    if (char === '{' || char === '}') {
      yield { index: i, char };
      i++;
    } else if (char === '"') {
      i = endOfString(content, i + 1);
    } else if (char === '#' || content.startsWith('//', i)) {
      const newline = content.indexOf('\n', i);
      i = newline === -1 ? to : newline;
    } else if (content.startsWith('/*', i)) {
      const close = content.indexOf('*/', i + 2);
      i = close === -1 ? to : close + 2;
    } else if (content.startsWith('<<', i)) {
      i = endOfHeredoc(content, i);
    } else {
      i++;
    }
  }
}

function endOfString(content, i) {
  while (i < content.length) {
    if (content[i] === '\\') {
      i += 2;
    } else if (content[i] === '"') {
      return i + 1;
    } else if (content.startsWith('${', i)) {
      i = endOfInterpolation(content, i + 2);
    } else {
      i++;
    }
  }
  return i;
}

function endOfInterpolation(content, i) {
  let depth = 1;
  while (i < content.length && depth > 0) {
    if (content[i] === '"') {
      i = endOfString(content, i + 1);
      continue;
    }
    if (content[i] === '{') depth++;
    if (content[i] === '}') depth--;
    i++;
  }
  return i;
}

function endOfHeredoc(content, i) {
  const opener = /^<<-?([A-Za-z_][A-Za-z0-9_]*)[ \t]*\r?\n/.exec(content.slice(i, i + 200));
  if (!opener) return i + 2;
  const terminator = new RegExp(`^[ \\t]*${opener[1]}[ \\t]*$`, 'm');
  const rest = content.slice(i + opener[0].length);
  const close = terminator.exec(rest);
  return close ? i + opener[0].length + close.index + close[0].length : content.length;
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

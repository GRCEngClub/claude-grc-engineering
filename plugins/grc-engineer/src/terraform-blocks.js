const RESOURCE_HEADER = /^[ \t]*resource\s+"([^"]+)"\s+"([^"]+)"\s*\{/gm;
const ASSIGNMENT = /([A-Za-z_][\w-]*)[ \t]*=(?![=>])[ \t]*/y;
const BLOCK_HEADER = /([A-Za-z_][\w-]*)(?:[ \t]+(?:"[^"\n]*"|[A-Za-z_][\w-]*))*[ \t]*\{/y;

export function terraformResources(content) {
  const { inert, withoutComments } = classify(content);
  const resources = [];
  for (const header of content.matchAll(RESOURCE_HEADER)) {
    const indent = header[0].match(/^[ \t]*/)[0];
    if (inert[header.index + indent.length]) continue;
    const bodyStart = header.index + header[0].length;
    const bodyEnd = closingBraceIndex(content, bodyStart);
    if (bodyEnd === -1) continue;
    resources.push({
      type: header[1],
      name: header[2],
      body: withoutComments.slice(bodyStart, bodyEnd),
      bodyStart,
      bodyEnd,
      line: content.slice(0, header.index).split('\n').length,
      indent
    });
  }
  return resources;
}

export function resourceAttribute(content, resource, attribute) {
  return blockAttributeValues(content, resource, [], attribute)[0] ?? null;
}

export function blockAttributeValues(content, resource, blockPath, attribute) {
  const code = classify(content).withoutComments;
  let ranges = [{ bodyStart: resource.bodyStart, bodyEnd: resource.bodyEnd }];
  for (const blockName of blockPath) {
    ranges = ranges.flatMap(range => (statements(code, range.bodyStart, range.bodyEnd)?.blocks ?? []).filter(b => b.name === blockName));
  }
  return ranges.flatMap(range => (statements(code, range.bodyStart, range.bodyEnd)?.attributes ?? [])
    .filter(a => a.name === attribute)
    .map(a => code.slice(a.valueStart, a.valueEnd).trim()));
}

export function hasBlock(content, resource, blockName) {
  const parsed = statements(classify(content).withoutComments, resource.bodyStart, resource.bodyEnd);
  return parsed !== null && parsed.blocks.some(b => b.name === blockName);
}

export function companionCoverage(content, companionType, bucketName) {
  const all = terraformResources(content);
  const bucket = all.find(r => r.type === 'aws_s3_bucket' && r.name === bucketName);
  const compact = (resource, attribute) => (resourceAttribute(content, resource, attribute) ?? '').replace(/\s+/g, '');
  const bucketCount = bucket ? compact(bucket, 'count') : '';
  const bucketForEach = bucket ? compact(bucket, 'for_each') : '';

  const address = `aws_s3_bucket.${bucketName}`;
  const mention = new RegExp(`\\b${escapeRegExp(address)}(?![\\w-])`);
  const coverage = { resources: [], unresolved: [] };

  for (const resource of all) {
    if (resource.type !== companionType) continue;
    const count = compact(resource, 'count');
    const forEach = compact(resource, 'for_each');
    const reference = compact(resource, 'bucket').replace(/^"\$\{(.*)\}"$/, '$1').replace(/\.(?:id|bucket)$/, '');

    const covers =
      (reference === address && !bucketCount && !bucketForEach && !count && !forEach)
      || (reference === `${address}[count.index]` && (count === `length(${address})` || (count !== '' && count === bucketCount)))
      || (reference === `${address}[each.key]` && (forEach === address || (forEach !== '' && forEach === bucketForEach)))
      || (reference === 'each.value' && forEach === address);

    if (covers) {
      coverage.resources.push(resource);
    } else if (mention.test(reference) || mention.test(forEach) || mention.test(count)) {
      coverage.unresolved.push(resource);
    }
  }
  return coverage;
}

export function setTopLevelAttribute(content, resourceType, resourceName, attribute, value) {
  const resource = terraformResources(content).find(r => r.type === resourceType && r.name === resourceName);
  if (!resource) return content;
  const parsed = statements(classify(content).withoutComments, resource.bodyStart, resource.bodyEnd);
  if (!parsed) return content;

  const existing = parsed.attributes.find(a => a.name === attribute);
  if (existing) {
    return content.slice(0, existing.valueStart) + value + content.slice(existing.valueEnd);
  }

  const inserted = `\n${resource.indent}  ${attribute} = ${value}`;
  return content.slice(0, resource.bodyStart) + inserted + content.slice(resource.bodyStart);
}

export function appendResource(content, block) {
  const separator = content.endsWith('\n\n') || content === '' ? '' : content.endsWith('\n') ? '\n' : '\n\n';
  return `${content}${separator}${block}\n`;
}

let classified = { content: null, result: null };

function classify(content) {
  if (classified.content !== content) {
    classified = { content, result: classifyUncached(content) };
  }
  return classified.result;
}

function classifyUncached(content) {
  const inert = new Uint8Array(content.length);
  let withoutComments = '';
  let copied = 0;
  for (const token of tokens(content, 0, content.length)) {
    if (token.kind === 'bracket' || token.kind === 'newline') continue;
    inert.fill(1, token.start, token.end);
    if (token.kind === 'comment') {
      withoutComments += content.slice(copied, token.start) + content.slice(token.start, token.end).replace(/[^\n]/g, ' ');
      copied = token.end;
    }
  }
  return { inert, withoutComments: withoutComments + content.slice(copied) };
}

function statements(code, start, end) {
  const attributes = [];
  const blocks = [];
  let pos = start;
  while (pos < end) {
    if (/\s/.test(code[pos])) {
      pos++;
      continue;
    }
    ASSIGNMENT.lastIndex = pos;
    const assignment = ASSIGNMENT.exec(code);
    BLOCK_HEADER.lastIndex = pos;
    const block = assignment ? null : BLOCK_HEADER.exec(code);
    if (block) {
      const bodyStart = pos + block[0].length;
      const bodyEnd = closingBraceIndex(code, bodyStart);
      if (bodyEnd === -1 || bodyEnd > end) return null;
      const dynamicLabel = block[1] === 'dynamic' ? /"([^"\n]*)"/.exec(block[0])?.[1] : undefined;
      blocks.push({ name: dynamicLabel ?? block[1], bodyStart, bodyEnd });
      pos = bodyEnd + 1;
      continue;
    }
    const valueStart = assignment ? pos + assignment[0].length : pos;
    const stop = expressionEnd(code, valueStart, end);
    if (stop === null) return null;
    if (assignment) {
      const valueEnd = valueStart + code.slice(valueStart, stop).trimEnd().length;
      attributes.push({ name: assignment[1], valueStart, valueEnd });
    }
    pos = Math.max(stop, pos + 1);
  }
  return { attributes, blocks };
}

function expressionEnd(code, start, limit) {
  let depth = 0;
  for (const token of tokens(code, start, limit)) {
    if (token.kind === 'bracket') {
      depth += '{[('.includes(token.char) ? 1 : -1;
      if (depth < 0) return null;
    } else if (depth === 0 && token.kind === 'newline') {
      return token.start;
    }
  }
  return depth === 0 ? limit : null;
}

function closingBraceIndex(content, bodyStart) {
  let depth = 1;
  for (const token of tokens(content, bodyStart, content.length)) {
    if (token.char !== '{' && token.char !== '}') continue;
    depth += token.char === '{' ? 1 : -1;
    if (depth === 0) return token.start;
  }
  return -1;
}

function* tokens(content, from, to) {
  let i = from;
  while (i < to) {
    const char = content[i];
    if ('{}[]()'.includes(char)) {
      yield { kind: 'bracket', start: i, end: i + 1, char };
      i++;
    } else if (char === '\n') {
      yield { kind: 'newline', start: i, end: i + 1 };
      i++;
    } else if (char === '"') {
      const end = endOfString(content, i + 1);
      yield { kind: 'string', start: i, end };
      i = end;
    } else if (char === '#' || content.startsWith('//', i)) {
      const newline = content.indexOf('\n', i);
      const end = newline === -1 ? content.length : newline;
      yield { kind: 'comment', start: i, end };
      i = end;
    } else if (content.startsWith('/*', i)) {
      const close = content.indexOf('*/', i + 2);
      const end = close === -1 ? content.length : close + 2;
      yield { kind: 'comment', start: i, end };
      i = end;
    } else if (content.startsWith('<<', i)) {
      const end = endOfHeredoc(content, i);
      yield { kind: 'heredoc', start: i, end };
      i = end;
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

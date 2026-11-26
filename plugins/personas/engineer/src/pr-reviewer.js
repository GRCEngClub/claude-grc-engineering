const GITHUB_API = process.env.GITHUB_API_URL || 'https://api.github.com';

async function github(pathname, token) {
  const response = await fetch(`${GITHUB_API}${pathname}`, {
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'x-github-api-version': '2022-11-28',
      'user-agent': 'claude-grc-review-pr'
    }
  });
  if (!response.ok) {
    const error = new Error(`GitHub API ${response.status} for ${pathname}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

async function listPullFiles(base, token) {
  const files = [];
  for (let page = 1; ; page += 1) {
    const batch = await github(`${base}/files?per_page=100&page=${page}`, token);
    files.push(...batch);
    if (batch.length < 100) return files;
  }
}

const encodePath = filePath => filePath.split('/').map(encodeURIComponent).join('/');

const COMPLIANCE_CHECKS = {
  privilege_escalation: {
    patterns: [
      /AdministratorAccess/i,
      /\*.*\*/,
      /"Action":\s*"\*"/,
      /full.*access/i
    ],
    frameworks: {
      SOC2: 'CC6.1',
      ISO27001: 'A.8.2',
      NIST80053: 'AC-6'
    },
    severity: 'high',
    message: 'This change introduces overly permissive access, violating the Least Privilege principle.'
  },
  missing_encryption: {
    patterns: [
      /storage_encrypted\s*=\s*false/i,
      /encrypted\s*=\s*false/i,
      /encryption.*disabled/i
    ],
    frameworks: {
      SOC2: 'CC7.2',
      ISO27001: 'A.8.24',
      NIST80053: 'SC-28'
    },
    severity: 'high',
    message: 'This change disables encryption, which violates data protection requirements.'
  },
  missing_tags: {
    patterns: [
      /tags\s*=\s*\{\}/,
      /tags\s*=\s*null/,
      /#.*missing.*tag/i
    ],
    frameworks: {
      SOC2: 'CC7.1',
      ISO27001: 'A.5.12'
    },
    severity: 'medium',
    message: 'This change creates resources without required tags for governance and compliance tracking.'
  },
  public_access: {
    patterns: [
      /public_access_block\s*=\s*null/i,
      /public.*true/i,
      /publicly_accessible\s*=\s*true/i
    ],
    frameworks: {
      SOC2: 'CC7.2',
      ISO27001: 'A.8.20',
      NIST80053: 'AC-4'
    },
    severity: 'critical',
    message: 'This change exposes resources to public access, creating a significant security risk.'
  }
};

export async function reviewPR(repo, prNumber, framework = 'SOC2', githubToken) {
  if (!githubToken) {
    throw new Error('GITHUB_TOKEN environment variable is required');
  }

  const [owner, repoName] = repo.split('/');
  if (!owner || !repoName) {
    throw new Error(`Repository must be owner/name, got "${repo}"`);
  }
  const repoBase = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}`;
  const pullBase = `${repoBase}/pulls/${encodeURIComponent(prNumber)}`;

  const pr = await github(pullBase, githubToken);
  const files = await listPullFiles(pullBase, githubToken);

  const issues = [];

  for (const file of files) {
    if (file.status === 'removed') continue;

    let content = '';
    if (file.patch) {
      content = file.patch;
    } else {
      try {
        const fileData = await github(
          `${repoBase}/contents/${encodePath(file.filename)}?ref=${encodeURIComponent(pr.head.sha)}`,
          githubToken
        );
        if (fileData.type === 'file' && 'content' in fileData) {
          content = Buffer.from(fileData.content, 'base64').toString('utf-8');
        }
      } catch (err) {
        continue;
      }
    }

    const fileIssues = analyzeFile(file.filename, content, framework);
    issues.push(...fileIssues);
  }

  const comments = generateComments(issues, framework);

  return {
    pr: {
      number: prNumber,
      title: pr.title,
      url: pr.html_url
    },
    issues,
    comments,
    summary: {
      total: issues.length,
      critical: issues.filter(i => i.severity === 'critical').length,
      high: issues.filter(i => i.severity === 'high').length,
      medium: issues.filter(i => i.severity === 'medium').length
    }
  };
}

function analyzeFile(filename, content, framework) {
  const issues = [];
  const lines = content.split('\n');

  for (const [checkName, check] of Object.entries(COMPLIANCE_CHECKS)) {
    const controlId = check.frameworks[framework];
    if (!controlId) continue;

    for (const pattern of check.patterns) {
      lines.forEach((line, index) => {
        if (pattern.test(line)) {
          const isAddition = line.startsWith('+') || !line.startsWith('-');
          
          if (isAddition) {
            issues.push({
              check: checkName,
              file: filename,
              line: index + 1,
              content: line.trim(),
              severity: check.severity,
              control: controlId,
              framework,
              message: check.message
            });
          }
        }
      });
    }
  }

  return issues;
}

function generateComments(issues, framework) {
  const comments = [];

  for (const issue of issues) {
    const emoji = {
      critical: '🚨',
      high: '⚠️',
      medium: '📝'
    }[issue.severity] || 'ℹ️';

    const comment = {
      path: issue.file,
      line: issue.line,
      body: `${emoji} **Compliance Warning: ${framework} ${issue.control}**\n\n` +
            `${issue.message}\n\n` +
            `**Issue:** Line ${issue.line} in \`${issue.file}\`\n` +
            `\`\`\`\n${issue.content}\n\`\`\`\n\n` +
            `**Control Reference:** ${framework} ${issue.control}\n\n` +
            `**Suggested Fix:**\n` +
            generateSuggestion(issue.check) +
            `\n---\n` +
            `*This review was generated by the GRC Engineering Plugin*`
    };

    comments.push(comment);
  }

  return comments;
}

function generateSuggestion(checkName) {
  const suggestions = {
    privilege_escalation: `\`\`\`hcl
resource "aws_iam_role" "app_role" {
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "s3:GetObject",
        "s3:PutObject"
      ]
      Resource = "arn:aws:s3:::my-bucket/*"
    }]
  })
}
\`\`\`
Use least privilege: only grant the minimum permissions required.`,
    missing_encryption: `\`\`\`hcl
resource "aws_db_instance" "example" {
  storage_encrypted = true
  kms_key_id        = aws_kms_key.example.arn
}
\`\`\`
Enable encryption at rest for all data storage.`,
    missing_tags: `\`\`\`hcl
resource "aws_s3_bucket" "example" {
  tags = {
    Department = "Engineering"
    Environment = "Production"
    Compliance = "SOC2"
  }
}
\`\`\`
Add required tags for governance and compliance tracking.`,
    public_access: `\`\`\`hcl
resource "aws_s3_bucket_public_access_block" "example" {
  bucket = aws_s3_bucket.example.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
\`\`\`
Block public access to prevent unauthorized exposure.`
  };

  return suggestions[checkName] || 'Please review and ensure compliance with the control requirements.';
}


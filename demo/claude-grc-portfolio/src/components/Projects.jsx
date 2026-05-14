const projects = [
  {
    name: 'GRC Engineering Toolkit',
    description: '30+ open-source Claude Code plugins for GRC professionals — cross-framework control crosswalk covering 300+ controls across 7 frameworks, policy-as-code generation (OPA/Rego, Sentinel, AWS Config), IaC scanning with auto-fix, and continuous compliance monitoring with Slack alerting.',
    technologies: ['Claude Code', 'Node.js', 'YAML', 'OSCAL', 'Python'],
    url: 'https://github.com/GRCEngClub/claude-grc-engineering',
    highlights: [
      'Reduces multi-framework compliance effort by 56%',
      '30+ plugins covering SOC 2, FedRAMP, NIST, ISO, PCI-DSS, CMMC, HITRUST',
      'Cross-framework control crosswalk: implement once, satisfy many',
    ],
  },
  {
    name: 'AWS Inspector Connector',
    description: 'Tier-1 connector that collects security findings from AWS Inspector v2, maps them to NIST 800-53, SOC 2, and FedRAMP controls, and emits structured findings in a normalized JSON schema. Supports EC2, container image, and Lambda function scanning.',
    technologies: ['AWS Inspector v2', 'AWS Lambda', 'Node.js', 'NIST 800-53', 'SOC 2'],
    url: 'https://github.com/GRCEngClub/claude-grc-engineering/tree/main/plugins/connectors/aws-inspector',
    highlights: [
      'Real-time control mapping to 7+ frameworks',
      'Normalized finding schema for audit-ready export',
      'Auto-generates evidence artifacts',
    ],
  },
  {
    name: 'Cross-Framework Control Crosswalk',
    description: 'YAML database mapping 300+ security controls across SOC 2, PCI-DSS, NIST 800-53, ISO 27001, CIS Controls, CMMC, and FedRAMP. Identifies "implement once, satisfy many" opportunities and provides cloud implementation patterns for AWS, Azure, and GCP.',
    technologies: ['YAML', 'Node.js', 'SOC 2', 'NIST 800-53', 'ISO 27001', 'PCI-DSS', 'FedRAMP'],
    url: 'https://github.com/GRCEngClub/claude-grc-engineering/blob/main/plugins/grc-engineer/config/control-crosswalk.yaml',
    highlights: [
      '300+ controls mapped across 7 frameworks',
      '56% average effort reduction on multi-framework programs',
      'Conflict detection and resolution guidance',
    ],
  },
  {
    name: 'GRC Portfolio Builder (This Site)',
    description: 'A Claude Code plugin that walks GRC engineers through building and deploying a professional portfolio website with GRC-specific prompts for frameworks, certifications, and accomplishments. Deploys to AWS with S3, CloudFront, and GitHub Actions CI/CD via OIDC.',
    technologies: ['Claude Code', 'React', 'Vite', 'AWS CloudFormation', 'S3', 'CloudFront', 'OIDC'],
    url: 'https://github.com/GRCEngClub/claude-grc-engineering/tree/main/plugins/grc-portfolio',
    highlights: [
      'End-to-end: questionnaire → live AWS deployment',
      'OIDC-based keyless CI/CD — no static AWS keys',
      'This site was built entirely using the plugin',
    ],
  },
  {
    name: 'Okta Inspector Connector',
    description: 'Connector that pulls identity and access management findings from Okta — MFA enrollment rates, inactive user detection, privileged access review, and session policy compliance. Maps findings to AC-2, AC-3, IA-2, and IA-5 controls.',
    technologies: ['Okta API', 'Node.js', 'NIST 800-53', 'SOC 2', 'ISO 27001'],
    url: 'https://github.com/GRCEngClub/claude-grc-engineering/tree/main/plugins/connectors/okta-inspector',
    highlights: [
      'IAM control coverage across 5 frameworks',
      'Automated quarterly access review trigger',
      'Evidence artifact generation for audit packages',
    ],
  },
  {
    name: 'FedRAMP 20x Automation Plugin',
    description: 'Plugin implementing the emerging FedRAMP 20x standard with machine-readable continuous authorization data packages, automated control validation, and monthly attestation workflows. Supports the shift from point-in-time audits to continuous authorization.',
    technologies: ['OSCAL', 'FedRAMP 20x', 'Node.js', 'AWS', 'YAML'],
    url: 'https://github.com/GRCEngClub/claude-grc-engineering/tree/main/plugins/frameworks/fedramp-20x',
    highlights: [
      'First open-source FedRAMP 20x tooling',
      'OSCAL-native data model',
      'Continuous authorization workflow automation',
    ],
  },
]

export default function Projects() {
  return (
    <section id="projects">
      <div className="container">
        <div className="section-label">Work</div>
        <h2 className="section-title">Projects</h2>
        <p className="section-subtitle">
          Open-source tools built for GRC engineers — evidence collection, control mapping,
          policy generation, and infrastructure scanning, all in one toolkit.
        </p>
        <div className="projects-grid">
          {projects.map(project => (
            <article key={project.name} className="project-card">
              <div className="project-card-header">
                <h3>{project.name}</h3>
              </div>
              <div className="project-card-body">
                <p>{project.description}</p>
                <div className="project-highlights">
                  {project.highlights.map(h => (
                    <div key={h} className="project-highlight">{h}</div>
                  ))}
                </div>
              </div>
              <div className="project-card-footer">
                <div className="project-tech">
                  {project.technologies.slice(0, 3).map(t => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                  {project.technologies.length > 3 && (
                    <span className="tag">+{project.technologies.length - 3}</span>
                  )}
                </div>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-link"
                  aria-label={`View ${project.name} (opens in new tab)`}
                >
                  View ↗
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

const frameworks = [
  { name: 'SOC 2 Type II', type: 'AICPA Trust Services', icon: '🛡️' },
  { name: 'NIST 800-53', type: 'Federal Security Controls', icon: '🏛️' },
  { name: 'ISO 27001', type: 'Information Security ISMS', icon: '🌐' },
  { name: 'FedRAMP Rev5', type: 'Federal Cloud Authorization', icon: '🇺🇸' },
  { name: 'FedRAMP 20x', type: 'Continuous Authorization', icon: '⚡' },
  { name: 'PCI-DSS v4.0.1', type: 'Payment Card Industry', icon: '💳' },
  { name: 'CMMC Level 2/3', type: 'DoD Cybersecurity Maturity', icon: '🔐' },
  { name: 'HITRUST CSF', type: 'Healthcare Security', icon: '🏥' },
  { name: 'GDPR', type: 'EU Data Protection', icon: '🇪🇺' },
  { name: 'CIS Controls v8', type: 'Security Best Practices', icon: '✅' },
  { name: 'DORA', type: 'EU Digital Operational Resilience', icon: '📊' },
  { name: 'StateRAMP', type: 'State Government Cloud', icon: '🏗️' },
]

const skillGroups = {
  'Compliance Automation': ['Control crosswalk mapping', 'Policy-as-code (OPA/Rego)', 'IaC scanning (Terraform/CloudFormation)', 'Evidence collection automation', 'Continuous compliance monitoring'],
  'Cloud & Infrastructure': ['AWS (IAM, CloudTrail, Config, Security Hub)', 'GCP (Cloud IAM, Security Command Center)', 'Terraform', 'CloudFormation', 'Kubernetes RBAC'],
  'GRC Tools': ['Claude Code', 'Vanta', 'Drata', 'AWS Inspector', 'Okta', 'GitHub Advanced Security'],
  'Languages & Tooling': ['Python', 'Node.js', 'Bash', 'YAML/JSON', 'OSCAL'],
}

export default function Frameworks() {
  return (
    <>
      <section id="frameworks">
        <div className="container">
          <div className="section-label">Expertise</div>
          <h2 className="section-title">Compliance Frameworks</h2>
          <p className="section-subtitle">
            Hands-on experience implementing and automating controls across every major compliance framework.
            Each plugin in the toolkit maps directly to these standards.
          </p>
          <div className="frameworks-grid">
            {frameworks.map(fw => (
              <div key={fw.name} className="framework-card">
                <div className="framework-icon">{fw.icon}</div>
                <div className="fw-name">{fw.name}</div>
                <div className="fw-type">{fw.type}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="skills">
        <div className="container">
          <div className="section-label">Technical Skills</div>
          <h2 className="section-title">Tools &amp; Technologies</h2>
          <p className="section-subtitle">The stack behind the automation — from evidence collectors to policy engines.</p>
          <div className="skills-grid">
            {Object.entries(skillGroups).map(([category, skills]) => (
              <div key={category} className="skill-category">
                <h3>{category}</h3>
                <div className="skill-tags">
                  {skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

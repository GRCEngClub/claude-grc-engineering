const certs = [
  { name: 'CISSP', full: 'Certified Information Systems Security Professional', abbr: 'CISSP' },
  { name: 'CISA', full: 'Certified Information Systems Auditor', abbr: 'CISA' },
  { name: 'CISM', full: 'Certified Information Security Manager', abbr: 'CISM' },
  { name: 'AWS Security', full: 'AWS Certified Security – Specialty', abbr: 'AWS' },
  { name: 'CCSP', full: 'Certified Cloud Security Professional', abbr: 'CCSP' },
]

export default function Certifications() {
  return (
    <section id="certifications">
      <div className="container">
        <div className="section-label">Credentials</div>
        <h2 className="section-title">Certifications</h2>
        <p className="section-subtitle">
          Active industry certifications across security, audit, and cloud disciplines.
        </p>

        <div className="certs-grid">
          {certs.map(cert => (
            <div key={cert.name} className="cert-badge">
              <div className="cert-icon">{cert.abbr.slice(0, 3)}</div>
              <div>
                <div className="cert-name">{cert.name}</div>
                <div className="cert-status">✓ Active</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

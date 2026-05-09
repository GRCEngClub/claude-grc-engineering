export default function Contact() {
  return (
    <section id="contact">
      <div className="container" style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
        <div className="section-label">Contact</div>
        <h2 className="section-title">Get In Touch</h2>
        <p style={{ color: 'var(--color-text-light)', fontSize: '1.05rem', marginBottom: '2.5rem', lineHeight: 1.7 }}>
          Questions about the GRC Engineering Toolkit, compliance automation, or working together?
          Reach out — always happy to talk shop with fellow GRC practitioners.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          <a
            href="mailto:hello@grcengclub.com"
            className="btn btn-primary"
          >
            ✉️ Email Me
          </a>
          <a
            href="https://www.linkedin.com/company/grc-engineering-club"
            target="_blank" rel="noopener noreferrer"
            className="btn btn-outline"
          >
            💼 LinkedIn
          </a>
          <a
            href="https://github.com/GRCEngClub/claude-grc-engineering"
            target="_blank" rel="noopener noreferrer"
            className="btn btn-outline"
          >
            ⚡ GitHub
          </a>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
          This site was built using the{' '}
          <a
            href="https://github.com/GRCEngClub/claude-grc-engineering/tree/main/plugins/grc-portfolio"
            target="_blank" rel="noopener noreferrer"
          >
            grc-portfolio plugin
          </a>
          {' '}— a Claude Code plugin for GRC engineers. Install it and build your own.
        </p>
      </div>
    </section>
  )
}

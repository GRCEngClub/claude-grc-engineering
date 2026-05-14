export default function Hero() {
  return (
    <section id="home" className="hero">
      <div className="container hero-content">
        <div className="hero-eyebrow">GRC Engineering Club</div>

        <h1>
          Claude<br />
          <span>Compliance Automation</span>
        </h1>

        <p className="hero-title">Senior GRC Engineer &amp; Compliance Automation Specialist</p>

        <p className="hero-bio">
          I build compliance automation tools that turn 6,520-hour audit cycles into 2,896-hour ones.
          Specializing in cross-framework control mapping, infrastructure-as-code scanning, and
          policy-as-code generation — I've shipped 30+ open-source GRC plugins used by compliance
          engineers across SOC 2, FedRAMP, PCI-DSS, ISO 27001, and CMMC programs.
        </p>

        <div className="hero-links">
          <a
            href="https://github.com/GRCEngClub/claude-grc-engineering"
            target="_blank" rel="noopener noreferrer"
            className="hero-link"
          >
            ⚡ GitHub
          </a>
          <a
            href="https://www.linkedin.com/company/grc-engineering-club"
            target="_blank" rel="noopener noreferrer"
            className="hero-link"
          >
            💼 LinkedIn
          </a>
          <a
            href="https://grcengclub.com"
            target="_blank" rel="noopener noreferrer"
            className="hero-link"
          >
            🌐 GRC Eng Club
          </a>
        </div>

        <div className="hero-actions">
          <a href="#projects" className="btn btn-primary">View Projects</a>
          <a href="#contact" className="btn btn-outline" style={{ color: '#94a3b8', borderColor: 'rgba(255,255,255,0.2)' }}>
            Get In Touch
          </a>
        </div>

        <div className="hero-stats">
          <div>
            <div className="hero-stat-number">30+</div>
            <div className="hero-stat-label">Open-source plugins</div>
          </div>
          <div>
            <div className="hero-stat-number">12</div>
            <div className="hero-stat-label">Frameworks covered</div>
          </div>
          <div>
            <div className="hero-stat-number">56%</div>
            <div className="hero-stat-label">Avg. effort reduction</div>
          </div>
          <div>
            <div className="hero-stat-number">300+</div>
            <div className="hero-stat-label">Controls mapped</div>
          </div>
        </div>
      </div>
    </section>
  )
}

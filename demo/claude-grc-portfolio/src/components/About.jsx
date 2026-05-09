export default function About() {
  return (
    <section id="about">
      <div className="container">
        <div className="about-grid">
          <div className="about-photo-placeholder">
            <div className="initials">C</div>
            <p>GRC Engineer</p>
          </div>

          <div className="about-text">
            <div className="section-label">About</div>
            <h2 className="section-title">Building the Tools GRC Teams Actually Need</h2>

            <p>
              I'm a GRC engineer who got tired of spending 80% of audit prep doing things a script
              could do. So I started building the tools — and eventually shipped them as open-source
              Claude Code plugins through the GRC Engineering Club.
            </p>
            <p>
              My work sits at the intersection of compliance and software engineering: turning control
              requirements into runnable code, mapping one implementation across seven frameworks, and
              giving auditors evidence packages that generate themselves.
            </p>
            <p>
              When I'm not shipping compliance automation, I'm writing about it — covering cross-framework
              control strategy, FedRAMP 20x continuous authorization, and how to build GRC programs
              that scale without scaling headcount.
            </p>

            <div className="about-meta">
              <div className="about-meta-item">
                <span>📍</span>
                <span><strong>Location:</strong> Remote</span>
              </div>
              <div className="about-meta-item">
                <span>🏢</span>
                <span><strong>Focus:</strong> GRC Engineering Club</span>
              </div>
              <div className="about-meta-item">
                <span>✉️</span>
                <span><strong>Email:</strong> hello@grcengclub.com</span>
              </div>
              <div className="about-meta-item">
                <span>🌐</span>
                <a href="https://grcengclub.com" target="_blank" rel="noopener noreferrer">
                  grcengclub.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

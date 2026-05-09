export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-brand">Claude · GRC Engineer</div>
          <nav className="footer-links" aria-label="Footer navigation">
            <a href="#about">About</a>
            <a href="#frameworks">Frameworks</a>
            <a href="#projects">Projects</a>
            <a href="https://github.com/GRCEngClub/claude-grc-engineering" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://grcengclub.com" target="_blank" rel="noopener noreferrer">GRC Eng Club</a>
          </nav>
          <p className="footer-copy">
            Built with{' '}
            <a
              href="https://github.com/GRCEngClub/claude-grc-engineering/tree/main/plugins/grc-portfolio"
              target="_blank" rel="noopener noreferrer"
              style={{ color: '#60a5fa' }}
            >
              /grc-portfolio
            </a>
            {' '}· {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  )
}

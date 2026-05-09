const articles = [
  {
    type: 'Article',
    title: 'Implement Once, Satisfy Many: Cross-Framework Control Mapping for GRC Engineers',
    publication: 'GRC Engineering Club',
    url: 'https://grcengclub.com',
    year: 2025,
  },
  {
    type: 'Article',
    title: 'FedRAMP 20x: What Continuous Authorization Means for Cloud Service Providers',
    publication: 'GRC Engineering Club',
    url: 'https://grcengclub.com',
    year: 2025,
  },
]

const speaking = [
  {
    type: 'Talk',
    title: 'Building Compliance Automation with Claude Code: 30 Plugins in One Toolkit',
    event: 'GRC Engineering Club — Claude Code Plugin Launch',
    url: 'https://grcengclub.com',
    year: 2025,
  },
]

export default function Writing() {
  const all = [
    ...speaking.map(s => ({ ...s, meta: s.event })),
    ...articles.map(a => ({ ...a, meta: a.publication })),
  ]

  return (
    <section id="writing">
      <div className="container">
        <div className="section-label">Writing &amp; Speaking</div>
        <h2 className="section-title">Published Work</h2>
        <p className="section-subtitle">
          Articles, talks, and commentary on compliance automation, cross-framework strategy,
          and the future of GRC engineering.
        </p>

        <div className="writing-grid">
          {all.map((item, i) => (
            <a
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="writing-card"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="writing-type">{item.type}</div>
              <h3>{item.title}</h3>
              <div className="writing-meta">
                <span>{item.meta}</span>
                <span>{item.year}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

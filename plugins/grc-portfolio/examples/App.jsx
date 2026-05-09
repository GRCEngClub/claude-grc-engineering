import { useState } from 'react'
import './App.css'

/**
 * Example React App
 * 
 * This is a simple starter app that you can customize.
 * Replace this with your own components and logic!
 */

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <header className="app-header">
        <h1>🚀 Your Website is Live on AWS!</h1>
        <p className="subtitle">
          Powered by S3, CloudFront, and Route 53
        </p>
      </header>

      <main className="app-main">
        <div className="card">
          <h2>Welcome to Your New Website</h2>
          <p>
            This is a starter template. Replace this content with your own!
          </p>
          
          <div className="counter-demo">
            <button onClick={() => setCount((count) => count + 1)}>
              Count is {count}
            </button>
            <p className="hint">
              Edit <code>src/App.jsx</code> and save to test hot module replacement
            </p>
          </div>
        </div>

        <div className="features">
          <h3>What You've Built</h3>
          <div className="feature-grid">
            <div className="feature">
              <span className="icon">☁️</span>
              <h4>CloudFront CDN</h4>
              <p>Lightning-fast global delivery</p>
            </div>
            <div className="feature">
              <span className="icon">🔒</span>
              <h4>HTTPS Enabled</h4>
              <p>Secure SSL certificate</p>
            </div>
            <div className="feature">
              <span className="icon">🌍</span>
              <h4>Custom Domain</h4>
              <p>Professional web presence</p>
            </div>
            <div className="feature">
              <span className="icon">💰</span>
              <h4>Cost Effective</h4>
              <p>Pay only for what you use</p>
            </div>
          </div>
        </div>

        <div className="next-steps">
          <h3>Next Steps</h3>
          <ul>
            <li>Customize this app with your own content</li>
            <li>Add React Router for multiple pages</li>
            <li>Install UI libraries (Tailwind, Material-UI, etc.)</li>
            <li>Set up CI/CD with GitHub Actions</li>
            <li>Add analytics (Google Analytics, Plausible, etc.)</li>
          </ul>
        </div>
      </main>

      <footer className="app-footer">
        <p>
          Built with React + Vite | Deployed on AWS
        </p>
      </footer>
    </div>
  )
}

export default App

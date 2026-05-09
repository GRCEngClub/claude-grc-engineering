import './App.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Frameworks from './components/Frameworks'
import Certifications from './components/Certifications'
import Projects from './components/Projects'
import Writing from './components/Writing'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 64 }}>
        <Hero />
        <About />
        <Frameworks />
        <Certifications />
        <Projects />
        <Writing />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

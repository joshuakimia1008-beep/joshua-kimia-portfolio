export default function Header() {
  return (
    <header>
      <nav className="nav">
        <a href="#home" className="logo">
          Joshua Kimia<span className="dot">.</span>
        </a>

        <div className="nav-links">
          <a href="#home" className="active">
            Home
          </a>

          <a href="#about">About</a>

          <a href="#skills">Skills</a>

          <a href="#work">Projects</a>

          <a href="#experience">Experience</a>

          <a href="#contact">Contact</a>
        </div>

        <a className="btn btn-solid" href="/Joshua-Kimia-CV.pdf" download>
          Download CV ↓
        </a>
      </nav>
    </header>
  );
}

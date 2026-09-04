export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="wrap hero-grid">
        <div>
          <div className="eyebrow">Hello, I&apos;m</div>

          <h1>
            Joshua Kimia<span className="accent">.</span>
          </h1>

          <div className="role">
            Software Engineering Student &amp;{" "}
            <span className="hl">Developer</span>
          </div>

          <p className="lede">
            I build clean, scalable and user-focused web applications that solve
            real problems.
          </p>

          <div className="hero-ctas">
            <a className="btn btn-solid" href="#projects">
              View Projects →
            </a>

            <a className="btn btn-line" href="#contact">
              Download CV ↓
            </a>
          </div>

          <div className="hero-tag">
            <span className="pip"></span>
            Software Engineering Student, African University of Science and
            Technology
          </div>
        </div>

        <div className="hero-photo-wrap">
          <div className="deco deco-code">&lt;/&gt;</div>
          <div className="deco deco-dots"></div>

          <div className="hero-photo">
            <svg
              className="ph-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#5B6180"
              strokeWidth={1.3}
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
            </svg>

            <span className="ph-label">Portrait — replace with your photo</span>
          </div>

          <div className="deco deco-arrow">&gt;</div>
        </div>
      </div>
    </section>
  );
}

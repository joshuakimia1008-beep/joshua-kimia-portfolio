import Reveal from "./Reveal";

const infoCards = [
  {
    icon: "🎓",
    title: "Education",
    text: "Software Engineering",
  },
  {
    icon: "💻",
    title: "Focus",
    text: "Software & Web Development",
  },
  {
    icon: "💼",
    title: "Experience",
    text: "Software Eng. Intern",
  },
];

export default function About() {
  return (
    <section className="about" id="about">
      <div className="wrap">
        <Reveal>
          <div className="eyebrow">About Me</div>
          <h2>A little about me</h2>
        </Reveal>

        <div className="about-content">
          <Reveal className="about-photo">
            <img src="/joshua-kimia.png" alt="Joshua Kimia" />
          </Reveal>

          <Reveal className="about-right">
            <div className="about-copy">
              <p>
                I&apos;m a Software Engineering student at the African
                University of Science and Technology, interested in building
                useful products and solving problems with technology.
              </p>

              <p>
                I enjoy learning by building, exploring new technologies, and
                turning ideas into working solutions. I&apos;m currently gaining
                professional experience as a Software Engineering Intern at
                Revlinks Integrated Services Limited.
              </p>
            </div>

            <div className="about-info">
              {infoCards.map((card) => (
                <div className="about-info-card" key={card.title}>
                  <div className="about-info-icon">{card.icon}</div>
                  <div>
                    <span>{card.title}</span>
                    <strong>{card.text}</strong>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

import Reveal from "./Reveal";

type ExperienceItem = {
  role: string;
  organization: string;
  period: string;
  description: string;
};

type EducationItem = {
  institution: string;
  field: string;
  period: string;
};

const experiences: ExperienceItem[] = [
  {
    role: "Software Engineering Intern",
    organization: "Revlinks Integrated Services Limited",
    period: "2026 — Present",
    description:
      "Gaining practical experience in software development and working on real-world projects in a professional team.",
  },
  {
    role: "Campus Co-Lead",
    organization: "Cowrywise Campus Ambassadors — AUST",
    period: "2026 — Present",
    description:
      "Leading campus activities, coordinating ambassadors, and promoting financial literacy among students.",
  },
];

const education: EducationItem[] = [
  {
    institution: "African University of Science and Technology",
    field: "Software Engineering",
    period: "Undergraduate · Oct 2024 – Jul 2028",
  },
];

export default function Experience() {
  return (
    <section className="timeline" id="experience">
      <div className="wrap">
        <Reveal>
          <h2>Experience &amp; Education</h2>
          <p>Where I&apos;ve been learning, building, and growing.</p>
        </Reveal>

        <Reveal className="tl-table">
          <div className="tl-col">
            <div className="tl-col-head">Experience</div>

            {experiences.map((item) => (
              <div
                className="tl-entry"
                key={`${item.role}-${item.organization}`}
              >
                <div className="role">{item.role}</div>

                <div className="org">{item.organization}</div>

                <div className="when">{item.period}</div>

                <div className="desc">{item.description}</div>
              </div>
            ))}
          </div>

          <div className="tl-col edu-block">
            <div className="tl-col-head">Education</div>

            {education.map((item) => (
              <div
                className="tl-entry"
                key={`${item.institution}-${item.field}`}
              >
                <div className="role">{item.institution}</div>

                <div className="org">{item.field}</div>

                <div className="when">{item.period}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

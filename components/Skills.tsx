"use client";

import { useState } from "react";
import Reveal from "./Reveal";

type Skill = {
  label: string;
  category: string;
  level: string;
  percentage: number;
  usedIn: string[];
  learnedFrom: string[];
  related: string[];
};

const skills: Skill[] = [
  {
    label: "HTML",
    category: "Programming & Web",
    level: "Strong",
    percentage: 85,
    usedIn: ["My Portfolio", "PeerTutorHQ"],
    learnedFrom: ["FreeCodeCamp", "Personal projects"],
    related: ["CSS", "JavaScript", "Accessibility"],
  },
  {
    label: "CSS",
    category: "Programming & Web",
    level: "Strong",
    percentage: 85,
    usedIn: ["My Portfolio", "Citizen's College"],
    learnedFrom: ["FreeCodeCamp", "Personal projects"],
    related: ["Flexbox", "Grid", "Responsive Design"],
  },
  {
    label: "JavaScript",
    category: "Programming & Web",
    level: "Intermediate",
    percentage: 65,
    usedIn: ["Web projects", "My Portfolio"],
    learnedFrom: ["FreeCodeCamp", "Personal projects"],
    related: ["DOM", "React", "APIs"],
  },
  {
    label: "Python",
    category: "Programming & Web",
    level: "Intermediate",
    percentage: 65,
    usedIn: ["Farming AI Assistant"],
    learnedFrom: ["Personal projects", "Online learning"],
    related: ["FastAPI", "AI / ML", "APIs"],
  },
  {
    label: "Next.js",
    category: "Programming & Web",
    level: "Currently Learning",
    percentage: 45,
    usedIn: ["My Portfolio"],
    learnedFrom: ["Building this portfolio"],
    related: ["React", "TypeScript", "App Router"],
  },
  {
    label: "Git",
    category: "Tools & Technologies",
    level: "Intermediate",
    percentage: 65,
    usedIn: ["My Portfolio", "Personal projects"],
    learnedFrom: ["Personal projects"],
    related: ["GitHub", "Version Control"],
  },
  {
    label: "GitHub",
    category: "Tools & Technologies",
    level: "Intermediate",
    percentage: 65,
    usedIn: ["My Portfolio", "Personal projects"],
    learnedFrom: ["Personal projects"],
    related: ["Git", "Repositories"],
  },
  {
    label: "VS Code",
    category: "Tools & Technologies",
    level: "Strong",
    percentage: 85,
    usedIn: ["Most development projects"],
    learnedFrom: ["Daily development"],
    related: ["Extensions", "Debugging"],
  },
  {
    label: "FastAPI",
    category: "Tools & Technologies",
    level: "Currently Learning",
    percentage: 45,
    usedIn: ["Farming AI Assistant"],
    learnedFrom: ["Personal projects"],
    related: ["Python", "APIs", "Backend"],
  },
  {
    label: "AI / ML",
    category: "Currently Exploring",
    level: "Exploring",
    percentage: 30,
    usedIn: ["Farming AI Assistant"],
    learnedFrom: ["Personal projects", "Online learning"],
    related: ["Python", "Machine Learning", "AI"],
  },
  {
    label: "APIs",
    category: "Currently Exploring",
    level: "Currently Learning",
    percentage: 45,
    usedIn: ["Farming AI Assistant"],
    learnedFrom: ["Personal projects"],
    related: ["REST", "FastAPI", "Backend"],
  },
  {
    label: "Backend Development",
    category: "Currently Exploring",
    level: "Currently Learning",
    percentage: 45,
    usedIn: ["Farming AI Assistant"],
    learnedFrom: ["Personal projects"],
    related: ["Python", "FastAPI", "APIs"],
  },
];

export default function Skills() {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  return (
    <section className="skills" id="skills">
      <div className="wrap">
        <Reveal className="sec-intro">
          <div className="eyebrow">Skills</div>

          <h2>What I work with</h2>

          <p>
            Technologies and tools I&apos;m currently learning and using to
            build real-world projects.
          </p>
        </Reveal>

        <div className="skills-groups">
          {[
            "Programming & Web",
            "Tools & Technologies",
            "Currently Exploring",
          ].map((category) => (
            <Reveal key={category} className="skill-group">
              <h3>{category}</h3>

              <div className="skill-row">
                {skills
                  .filter((skill) => skill.category === category)
                  .map((skill) => (
                    <button
                      key={skill.label}
                      type="button"
                      className="skill-chip"
                      onClick={() => setSelectedSkill(skill)}
                    >
                      {skill.label}
                    </button>
                  ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* =========================
          SKILL DETAILS MODAL
      ========================= */}

      {selectedSkill && (
        <div
          className="skill-modal-overlay"
          onClick={() => setSelectedSkill(null)}
        >
          <div className="skill-modal" onClick={(e) => e.stopPropagation()}>
            {/* Close */}
            <button
              className="skill-close"
              type="button"
              onClick={() => setSelectedSkill(null)}
              aria-label="Close skill details"
            >
              ×
            </button>

            {/* Header */}
            <div className="skill-modal-header">
              <div className="skill-modal-icon">
                {selectedSkill.label.substring(0, 2)}
              </div>

              <div>
                <h3>{selectedSkill.label}</h3>

                <div className="skill-meta">
                  <span>◷ {selectedSkill.level}</span>
                  <span>✦ {selectedSkill.percentage}% proficiency</span>
                </div>
              </div>
            </div>

            {/* Experience */}
            <div className="skill-modal-content">
              <div className="experience-header">
                <span>Experience Level</span>
                <strong>{selectedSkill.percentage}%</strong>
              </div>

              <div className="experience-track">
                <div
                  className="experience-progress"
                  style={{
                    width: `${selectedSkill.percentage}%`,
                  }}
                />
              </div>

              {/* Related */}
              <div className="skill-detail-section">
                <h4>✧ RELATED TECHNOLOGIES</h4>

                <div className="skill-tags">
                  {selectedSkill.related.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>

              {/* Used In */}
              <div className="skill-detail-section">
                <h4>▱ WHERE I&apos;VE USED IT</h4>

                <div className="skill-projects">
                  {selectedSkill.usedIn.map((project) => (
                    <div className="skill-project" key={project}>
                      <div>
                        <strong>{project}</strong>

                        <p>
                          Used while building and developing real-world
                          projects.
                        </p>
                      </div>

                      <span className="project-arrow">↗</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learned From */}
              <div className="skill-detail-section">
                <h4>◈ LEARNED FROM</h4>

                <div className="skill-tags">
                  {selectedSkill.learnedFrom.map((source) => (
                    <span key={source}>{source}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <button
              className="skill-modal-footer"
              type="button"
              onClick={() => setSelectedSkill(null)}
            >
              ↑ Close Details
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

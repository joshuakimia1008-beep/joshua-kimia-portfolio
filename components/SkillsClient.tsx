"use client";

import { useState } from "react";
import Reveal from "./Reveal";

type Skill = {
  label: string;
  category: string;
  level: string;
  percentage: number;
  usedIn?: string[];
  learnedFrom: string[];
  related: string[];
};

export default function Skills({ skills }: { skills: Skill[] }) {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const categories = [...new Set(skills.map((skill) => skill.category))];
  const [category, setCategory] = useState(categories[0] ?? "");
  const visibleSkills = skills.filter((skill) => skill.category === category);

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

        {categories.length > 0 && <div className="skill-tabs" role="tablist" aria-label="Skill categories">
          {categories.map((item) => <button key={item} type="button" role="tab" aria-selected={category === item} className="skill-tab" onClick={() => setCategory(item)}>{item}</button>)}
        </div>}
        {visibleSkills.length > 0 ? <Reveal className="skill-group" key={category}>
          <div className="skill-row">{visibleSkills.map((skill) => <button key={skill.label} type="button" className="skill-chip" onClick={() => setSelectedSkill(skill)}>{skill.label}</button>)}</div>
          <div className="skill-bars">{visibleSkills.map((skill) => <button key={skill.label} type="button" className="skill-bar-row" onClick={() => setSelectedSkill(skill)} aria-label={`${skill.label}, ${skill.percentage}% proficiency`} style={{ border: 0, background: "transparent", color: "inherit", textAlign: "left", cursor: "pointer", padding: 0 }}><span>{skill.label}</span><span className="skill-bar-track"><span className="skill-bar-fill" style={{ display: "block", width: `${skill.percentage}%` }} /></span><strong>{skill.percentage}%</strong></button>)}</div>
        </Reveal> : <p className="admin-empty-state">No skills added yet. Add skills from the admin dashboard.</p>}
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
              {(selectedSkill.usedIn?.length ?? 0) > 0 && <div className="skill-detail-section">
                <h4>▱ WHERE I&apos;VE USED IT</h4>

                <div className="skill-projects">
                  {(selectedSkill.usedIn ?? []).map((project) => (
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
              </div>}

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

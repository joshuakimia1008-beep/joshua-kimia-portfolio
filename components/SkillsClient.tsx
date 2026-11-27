"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Reveal from "./Reveal";
import FloatTiles from "./FloatTiles";
import SkillIcon from "./SkillIcon";
import GlitchTag from "./GlitchTag";

// The grid keeps a fixed, predictable height however many skills exist.
// Extra skills sit behind "+N more" and scroll INSIDE their own box.
const TAG_LIMIT = 12; // tags shown before "+N more"

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
  const [category, setCategoryState] = useState(categories[0] ?? "");
  const [showAllTags, setShowAllTags] = useState(false);
  const setCategory = (next: string) => {
    setCategoryState(next);
    setShowAllTags(false);
  };
  const visibleSkills = skills.filter((skill) => skill.category === category);
  const modalRef = useRef<HTMLDivElement>(null);
  const shownTags = showAllTags
    ? visibleSkills
    : visibleSkills.slice(0, TAG_LIMIT);
  const hiddenTags = visibleSkills.length - shownTags.length;

  // Escape closes the modal (FloatTiles handles Escape first when a chip is open)
  useEffect(() => {
    if (!selectedSkill) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedSkill(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedSkill]);

  // chip extras: show my proficiency when a tile matches one of my skills
  const tileNotes = useMemo(
    () =>
      Object.fromEntries(
        skills.map((s) => [
          s.label.toLowerCase(),
          `${s.percentage}% · ${s.level}`,
        ]),
      ),
    [skills],
  );
  const tilePriority = useMemo(
    () =>
      selectedSkill
        ? [
            selectedSkill.label,
            ...selectedSkill.related.map((r) =>
              r.replace(/^["'\s]+|["'\s]+$/g, ""),
            ),
          ]
        : [],
    [selectedSkill],
  );

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

        {categories.length > 0 && (
          <div
            className="skill-tabs"
            role="tablist"
            aria-label="Skill categories"
          >
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={category === item}
                className="skill-tab"
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
        )}
        {visibleSkills.length > 0 ? (
          <Reveal className="skill-group" key={category}>
            <div className={`skill-row${showAllTags ? " is-expanded" : ""}`}>
              {shownTags.map((skill, i) => (
                <GlitchTag
                  key={skill.label}
                  label={skill.label}
                  prefix={`SYS//${String(i + 1).padStart(2, "0")}`}
                  code={`${skill.level} // ${skill.percentage}%`}
                  delay={(i % 6) * 0.7}
                  order={i < TAG_LIMIT ? i : i - TAG_LIMIT}
                  lite={i >= TAG_LIMIT}
                  onClick={() => setSelectedSkill(skill)}
                />
              ))}
              {visibleSkills.length > TAG_LIMIT && (
                <button
                  type="button"
                  className="skill-more-tag"
                  aria-expanded={showAllTags}
                  onClick={() => setShowAllTags((v) => !v)}
                >
                  {showAllTags ? "− Show less" : `+ ${hiddenTags} more`}
                </button>
              )}
            </div>
          </Reveal>
        ) : (
          <p className="admin-empty-state">
            No skills added yet. Add skills from the admin dashboard.
          </p>
        )}
      </div>

      {/* =========================
          SKILL DETAILS MODAL
      ========================= */}

      {selectedSkill && (
        <div
          className="skill-modal-overlay"
          onClick={() => setSelectedSkill(null)}
        >
          <FloatTiles
            avoidRef={modalRef}
            priority={tilePriority}
            notes={tileNotes}
          />
          <div
            className="skill-modal"
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
          >
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
                <SkillIcon
                  label={selectedSkill.label}
                  size={44}
                  variant="tile"
                />
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
                    <span key={item}>
                      <SkillIcon
                        label={item}
                        size={14}
                        variant="glyph"
                        fallback={false}
                      />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Used In */}
              {(selectedSkill.usedIn?.length ?? 0) > 0 && (
                <div className="skill-detail-section">
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
                </div>
              )}

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

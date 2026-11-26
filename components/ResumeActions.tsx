"use client";

type ResumeActionsProps = {
  resumeUrl: string;
};

export default function ResumeActions({ resumeUrl }: ResumeActionsProps) {
  if (!resumeUrl) return null;

  const downloadUrl = resumeUrl.replace("/view?", "/download?");

  return (
    <div className="about-resume-actions">
      <a
        className="about-cv-btn"
        href={downloadUrl}
        download="Joshua-Kimia-CV.pdf"
      >
        ↓ Download CV
      </a>

      <a
        className="about-cv-btn"
        href={resumeUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        View CV →
      </a>
    </div>
  );
}

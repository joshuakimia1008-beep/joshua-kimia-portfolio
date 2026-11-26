import { tablesDB } from "@/lib/appwrite-server";

const databaseId = process.env.APPWRITE_DATABASE_ID!;

type Settings = {
  footerVideoUrl?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  contactEmail?: string | null;
};

export default async function Footer() {
  let settings: Settings | null = null;

  try {
    const row = await tablesDB.getRow({
      databaseId,
      tableId: "settings",
      rowId: "singleton",
    });

    settings = row as unknown as Settings;
  } catch (error) {
    const isNotFound =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 404;

    if (!isNotFound) {
      throw error;
    }
  }

  return (
    <footer className="footer" id="site-footer">
      {settings?.footerVideoUrl && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          className="footer-video"
          src={settings.footerVideoUrl}
          autoPlay
          loop
          muted
          playsInline
        />
      )}

      <div className="footer-content">
        <div className="footer-cta">
          <div>
            <h2>Let&apos;s build something together</h2>
            <p>Have a project in mind? I&apos;d love to hear about it.</p>
          </div>
          <a href="#contact">Get in touch →</a>
        </div>

        <div className="footer-main">
          <div className="footer-brand">
            <h3>
              Joshua Kimia<span className="dot">.</span>
            </h3>
            <p>Software Engineering Student &amp; Developer</p>
          </div>

          <div className="footer-column">
            <h4>Explore</h4>
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#skills">Skills</a>
            <a href="#work">Projects</a>
            <a href="#experience">Experience</a>
          </div>

          <div className="footer-column">
            <h4>Connect</h4>
            <a href={settings?.githubUrl || "#"}>GitHub</a>
            <a href={settings?.linkedinUrl || "#"}>LinkedIn</a>
            <a
              href={`mailto:${settings?.contactEmail || "JoshuaKimia1008@gmail.com"}`}
            >
              Email
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="footer-motto">A máa lọ 💪</span>
          <div className="footer-bottom-right">
            <span className="footer-copy">
              © 2026 Joshua Kimia. All rights reserved.
            </span>
            <a href="#site-footer" className="footer-top-link">
              Back to top ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

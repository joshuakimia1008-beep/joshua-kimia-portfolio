import { tablesDB } from "@/lib/appwrite-server";
import { Query } from "node-appwrite";
import Reveal from "./Reveal";
import CountUp from "./CountUp";
import TiltImage from "./TiltImage";
import ResumeActions from "./ResumeActions";
import { parseProfileImageUrls } from "./profileImages";

export const dynamic = "force-dynamic";

const databaseId = process.env.APPWRITE_DATABASE_ID!;

type Settings = {
  bio?: string | null;
  profileImageUrl?: string | null;
  resumeUrl?: string | null;
  availability?: string | null;
};

type ExperienceEntry = {
  type: string;
  title: string;
  organization: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

async function getSettings(): Promise<Settings | null> {
  try {
    const row = await tablesDB.getRow({
      databaseId,
      tableId: "settings",
      rowId: "singleton",
    });

    return row as unknown as Settings;
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 404
    ) {
      return null;
    }

    throw error;
  }
}

async function getCount(tableId: string): Promise<number> {
  const result = await tablesDB.listRows({
    databaseId,
    tableId,
    queries: [],
    total: true,
  });

  return result.total;
}

async function getExperienceEntries(): Promise<ExperienceEntry[]> {
  const result = await tablesDB.listRows({
    databaseId,
    tableId: process.env.APPWRITE_EXPERIENCE_TABLE_ID!,
    queries: [Query.orderDesc("startDate"), Query.limit(100)],
  });

  return result.rows as unknown as ExperienceEntry[];
}

export default async function About() {
  const [settings, projects, achievements, entries] = await Promise.all([
    getSettings(),
    getCount(process.env.APPWRITE_PROJECTS_TABLE_ID!),
    getCount(process.env.APPWRITE_ACHIEVEMENTS_TABLE_ID!),
    getExperienceEntries(),
  ]);

  const education = entries.find((entry) => entry.type === "EDUCATION");
  const current = entries.find((entry) => entry.type === "EXPERIENCE");

  const bio =
    settings?.bio ||
    "I enjoy learning by building, exploring new technologies, and turning ideas into useful solutions.";

  const resumeUrl = settings?.resumeUrl || "/Joshua-Kimia-CV.pdf";

  const stats = [
    { value: projects, label: "Projects" },
    {
      value: entries.filter((entry) => entry.type === "EXPERIENCE").length,
      label: "Experience roles",
    },
    { value: achievements, label: "Achievements" },
  ];

  const cards = [
    {
      icon: "🎓",
      title: "Education",
      heading: education?.title || "Add education in dashboard",
      text: education
        ? `${education.organization}${
            education.endDate
              ? ` · ${new Date(education.endDate).getFullYear()}`
              : ""
          }`
        : "Your education entries appear here when added.",
    },
    {
      icon: "💻",
      title: "Focus",
      heading: "Current focus",
      text: bio.slice(0, 130),
    },
    {
      icon: "💼",
      title: "Experience",
      heading: current?.title || "Currently growing",
      text:
        current?.organization ||
        (settings?.availability === "AVAILABLE"
          ? "Open to new opportunities"
          : "Building and learning every day"),
    },
  ];

  return (
    <section className="about" id="about">
      <div className="wrap">
        <Reveal>
          <div className="eyebrow">About Me</div>
          <h2>A little about me</h2>
        </Reveal>

        <div className="about-content">
          <Reveal className="about-left">
            <div className="about-intro">
              <TiltImage
                src={
                  parseProfileImageUrls(settings?.profileImageUrl)[0] ||
                  "/joshua-kimia.png"
                }
                alt="Joshua Kimia"
              />

              <div className="about-copy">
                <p>{bio}</p>

                {current && (
                  <p>
                    Currently: <strong>{current.title}</strong> at{" "}
                    <strong>{current.organization}</strong>
                    {current.description ? ` — ${current.description}` : ""}
                  </p>
                )}
              </div>
            </div>

            <div className="about-stats">
              {stats.map((stat) => (
                <div className="about-stat" key={stat.label}>
                  <strong>
                    <CountUp value={stat.value} />
                  </strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>

            <ResumeActions resumeUrl={resumeUrl} />
          </Reveal>

          <Reveal className="about-info">
            {cards.map((card) => (
              <div className="about-info-card" key={card.title}>
                <div className="about-info-icon">{card.icon}</div>
                <div className="about-info-content">
                  <span>{card.title}</span>
                  <strong>{card.heading}</strong>
                  <p>{card.text}</p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

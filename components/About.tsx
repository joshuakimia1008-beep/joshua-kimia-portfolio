import { tablesDB } from "@/lib/appwrite-server";
import { Query } from "node-appwrite";
import Reveal from "./Reveal";
import CountUp from "./CountUp";
import TiltImage from "./TiltImage";
import ResumeActions from "./ResumeActions";
import { parseProfileImageUrls } from "./profileImages";

export const dynamic = "force-dynamic";

const databaseId = process.env.APPWRITE_DATABASE_ID!;

const introduction =
  "I'm Joshua Kimia, a Nigerian Software Engineering student and frontend developer passionate about building useful digital experiences and turning ideas into reality. Beyond tech, I enjoy leadership, entrepreneurship, financial literacy and community development.";

const currently =
  "Growing my skills, building projects and creating impact through technology and community involvement.";

type Settings = {
  profileImageUrl?: string | null;
  resumeUrl?: string | null;
};

type ExperienceEntry = {
  $id: string;
  type: string;
  title: string;
  organization: string;
  startDate?: string | null;
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

  const experienceCount = entries.filter(
    (entry) => entry.type === "EXPERIENCE",
  ).length;

  const profileImage =
    parseProfileImageUrls(settings?.profileImageUrl)[0] || "/joshua-kimia.png";

  const resumeUrl = settings?.resumeUrl || "/Joshua-Kimia-CV.pdf";

  const stats = [
    { value: projects, label: "Projects" },
    { value: experienceCount, label: "Experience roles" },
    { value: achievements, label: "Achievements" },
  ];

  const cards = [
    {
      icon: "🎓",
      title: "Education",
      heading: education?.title || "Software Engineering",
      text: education
        ? education.organization
        : "Learning, growing and building through technology.",
    },
    {
      icon: "💻",
      title: "Focus",
      heading: "Software Engineering & Product Building",
      text: "Frontend development, problem-solving and digital innovation.",
    },
    {
      icon: "🤝",
      title: "Leadership",
      heading: "Technology & Community",
      text: "Campus leadership, student engagement and community development.",
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
              <TiltImage src={profileImage} alt="Joshua Kimia" />

              <div className="about-copy">
                <p>{introduction}</p>

                <p>
                  <strong>Currently:</strong> {currently}
                </p>
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

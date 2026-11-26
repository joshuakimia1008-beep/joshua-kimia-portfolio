import { tablesDB } from "@/lib/appwrite-server";
import SkillsClient from "./SkillsClient";

const categoryLabels: Record<string, string> = {
  PROGRAMMING_AND_WEB: "Programming & Web",
  TOOLS_AND_TECHNOLOGIES: "Tools & Technologies",
  CURRENTLY_EXPLORING: "Currently Exploring",
};

export default async function Skills() {
  const result = await tablesDB.listRows({
    databaseId: process.env.APPWRITE_DATABASE_ID!,
    tableId: process.env.APPWRITE_SKILLS_TABLE_ID!,
    queries: [],
  });

  const records = result.rows.sort(
    (a, b) => Number(a.order ?? 0) - Number(b.order ?? 0),
  );

  const skills = records.map((skill) => ({
    label: String(skill.name),
    category: categoryLabels[String(skill.category)] ?? "Other",
    level: skill.level ? String(skill.level) : "Learning",
    percentage: Number(skill.proficiency ?? 0),
    learnedFrom: String(skill.learnedFrom ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    related: String(skill.relatedTechnologies ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  }));

  return <SkillsClient skills={skills} />;
}

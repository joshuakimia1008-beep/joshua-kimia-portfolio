import Link from "next/link";
import { Query } from "node-appwrite";
import { tablesDB } from "@/lib/appwrite-server";
import DashboardAppearance from "@/components/admin/DashboardAppearance";

export const dynamic = "force-dynamic";

const databaseId = process.env.APPWRITE_DATABASE_ID!;
const contentTables = [
  { label: "Projects", href: "/admin/projects", tableId: process.env.APPWRITE_PROJECTS_TABLE_ID || "6af0e694000cbb5365c1", icon: "▰", tone: "blue" },
  { label: "Experience", href: "/admin/experience", tableId: "experience", icon: "▣", tone: "violet" },
  { label: "Skills", href: "/admin/skills", tableId: "skills", icon: "✧", tone: "cyan" },
  { label: "Certifications", href: "/admin/certifications", tableId: "certifications", icon: "✳", tone: "amber" },
  { label: "Achievements", href: "/admin/achievements", tableId: "achievements", icon: "☆", tone: "rose" },
];

async function countRows(tableId: string): Promise<number> {
  const result = await tablesDB.listRows({ databaseId, tableId, queries: [Query.limit(1)] });
  return result.total;
}

async function getAppearanceSettings() {
  try {
    const row = await tablesDB.getRow({ databaseId, tableId: "settings", rowId: "singleton" });
    const settings = row as unknown as Record<string, unknown>;
    return {
      imageUrl: typeof settings.dashboardBackgroundUrl === "string" ? settings.dashboardBackgroundUrl : "",
      overlay: Math.min(80, Math.max(0, Number(settings.dashboardBackgroundOverlay ?? 42))),
      blur: Math.min(12, Math.max(0, Number(settings.dashboardBackgroundBlur ?? 0))),
    };
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 404) {
      return { imageUrl: "", overlay: 42, blur: 0 };
    }
    throw error;
  }
}

function countLabel(total: number) {
  return `${total} ${total === 1 ? "item" : "items"}`;
}

export default async function AdminDashboard() {
  const [counts, appearance] = await Promise.all([
    Promise.all(contentTables.map((entry) => countRows(entry.tableId))),
    getAppearanceSettings(),
  ]);
  const chartMax = Math.max(1, ...counts);

  return (
    <div className="admin-dashboard">
      <section className="dashboard-heading">
        <div>
          <p className="admin-eyebrow">YOUR PORTFOLIO WORKSPACE</p>
          <h1>Good morning, Joshua</h1>
          <p className="admin-welcome">Your portfolio at a glance.</p>
        </div>
        <div className="dashboard-status"><span /> Portfolio workspace</div>
      </section>

      <section className="admin-stats-grid" aria-label="Portfolio content counts">
        {contentTables.slice(0, 4).map((entry, index) => (
          <Link key={entry.label} href={entry.href} className="admin-stat-card">
            <div className="stat-card-top">
              <span className="admin-stat-label">{entry.label}</span>
              <span className={`admin-stat-icon ${entry.tone}`} aria-hidden="true">{entry.icon}</span>
            </div>
            <div className="admin-stat-value">{counts[index]}</div>
            <div className="stat-card-foot">{countLabel(counts[index])} in your portfolio <span aria-hidden="true">↗</span></div>
          </Link>
        ))}
      </section>

      <div className="dashboard-mid-grid">
        <section className="dashboard-panel content-chart-panel">
          <div className="panel-heading">
            <div><h2>Portfolio content</h2><p>Published entries across your sections</p></div>
            <span className="panel-period">LIVE COUNTS</span>
          </div>
          <div className="content-chart" role="img" aria-label="Bar chart of Appwrite content counts">
            <div className="chart-grid-lines"><span>Content sections</span><i /><i /><i /><i /><i /></div>
            <div className="chart-bars">
              {contentTables.map((entry, index) => {
                const height = Math.max(8, Math.round((counts[index] / chartMax) * 100));
                return (
                  <Link href={entry.href} key={entry.label} className="chart-bar-column" aria-label={`${entry.label}: ${counts[index]}`}>
                    <span className="chart-bar-value">{counts[index]}</span>
                    <span className={`chart-bar ${entry.tone}`} style={{ height: `${height}%` }} />
                    <span className="chart-bar-label">{entry.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          <p className="chart-footnote">Counts are read live from your Appwrite tables. Traffic analytics are not connected in this project.</p>
        </section>

        <section className="dashboard-panel quick-actions-panel">
          <div className="panel-heading"><div><h2>Quick actions</h2><p>Keep your portfolio up to date</p></div></div>
          <div className="quick-action-list">
            <Link href="/admin/projects" className="quick-action"><span className="quick-action-icon">＋</span><span><strong>Add project</strong><small>Showcase a new piece of work</small></span><span className="quick-action-arrow">›</span></Link>
            <Link href="/admin/experience" className="quick-action"><span className="quick-action-icon">↗</span><span><strong>Update experience</strong><small>Add a role to your timeline</small></span><span className="quick-action-arrow">›</span></Link>
            <Link href="/admin/skills" className="quick-action"><span className="quick-action-icon">✧</span><span><strong>Edit skills</strong><small>Refresh your capabilities</small></span><span className="quick-action-arrow">›</span></Link>
            <Link href="/admin/settings" className="quick-action"><span className="quick-action-icon">⚙</span><span><strong>Site settings</strong><small>Profile, contact and SEO</small></span><span className="quick-action-arrow">›</span></Link>
          </div>
        </section>
      </div>

      <DashboardAppearance savedImageUrl={appearance.imageUrl} savedOverlay={appearance.overlay} savedBlur={appearance.blur} />
    </div>
  );
}

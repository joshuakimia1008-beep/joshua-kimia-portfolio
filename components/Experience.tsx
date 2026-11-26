import { tablesDB } from "@/lib/appwrite-server";
import Reveal from "./Reveal";
import TimelineProgress from "./TimelineProgress";

function dateLabel(start: Date, end: Date | null) {
  const format = (date: Date) =>
    date.toLocaleDateString("en", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });

  return `${format(start)} — ${end ? format(end) : "Present"}`;
}

export default async function Experience() {
  const result = await tablesDB.listRows({
    databaseId: process.env.APPWRITE_DATABASE_ID!,
    tableId: process.env.APPWRITE_EXPERIENCE_TABLE_ID!,
    queries: [],
  });

  const entries = result.rows.sort(
    (a, b) =>
      new Date(String(b.startDate)).getTime() -
      new Date(String(a.startDate)).getTime(),
  );

  const experiences = entries.filter((entry) => entry.type === "EXPERIENCE");

  const education = entries.filter((entry) => entry.type === "EDUCATION");

  return (
    <section className="timeline" id="experience">
      <div className="wrap">
        <Reveal>
          <h2>Experience &amp; Education</h2>
          <p>Where I&apos;ve been learning, building, and growing.</p>
        </Reveal>

        {entries.length ? (
          <Reveal className="tl-table">
            <TimelineProgress />

            <div className="tl-col">
              <div className="tl-col-head">Experience</div>

              {experiences.length ? (
                experiences.map((item) => (
                  <article className="tl-entry" key={item.$id}>
                    <div className="role">{String(item.title)}</div>
                    <div className="org">{String(item.organization)}</div>
                    <div className="when">
                      {dateLabel(
                        new Date(String(item.startDate)),
                        item.endDate ? new Date(String(item.endDate)) : null,
                      )}
                    </div>
                    {item.description && (
                      <div className="desc">{String(item.description)}</div>
                    )}
                  </article>
                ))
              ) : (
                <p className="admin-empty-state">No experience entries yet.</p>
              )}
            </div>

            <div className="tl-col edu-block">
              <div className="tl-col-head">Education</div>

              {education.length ? (
                education.map((item) => (
                  <article className="tl-entry" key={item.$id}>
                    <div className="role">{String(item.title)}</div>
                    <div className="org">{String(item.organization)}</div>
                    <div className="when">
                      {dateLabel(
                        new Date(String(item.startDate)),
                        item.endDate ? new Date(String(item.endDate)) : null,
                      )}
                    </div>
                    {item.description && (
                      <div className="desc">{String(item.description)}</div>
                    )}
                  </article>
                ))
              ) : (
                <p className="admin-empty-state">No education entries yet.</p>
              )}
            </div>
          </Reveal>
        ) : (
          <p className="admin-empty-state">
            Add experience and education entries from the admin dashboard.
          </p>
        )}
      </div>
    </section>
  );
}

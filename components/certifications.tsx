import { prisma } from "@/lib/prisma";
import Reveal from "./Reveal";

export default async function Certifications() {
  const certifications = await prisma.certification.findMany({
    orderBy: { order: "asc" },
  });

  if (certifications.length === 0) return null;

  return (
    <section className="certifications" id="certifications">
      <div className="wrap">
        <Reveal>
          <div className="eyebrow">Certifications</div>
          <h2>Credentials I&apos;ve earned</h2>
        </Reveal>

        <Reveal className="cert-grid">
          {certifications.map((cert) => (
            <article className="cert-card" key={cert.id}>
              {cert.imageUrl && (
                <div className="cert-shot">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cert.imageUrl} alt={`${cert.title} certificate`} />
                </div>
              )}

              <div className="cert-body">
                <h3>{cert.title}</h3>
                <p className="cert-issuer">{cert.issuer}</p>
                <p className="cert-dates">
                  Issued{" "}
                  {cert.issueDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                  {cert.expiryDate &&
                    ` · Expires ${cert.expiryDate.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}`}
                </p>

                {cert.credentialUrl && (
                  <a
                    className="cert-link"
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Credential
                  </a>
                )}
              </div>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

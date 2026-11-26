import { tablesDB } from "@/lib/appwrite-server";
import Reveal from "./Reveal";
import CertificationCarousel from "./CertificationCarousel";

const credentialDate = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export default async function Certifications() {
  const result = await tablesDB.listRows({
    databaseId: process.env.APPWRITE_DATABASE_ID!,
    tableId: process.env.APPWRITE_CERTIFICATIONS_TABLE_ID!,
    queries: [],
  });

  const certifications = result.rows.sort(
    (a, b) => Number(a.displayOrder ?? 0) - Number(b.displayOrder ?? 0),
  );

  if (certifications.length === 0) return null;

  const slides = certifications.map((cert) => ({
    id: String(cert.$id),
    title: String(cert.title),
    issuer: String(cert.issuer),
    imageUrl: cert.imageUrl ? String(cert.imageUrl) : "",
    issueDate: credentialDate.format(new Date(String(cert.issueDate))),
    expiryDate: cert.expiryDate
      ? credentialDate.format(new Date(String(cert.expiryDate)))
      : null,
    credentialUrl: cert.credentialUrl ? String(cert.credentialUrl) : null,
  }));

  return (
    <section className="certifications" id="certifications">
      <div className="wrap">
        <Reveal className="credential-intro">
          <div className="eyebrow">Certifications</div>
          <h2>Credentials I&apos;ve earned</h2>
          <p>Proof of curiosity, craft, and the work behind the next idea.</p>
        </Reveal>

        <Reveal className="credential-reveal">
          <CertificationCarousel certifications={slides} />
        </Reveal>
      </div>
    </section>
  );
}

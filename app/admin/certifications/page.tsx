import { prisma } from "@/lib/prisma";
import { createCertification, deleteCertification } from "./actions";

export default async function CertificationsPage() {
  const certifications = await prisma.certification.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <h1>Certifications</h1>

      <form
        action={createCertification}
        style={{ display: "grid", gap: 8, maxWidth: 400, marginBottom: 32 }}
        encType="multipart/form-data"
      >
        <input
          name="title"
          placeholder="Title (e.g. Frontend Development)"
          required
        />
        <input name="issuer" placeholder="Issuer (e.g. TS Academy)" required />
        <label>
          Issue date
          <input name="issueDate" type="date" required />
        </label>
        <label>
          Expiry date (optional)
          <input name="expiryDate" type="date" />
        </label>
        <input name="credentialUrl" placeholder="Credential URL (optional)" />
        <label>
          Certificate image (optional)
          <input name="image" type="file" accept="image/*" />
        </label>
        <button type="submit">Add Certification</button>
      </form>

      <ul>
        {certifications.map((c) => (
          <li key={c.id} style={{ marginBottom: 8 }}>
            <strong>{c.title}</strong> — {c.issuer}
            <form
              action={deleteCertification.bind(null, c.id)}
              style={{ display: "inline", marginLeft: 8 }}
            >
              <button type="submit">Delete</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}

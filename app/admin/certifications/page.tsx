import { tablesDB } from "@/lib/appwrite-server";
import { createCertification, deleteCertification } from "./actions";
import ImageCropInput from "@/components/admin/ImageCropInput";

export const dynamic = "force-dynamic";

export default async function CertificationsPage() {
  const result = await tablesDB.listRows({
    databaseId: process.env.APPWRITE_DATABASE_ID!,
    tableId: process.env.APPWRITE_CERTIFICATIONS_TABLE_ID!,
  });

  const certifications = result.rows.sort(
    (a, b) => Number(a.displayOrder ?? 0) - Number(b.displayOrder ?? 0),
  );

  return (
    <div>
      <h1>Certifications</h1>

      <form action={createCertification} className="admin-form">
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
        <ImageCropInput
          name="image"
          label="Certificate image (optional)"
          aspectRatio={4 / 3}
          helpText="Crop the certificate so its important details remain visible."
        />
        <button type="submit">Add Certification</button>
      </form>

      <ul className="admin-list">
        {certifications.map((c) => (
          <li key={c.$id} className="admin-list-item">
            <div>
              <strong>{c.title}</strong>
              <div className="admin-item-meta">{c.issuer}</div>
            </div>
            <form action={deleteCertification.bind(null, c.$id)}>
              <button type="submit" className="admin-delete-btn">
                Delete
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}

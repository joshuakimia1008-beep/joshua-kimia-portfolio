"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useFormStatus } from "react-dom";
import { saveDashboardAppearance } from "@/app/admin/settings/actions";

type Props = {
  savedImageUrl: string;
  savedOverlay: number;
  savedBlur: number;
};

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button className="appearance-save" type="submit" disabled={pending}>
      {pending ? "Saving to Appwrite…" : "Save appearance"}
    </button>
  );
}

export default function DashboardAppearance({
  savedImageUrl,
  savedOverlay,
  savedBlur,
}: Props) {
  const [previewUrl, setPreviewUrl] = useState(savedImageUrl);
  const [overlay, setOverlay] = useState(savedOverlay);
  const [blur, setBlur] = useState(savedBlur);
  const [desktopPreview, setDesktopPreview] = useState(true);

  useEffect(() => {
    setPreviewUrl(savedImageUrl);
    setOverlay(savedOverlay);
    setBlur(savedBlur);
  }, [savedImageUrl, savedOverlay, savedBlur]);

  function onChooseImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
  }

  return (
    <section className="appearance-card" id="appearance" aria-labelledby="appearance-title">
      <div className="appearance-heading">
        <div>
          <p className="admin-eyebrow">MAKE IT YOURS</p>
          <h2 id="appearance-title">Appearance &amp; background</h2>
          <p>Customize the visual presence of your portfolio.</p>
        </div>
        <span className="appearance-cloud-badge">
          <span aria-hidden="true">●</span> Stored in Appwrite
        </span>
      </div>
      <form action={saveDashboardAppearance} encType="multipart/form-data" className="appearance-form">
        <input type="hidden" name="dashboardBackgroundOverlay" value={overlay} />
        <input type="hidden" name="dashboardBackgroundBlur" value={blur} />
        <div className={`appearance-body${desktopPreview ? " is-desktop-preview" : ""}`}>
          <div className="appearance-preview" aria-label={previewUrl ? "Selected background image preview" : "No custom image selected"} role="img">
            {previewUrl && <div className="appearance-preview-image" style={{ backgroundImage: `linear-gradient(rgba(8, 17, 37, ${overlay / 100}), rgba(8, 17, 37, ${overlay / 100})), url("${previewUrl}")`, filter: `blur(${blur}px)`, transform: blur ? `scale(${1 + blur / 100})` : undefined }} />}
            {previewUrl ? (
              <span className="appearance-preview-label">LIVE PREVIEW</span>
            ) : (
              <div className="appearance-empty-preview">
                <span className="appearance-empty-icon" aria-hidden="true">▧</span>
                <strong>Choose a background image</strong>
                <span>JPG, PNG or WebP · up to 30 MB</span>
              </div>
            )}
          </div>
          <div className="appearance-controls">
            <div className="appearance-control-title">
              <span className="appearance-image-icon" aria-hidden="true">▧</span>
              <div>
                <strong>Custom background image</strong>
                <span>Upload a photo to personalize your portfolio</span>
              </div>
            </div>
            <label className="appearance-upload">
              <input
                name="dashboardBackground"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                onChange={onChooseImage}
              />
              <span aria-hidden="true">⇧</span>
              <span>Choose image</span>
            </label>
            <div className="appearance-sliders">
              <label className="appearance-range-row">
                <span>Overlay</span>
                <input
                  aria-label="Image overlay strength"
                  type="range"
                  min="0"
                  max="80"
                  value={overlay}
                  onChange={(event) => setOverlay(Number(event.target.value))}
                />
                <output>{overlay}%</output>
              </label>
              <label className="appearance-range-row">
                <span>Blur</span>
                <input
                  aria-label="Image blur"
                  type="range"
                  min="0"
                  max="12"
                  value={blur}
                  onChange={(event) => setBlur(Number(event.target.value))}
                />
                <output>{blur}</output>
              </label>
              <label className="appearance-preview-toggle">
                <span>{desktopPreview ? "Desktop" : "Mobile"}</span>
                <input
                  type="checkbox"
                  checked={desktopPreview}
                  onChange={(event) => setDesktopPreview(event.target.checked)}
                />
                <span className="appearance-switch" aria-hidden="true" />
              </label>
            </div>
            <div className="appearance-actions">
              <SaveButton />
              {savedImageUrl && (
                <button
                  className="appearance-remove"
                  type="submit"
                  name="removeDashboardBackground"
                  value="true"
                  formAction={saveDashboardAppearance}
                >
                  Remove image
                </button>
              )}
            </div>
            <p className="appearance-note">The image is uploaded to your configured Appwrite Storage bucket; display settings are saved with your settings record.</p>
          </div>
        </div>
      </form>
    </section>
  );
}

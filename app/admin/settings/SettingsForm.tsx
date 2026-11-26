"use client";

import { useState } from "react";
import { updateSettings } from "./actions";
import ImageCropInput from "@/components/admin/ImageCropInput";
import ProfilePhotoManager from "@/components/admin/ProfilePhotoManager";
import { parseProfileImageUrls } from "@/components/profileImages";

type Settings = {
  bio: string | null;
  profileImageUrl: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  faviconUrl: string | null;
  ogImageUrl: string | null;
  resumeUrl: string | null;
  contactEmail: string | null;
  location: string | null;
  availability: string;
  footerVideoUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
} | null;

const tabs = [
  "Profile",
  "Branding",
  "Resume",
  "Contact & Availability",
  "Footer Video",
  "SEO",
];

export default function SettingsForm({ settings }: { settings: Settings }) {
  const [activeTab, setActiveTab] = useState("Profile");

  return (
    <form
      action={updateSettings}
      encType="multipart/form-data"
      className="admin-form"
      style={{ maxWidth: 560 }}
    >
      <div className="settings-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`settings-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div
        className={`settings-panel ${activeTab === "Profile" ? "active" : ""}`}
      >
        <label>
          Bio
          <textarea
            name="bio"
            defaultValue={settings?.bio ?? ""}
            placeholder="A short bio about yourself"
          />
        </label>
        <ProfilePhotoManager initialUrls={parseProfileImageUrls(settings?.profileImageUrl)} />
        <input
          name="githubUrl"
          placeholder="GitHub URL"
          defaultValue={settings?.githubUrl ?? ""}
        />
        <input
          name="linkedinUrl"
          placeholder="LinkedIn URL"
          defaultValue={settings?.linkedinUrl ?? ""}
        />
        <input
          name="twitterUrl"
          placeholder="Twitter/X URL"
          defaultValue={settings?.twitterUrl ?? ""}
        />
      </div>

      <div
        className={`settings-panel ${activeTab === "Branding" ? "active" : ""}`}
      >
        <ImageCropInput
          name="favicon"
          label="Favicon (browser tab icon)"
          aspectRatio={1}
          currentImageUrl={settings?.faviconUrl}
          helpText="Square crop recommended."
        />
        <ImageCropInput
          name="ogImage"
          label="Open Graph image (link preview image)"
          aspectRatio={1.91}
          currentImageUrl={settings?.ogImageUrl}
          helpText="Wide crop for link previews."
        />
      </div>

      <div
        className={`settings-panel ${activeTab === "Resume" ? "active" : ""}`}
      >
        <label>
          Resume/CV (PDF)
          <input name="resume" type="file" accept="application/pdf" />
        </label>
        {settings?.resumeUrl && (
          <a
            href={settings.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Current resume →
          </a>
        )}
      </div>

      <div
        className={`settings-panel ${activeTab === "Contact & Availability" ? "active" : ""}`}
      >
        <input
          name="contactEmail"
          placeholder="Public contact email"
          defaultValue={settings?.contactEmail ?? ""}
        />
        <input
          name="location"
          placeholder="Location / Timezone (e.g. Abuja, Nigeria)"
          defaultValue={settings?.location ?? ""}
        />
        <select
          name="availability"
          defaultValue={settings?.availability ?? "AVAILABLE"}
        >
          <option value="AVAILABLE">Available for Hire</option>
          <option value="BUSY">Busy</option>
          <option value="NOT_ACCEPTING">Not Accepting Work</option>
        </select>
      </div>

      <div
        className={`settings-panel ${activeTab === "Footer Video" ? "active" : ""}`}
      >
        <label>
          Footer background video
          <input name="footerVideo" type="file" accept="video/*" />
        </label>
        {settings?.footerVideoUrl && <p>Current: {settings.footerVideoUrl}</p>}
      </div>

      <div className={`settings-panel ${activeTab === "SEO" ? "active" : ""}`}>
        <label>
          SEO Title
          <input
            name="seoTitle"
            placeholder="Page title for search engines"
            defaultValue={settings?.seoTitle ?? ""}
          />
        </label>
        <label>
          SEO Description
          <textarea
            name="seoDescription"
            placeholder="Meta description for search engines"
            defaultValue={settings?.seoDescription ?? ""}
          />
        </label>
      </div>

      <button type="submit" style={{ marginTop: 20 }}>
        Save Settings
      </button>
    </form>
  );
}

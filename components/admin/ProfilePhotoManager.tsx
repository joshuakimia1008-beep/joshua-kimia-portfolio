"use client";

import { useEffect, useState, type ChangeEvent } from "react";

export default function ProfilePhotoManager({
  initialUrls,
}: {
  initialUrls: string[];
}) {
  const [urls, setUrls] = useState(initialUrls);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const initialUrlsKey = JSON.stringify(initialUrls);
  useEffect(() => {
    setUrls(JSON.parse(initialUrlsKey) as string[]);
    setSelectedFiles([]);
  }, [initialUrlsKey]);

  return (
    <section className="profile-photo-manager" aria-labelledby="hero-photos-heading">
      <div className="profile-photo-manager-heading">
        <div>
          <h3 id="hero-photos-heading">Hero photo slideshow</h3>
          <p>Add several photos. The first photo also remains your About portrait.</p>
        </div>
        <span className="profile-photo-count">{urls.length} saved{selectedFiles.length ? ` · ${selectedFiles.length} selected` : ""}</span>
      </div>
      {urls.length > 0 ? (
        <div className="profile-photo-list">
          {urls.map((url, index) => (
            <div className="profile-photo-item" key={`${url}-${index}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Saved hero photo ${index + 1}`} />
              <span className="profile-photo-item-copy">
                <strong>{index === 0 ? "Photo 1 · About portrait" : `Photo ${index + 1}`}</strong>
                <small>{index === 0 ? "Shown first in the hero slideshow" : "Included in the hero slideshow"}</small>
              </span>
              <span className="profile-photo-order">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => setUrls((current) => {
                    const next = [...current];
                    [next[index - 1], next[index]] = [next[index], next[index - 1]];
                    return next;
                  })}
                  aria-label={`Move photo ${index + 1} earlier`}
                >↑</button>
                <button
                  type="button"
                  disabled={index === urls.length - 1}
                  onClick={() => setUrls((current) => {
                    const next = [...current];
                    [next[index], next[index + 1]] = [next[index + 1], next[index]];
                    return next;
                  })}
                  aria-label={`Move photo ${index + 1} later`}
                >↓</button>
              </span>
              <button
                className="profile-photo-remove"
                type="button"
                onClick={() => setUrls((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                aria-label={`Remove photo ${index + 1}`}
              >
                Remove
              </button>
              <input type="hidden" name="profileImageUrls" value={url} />
            </div>
          ))}
        </div>
      ) : (
        <p className="profile-photo-empty">No photos saved yet. Choose one or more photos below.</p>
      )}
      <label className="profile-photo-upload">
        <span className="profile-photo-upload-icon" aria-hidden="true">＋</span>
        <span><strong>Add photos</strong><small>Choose multiple image files at once</small></span>
        <input
          name="profileImageFiles"
          type="file"
          accept="image/*"
          multiple
          onChange={(event: ChangeEvent<HTMLInputElement>) => setSelectedFiles((Array.from(event.currentTarget.files ?? []) as File[]).map((file) => file.name))}
        />
      </label>
      {selectedFiles.length > 0 && (
        <ul className="profile-photo-queued" aria-label="Photos selected for upload">
          {selectedFiles.map((name, index) => <li key={`${name}-${index}`}>{name}</li>)}
        </ul>
      )}
      <p className="profile-photo-manager-note">The hero shows one photo at a time and rotates through saved photos. Add up to 12 photos at once (10 MB max each). New photos follow saved photos in selection order.</p>
    </section>
  );
}

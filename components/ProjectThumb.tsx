"use client";

import { useState } from "react";

export default function ProjectThumb({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div className="p-shot p-shot-placeholder">
        <span>{title.slice(0, 2).toUpperCase()}</span>
        <p>Preview coming soon</p>
      </div>
    );
  }

  return (
    <div className="p-shot">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${title} project preview`}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

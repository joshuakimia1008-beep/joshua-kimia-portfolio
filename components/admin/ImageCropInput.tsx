"use client";

import { useEffect, useRef, useState } from "react";

type ImageCropInputProps = {
  name: string;
  label: string;
  aspectRatio: number;
  currentImageUrl?: string | null;
  helpText?: string;
};
type Size = { width: number; height: number };
type Pan = { x: number; y: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function ImageCropInput({
  name,
  label,
  aspectRatio,
  currentImageUrl,
  helpText = "Choose a picture, then drag and zoom to crop it before saving.",
}: ImageCropInputProps) {
  const pickerRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cropImageRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const pendingUrlRef = useRef<string | null>(null);
  const previewBlobUrlRef = useRef<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl ?? null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<Size | null>(null);
  const [stageSize, setStageSize] = useState<Size>({ width: 0, height: 0 });
  const [sourceMimeType, setSourceMimeType] = useState("image/png");
  const [cropImageReady, setCropImageReady] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Pan>({ x: 0, y: 0 });
  const [isCropping, setIsCropping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isCropping || !stageRef.current) return;
    const stage = stageRef.current;
    const measure = () => setStageSize({ width: stage.clientWidth, height: stage.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [isCropping, pendingUrl]);

  useEffect(() => {
    if (!isCropping) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isCropping]);

  useEffect(() => () => {
    if (pendingUrlRef.current) URL.revokeObjectURL(pendingUrlRef.current);
    if (previewBlobUrlRef.current) URL.revokeObjectURL(previewBlobUrlRef.current);
  }, []);

  function chooseImage() {
    pickerRef.current?.click();
  }

  function onFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    if (pendingUrlRef.current) URL.revokeObjectURL(pendingUrlRef.current);
    const url = URL.createObjectURL(file);
    pendingUrlRef.current = url;
    setPendingUrl(url);
    setNaturalSize(null);
    setStageSize({ width: 0, height: 0 });
    setSourceMimeType(file.type || "image/png");
    setCropImageReady(false);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    const probe = new window.Image();
    probe.onload = () => {
      setNaturalSize({ width: probe.naturalWidth, height: probe.naturalHeight });
      setIsCropping(true);
    };
    probe.onerror = () => {
      URL.revokeObjectURL(url);
      pendingUrlRef.current = null;
      setPendingUrl(null);
      setError("That image could not be opened. Please choose another file.");
      if (pickerRef.current) pickerRef.current.value = "";
    };
    probe.src = url;
  }

  function getDisplaySize(stage: HTMLDivElement, image: Size, scale: number) {
    const base = Math.max(stage.clientWidth / image.width, stage.clientHeight / image.height);
    return { width: image.width * base * scale, height: image.height * base * scale };
  }

  function updatePan(next: Pan) {
    const stage = stageRef.current;
    if (!stage || !naturalSize) return;
    const display = getDisplaySize(stage, naturalSize, zoom);
    const maxX = Math.max(0, (display.width - stage.clientWidth) / 2);
    const maxY = Math.max(0, (display.height - stage.clientHeight) / 2);
    setPan({ x: clamp(next.x, -maxX, maxX), y: clamp(next.y, -maxY, maxY) });
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!naturalSize || event.button !== 0) return;
    dragRef.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    updatePan({
      x: drag.panX + event.clientX - drag.x,
      y: drag.panY + event.clientY - drag.y,
    });
  }

  function onZoomChange(value: number) {
    setZoom(value);
    const stage = stageRef.current;
    if (!stage || !naturalSize) return;
    const display = getDisplaySize(stage, naturalSize, value);
    const maxX = Math.max(0, (display.width - stage.clientWidth) / 2);
    const maxY = Math.max(0, (display.height - stage.clientHeight) / 2);
    setPan((current) => ({ x: clamp(current.x, -maxX, maxX), y: clamp(current.y, -maxY, maxY) }));
  }

  function closeCropper() {
    setIsCropping(false);
    setIsDragging(false);
    dragRef.current = null;
    if (pendingUrlRef.current) URL.revokeObjectURL(pendingUrlRef.current);
    pendingUrlRef.current = null;
    setPendingUrl(null);
    if (pickerRef.current) pickerRef.current.value = "";
  }

  async function applyCrop() {
    const stage = stageRef.current;
    const image = cropImageRef.current;
    const upload = uploadRef.current;
    if (!stage || !image || !naturalSize || !upload) return;
    setIsSaving(true);
    setError("");
    try {
      const stageWidth = stage.clientWidth;
      const stageHeight = stage.clientHeight;
      const baseScale = Math.max(stageWidth / naturalSize.width, stageHeight / naturalSize.height);
      const imageScale = baseScale * zoom;
      const displayWidth = naturalSize.width * imageScale;
      const displayHeight = naturalSize.height * imageScale;
      const sourceX = clamp((displayWidth - stageWidth) / (2 * imageScale) - pan.x / imageScale, 0, naturalSize.width);
      const sourceY = clamp((displayHeight - stageHeight) / (2 * imageScale) - pan.y / imageScale, 0, naturalSize.height);
      const sourceWidth = Math.min(stageWidth / imageScale, naturalSize.width - sourceX);
      const sourceHeight = Math.min(stageHeight / imageScale, naturalSize.height - sourceY);
      const outputWidth = Math.min(1800, Math.max(1, Math.round(sourceWidth)));
      const outputHeight = Math.round(outputWidth / aspectRatio);
      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Your browser could not prepare the cropped image.");
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, outputWidth, outputHeight);
      const outputType = sourceMimeType === "image/jpeg" ? "image/jpeg" : "image/png";
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, outputType, .92));
      if (!blob) throw new Error("The crop could not be saved. Please try again.");
      const extension = blob.type === "image/jpeg" ? "jpg" : "png";
      const croppedFile = new File([blob], `${name}-cropped.${extension}`, { type: blob.type, lastModified: Date.now() });
      const transfer = new DataTransfer();
      transfer.items.add(croppedFile);
      upload.files = transfer.files;
      if (previewBlobUrlRef.current) URL.revokeObjectURL(previewBlobUrlRef.current);
      const croppedUrl = URL.createObjectURL(blob);
      previewBlobUrlRef.current = croppedUrl;
      setPreviewUrl(croppedUrl);
      closeCropper();
    } catch (cropError) {
      setError(cropError instanceof Error ? cropError.message : "The image could not be cropped.");
    } finally {
      setIsSaving(false);
    }
  }

  const baseScale = naturalSize && stageSize.width > 0 && stageSize.height > 0
    ? Math.max(stageSize.width / naturalSize.width, stageSize.height / naturalSize.height)
    : 1;
  const displayWidth = naturalSize ? naturalSize.width * baseScale * zoom : 0;
  const displayHeight = naturalSize ? naturalSize.height * baseScale * zoom : 0;

  return (
    <div className="image-crop-input">
      <input ref={pickerRef} className="image-crop-picker" type="file" accept="image/*" onChange={onFileSelected} tabIndex={-1} aria-hidden="true" />
      <input ref={uploadRef} className="image-crop-upload" type="file" name={name} accept="image/*" tabIndex={-1} aria-hidden="true" />
      <div className="image-crop-input-row">
        {previewUrl && <img className="image-crop-preview" src={previewUrl} alt={`Current ${label.toLowerCase()}`} />}
        <div className="image-crop-input-copy">
          <strong>{label}</strong>
          <span>{helpText}</span>
          <button className="image-crop-choose" type="button" onClick={chooseImage}>
            {previewUrl ? "Choose / crop another image" : "Choose image to crop"}
          </button>
          {error && !isCropping && <span className="image-crop-error" role="alert">{error}</span>}
        </div>
      </div>

      {isCropping && pendingUrl && (
        <div className="image-crop-overlay" role="presentation">
          <section
            className="image-crop-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`crop-title-${name}`}
            onKeyDown={(event) => { if (event.key === "Escape" && !isSaving) closeCropper(); }}
          >
            <header className="image-crop-dialog-header">
              <div>
                <span className="image-crop-eyebrow">Image editor</span>
                <h2 id={`crop-title-${name}`}>Crop {label.toLowerCase()}</h2>
                <p>Drag the image to reposition it, then adjust the zoom.</p>
              </div>
              <button type="button" className="image-crop-close" onClick={closeCropper} aria-label="Cancel crop">×</button>
            </header>
            <div
              ref={stageRef}
              className={`image-crop-stage${isDragging ? " is-dragging" : ""}`}
              style={{ aspectRatio: String(aspectRatio) }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={() => { dragRef.current = null; setIsDragging(false); }}
              onPointerCancel={() => { dragRef.current = null; setIsDragging(false); }}
            >
              {naturalSize && <img
                ref={cropImageRef}
                src={pendingUrl}
                alt="Image crop preview"
                draggable={false}
                onLoad={() => setCropImageReady(true)}
                style={{
                  width: `${displayWidth}px`,
                  height: `${displayHeight}px`,
                  visibility: stageSize.width > 0 ? "visible" : "hidden",
                  transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px))`,
                }}
              />}
              <span className="image-crop-frame" aria-hidden="true" />
            </div>
            <div className="image-crop-tools">
              <label className="image-crop-zoom">
                <span>Zoom</span>
                <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={(event) => onZoomChange(Number(event.target.value))} aria-label="Zoom image" />
                <output>{zoom.toFixed(1)}×</output>
              </label>
              <button type="button" className="image-crop-reset" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>Reset</button>
            </div>
            {error && <p className="image-crop-error" role="alert">{error}</p>}
            <footer className="image-crop-actions">
              <button type="button" className="image-crop-cancel" onClick={closeCropper}>Cancel</button>
              <button type="button" className="image-crop-apply" onClick={applyCrop} disabled={!naturalSize || !cropImageReady || isSaving}>
                {isSaving ? "Preparing crop…" : "Use this crop"}
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}

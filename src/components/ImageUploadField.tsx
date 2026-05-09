"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

type ImageUploadFieldProps = {
  name: string;
  label: string;
  currentImages?: string[];
  hint?: string;
  className?: string;
  maxImages?: number;
};

const DEFAULT_MAX = 11;
const ACCEPT = "image/jpeg,image/jpg,image/png,image/webp,image/gif,image/avif,image/heic,image/heif";

export function ImageUploadField({
  name,
  label,
  currentImages,
  hint,
  className,
  maxImages = DEFAULT_MAX,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  function syncInput(next: File[]) {
    if (typeof DataTransfer === "undefined" || !inputRef.current) return;
    const dt = new DataTransfer();
    next.forEach((f) => dt.items.add(f));
    inputRef.current.files = dt.files;
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    if (picked.length === 0) return;

    setError(null);

    const merged = [...files];
    let dropped = 0;
    for (const file of picked) {
      if (merged.length >= maxImages) {
        dropped++;
        continue;
      }
      const isDuplicate = merged.some(
        (existing) =>
          existing.name === file.name &&
          existing.size === file.size &&
          existing.lastModified === file.lastModified,
      );
      if (isDuplicate) continue;
      merged.push(file);
    }

    if (dropped > 0) {
      setError(
        `Maximum ${maxImages} images allowed. ${dropped} extra ${dropped === 1 ? "file was" : "files were"} skipped.`,
      );
    }

    setFiles(merged);
    syncInput(merged);
  }

  function removeAt(index: number) {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    syncInput(next);
    setError(null);
  }

  function clearAll() {
    setFiles([]);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  const hasNew = files.length > 0;
  const currentCount = currentImages?.length ?? 0;
  const remaining = Math.max(0, maxImages - files.length);
  const defaultHint = hasNew
    ? `Uploading these ${files.length} ${files.length === 1 ? "image replaces" : "images replace"} all current images.`
    : currentCount > 0
      ? `Pick up to ${maxImages} images to replace the current ${currentCount}. Otherwise the existing photos stay.`
      : `Choose up to ${maxImages} images. They are auto-resized and optimized.`;

  return (
    <div className={`image-upload-field ${className ?? ""}`}>
      <div className="image-upload-field-head">
        <span className="image-upload-field-label">{label}</span>
        <span className="image-upload-field-counter">
          {hasNew
            ? `${files.length} / ${maxImages} new`
            : `${currentCount} / ${maxImages} saved`}
        </span>
      </div>

      {hasNew ? (
        <div className="image-upload-grid">
          {previews.map((url, idx) => (
            <figure key={`${files[idx].name}-${idx}`} className="image-upload-tile image-upload-tile-new">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`New upload ${idx + 1}`} />
              {idx === 0 ? (
                <span className="image-upload-tile-cover">Cover</span>
              ) : null}
              <button
                type="button"
                className="image-upload-tile-remove"
                onClick={() => removeAt(idx)}
                aria-label={`Remove ${files[idx].name}`}
                title="Remove"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            </figure>
          ))}
        </div>
      ) : currentCount > 0 ? (
        <div className="image-upload-grid">
          {currentImages!.slice(0, maxImages).map((src, idx) => (
            <figure key={`${src}-${idx}`} className="image-upload-tile image-upload-tile-current">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Current ${idx + 1}`} />
              {idx === 0 ? (
                <span className="image-upload-tile-cover">Cover</span>
              ) : null}
            </figure>
          ))}
        </div>
      ) : (
        <div className="image-upload-empty">
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-5-5L5 21" />
          </svg>
          <span>No photos yet</span>
        </div>
      )}

      <div className="image-upload-actions">
        <label className="image-upload-btn">
          <input
            ref={inputRef}
            type="file"
            name={name}
            accept={ACCEPT}
            multiple={maxImages > 1}
            onChange={onFileChange}
            className="image-upload-input-hidden"
            disabled={remaining === 0}
          />
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span>
            {hasNew
              ? remaining === 0
                ? "Maximum reached"
                : `Add more (${remaining} left)`
              : currentCount > 0
                ? "Replace photos"
                : `Upload up to ${maxImages} photos`}
          </span>
        </label>

        {hasNew ? (
          <button
            type="button"
            className="image-upload-clear"
            onClick={clearAll}
          >
            Clear selection
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="image-upload-error" role="alert">
          {error}
        </p>
      ) : (
        <p className="image-upload-hint">{hint ?? defaultHint}</p>
      )}
    </div>
  );
}

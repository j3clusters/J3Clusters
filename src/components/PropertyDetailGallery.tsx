"use client";

import { useCallback, useEffect, useState } from "react";

type PropertyDetailGalleryProps = {
  title: string;
  images: string[];
};

export function PropertyDetailGallery({
  title,
  images,
}: PropertyDetailGalleryProps) {
  const safeImages = images.filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  const goPrev = useCallback(() => {
    setLightboxIndex((i) =>
      i <= 0 ? safeImages.length - 1 : i - 1,
    );
  }, [safeImages.length]);

  const goNext = useCallback(() => {
    setLightboxIndex((i) =>
      i >= safeImages.length - 1 ? 0 : i + 1,
    );
  }, [safeImages.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, closeLightbox, goPrev, goNext]);

  if (!safeImages.length) {
    return null;
  }

  const hero = safeImages[activeIndex] ?? safeImages[0];

  return (
    <div className="property-detail-gallery">
      <button
        type="button"
        className="property-detail-hero"
        onClick={() => openLightbox(activeIndex)}
        aria-label={`View full size: ${title}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={hero} alt={title} className="property-detail-hero-img" />
        <span className="property-detail-hero-shade" aria-hidden />
        <span className="property-detail-hero-hint">
          <span className="property-detail-hero-hint-icon" aria-hidden>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          Tap to view full size
        </span>
      </button>

      {safeImages.length > 1 ? (
        <div className="property-detail-thumbs" role="list">
          {safeImages.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              role="listitem"
              className={
                index === activeIndex
                  ? "property-detail-thumb is-active"
                  : "property-detail-thumb"
              }
              onClick={() => {
                setActiveIndex(index);
                openLightbox(index);
              }}
              aria-label={`View photo ${index + 1} of ${safeImages.length}`}
              aria-current={index === activeIndex ? "true" : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" />
            </button>
          ))}
        </div>
      ) : null}

      {lightboxOpen ? (
        <div
          className="property-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Image gallery"
        >
          <button
            type="button"
            className="property-lightbox-backdrop"
            onClick={closeLightbox}
            aria-label="Close gallery"
          />
          <div className="property-lightbox-inner">
            <button
              type="button"
              className="property-lightbox-close"
              onClick={closeLightbox}
              aria-label="Close"
            >
              ×
            </button>
            {safeImages.length > 1 ? (
              <>
                <button
                  type="button"
                  className="property-lightbox-nav property-lightbox-prev"
                  onClick={goPrev}
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="property-lightbox-nav property-lightbox-next"
                  onClick={goNext}
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            ) : null}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={safeImages[lightboxIndex]}
              alt={`${title} — photo ${lightboxIndex + 1}`}
              className="property-lightbox-img"
            />
            <p className="property-lightbox-caption">
              {lightboxIndex + 1} / {safeImages.length}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

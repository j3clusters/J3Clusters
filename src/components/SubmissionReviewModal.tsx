"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useState,
  type MouseEvent,
} from "react";

import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";

type ServerAction = (formData: FormData) => void | Promise<void>;

export type SubmissionReviewData = {
  id: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerPhotoUrl: string;
  type: string;
  purpose: "Sale" | "Rent";
  city: string;
  address: string;
  areaSqft: number;
  bedrooms: number;
  bathrooms: number;
  balconies: number;
  parkingSpots: number;
  furnishing: string;
  propertyAgeYears: number;
  availableFrom: string;
  legalClearance: boolean;
  price: number;
  description: string;
  images: string[];
  createdAtIso: string;
};

type SubmissionReviewModalProps = {
  submission: SubmissionReviewData;
  approveAction: ServerAction;
  rejectAction: ServerAction;
  markReviewedAction: ServerAction;
  reviewedAtIso: string | null;
};

function formatPriceInr(value: number) {
  return value.toLocaleString("en-IN");
}

function formatDateIso(iso: string) {
  if (!iso) return "—";
  return iso.replace("T", " ").slice(0, 16);
}

function purposeLabel(purpose: "Sale" | "Rent") {
  return purpose === "Rent" ? "For rent" : "For sale";
}

function furnishingDisplay(value: string) {
  if (value === "SemiFurnished") return "Semi-furnished";
  return value;
}

export function SubmissionReviewModal({
  submission,
  approveAction,
  rejectAction,
  markReviewedAction,
  reviewedAtIso,
}: SubmissionReviewModalProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  function onTriggerClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }
    }

    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close]);

  const isPlot = submission.type === "Plot";
  const isPG = submission.type === "PG";
  const showRoomDetails = !isPlot;
  const bedroomLabel = isPG ? "Rooms" : "Bedrooms";
  const bathroomLabel = isPG ? "Bathrooms (shared/attached)" : "Bathrooms";
  const priceLabel = isPG ? "Monthly rent" : "Expected price";

  return (
    <>
      <button
        type="button"
        className="secondary-btn submission-review-trigger"
        onClick={onTriggerClick}
      >
        Review
      </button>

      {open ? (
        <div
          className="edit-modal-backdrop"
          role="presentation"
          onClick={close}
        >
          <div
            className="edit-modal edit-modal-lg submission-review-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`review-modal-title-${submission.id}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="edit-modal-header">
              <div className="edit-modal-heading">
                <h2
                  id={`review-modal-title-${submission.id}`}
                  className="edit-modal-title"
                >
                  Review submission
                </h2>
                <p className="edit-modal-subtitle">
                  {submission.ownerName} · {submission.type} in {submission.city}
                </p>
                {reviewedAtIso ? (
                  <p className="submission-review-banner submission-review-banner-done">
                    Review recorded — you can approve to publish this listing.
                  </p>
                ) : (
                  <p className="submission-review-banner submission-review-banner-pending">
                    Review the details below, then use <strong>Mark as reviewed</strong>{" "}
                    before approving.
                  </p>
                )}
              </div>
            </div>

            <div className="edit-modal-body">
              <div className="submission-review-content">
                <section className="submission-review-section">
                  <h3>Property consultant</h3>
                  {submission.ownerPhotoUrl.trim() ? (
                    <div className="submission-review-consultant-photo">
                      <Image
                        src={submission.ownerPhotoUrl.trim()}
                        alt=""
                        width={64}
                        height={64}
                        className="submission-review-consultant-photo-img"
                        unoptimized={submission.ownerPhotoUrl.trim().startsWith("http")}
                      />
                    </div>
                  ) : null}
                  <dl className="submission-review-grid">
                    <div>
                      <dt>Name</dt>
                      <dd>{submission.ownerName}</dd>
                    </div>
                    <div>
                      <dt>Email</dt>
                      <dd>
                        <a
                          className="admin-contact-chip"
                          href={`mailto:${submission.ownerEmail}`}
                        >
                          {submission.ownerEmail}
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt>Phone</dt>
                      <dd>
                        <a
                          className="admin-contact-chip"
                          href={`tel:${submission.ownerPhone}`}
                        >
                          {submission.ownerPhone}
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt>Submitted</dt>
                      <dd>{formatDateIso(submission.createdAtIso)}</dd>
                    </div>
                  </dl>
                </section>

                <section className="submission-review-section">
                  <h3>Property</h3>
                  <dl className="submission-review-grid">
                    <div>
                      <dt>Property for</dt>
                      <dd>{purposeLabel(submission.purpose)}</dd>
                    </div>
                    <div>
                      <dt>Type</dt>
                      <dd>{submission.type}</dd>
                    </div>
                    <div>
                      <dt>City</dt>
                      <dd>{submission.city}</dd>
                    </div>
                    <div>
                      <dt>Area</dt>
                      <dd>
                        {submission.areaSqft.toLocaleString("en-IN")} sqft
                      </dd>
                    </div>
                    <div className="submission-review-grid-full">
                      <dt>Full address</dt>
                      <dd>{submission.address}</dd>
                    </div>
                    {showRoomDetails ? (
                      <>
                        <div>
                          <dt>{bedroomLabel}</dt>
                          <dd>{submission.bedrooms}</dd>
                        </div>
                        <div>
                          <dt>{bathroomLabel}</dt>
                          <dd>{submission.bathrooms}</dd>
                        </div>
                        <div>
                          <dt>Balconies</dt>
                          <dd>{submission.balconies}</dd>
                        </div>
                        <div>
                          <dt>Parking spots</dt>
                          <dd>{submission.parkingSpots}</dd>
                        </div>
                        <div>
                          <dt>Furnishing</dt>
                          <dd>{furnishingDisplay(submission.furnishing)}</dd>
                        </div>
                        <div>
                          <dt>Property age</dt>
                          <dd>{submission.propertyAgeYears} years</dd>
                        </div>
                      </>
                    ) : null}
                    <div>
                      <dt>Available from</dt>
                      <dd>{submission.availableFrom || "—"}</dd>
                    </div>
                    <div>
                      <dt>{priceLabel}</dt>
                      <dd>INR {formatPriceInr(submission.price)}</dd>
                    </div>
                    <div>
                      <dt>Legal clearance</dt>
                      <dd>{submission.legalClearance ? "Confirmed" : "Not confirmed"}</dd>
                    </div>
                  </dl>
                </section>

                <section className="submission-review-section">
                  <h3>Description</h3>
                  <p className="submission-review-description">
                    {submission.description || "—"}
                  </p>
                </section>

                {submission.images.length > 0 ? (
                  <section className="submission-review-section">
                    <h3>Photos ({submission.images.length})</h3>
                    <div className="submission-review-gallery">
                      {submission.images.map((src) => (
                        <a
                          key={src}
                          href={src}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="submission-review-photo"
                        >
                          <Image
                            src={src}
                            alt={`${submission.type} in ${submission.city}`}
                            width={240}
                            height={160}
                          />
                        </a>
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>
            </div>

            <div className="edit-modal-footer submission-review-footer">
              <button
                type="button"
                className="edit-modal-cancel"
                onClick={close}
              >
                Close
              </button>
              <form action={rejectAction}>
                <ConfirmSubmitButton
                  className="secondary-btn"
                  title="Reject submission"
                  confirmLabel="Reject"
                  confirmMessage="Reject this submission? The property consultant will not see it go live."
                >
                  Reject
                </ConfirmSubmitButton>
              </form>
              {!reviewedAtIso ? (
                <form action={markReviewedAction}>
                  <ConfirmSubmitButton
                    variant="primary"
                    title="Mark submission as reviewed"
                    confirmLabel="Mark as reviewed"
                    confirmMessage="Record that you have reviewed this submission? You can then approve to publish it as a live listing."
                  >
                    Mark as reviewed
                  </ConfirmSubmitButton>
                </form>
              ) : (
                <form action={approveAction}>
                  <ConfirmSubmitButton
                    variant="primary"
                    title="Approve & publish"
                    confirmLabel="Approve & publish"
                    confirmMessage={`Publish "${submission.type} in ${submission.city}" as a live listing?`}
                  >
                    Approve & publish
                  </ConfirmSubmitButton>
                </form>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

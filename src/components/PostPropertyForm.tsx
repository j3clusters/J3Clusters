"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

export type PostPropertyAccountProfile = {
  name: string;
  email: string;
  phone: string;
  city: string;
};

import type { PropertyFormInitial } from "@/lib/property-form-initial";
import { CONSULTANT } from "@/lib/consultant-labels";

export type { PropertyFormInitial };

type PostPropertyFormProps = {
  accountProfile?: PostPropertyAccountProfile | null;
  initial?: PropertyFormInitial | null;
};

const PROPERTY_TYPES = [
  { value: "Apartment", label: "Apartment", hint: "Flats & units" },
  { value: "Villa", label: "Villa", hint: "Independent homes" },
  { value: "Plot", label: "Plot", hint: "Land only" },
  { value: "PG", label: "PG", hint: "Shared stays" },
] as const;

export function PostPropertyForm({
  accountProfile = null,
  initial = null,
}: PostPropertyFormProps) {
  const isEdit = Boolean(initial);
  const [propertyPurpose, setPropertyPurpose] = useState<"Sale" | "Rent" | "">(
    initial?.purpose ?? "",
  );
  const [propertyType, setPropertyType] = useState<
    "Apartment" | "Villa" | "Plot" | "PG" | ""
  >(initial?.type ?? "");
  const [keptImages, setKeptImages] = useState<string[]>(initial?.imageUrls ?? []);
  const [photoCount, setPhotoCount] = useState(0);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{
    text: string;
    ok: boolean;
  } | null>(null);

  const isResidential = propertyType === "Apartment" || propertyType === "Villa";
  const isPlot = propertyType === "Plot";
  const isPG = propertyType === "PG";
  const requiresRoomDetails = isResidential || propertyType === "PG";
  const requiresBalconyAndParking = isResidential || isPG;
  const requiresFurnishing = requiresRoomDetails;
  const bedroomLabel = isPG ? "Rooms available" : "Bedrooms";
  const bathroomLabel = isPG ? "Shared/attached bathrooms" : "Bathrooms";
  const areaLabel = isPlot ? "Plot area (sqft)" : "Area (sqft)";
  const areaPlaceholder = isPlot ? "e.g. 2400" : "e.g. 1200";
  const priceLabel = isPG ? "Monthly rent (INR)" : "Expected price (INR)";
  const priceStep = isPG ? 1000 : 100000;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setPending(true);

    const form = event.currentTarget;
    const data = new FormData(form);
    const endpoint = initial?.submissionId
      ? `/api/submissions/${initial.submissionId}`
      : initial?.listingId
        ? `/api/listings/${initial.listingId}/resubmit`
        : "/api/submissions";
    const method = isEdit ? "PATCH" : "POST";
    try {
      const response = await fetch(endpoint, {
        method,
        credentials: "same-origin",
        body: data,
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const details = payload?.details as
          | { fieldErrors?: Record<string, string[] | undefined> }
          | undefined;
        const firstFieldError = details?.fieldErrors
          ? Object.values(details.fieldErrors).flat().find(Boolean)
          : undefined;
        setFeedback({
          text:
            typeof firstFieldError === "string"
              ? firstFieldError
              : typeof payload.error === "string"
                ? payload.error
                : isEdit
                  ? "Save failed."
                  : "Submit failed.",
          ok: false,
        });
        return;
      }

      if (!isEdit) {
        form.reset();
        setPropertyPurpose("");
        setPropertyType("");
        setPhotoCount(0);
        setKeptImages([]);
      }
      setFeedback({
        text: isEdit
          ? "Changes saved. Your listing is off the public site until the team approves the update. Track status on My properties."
          : "Received. Your property is queued for verification. It must be approved before it appears publicly. Track status anytime from My properties using the links at the top of this page.",
        ok: true,
      });
    } catch {
      setFeedback({ text: "Network error. Please try again.", ok: false });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="owner-form-card post-property-form-card">
      <div className="post-property-form-head">
        {!isEdit ? (
          <p className="post-property-form-head-eyebrow">New listing form</p>
        ) : null}
        <h2>{isEdit ? "Edit listing" : "Listing details"}</h2>
        <p className="post-property-form-intro">
          {isEdit
            ? "Update each section below. After you save, the listing is hidden until J3 Clusters approves your changes."
            : "Work through all four sections in order. Required fields are marked with * — optional hints update when you change property type (sale/rent, apartment, villa, plot, or PG)."}
        </p>
        {!isEdit ? (
          <ol className="post-property-form-sections-guide" aria-label="Form sections">
            <li>
              <span className="post-property-form-sections-guide-num">1</span>
              <span>
                <strong>Agent contact</strong>
                <span>Name, email, phone, and photo for buyers</span>
              </span>
            </li>
            <li>
              <span className="post-property-form-sections-guide-num">2</span>
              <span>
                <strong>Property details</strong>
                <span>Type, location, price, size, and amenities</span>
              </span>
            </li>
            <li>
              <span className="post-property-form-sections-guide-num">3</span>
              <span>
                <strong>Photos</strong>
                <span>Up to 13 images — first photo is the cover</span>
              </span>
            </li>
            <li>
              <span className="post-property-form-sections-guide-num">4</span>
              <span>
                <strong>Description &amp; submit</strong>
                <span>Title, description, then send for review</span>
              </span>
            </li>
          </ol>
        ) : null}
      </div>

      {feedback ? (
        <p
          className="owner-form-message"
          data-tone={feedback.ok ? "ok" : "err"}
          role={feedback.ok ? "status" : "alert"}
        >
          {feedback.text}
        </p>
      ) : null}

      <form className="stacked-form" onSubmit={onSubmit}>
        <section className="owner-form-section" aria-labelledby="post-section-contact">
          <div className="owner-form-section-head">
            <span className="owner-form-step">01</span>
            <h3 id="post-section-contact">{CONSULTANT.contactSectionLong}</h3>
          </div>
          <div className="owner-form-grid">
            {accountProfile ? (
              <p className="owner-form-hint owner-form-grid-full post-property-prefill-note">
                <span className="post-property-prefill-badge">Prefilled</span>
                From your account — edit only if someone else should be the listing contact.
              </p>
            ) : null}
            <label>
              {CONSULTANT.name}
              <input
                name="ownerName"
                type="text"
                required
                placeholder="Full legal name"
                defaultValue={initial?.ownerName ?? accountProfile?.name ?? ""}
                autoComplete="name"
              />
            </label>
            <label>
              Email
              <input
                name="ownerEmail"
                type="email"
                required
                placeholder="you@example.com"
                defaultValue={initial?.ownerEmail ?? accountProfile?.email ?? ""}
                autoComplete="email"
              />
            </label>
            <label>
              Phone
              <input
                name="ownerPhone"
                type="tel"
                required
                placeholder="+91 …"
                defaultValue={initial?.ownerPhone ?? accountProfile?.phone ?? ""}
                autoComplete="tel"
              />
            </label>
            <label className="owner-form-grid-full">
              {CONSULTANT.photo} <span className="owner-form-optional">(optional)</span>
              <input name="ownerPhoto" type="file" accept="image/*" />
              <span className="owner-form-hint">
                JPG, PNG, or WebP — max 4 MB. Shown on the listing next to your name.
              </span>
            </label>
          </div>
        </section>

        <section className="owner-form-section" aria-labelledby="post-section-property">
          <div className="owner-form-section-head">
            <span className="owner-form-step">02</span>
            <h3 id="post-section-property">Property details</h3>
          </div>
          <div className="owner-form-grid">
            <fieldset className="owner-form-grid-full owner-choice-fieldset">
              <legend>Property for</legend>
              <div className="owner-choice-row" role="radiogroup" aria-label="Property for">
                {(["Sale", "Rent"] as const).map((value) => (
                  <label
                    key={value}
                    className={`owner-choice-chip${propertyPurpose === value ? " is-selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="purpose"
                      value={value}
                      required
                      checked={propertyPurpose === value}
                      onChange={() => setPropertyPurpose(value)}
                    />
                    <span className="owner-choice-chip-label">
                      {value === "Sale" ? "For sale" : "For rent"}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="owner-form-grid-full owner-choice-fieldset">
              <legend>Property type</legend>
              <div className="owner-choice-grid" role="radiogroup" aria-label="Property type">
                {PROPERTY_TYPES.map(({ value, label, hint }) => (
                  <label
                    key={value}
                    className={`owner-choice-tile${propertyType === value ? " is-selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={value}
                      required
                      checked={propertyType === value}
                      onChange={() =>
                        setPropertyType(value as "Apartment" | "Villa" | "Plot" | "PG")
                      }
                    />
                    <span className="owner-choice-tile-label">{label}</span>
                    <span className="owner-choice-tile-hint">{hint}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label>
              City
              <input
                name="city"
                type="text"
                required
                placeholder="e.g. Bengaluru"
                defaultValue={initial?.city ?? accountProfile?.city ?? ""}
                autoComplete="address-level2"
              />
            </label>
            <label className="owner-form-grid-full">
              Full address
              <textarea
                name="address"
                rows={2}
                required
                minLength={5}
                placeholder="Street, locality, landmark"
                defaultValue={initial?.address ?? ""}
              />
            </label>
            <label>
              {areaLabel}
              <input
                name="areaSqft"
                type="number"
                min={1}
                step={1}
                placeholder={areaPlaceholder}
                required
                defaultValue={initial?.areaSqft ?? undefined}
              />
            </label>
            {requiresRoomDetails ? (
              <>
                <label>
                  {bedroomLabel}
                  <input
                    name="bedrooms"
                    type="number"
                    min={0}
                    step={1}
                    required={requiresRoomDetails}
                    defaultValue={initial?.bedrooms ?? undefined}
                  />
                </label>
                <label>
                  {bathroomLabel}
                  <input
                    name="bathrooms"
                    type="number"
                    min={0}
                    step={1}
                    required={requiresRoomDetails}
                    defaultValue={initial?.bathrooms ?? undefined}
                  />
                </label>
              </>
            ) : null}
            {requiresBalconyAndParking ? (
              <>
                <label>
                  Balconies
                  <input
                    name="balconies"
                    type="number"
                    min={0}
                    step={1}
                    required={requiresBalconyAndParking}
                    defaultValue={initial?.balconies ?? undefined}
                  />
                </label>
                <label>
                  Parking spots
                  <input
                    name="parkingSpots"
                    type="number"
                    min={0}
                    step={1}
                    required={requiresBalconyAndParking}
                    defaultValue={initial?.parkingSpots ?? undefined}
                  />
                </label>
              </>
            ) : null}
            {requiresFurnishing ? (
              <label>
                Furnishing
                <select
                  name="furnishing"
                  required={requiresFurnishing}
                  defaultValue={initial?.furnishing ?? ""}
                >
                  <option value="">Select furnishing</option>
                  <option value="Unfurnished">Unfurnished</option>
                  <option value="SemiFurnished">Semi-furnished</option>
                  <option value="Furnished">Furnished</option>
                </select>
              </label>
            ) : null}
            {requiresRoomDetails ? (
              <label>
                Property age (years)
                <input
                  name="propertyAgeYears"
                  type="number"
                  min={0}
                  step={1}
                  defaultValue={initial?.propertyAgeYears ?? undefined}
                />
              </label>
            ) : null}
            {isPlot ? (
              <p className="owner-form-hint owner-form-grid-full post-property-type-note">
                Plot listings focus on land area, location, price, and description.
              </p>
            ) : null}
            {isPG ? (
              <p className="owner-form-hint owner-form-grid-full post-property-type-note">
                PG listings include room, bathroom, balcony, parking, furnishing, and age details.
              </p>
            ) : null}
            <label>
              Available from
              <input
                name="availableFrom"
                type="date"
                required
                defaultValue={initial?.availableFrom ?? ""}
              />
            </label>
            <label>
              {priceLabel}
              <input
                name="price"
                type="number"
                min={0}
                step={priceStep}
                required
                defaultValue={initial?.price ?? undefined}
              />
            </label>
          </div>
        </section>

        <section className="owner-form-section" aria-labelledby="post-section-photos">
          <div className="owner-form-section-head">
            <span className="owner-form-step">03</span>
            <h3 id="post-section-photos">Photos</h3>
          </div>
          <p className="owner-form-hint post-property-photo-intro">
            {isEdit
              ? "Keep current photos or upload new ones to replace them. Up to 13 images, 8 MB each."
              : "Clear, well-lit photos help your listing stand out. Up to 13 images, 8 MB each."}
          </p>
          {keptImages.length > 0 ? (
            <ul className="post-property-existing-photos" aria-label="Current photos">
              {keptImages.map((url) => (
                <li key={url}>
                  <Image
                    src={url}
                    alt=""
                    width={120}
                    height={90}
                    className="post-property-existing-photo"
                  />
                  <input type="hidden" name="existingImages" value={url} />
                </li>
              ))}
            </ul>
          ) : null}
          <label className="owner-file-upload">
            <span className="owner-file-upload-panel">
              <span className="owner-file-upload-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </span>
              <span className="owner-file-upload-title">
                {photoCount > 0
                  ? `${photoCount} photo${photoCount === 1 ? "" : "s"} selected`
                  : "Choose photos to upload"}
              </span>
              <span className="owner-file-upload-sub">
                JPG, PNG, or WebP · automatically optimized on upload
              </span>
              <span className="owner-file-upload-cta">Browse files</span>
            </span>
            <input
              name="images"
              type="file"
              accept="image/*"
              multiple
              required={!isEdit && keptImages.length === 0}
              onChange={(event) => {
                const count = event.target.files?.length ?? 0;
                setPhotoCount(count);
                if (count > 0) {
                  setKeptImages([]);
                }
              }}
            />
          </label>
        </section>

        <section className="owner-form-section" aria-labelledby="post-section-review">
          <div className="owner-form-section-head">
            <span className="owner-form-step">04</span>
            <h3 id="post-section-review">Description & confirmation</h3>
          </div>
          <label>
            Description
            <textarea
              name="description"
              rows={5}
              required
              minLength={10}
              placeholder="Highlight layout, amenities, nearby landmarks, and what makes this property special…"
              defaultValue={initial?.description ?? ""}
            />
          </label>
          <label className="owner-legal-confirm">
            <input
              name="legalClearance"
              type="checkbox"
              required
              defaultChecked={initial?.legalClearance ?? false}
            />
            <span>
              I confirm legal ownership documents are available for verification when
              requested by the J3 Clusters team.
            </span>
          </label>
        </section>

        <div className="owner-form-submit post-property-form-submit">
          <p className="post-property-submit-note">
            {isEdit
              ? "Saving will unpublish this listing until an admin approves your changes."
              : "By submitting, you agree your details are accurate. We typically review within 1–2 business days."}
          </p>
          <button type="submit" disabled={pending}>
            {pending
              ? isEdit
                ? "Saving…"
                : "Submitting…"
              : isEdit
                ? "Save changes for review"
                : "Submit property for review"}
          </button>
        </div>
      </form>
    </div>
  );
}

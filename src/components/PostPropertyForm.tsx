"use client";

import { FormEvent, useState } from "react";

export type PostPropertyAccountProfile = {
  name: string;
  email: string;
  phone: string;
  city: string;
};

type PostPropertyFormProps = {
  accountProfile?: PostPropertyAccountProfile | null;
};

const PROPERTY_TYPES = [
  { value: "Apartment", label: "Apartment", hint: "Flats & units" },
  { value: "Villa", label: "Villa", hint: "Independent homes" },
  { value: "Plot", label: "Plot", hint: "Land only" },
  { value: "PG", label: "PG", hint: "Shared stays" },
] as const;

export function PostPropertyForm({ accountProfile = null }: PostPropertyFormProps) {
  const [propertyPurpose, setPropertyPurpose] = useState<"Sale" | "Rent" | "">("");
  const [propertyType, setPropertyType] = useState<
    "Apartment" | "Villa" | "Plot" | "PG" | ""
  >("");
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
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
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
                : "Submit failed.",
          ok: false,
        });
        return;
      }

      form.reset();
      setPropertyPurpose("");
      setPropertyType("");
      setPhotoCount(0);
      setFeedback({
        text:
          "Received. Your property is queued for verification. It must be approved before it appears publicly. Track status anytime from My properties using the links at the top of this page.",
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
        <h2>Listing details</h2>
        <p>Complete each section below. Fields marked with context hints adapt to your property type.</p>
        <ol className="post-property-form-progress" aria-label="Form sections">
          <li className="is-done">Contact</li>
          <li className={propertyType ? "is-done" : propertyPurpose ? "is-active" : ""}>
            Property
          </li>
          <li>Photos</li>
          <li>Review</li>
        </ol>
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
            <h3 id="post-section-contact">Property consultant contact</h3>
          </div>
          <div className="owner-form-grid">
            {accountProfile ? (
              <p className="owner-form-hint owner-form-grid-full post-property-prefill-note">
                <span className="post-property-prefill-badge">Prefilled</span>
                From your account — edit only if someone else should be the listing contact.
              </p>
            ) : null}
            <label>
              Property consultant name
              <input
                name="ownerName"
                type="text"
                required
                placeholder="Full legal name"
                defaultValue={accountProfile?.name ?? ""}
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
                defaultValue={accountProfile?.email ?? ""}
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
                defaultValue={accountProfile?.phone ?? ""}
                autoComplete="tel"
              />
            </label>
            <label className="owner-form-grid-full">
              Consultant photo <span className="owner-form-optional">(optional)</span>
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
                defaultValue={accountProfile?.city ?? ""}
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
                  />
                </label>
              </>
            ) : null}
            {requiresFurnishing ? (
              <label>
                Furnishing
                <select name="furnishing" required={requiresFurnishing} defaultValue="">
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
                <input name="propertyAgeYears" type="number" min={0} step={1} />
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
              <input name="availableFrom" type="date" required />
            </label>
            <label>
              {priceLabel}
              <input name="price" type="number" min={0} step={priceStep} required />
            </label>
          </div>
        </section>

        <section className="owner-form-section" aria-labelledby="post-section-photos">
          <div className="owner-form-section-head">
            <span className="owner-form-step">03</span>
            <h3 id="post-section-photos">Photos</h3>
          </div>
          <p className="owner-form-hint post-property-photo-intro">
            Clear, well-lit photos help your listing stand out. Up to 10 images, 8 MB each.
          </p>
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
              required
              onChange={(event) => setPhotoCount(event.target.files?.length ?? 0)}
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
            />
          </label>
          <label className="owner-legal-confirm">
            <input name="legalClearance" type="checkbox" required />
            <span>
              I confirm legal ownership documents are available for verification when
              requested by the J3 Clusters team.
            </span>
          </label>
        </section>

        <div className="owner-form-submit post-property-form-submit">
          <p className="post-property-submit-note">
            By submitting, you agree your details are accurate. We typically review within 1–2 business days.
          </p>
          <button type="submit" disabled={pending}>
            {pending ? "Submitting…" : "Submit property for review"}
          </button>
        </div>
      </form>
    </div>
  );
}

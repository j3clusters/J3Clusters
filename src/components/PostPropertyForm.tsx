"use client";

import { FormEvent, useState } from "react";

export function PostPropertyForm() {
  const [propertyPurpose, setPropertyPurpose] = useState<"Sale" | "Rent" | "">(
    "",
  );
  const [propertyType, setPropertyType] = useState<
    "Apartment" | "Villa" | "Plot" | "PG" | ""
  >("");
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

    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
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
      setFeedback({
        text:
          "Received. Your property is queued for verification. It must be approved before it appears publicly.",
        ok: true,
      });
    } catch {
      setFeedback({ text: "Network error. Please try again.", ok: false });
    }
  }

  return (
    <div className="owner-form-card">
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
        <div className="owner-form-section">
          <h3>Your contact details</h3>
          <div className="owner-form-grid">
            <label>
              Owner name
              <input name="ownerName" type="text" required />
            </label>
            <label>
              Email
              <input name="ownerEmail" type="email" required />
            </label>
            <label>
              Phone
              <input name="ownerPhone" type="tel" required />
            </label>
          </div>
        </div>

        <div className="owner-form-section">
          <h3>Property</h3>
          <div className="owner-form-grid">
            <label>
              Property for
              <select
                name="purpose"
                required
                value={propertyPurpose}
                onChange={(event) =>
                  setPropertyPurpose(event.target.value as "Sale" | "Rent" | "")
                }
              >
                <option value="">Select purpose</option>
                <option value="Sale">For sale</option>
                <option value="Rent">For rent</option>
              </select>
            </label>
            <label>
              Type
              <select
                name="type"
                required
                value={propertyType}
                onChange={(event) =>
                  setPropertyType(
                    event.target.value as "Apartment" | "Villa" | "Plot" | "PG" | "",
                  )
                }
              >
                <option value="">Select type</option>
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Plot">Plot</option>
                <option value="PG">PG</option>
              </select>
            </label>
            <label>
              City
              <input name="city" type="text" required />
            </label>
            <label className="owner-form-grid-full">
              Full address
              <textarea name="address" rows={2} required minLength={5} />
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
                <input
                  name="propertyAgeYears"
                  type="number"
                  min={0}
                  step={1}
                />
              </label>
            ) : null}
            {isPlot ? (
              <p className="owner-form-hint owner-form-grid-full">
                Plot listings only require land details such as area, location, price, and description.
              </p>
            ) : null}
            {isPG ? (
              <p className="owner-form-hint owner-form-grid-full">
                PG listings require room, bathroom, balcony, parking, furnishing, and property age details.
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
        </div>

        <div className="owner-form-section">
          <h3>Photos</h3>
          <p className="owner-form-hint">
            Up to 10 images, 8 MB each. Files are optimized automatically.
          </p>
          <label>
            Upload photos
            <input name="images" type="file" accept="image/*" multiple required />
          </label>
        </div>

        <div className="owner-form-section">
          <h3>Description and confirmation</h3>
          <label>
            Description
            <textarea name="description" rows={4} required minLength={10} />
          </label>
          <label className="admin-checkbox-label">
            <input name="legalClearance" type="checkbox" required /> I confirm
            legal ownership documents are available for verification.
          </label>
        </div>

        <div className="owner-form-submit">
          <button type="submit">Submit property</button>
        </div>
      </form>
    </div>
  );
}

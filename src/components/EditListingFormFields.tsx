"use client";

import { useState } from "react";

import { ImageUploadField } from "@/components/ImageUploadField";

type ListingType = "Apartment" | "Villa" | "Plot" | "PG";
type FurnishingType = "Unfurnished" | "SemiFurnished" | "Furnished";
type ListingPurpose = "Sale" | "Rent";

export type EditListingDefaults = {
  id: string;
  title: string;
  type: ListingType;
  purpose: ListingPurpose;
  city: string;
  address: string;
  beds: number;
  baths: number;
  balconies: number;
  parkingSpots: number;
  furnishing: FurnishingType;
  propertyAgeYears: number;
  availableFrom: string;
  legalClearance: boolean;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerPhotoUrl: string;
  areaSqft: number;
  price: number;
  description: string;
  imageUrls: string[];
};

type ListingFormFieldsProps = {
  formId: string;
  formAction: (formData: FormData) => void | Promise<void>;
  defaults: EditListingDefaults;
  maxImages?: number;
};

export function EditListingFormFields({
  formId,
  formAction,
  defaults,
  maxImages = 11,
}: ListingFormFieldsProps) {
  const [propertyType, setPropertyType] = useState<ListingType>(defaults.type);
  const [propertyPurpose, setPropertyPurpose] = useState<ListingPurpose>(
    defaults.purpose,
  );

  const isResidential = propertyType === "Apartment" || propertyType === "Villa";
  const isPlot = propertyType === "Plot";
  const isPG = propertyType === "PG";
  const requiresRoomDetails = isResidential || isPG;
  const requiresBalconyAndParking = isResidential || isPG;
  const requiresFurnishing = requiresRoomDetails;
  const bedroomLabel = isPG ? "Rooms available" : "Bedrooms";
  const bathroomLabel = isPG ? "Shared/attached bathrooms" : "Bathrooms";
  const areaLabel = isPlot ? "Plot area (sqft)" : "Area (sqft)";
  const priceLabel = isPG ? "Monthly rent (INR)" : "Expected price (INR)";
  const priceStep = isPG ? 1000 : 100000;

  const initialImages =
    defaults.imageUrls.length > 0
      ? defaults.imageUrls
      : ([] as string[]);

  return (
    <form
      id={formId}
      action={formAction}
      className="edit-modal-form edit-listing-form"
    >
      <input type="hidden" name="id" value={defaults.id} />

      <fieldset className="edit-listing-section">
        <legend>Listing</legend>
        <div className="edit-modal-grid">
          <label className="edit-modal-field edit-modal-field-full">
            <span>Listing title</span>
            <input
              type="text"
              name="title"
              defaultValue={defaults.title}
              required
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="edit-listing-section">
        <legend>Property consultant contact</legend>
        <div className="edit-modal-grid">
          <label className="edit-modal-field">
            <span>Property consultant name</span>
            <input
              type="text"
              name="ownerName"
              defaultValue={defaults.ownerName}
              required
            />
          </label>
          <label className="edit-modal-field">
            <span>Email</span>
            <input
              type="email"
              name="ownerEmail"
              defaultValue={defaults.ownerEmail}
              required
            />
          </label>
          <label className="edit-modal-field">
            <span>Phone</span>
            <input
              type="tel"
              name="ownerPhone"
              defaultValue={defaults.ownerPhone}
              required
            />
          </label>
          <label className="edit-modal-field edit-modal-field-full">
            <span>Consultant photo (optional)</span>
            {defaults.ownerPhotoUrl.trim() ? (
              <span className="edit-listing-owner-photo-current">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={defaults.ownerPhotoUrl}
                  alt=""
                  className="edit-listing-owner-photo-thumb"
                />
                <span className="edit-listing-owner-photo-caption">
                  Current photo — upload a file to replace
                </span>
              </span>
            ) : null}
            <input type="file" name="ownerPhoto" accept="image/*" />
          </label>
        </div>
      </fieldset>

      <fieldset className="edit-listing-section">
        <legend>Property</legend>
        <div className="edit-modal-grid">
          <label className="edit-modal-field">
            <span>Property for</span>
            <select
              name="purpose"
              value={propertyPurpose}
              onChange={(event) =>
                setPropertyPurpose(event.target.value as ListingPurpose)
              }
              required
            >
              <option value="Sale">For sale</option>
              <option value="Rent">For rent</option>
            </select>
          </label>
          <label className="edit-modal-field">
            <span>Type</span>
            <select
              name="type"
              value={propertyType}
              onChange={(event) =>
                setPropertyType(event.target.value as ListingType)
              }
              required
            >
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="Plot">Plot</option>
              <option value="PG">PG</option>
            </select>
          </label>
          <label className="edit-modal-field">
            <span>City</span>
            <input
              type="text"
              name="city"
              defaultValue={defaults.city}
              required
            />
          </label>
          <label className="edit-modal-field edit-modal-field-full">
            <span>Full address</span>
            <textarea
              name="address"
              defaultValue={defaults.address}
              rows={2}
              required
              minLength={5}
            />
          </label>
          <label className="edit-modal-field">
            <span>{areaLabel}</span>
            <input
              type="number"
              name="areaSqft"
              defaultValue={defaults.areaSqft || ""}
              min={1}
              step={1}
              required
            />
          </label>
          {requiresRoomDetails ? (
            <>
              <label className="edit-modal-field">
                <span>{bedroomLabel}</span>
                <input
                  type="number"
                  name="beds"
                  defaultValue={defaults.beds}
                  min={0}
                  step={1}
                  required
                />
              </label>
              <label className="edit-modal-field">
                <span>{bathroomLabel}</span>
                <input
                  type="number"
                  name="baths"
                  defaultValue={defaults.baths}
                  min={0}
                  step={1}
                  required
                />
              </label>
            </>
          ) : null}
          {requiresBalconyAndParking ? (
            <>
              <label className="edit-modal-field">
                <span>Balconies</span>
                <input
                  type="number"
                  name="balconies"
                  defaultValue={defaults.balconies}
                  min={0}
                  step={1}
                  required
                />
              </label>
              <label className="edit-modal-field">
                <span>Parking spots</span>
                <input
                  type="number"
                  name="parkingSpots"
                  defaultValue={defaults.parkingSpots}
                  min={0}
                  step={1}
                  required
                />
              </label>
            </>
          ) : null}
          {requiresFurnishing ? (
            <label className="edit-modal-field">
              <span>Furnishing</span>
              <select
                name="furnishing"
                defaultValue={defaults.furnishing}
                required
              >
                <option value="Unfurnished">Unfurnished</option>
                <option value="SemiFurnished">Semi-furnished</option>
                <option value="Furnished">Furnished</option>
              </select>
            </label>
          ) : null}
          {requiresRoomDetails ? (
            <label className="edit-modal-field">
              <span>Property age (years)</span>
              <input
                type="number"
                name="propertyAgeYears"
                defaultValue={defaults.propertyAgeYears}
                min={0}
                step={1}
              />
            </label>
          ) : null}
          {isPlot ? (
            <p className="edit-listing-hint edit-modal-field-full">
              Plot listings only require land details such as area, location,
              price, and description.
            </p>
          ) : null}
          {isPG ? (
            <p className="edit-listing-hint edit-modal-field-full">
              PG listings include rooms, bathrooms, balconies, parking,
              furnishing, and property age.
            </p>
          ) : null}
          <label className="edit-modal-field">
            <span>Available from</span>
            <input
              type="date"
              name="availableFrom"
              defaultValue={defaults.availableFrom}
              required
            />
          </label>
          <label className="edit-modal-field">
            <span>{priceLabel}</span>
            <input
              type="number"
              name="price"
              defaultValue={defaults.price || ""}
              min={1}
              step={priceStep}
              required
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="edit-listing-section">
        <legend>Photos</legend>
        <ImageUploadField
          name="image"
          label="Listing photos"
          currentImages={initialImages}
          maxImages={maxImages}
        />
      </fieldset>

      <fieldset className="edit-listing-section">
        <legend>Description and confirmation</legend>
        <div className="edit-modal-grid">
          <label className="edit-modal-field edit-modal-field-full">
            <span>Description</span>
            <textarea
              name="description"
              defaultValue={defaults.description}
              rows={4}
              required
              minLength={10}
            />
          </label>
          <label className="admin-checkbox-label edit-modal-field-full">
            <input
              type="checkbox"
              name="legalClearance"
              defaultChecked={defaults.legalClearance}
            />{" "}
            Legal ownership documents are available for verification.
          </label>
        </div>
      </fieldset>
    </form>
  );
}

import { PropertyDetailGallery } from "@/components/PropertyDetailGallery";
import {
  PropertyDetailDescription,
  PropertyDetailListedBy,
} from "@/components/PropertyDetailNarrative";
import type { Listing } from "@/types/listing";

type PropertyDetailMediaColumnProps = {
  item: Listing;
  images: string[];
};

export function PropertyDetailMediaColumn({
  item,
  images,
}: PropertyDetailMediaColumnProps) {
  const extraPhotos = images.slice(1, 5);
  const photoCount = images.length;

  return (
    <div className="property-detail-media-column">
      <PropertyDetailGallery title={item.title} images={images} />

      <div className="property-detail-media-panel">
        {extraPhotos.length > 0 ? (
          <div className="property-detail-photo-grid" aria-label="More photos">
            <p className="property-detail-photo-grid-label">
              Gallery · {photoCount} photo{photoCount === 1 ? "" : "s"}
            </p>
            <div className="property-detail-photo-grid-inner">
              {extraPhotos.map((src, index) => (
                <div
                  key={`${src}-${index}`}
                  className="property-detail-photo-grid-item"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`${item.title} photo ${index + 2}`} />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <PropertyDetailDescription item={item} />

        <div className="property-detail-media-card property-detail-media-trust">
          <h3>J3 Clusters assurance</h3>
          <ul className="property-detail-media-trust-list">
            <li>Listing reviewed before publish</li>
            <li>Dedicated advisor for your inquiry</li>
            <li>Help scheduling a site visit</li>
          </ul>
        </div>

        <PropertyDetailListedBy item={item} />
      </div>
    </div>
  );
}

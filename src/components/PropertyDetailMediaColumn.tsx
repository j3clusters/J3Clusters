import { PropertyDetailConsultant } from "@/components/PropertyDetailConsultant";
import { PropertyDetailGallery } from "@/components/PropertyDetailGallery";
import { PropertyDetailDescription } from "@/components/PropertyDetailNarrative";
import type { Listing } from "@/types/listing";

type PropertyDetailMediaColumnProps = {
  item: Listing;
  images: string[];
  listingId: string;
  consultantPhoneOnFile: string;
  canViewContact: boolean;
};

export function PropertyDetailMediaColumn({
  item,
  images,
  listingId,
  consultantPhoneOnFile,
  canViewContact,
}: PropertyDetailMediaColumnProps) {
  return (
    <div className="property-detail-media-column">
      <PropertyDetailGallery title={item.title} images={images} />

      <div className="property-detail-media-panel">
        <PropertyDetailConsultant
          item={item}
          listingId={listingId}
          consultantPhoneOnFile={consultantPhoneOnFile}
          canViewContact={canViewContact}
        />

        <PropertyDetailDescription item={item} />

        <div className="property-detail-media-card property-detail-media-trust">
          <h3>J3 Clusters assurance</h3>
          <ul className="property-detail-media-trust-list">
            <li>Listing reviewed before publish</li>
            <li>Dedicated advisor for your inquiry</li>
            <li>Help scheduling a site visit</li>
          </ul>
        </div>

      </div>
    </div>
  );
}

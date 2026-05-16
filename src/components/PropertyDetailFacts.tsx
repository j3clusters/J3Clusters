import { furnishingLabel, listingTypeLabel } from "@/lib/listing-labels";
import type { Listing } from "@/types/listing";

type Fact = {
  label: string;
  value: string;
  fullWidth?: boolean;
};

function formatAvailableFrom(value: string) {
  if (!value?.trim()) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T00:00:00`);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  }
  return value;
}

function displayCount(value: number) {
  return value > 0 ? String(value) : "—";
}

export function PropertyDetailFacts({ item }: { item: Listing }) {
  const isPlot = item.type === "Plot";
  const isPG = item.type === "PG";
  const showRoomDetails = !isPlot;
  const purposeLabel = item.purpose === "Rent" ? "For rent" : "For sale";

  const overviewFacts: Fact[] = [
    { label: "Listing for", value: purposeLabel },
    { label: "Property type", value: listingTypeLabel(item.type) },
    { label: "City", value: item.city },
    {
      label: isPlot ? "Plot area" : "Built-up area",
      value: `${item.areaSqft.toLocaleString("en-IN")} sqft`,
    },
    {
      label: "Available from",
      value: formatAvailableFrom(item.availableFrom),
    },
  ];

  if (item.address.trim()) {
    overviewFacts.splice(3, 0, {
      label: "Address",
      value: item.address.trim(),
      fullWidth: true,
    });
  }

  const featureFacts: Fact[] = [];

  if (showRoomDetails) {
    featureFacts.push(
      {
        label: isPG ? "Rooms" : "Bedrooms",
        value: displayCount(item.beds),
      },
      {
        label: isPG ? "Bathrooms (shared/attached)" : "Bathrooms",
        value: displayCount(item.baths),
      },
      { label: "Balconies", value: displayCount(item.balconies) },
      { label: "Parking spots", value: displayCount(item.parkingSpots) },
      {
        label: "Furnishing",
        value: furnishingLabel(item.furnishing) || "—",
      },
    );
    if (item.propertyAgeYears > 0) {
      featureFacts.push({
        label: "Property age",
        value: `${item.propertyAgeYears} years`,
      });
    }
  }

  return (
    <>
      <section className="property-detail-section" aria-labelledby="property-overview">
        <h2 id="property-overview" className="property-detail-section-title">
          Overview
        </h2>
        <dl className="property-detail-facts">
          {overviewFacts.map((fact) => (
            <div
              key={fact.label}
              className={fact.fullWidth ? "property-detail-fact-full" : undefined}
            >
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {featureFacts.length > 0 ? (
        <section className="property-detail-section" aria-labelledby="property-features">
          <h2 id="property-features" className="property-detail-section-title">
            Property features
          </h2>
          <dl className="property-detail-facts">
            {featureFacts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </>
  );
}

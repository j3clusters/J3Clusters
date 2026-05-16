import { ListingsView } from "./ListingsView";
import { loadPublishedAppListingsOrdered } from "@/lib/listing-catalog";
export type ListingsSearchParams = {
  mode?: string;
  type?: string;
  city?: string;
  min?: string;
  budget?: string;
  sort?: string;
};

/** Keep in sync with LISTINGS_PAGE_REVALIDATE_SECONDS in @/lib/listing-cache */
export const revalidate = 300;

function budgetMaxFromParam(budget: string | undefined) {
  return budget?.includes("-") ? (budget.split("-")[1] ?? "") : "";
}

export async function ListingsShell({
  purposeRoute,
  searchParams,
}: {
  purposeRoute: "listings" | "buy" | "rent";
  searchParams: ListingsSearchParams;
}) {
  const initialMode =
    purposeRoute === "buy"
      ? "buy"
      : purposeRoute === "rent"
        ? "rent"
        : (searchParams.mode ?? "");

  const catalogItems = await loadPublishedAppListingsOrdered();

  return (
    <ListingsView
      purposeRoute={purposeRoute}
      catalogItems={catalogItems}
      initialMode={initialMode}
      initialType={searchParams.type ?? ""}
      initialCity={searchParams.city ?? ""}
      initialMinBudget={searchParams.min ?? ""}
      initialBudgetMax={budgetMaxFromParam(searchParams.budget)}
      initialSort={searchParams.sort ?? "newest"}
    />
  );
}

import { Suspense } from "react";

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

export const revalidate = 60;

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
    <Suspense
      fallback={
        <main className="container section">
          <h1>Property listings</h1>
          <p>Loading…</p>
        </main>
      }
    >
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
    </Suspense>
  );
}

import { Suspense } from "react";

import { ListingsView } from "./ListingsView";

export type ListingsSearchParams = {
  mode?: string;
  type?: string;
  city?: string;
  min?: string;
  budget?: string;
  sort?: string;
};

function budgetMaxFromParam(budget: string | undefined) {
  return budget?.includes("-") ? (budget.split("-")[1] ?? "") : "";
}

export function ListingsShell({
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

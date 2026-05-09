import { Suspense } from "react";
import { redirect } from "next/navigation";

import { ListingsView } from "./ListingsView";

type PageProps = {
  searchParams: Promise<{
    mode?: string;
    type?: string;
    city?: string;
    min?: string;
    budget?: string;
    sort?: string;
  }>;
};

export default async function ListingsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  if ((searchParams.mode ?? "").toLowerCase() === "sell") {
    redirect("/register");
  }
  const initialBudgetMax = searchParams.budget?.includes("-")
    ? (searchParams.budget?.split("-")[1] ?? "")
    : "";

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
        initialMode={searchParams.mode ?? ""}
        initialType={searchParams.type ?? ""}
        initialCity={searchParams.city ?? ""}
        initialMinBudget={searchParams.min ?? ""}
        initialBudgetMax={initialBudgetMax}
        initialSort={searchParams.sort ?? "newest"}
      />
    </Suspense>
  );
}

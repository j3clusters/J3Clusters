import { redirect } from "next/navigation";

import {
  ListingsShell,
  type ListingsSearchParams,
} from "./listings-shell";

type PageProps = {
  searchParams: Promise<ListingsSearchParams>;
};

function redirectPreservingFilters(
  path: "/listings/buy" | "/listings/rent",
  searchParams: ListingsSearchParams,
) {
  const p = new URLSearchParams();
  if (searchParams.type) {
    p.set("type", searchParams.type);
  }
  if (searchParams.city) {
    p.set("city", searchParams.city);
  }
  if (searchParams.min) {
    p.set("min", searchParams.min);
  }
  if (searchParams.budget) {
    p.set("budget", searchParams.budget);
  }
  if (searchParams.sort) {
    p.set("sort", searchParams.sort);
  }
  const q = p.toString();
  redirect(q ? `${path}?${q}` : path);
}

export default async function ListingsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  if ((searchParams.mode ?? "").toLowerCase() === "sell") {
    redirect("/register");
  }

  const mode = (searchParams.mode ?? "").toLowerCase();
  if (mode === "buy" || mode === "sell") {
    redirectPreservingFilters("/listings/buy", searchParams);
  }
  if (mode === "rent") {
    redirectPreservingFilters("/listings/rent", searchParams);
  }

  return <ListingsShell purposeRoute="listings" searchParams={searchParams} />;
}

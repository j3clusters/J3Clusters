import { redirect } from "next/navigation";

import {
  ListingsShell,
  type ListingsSearchParams,
} from "../listings-shell";

type PageProps = {
  searchParams: Promise<ListingsSearchParams>;
};

export default async function BuyListingsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  if ((searchParams.mode ?? "").toLowerCase() === "sell") {
    redirect("/register/consultant");
  }
  return <ListingsShell purposeRoute="buy" searchParams={searchParams} />;
}

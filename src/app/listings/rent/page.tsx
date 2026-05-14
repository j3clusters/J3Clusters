import { redirect } from "next/navigation";

import {
  ListingsShell,
  type ListingsSearchParams,
} from "../listings-shell";

type PageProps = {
  searchParams: Promise<ListingsSearchParams>;
};

export default async function RentListingsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  if ((searchParams.mode ?? "").toLowerCase() === "sell") {
    redirect("/register");
  }
  return <ListingsShell purposeRoute="rent" searchParams={searchParams} />;
}

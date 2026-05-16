import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { buildListingsMetadata } from "@/lib/seo";
import {
  ListingsShell,
  type ListingsSearchParams,
} from "../listings-shell";

type PageProps = {
  searchParams: Promise<ListingsSearchParams>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  return buildListingsMetadata({
    purpose: "buy",
    city: params.city?.trim() || undefined,
  });
}

export default async function BuyListingsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  if ((searchParams.mode ?? "").toLowerCase() === "sell") {
    redirect("/register/consultant");
  }
  return <ListingsShell purposeRoute="buy" searchParams={searchParams} />;
}

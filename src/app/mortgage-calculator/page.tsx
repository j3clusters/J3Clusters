import { MortgageCalculator } from "@/components/MortgageCalculator";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Home loan EMI calculator",
  description:
    "Estimate monthly mortgage EMI for properties in India. Adjust price, down payment, interest rate, and loan tenure on J3 Clusters.",
  path: "/mortgage-calculator",
  keywords: [
    "home loan EMI calculator",
    "mortgage calculator India",
    "property EMI estimate",
  ],
});

type PageProps = {
  searchParams: Promise<{ price?: string }>;
};

export default async function MortgageCalculatorPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const rawPrice = params.price?.trim() ?? "";
  const parsed = Number(rawPrice.replace(/,/g, ""));
  const initialPrice =
    Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : undefined;

  return (
    <main className="community-page">
      <div className="container community-page-inner">
        <header className="community-page-hero">
          <p className="pill">Tools</p>
          <h1>Home loan EMI calculator</h1>
          <p className="community-page-lead">
            Plan your purchase with an indicative monthly EMI. Open a property
            listing to pre-fill the price automatically.
          </p>
        </header>
        <MortgageCalculator initialPropertyPrice={initialPrice} />
      </div>
    </main>
  );
}

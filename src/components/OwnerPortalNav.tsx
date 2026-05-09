import Link from "next/link";

type OwnerPortalNavProps = {
  active: "post" | "listings" | "home";
};

export function OwnerPortalNav({ active }: OwnerPortalNavProps) {
  return (
    <nav className="owner-portal-nav" aria-label="Owner navigation">
      <h2>Menu</h2>
      <Link
        href="/post-property"
        className={active === "post" ? "is-active" : undefined}
      >
        Post property
      </Link>
      <Link
        href="/listings"
        className={active === "listings" ? "is-active" : undefined}
      >
        Browse listings
      </Link>
      <Link href="/" className={active === "home" ? "is-active" : undefined}>
        Home
      </Link>
    </nav>
  );
}

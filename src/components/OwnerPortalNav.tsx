import Link from "next/link";

type OwnerPortalNavProps = {
  active: "post" | "mine";
};

export function OwnerPortalNav({ active }: OwnerPortalNavProps) {
  return (
    <nav className="owner-portal-nav" aria-label="Property agent navigation">
      <div className="owner-portal-nav-links">
        <Link
          href="/post-property"
          className={active === "post" ? "is-active" : undefined}
        >
          Post property
        </Link>
        <Link
          href="/my-properties"
          className={active === "mine" ? "is-active" : undefined}
        >
          My properties
        </Link>
      </div>
    </nav>
  );
}

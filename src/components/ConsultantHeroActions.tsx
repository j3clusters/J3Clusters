import Link from "next/link";

type ConsultantHeroActionsProps = {
  active: "post" | "mine";
};

export function ConsultantHeroActions({ active }: ConsultantHeroActionsProps) {
  return (
    <div className="mp-hero-actions">
      <Link
        href="/my-properties"
        className={`mp-cta-secondary${active === "mine" ? " is-active" : ""}`}
        aria-current={active === "mine" ? "page" : undefined}
      >
        My properties
      </Link>
      <Link
        href="/post-property"
        className={`mp-cta-primary${active === "post" ? " is-active" : ""}`}
        aria-current={active === "post" ? "page" : undefined}
      >
        Post new property
      </Link>
    </div>
  );
}


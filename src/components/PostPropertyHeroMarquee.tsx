type PostPropertyHeroMarqueeProps = {
  hidden?: boolean;
};

export function PostPropertyHeroMarquee({ hidden }: PostPropertyHeroMarqueeProps) {
  return (
    <ol className="post-property-hero-steps" aria-hidden={hidden || undefined}>
      <li className="post-property-hero-chip post-property-hero-chip--tagline">
        <span className="post-property-hero-pill" aria-hidden="true">
          Free
        </span>
        No listing fees · Verified before publishing
      </li>
      <li className="post-property-hero-chip">
        <span>1</span>
        Fill the form
      </li>
      <li className="post-property-hero-chip">
        <span>2</span>
        Team review
      </li>
      <li className="post-property-hero-chip">
        <span>3</span>
        Go live
      </li>
    </ol>
  );
}

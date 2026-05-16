type MyPropertiesHeroMarqueeProps = {
  hidden?: boolean;
};

export function MyPropertiesHeroMarquee({ hidden }: MyPropertiesHeroMarqueeProps) {
  return (
    <ol className="post-property-hero-steps" aria-hidden={hidden || undefined}>
      <li className="post-property-hero-chip post-property-hero-chip--tagline">
        Track every submission and live listing tied to your account - all in one
        place.
      </li>
    </ol>
  );
}

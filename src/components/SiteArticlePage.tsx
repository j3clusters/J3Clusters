import type { ReactNode } from "react";

type SiteArticlePageProps = {
  title: string;
  eyebrow?: string;
  intro?: ReactNode;
  children: ReactNode;
};

export function SiteArticlePage({
  title,
  eyebrow = "J3 Clusters",
  intro,
  children,
}: SiteArticlePageProps) {
  return (
    <main className="container section">
      <article className="narrow site-article">
        <header className="site-article-header">
          {eyebrow ? <p className="pill">{eyebrow}</p> : null}
          <h1>{title}</h1>
          {intro ?? null}
        </header>
        <div className="site-article-body">{children}</div>
      </article>
    </main>
  );
}

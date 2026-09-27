import Link from "next/link";
import { SiteFooter } from "./site-footer";

type InfoPageProps = {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
};

export function InfoPage({ eyebrow, title, children }: InfoPageProps) {
  return (
    <main>
      <nav className="info-nav" aria-label="Main navigation">
        <Link className="brand" href="/"><span className="brand-orb" aria-hidden="true">✦</span> Faraday</Link>
        <Link className="back-link" href="/">← Back to home</Link>
      </nav>
      <article className="info-content section-shell">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {children}
      </article>
      <SiteFooter />
    </main>
  );
}

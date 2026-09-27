import Image from "next/image";
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
        <Link className="brand" href="/">
          <Image className="brand-logo" src="/brand/logo.png?v=20260927" alt="" width={42} height={42} priority />
          <span>Faraday AI</span>
        </Link>
        <Link className="back-link" href="/">Ã¢â€ Â Back to home</Link>
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

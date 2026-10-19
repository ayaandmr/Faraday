import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function SiteFooter() {
  return <footer className="public-footer">
    <div className="public-footer-inner">
      <div className="public-footer-brand"><Link className="landing-brand" href="/"><Image src="/brand/logo.png" alt="" width={34} height={34} /><span>Faraday AI</span></Link><p>A little curiosity goes a long way.</p></div>
      <nav aria-label="Footer navigation"><Link href="/#how-it-works">How it works</Link><Link href="/privacy">Privacy policy</Link><Link href="/sign-in">Log in</Link><Link href="/sign-up">Sign up ↗</Link></nav>
      <div className="public-footer-bottom"><p>© {new Date().getFullYear()} Faraday AI</p><ThemeToggle /></div>
    </div>
  </footer>;
}

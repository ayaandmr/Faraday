import Image from "next/image";
import Link from "next/link";

export function SiteNav() {
  return <nav aria-label="Main navigation" className="landing-nav">
    <Link className="landing-brand" href="/" aria-label="Faraday AI home">
      <Image src="/brand/logo.png" alt="" width={36} height={36} priority />
      <span>Faraday AI</span>
    </Link>
    <div className="landing-nav-links"><Link href="/#how-it-works">How it works</Link><Link href="/privacy">Privacy policy</Link></div>
    <div className="landing-nav-auth"><Link href="/sign-in">Log in</Link><Link className="landing-nav-signup" href="/sign-up">Sign up <span aria-hidden="true">↗</span></Link></div>
  </nav>;
}

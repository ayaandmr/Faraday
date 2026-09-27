import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="footer section-shell">
      <div className="footer-group footer-intro">
        <h2>Faraday</h2>
        <Link href="/about">About us</Link>
        <Link href="/#pilot">School pilot</Link>
      </div>
      <div className="footer-group">
        <h2>Explore</h2>
        <Link href="/#how-it-works">How it works</Link>
        <Link href="/#for-teachers">For teachers</Link>
        <Link href="/#pilot">School pilot</Link>
      </div>
      <div className="footer-group">
        <h2>Learning</h2>
        <Link href="/#top">Personal learning paths</Link>
        <Link href="/#for-teachers">Teacher-planned lessons</Link>
        <Link href="/#for-teachers">Learning resources</Link>
      </div>
      <div className="footer-group">
        <h2>Classrooms</h2>
        <Link href="/#for-teachers">Progress check-ins</Link>
        <Link href="/#for-teachers">Student feedback</Link>
        <Link href="/#pilot">Pilot classrooms</Link>
      </div>
      <div className="footer-group">
        <h2>Legal</h2>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </div>
      <p className="footer-copyright">© {new Date().getFullYear()} Faraday</p>
    </footer>
  );
}

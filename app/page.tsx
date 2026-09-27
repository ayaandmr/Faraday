import { PilotCta } from "../components/pilot-cta";
import { SiteFooter } from "../components/site-footer";

const features = [
  {
    number: "01",
    icon: "✎",
    title: "Teacher-built lessons",
    body: "Start with a topic, a learning goal, or material you already use. Jarvis helps turn it into a thoughtful lesson.",
    tone: "lemon",
  },
  {
    number: "02",
    icon: "✦",
    title: "A path that adapts",
    body: "Short check-ins and learning progress help each student receive the next explanation, activity, or challenge they need.",
    tone: "lilac",
  },
  {
    number: "03",
    icon: "⌕",
    title: "Useful resources, together",
    body: "Bring teacher materials, videos, and helpful reading into one calm workspace instead of sending students everywhere.",
    tone: "mint",
  },
  {
    number: "04",
    icon: "♡",
    title: "Room for honest feedback",
    body: "Students can share anonymous feedback with their teacher, making it easier to understand what is landing and what is not.",
    tone: "peach",
  },
];

const steps = [
  ["1", "Plan together", "A teacher enters a topic or uploads familiar material."],
  ["2", "Shape the lesson", "Jarvis helps organize the lesson into clear, teachable steps."],
  ["3", "Meet each learner", "Students get support that responds to their own check-ins and progress."],
];

export default function Home() {
  return (
    <main>
      <nav aria-label="Main navigation" className="nav-shell">
        <a className="brand" href="#top" aria-label="Faraday home">
          <span className="brand-orb" aria-hidden="true">✦</span> Faraday
        </a>
        <div className="nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#for-teachers">For teachers</a>
          <a href="#pilot">Pilot</a>
        </div>
        <a className="nav-cta" href="#pilot">Join the pilot <span aria-hidden="true">→</span></a>
      </nav>

      <section id="top" className="hero section-shell">
        <div className="hero-copy">
          <h1>Every student gets <em>their own path.</em></h1>
          <p className="hero-text">
            Faraday helps teachers turn one great lesson into learning support that meets every student where they are.
          </p>
          <div className="hero-actions">
            <PilotCta />
            <a className="text-link" href="#how-it-works">See how it works <span aria-hidden="true">↓</span></a>
          </div>
          <p className="microcopy">A pre-pilot project for grades 6–10. No sign-up required today.</p>
        </div>
        <div className="hero-visual" aria-label="An illustration of a teacher lesson adapting for three students" role="img">
          <div className="sun-shape" />
          <div className="lesson-card">
            <div className="lesson-card-top"><span>Today&apos;s lesson</span><span className="status-dot">●</span></div>
            <strong>Forces &amp;<br />motion</strong>
            <div className="lesson-line"><span /></div>
            <div className="lesson-line short"><span /></div>
            <div className="lesson-chip">Teacher plan ✓</div>
          </div>
          <div className="path path-one"><span>Explore</span><i /></div>
          <div className="path path-two"><span>Practice</span><i /></div>
          <div className="path path-three"><span>Challenge</span><i /></div>
          <div className="student student-one"><span>◎</span><small>Sam</small></div>
          <div className="student student-two"><span>◉</span><small>Mia</small></div>
          <div className="student student-three"><span>◌</span><small>Arun</small></div>
          <div className="float-note">One lesson.<br /><b>Many ways in.</b></div>
        </div>
      </section>

      <section id="how-it-works" className="how-section section-shell">
        <div className="section-intro">
          <p className="eyebrow">A calmer way to teach and learn</p>
          <h2>One teacher can start a hundred different learning journeys.</h2>
          <p>Not by doing more alone. By giving every student a useful next step.</p>
        </div>
        <ol className="steps-list">
          {steps.map(([number, title, body]) => (
            <li key={number} className="step-card">
              <span className="step-number">{number}</span>
              <div><h3>{title}</h3><p>{body}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <section id="for-teachers" className="features section-shell">
        <div className="section-intro compact">
          <p className="eyebrow">Designed around your classroom</p>
          <h2>Helpful support, without losing the human in the room.</h2>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <article className={`feature-card ${feature.tone}`} key={feature.number}>
              <div className="feature-top"><span className="feature-icon" aria-hidden="true">{feature.icon}</span><span>{feature.number}</span></div>
              <h3>{feature.title}</h3><p>{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="promise section-shell">
        <div className="promise-art" aria-hidden="true"><span>✦</span><span>●</span><span>⌁</span><div /></div>
        <div>
          <p className="eyebrow">Personal, not complicated</p>
          <h2>Jarvis is here to extend a teacher&apos;s care—not replace it.</h2>
          <p>Teachers keep the plan, their voice, and the relationship. Faraday makes more room for each student to be understood.</p>
        </div>
      </section>

      <section id="pilot" className="pilot section-shell">
        <div className="pilot-content">
          <p className="eyebrow">First classrooms, first lessons</p>
          <h2>We&apos;re getting ready for our first school pilot.</h2>
          <p>Faraday is in its early days. If you believe every learner deserves a path that makes sense to them, keep an eye on this space.</p>
          <PilotCta label="Tell me when it&apos;s ready" />
        </div>
        <div className="pilot-badge" aria-hidden="true"><span>✦</span><b>Learning<br />grows here</b><i>✦</i></div>
      </section>

      <SiteFooter />
    </main>
  );
}

import Image from "next/image";
import { PilotCta } from "../components/pilot-cta";
import { SiteFooter } from "../components/site-footer";

const learningLoop = [
  ["01", "Understand", "Faraday AI listens to the question behind the question."],
  ["02", "Find the gap", "It notices exactly what is missing, not just what is wrong."],
  ["03", "Teach", "The explanation changes to fit the student in front of it."],
  ["04", "Test", "A small check reveals whether the idea has really landed."],
  ["05", "Learn", "Every answer, hesitation, and win becomes useful context."],
  ["06", "Grow", "Faraday AI chooses the next best thing to teach."],
];

const features = [
  { number: "01", title: "A memory for your learning", body: "Faraday AI remembers the ideas that clicked, the mistakes that keep returning, and the concepts that deserve another angle.", accent: "yellow" },
  { number: "02", title: "Explanations in your world", body: "Gravitation can start with a historical mystery, a chemistry experiment, or the thing you already care about.", accent: "lilac" },
  { number: "03", title: "A gap finder, not a guesser", body: "Short checks help Faraday AI see the missing link before it turns into a bigger confidence problem.", accent: "mint" },
  { number: "04", title: "Progress you can feel", body: "Your learning path keeps moving, so every session starts a little closer to what you need next.", accent: "coral" },
];

export default function Home() {
  return (
    <main>
      <nav aria-label="Main navigation" className="nav-shell">
        <a className="brand" href="#top" aria-label="Faraday AI home">
          <Image className="brand-logo" src="/brand/logo.png" alt="" width={42} height={42} priority />
          <span>Faraday AI</span>
        </a>
        <div className="nav-links">
          <a href="#how-it-works">How it grows</a>
          <a href="#for-students">For students</a>
          <a href="#pilot">Pilot</a>
        </div>
        <a className="nav-cta" href="#pilot">Meet Faraday AI <span aria-hidden="true">&rarr;</span></a>
      </nav>

      <section id="top" className="hero section-shell">
        <div className="hero-copy">
          <p className="eyebrow">For students in grades 8-12</p>
          <h1>Your teacher.<br /><em>Growing with you.</em></h1>
          <p className="hero-text">Faraday AI does not just answer your questions. It learns how you learn, finds the gaps holding you back, and helps you take the next step with confidence.</p>
          <div className="hero-actions">
            <PilotCta label="Meet Faraday AI" />
            <a className="text-link" href="#how-it-works">See the learning loop <span aria-hidden="true">&darr;</span></a>
          </div>
          <p className="microcopy">Your personal learning memory. Built to grow with you over time.</p>
        </div>

        <div className="hero-world" aria-label="Illustration of Faraday AI building a student's growing learning map" role="img">
          <div className="hero-sun" />
          <div className="world-label">Faraday AI is paying attention</div>
          <div className="learning-orbit orbit-one" />
          <div className="learning-orbit orbit-two" />
          <div className="student-note">
            <span className="note-kicker">Maya&apos;s learning map</span>
            <strong>Gravitation</strong>
            <div className="mastery-row"><span>Understands force</span><b>86%</b></div>
            <div className="mastery-track"><i /></div>
            <div className="next-lesson">Next: why orbits work <span>&rarr;</span></div>
          </div>
          <div className="thought thought-history"><span>History</span><small>Use a Galileo story</small></div>
          <div className="thought thought-gap"><span>One small gap</span><small>Mass vs. weight</small></div>
          <div className="thought thought-win"><span>Got it!</span><small>Momentum clicked</small></div>
          <div className="world-dot dot-one" /><div className="world-dot dot-two" /><div className="world-dot dot-three" />
        </div>
      </section>

      <section id="how-it-works" className="loop-section">
        <div className="section-shell">
          <div className="section-heading">
            <p className="eyebrow">Not a chat. A relationship.</p>
            <h2>A teacher who keeps paying attention.</h2>
            <p>Each session gives Faraday AI a clearer picture of one particular student, so the next lesson can feel a little more like it was made for them.</p>
          </div>
          <ol className="learning-loop">
            {learningLoop.map(([number, title, body]) => (
              <li key={number}><span className="loop-number">{number}</span><h3>{title}</h3><p>{body}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section id="for-students" className="features section-shell">
        <div className="section-heading feature-heading">
          <p className="eyebrow">Your brain is not a blank profile</p>
          <h2>Faraday AI gets better at teaching <em>you.</em></h2>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <article className={`feature-card ${feature.accent}`} key={feature.number}>
              <span className="feature-number">{feature.number}</span>
              <div className="feature-glyph" aria-hidden="true"><i /><i /><i /></div>
              <h3>{feature.title}</h3><p>{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="interest-section section-shell">
        <div className="interest-copy">
          <p className="eyebrow">The same lesson. Your own way in.</p>
          <h2>One topic can open up in more than one direction.</h2>
          <p>Two students can study gravitation on the same day and meet completely different explanations. Faraday AI uses what they enjoy to make the idea stick.</p>
        </div>
        <div className="interest-examples">
          <article className="interest-card history-card">
            <span className="person-pill">Aarav loves history</span><h3>Why did Galileo drop things from a tower?</h3>
            <p>Faraday AI starts with a question from the past, then builds toward gravity.</p><div className="interest-sketch sketch-tower" aria-hidden="true"><i /><b /></div>
          </article>
          <article className="interest-card chemistry-card">
            <span className="person-pill">Nora loves chemistry</span><h3>What keeps particles and planets moving?</h3>
            <p>Faraday AI starts with forces you cannot see, then connects them to orbit.</p><div className="interest-sketch sketch-atom" aria-hidden="true"><i /><b /></div>
          </article>
        </div>
      </section>

      <section className="promise section-shell">
        <div className="promise-map" aria-hidden="true">
          <span className="map-title">A learning path that moves</span><div className="map-line" />
          <div className="map-node node-start">What you know</div><div className="map-node node-gap">A gap</div><div className="map-node node-next">Your next win</div>
          <div className="map-spark spark-one">+</div><div className="map-spark spark-two">*</div>
        </div>
        <div><p className="eyebrow">Personal, not complicated</p><h2>Faraday AI keeps the thread when school gets busy.</h2><p>It remembers where you were, what you were working through, and what helped last time. That means less starting over and more real progress.</p></div>
      </section>

      <section id="pilot" className="pilot section-shell">
        <div className="pilot-content">
          <p className="eyebrow">First classrooms, first learning stories</p><h2>Help us build a teacher that grows with every student.</h2>
          <p>Faraday AI is getting ready for its first school pilot. We are building it carefully with students, teachers, and the moments when learning needs to feel more personal.</p><PilotCta label="Follow the pilot" />
        </div>
        <div className="pilot-illustration" aria-hidden="true"><div className="pilot-ring" /><span>Ready to<br />learn?</span><i>+</i><b>*</b></div>
      </section>

      <SiteFooter />
    </main>
  );
}

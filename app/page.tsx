import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LearningOrbit, LearningSketch } from "../components/landing-art";
import { SiteFooter } from "../components/site-footer";
import { SiteNav } from "../components/site-nav";

const learningSteps = [
  { number: "01", title: "Choose a topic.", body: "Start with something you want to understand.", icon: "curiosity" as const },
  { number: "02", title: "Follow your path.", body: "Learn one idea at a time, at your pace.", icon: "path" as const },
  { number: "03", title: "Make it click.", body: "Ask again. Try an example. Keep going.", icon: "spark" as const },
];

const features = [
  { title: "Explained your way.", body: "Examples that fit how you learn.", icon: "world" as const },
  { title: "Progress you can see.", body: "Know what is next and how far you have come.", icon: "path" as const },
  { title: "A teacher who remembers.", body: "Pick up your lesson where you left off.", icon: "memory" as const },
];

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <main className="landing-page landing-refresh">
      <SiteNav />
      <section id="top" className="landing-hero" aria-labelledby="hero-title">
        <div className="landing-hero-copy">
          <h1 id="hero-title">Your teacher.<br /><em>Growing with you.</em></h1>
          <p className="landing-hero-description">Understand any topic, one simple step at a time.</p>
          <div className="landing-hero-actions">
            <Link className="landing-button landing-button-primary" href="/sign-up">Meet your teacher <span aria-hidden="true">↗</span></Link>
            <a className="landing-text-link" href="#how-it-works">How it works</a>
          </div>
        </div>
        <LearningOrbit />
      </section>

      <section id="how-it-works" className="landing-how" aria-labelledby="how-title">
        <div className="landing-section-inner">
          <div className="landing-section-heading">
            <h2 id="how-title">A little curiosity.<br /><em>A clear way forward.</em></h2>
          </div>
          <ol className="landing-how-grid">
            {learningSteps.map((step) => <li className="landing-how-card" key={step.number}>
              <div className="landing-card-top"><span className="landing-step-number">{step.number}</span><LearningSketch kind={step.icon} /></div>
              <h3>{step.title}</h3><p>{step.body}</p>
            </li>)}
          </ol>
        </div>
      </section>

      <section className="landing-features landing-section-inner" aria-labelledby="features-title">
        <div className="landing-section-heading">
          <h2 id="features-title">Learning that feels<br /><em>made for you.</em></h2>
        </div>
        <div className="landing-features-grid">
          {features.map((feature) => <article className="landing-feature-card" key={feature.title}>
            <LearningSketch kind={feature.icon} />
            <h3>{feature.title}</h3><p>{feature.body}</p>
          </article>)}
        </div>
      </section>

      <section className="landing-invitation landing-section-inner" aria-labelledby="invitation-title">
        <div><h2 id="invitation-title">What are you<br /><em>curious about?</em></h2></div>
        <Link href="/sign-up" className="landing-button landing-button-primary">Meet your teacher <span aria-hidden="true">↗</span></Link>
      </section>
      <SiteFooter />
    </main>
  );
}

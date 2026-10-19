export function Sparkle() {
  return <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="m20 3 4 13 13 4-13 4-4 13-4-13-13-4 13-4 4-13Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" /></svg>;
}

type SketchKind = "curiosity" | "path" | "spark" | "world" | "memory";

export function LearningSketch({ kind }: { kind: SketchKind }) {
  return <svg className="landing-sketch" viewBox="0 0 160 120" fill="none" stroke="currentColor" strokeWidth="2.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === "curiosity" && <><path d="M43 83C31 75 25 64 29 48C34 29 56 20 77 24C98 28 112 41 108 59C105 74 92 82 73 85L48 100L51 84" fill="currentColor" fillOpacity=".07" /><path d="M57 46C60 32 82 33 84 46C85 56 72 57 71 65M71 75h.1M119 19l-3 11M133 34l-11 4M113 91l10 9" /><circle cx="131" cy="71" r="5" /></>}
    {kind === "path" && <><path d="M27 96C6 57 97 88 78 55C58 22 126 47 129 18" strokeDasharray="4 7" /><circle cx="27" cy="96" r="10" fill="currentColor" fillOpacity=".13" /><circle cx="78" cy="55" r="12" fill="currentColor" fillOpacity=".13" /><path d="m73 55 4 4 7-9M129 37V12l21 8-21 8M44 17l2 8 8 2-8 2-2 8-2-8-8-2 8-2 2-8Z" /></>}
    {kind === "spark" && <><path d="M57 68C35 44 52 20 76 20C101 20 116 47 95 68L90 77H63l-6-9Z" fill="currentColor" fillOpacity=".08" /><path d="M65 87h23M69 97h15M76 76V52M65 47l11 9 12-9M76 4v6M117 20l-7 7M125 51h-10M31 48h9M34 19l8 8M111 86l4 11 11 4-11 4-4 11-4-11-11-4 11-4 4-11Z" /></>}
    {kind === "world" && <><circle cx="79" cy="58" r="35" fill="currentColor" fillOpacity=".07" /><ellipse cx="79" cy="58" rx="17" ry="35" /><path d="M45 49h68M46 71h66M79 24v68" /><ellipse cx="79" cy="58" rx="66" ry="17" transform="rotate(-24 79 58)" /><circle cx="135" cy="32" r="6" fill="currentColor" /><path d="M26 95v12M20 101h12" /></>}
    {kind === "memory" && <><path d="m41 29 56-9 14 78-56 9-14-78Z" fill="currentColor" fillOpacity=".07" /><path d="m52 27 13 78M64 41l25-4M67 52l25-4M69 63l17-3M96 23l-3-15-56 9 3 17M116 39l4-10M128 48l10-4M111 77c15-22 42-5 23 13l-14 13-15-11" /></>}
  </svg>;
}

export function LearningOrbit() {
  return <div className="landing-orbit" role="img" aria-label="An illustrated learning map: a student learns about gravitation, understands force, and moves on to orbits.">
    <div className="landing-orbit-sun" />
    <svg className="landing-orbit-lines" viewBox="0 0 640 600" fill="none" aria-hidden="true">
      <ellipse cx="320" cy="272" rx="223" ry="123" transform="rotate(-23 320 272)" stroke="currentColor" strokeDasharray="3 5" />
      <ellipse cx="332" cy="277" rx="216" ry="114" transform="rotate(30 332 277)" stroke="currentColor" strokeDasharray="3 5" />
      <circle cx="96" cy="191" r="6" fill="currentColor" />
      <circle cx="520" cy="340" r="7" fill="currentColor" />
      <path d="M138 468c48 24 131 23 181-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="m307 455 14 3-5 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <div className="landing-orbit-card">
      <div className="landing-orbit-card-kicker">Your learning map</div>
      <strong>Gravitation</strong>
      <div className="landing-orbit-card-progress"><span>Understands force</span><b>86%</b></div>
      <div className="landing-orbit-track"><span /></div>
      <div className="landing-orbit-next"><span>Next: why orbits work</span><span aria-hidden="true">→</span></div>
    </div>
  </div>;
}

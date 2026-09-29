"use client";

import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useState, type ReactNode } from "react";

export type LearningPage = "learning" | "learn" | "lessons" | "suggested" | "progress" | "tests" | "memory" | "settings";

type Props = { firstName: string; page: LearningPage };

const nav = [
  ["/dashboard", "learning", "My learning", "⌂"],
  ["/dashboard/learn", "learn", "Start a topic", "+"],
  ["/dashboard/lessons", "lessons", "Lessons", "◫"],
  ["/dashboard/suggested", "suggested", "Suggested for you", "✦"],
  ["/dashboard/progress", "progress", "My progress", "↗"],
  ["/dashboard/tests", "tests", "Tests", "✓"],
  ["/dashboard/memory", "memory", "Memory & preferences", "◌"],
] as const;

const tracks = [
  { subject: "Physics", title: "Why objects orbit", detail: "Continue from your last question", percent: 62, color: "bg-[#ffd53d]", icon: "🚀" },
  { subject: "Maths", title: "Two-step equations", detail: "A tiny 6-minute mission", percent: 45, color: "bg-[#ded5ff]", icon: "✏️" },
  { subject: "History", title: "The Galileo clue", detail: "A story-led lesson", percent: 28, color: "bg-[#b8ebc9]", icon: "⌛" },
];

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[22px] border border-[#dfe7d7] bg-white ${className}`}>{children}</div>;
}

function Choice({ children, selected, onClick }: { children: ReactNode; selected?: boolean; onClick?: () => void }) {
  return <button onClick={onClick} className={`rounded-xl border px-3 py-2.5 text-left text-sm font-extrabold transition ${selected ? "border-[#246946] bg-[#dff5e5] text-[#1d6a42] shadow-[0_2px_0_#8bcba0]" : "border-[#d9e3d4] bg-white text-[#486252] hover:-translate-y-0.5 hover:border-[#8fc7a1] hover:bg-[#f4fbf1]"}`}>{children}</button>;
}

function TrackCard({ track }: { track: (typeof tracks)[number] }) {
  return <Card className="group p-4 transition hover:-translate-y-1 hover:border-[#b7d6c0] hover:shadow-[0_12px_28px_rgba(28,65,45,.11)]">
    <div className={`mb-5 grid size-12 place-items-center rounded-2xl text-xl shadow-[0_3px_0_rgba(23,53,42,.10)] ${track.color}`}>{track.icon}</div>
    <div className="flex justify-between gap-2 text-[10px] font-extrabold uppercase tracking-[.8px] text-[#6e8173]"><span>{track.subject}</span><span className="text-[#246946]">{track.percent}%</span></div>
    <h3 className="mt-1 text-lg font-bold tracking-[-.7px]">{track.title}</h3><p className="mt-1 text-xs text-[#718173]">{track.detail}</p>
    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#eaf0e5]"><div className="h-full rounded-full bg-[#56b878]" style={{ width: `${track.percent}%` }} /></div>
    <Link href="/dashboard/learn" className="mt-4 inline-block text-sm font-extrabold text-[#246946] transition group-hover:translate-x-1">Continue →</Link>
  </Card>;
}

function LearningHome({ firstName }: { firstName: string }) {
  return <>
    <p className="eyebrow">Your learning space</p><h1>Good to see you, {firstName}.</h1><p className="intro">Your teacher has kept a few small wins ready for today.</p>
    <div className="mt-7 overflow-hidden rounded-[27px] border border-[#e6cf70] bg-[#fff1b9] p-6 shadow-[0_7px_0_#ead579] min-[750px]:p-8">
      <p className="eyebrow text-[#80660b]">Your next best step</p><h2 className="mt-2 max-w-xl">Why doesn&apos;t the Moon fall down?</h2><p className="mt-3 max-w-lg text-sm leading-relaxed text-[#705f25]">You already understand gravity. Let&apos;s use a space story to untangle the one part that felt tricky: orbits.</p>
      <Link href="/dashboard/learn" className="mt-5 inline-block rounded-xl bg-[#246946] px-4 py-3 text-sm font-extrabold text-white shadow-[0_3px_0_#143d2b] transition hover:-translate-y-0.5">Start the 8-minute mission →</Link>
    </div>
    <section className="mt-8"><div className="section-heading"><div><p className="eyebrow">Continue learning</p><h2>Pick up a thread</h2></div><Link href="/dashboard/lessons">See all →</Link></div><div className="mt-4 grid gap-4 min-[680px]:grid-cols-3">{tracks.map((track) => <TrackCard key={track.title} track={track} />)}</div></section>
  </>;
}

function LearnPage() {
  const [topic, setTopic] = useState(""); const [started, setStarted] = useState(false); const [style, setStyle] = useState("Sports"); const [level, setLevel] = useState("I know a little");
  return <>
    <p className="eyebrow">Start a new learning mission</p><h1>What are you curious about?</h1><p className="intro">Name a topic. Faraday will help you choose a friendly place to begin.</p>
    <Card className="mt-7 overflow-hidden p-5 min-[700px]:p-7"><label className="text-sm font-extrabold text-[#38564a]" htmlFor="topic">Your topic</label><div className="mt-3 flex rounded-2xl border border-[#d2dfc9] bg-[#f8fbf4] p-2 focus-within:ring-4 focus-within:ring-[#e2f4dd]"><input id="topic" value={topic} onChange={(e) => { setTopic(e.target.value); setStarted(false); }} onKeyDown={(e) => e.key === "Enter" && setStarted(Boolean(topic.trim()))} placeholder="Try: Why do planets stay in orbit?" className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-[#91a092]"/><button onClick={() => setStarted(Boolean(topic.trim()))} className="rounded-xl bg-[#246946] px-4 py-3 text-sm font-extrabold text-white">Let&apos;s go →</button></div>
      {started && <div className="mt-6 rounded-2xl bg-[#fff5c6] p-5"><p className="eyebrow text-[#80660b]">Tiny mission: {topic}</p><h2 className="mt-2 text-[25px]">Before we begin, how should we explore it?</h2><p className="mt-2 text-sm text-[#75652b]">Pick what sounds fun. You can change your mind anytime.</p><div className="mt-4 grid grid-cols-2 gap-2 min-[560px]:grid-cols-3">{["⚽ Sports", "🧪 Practical", "📖 Story", "🚀 Space", "🎮 Game-like", "✏️ Just explain"].map((option) => <Choice key={option} selected={style === option.replace(/^.. /, "")} onClick={() => setStyle(option.replace(/^.. /, ""))}>{option}</Choice>)}</div><div className="mt-5 border-t border-[#e4cf7c] pt-4"><p className="text-sm font-extrabold text-[#705f25]">Or tell Faraday what you want</p><div className="mt-2 flex rounded-xl border border-[#dbc264] bg-white p-1.5"><input placeholder="Explain it with cricket..." className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-[#9a915f]"/><button className="rounded-lg bg-[#246946] px-3 text-sm font-extrabold text-white">Ask →</button></div></div></div>}
    </Card>
    <Card className="mt-5 p-5 min-[700px]:p-7"><p className="eyebrow">Make it yours</p><h2 className="mt-1 text-[25px]">Where should we begin?</h2><div className="mt-4 grid gap-2 min-[560px]:grid-cols-3">{["I’m brand new", "I know a little", "Test me first"].map((option) => <Choice key={option} selected={level === option} onClick={() => setLevel(option)}>{option}</Choice>)}</div><p className="mt-4 rounded-xl bg-[#eff8ee] px-4 py-3 text-sm text-[#3f694d]">No pressure: “I&apos;m not sure yet” is always a perfect answer here.</p></Card>
    <div className="mt-6"><p className="eyebrow">Explore a ready-made path</p><div className="mt-3 grid gap-3 min-[650px]:grid-cols-3">{["Gravity", "The French Revolution", "Photosynthesis"].map((item, i) => <Link href="/dashboard/lessons" key={item} className="rounded-2xl border border-[#dfe7d7] bg-white p-4 font-bold transition hover:-translate-y-1 hover:border-[#a4d2af]"><span className="mr-2">{["🌎", "🏛️", "🌿"][i]}</span>{item}<span className="float-right text-[#246946]">→</span></Link>)}</div></div>
  </>;
}

function LessonsPage() { return <><p className="eyebrow">Your paths</p><h1>Lessons that lead somewhere.</h1><p className="intro">Every card remembers where you stopped and what still needs a little care.</p><div className="mt-7 grid gap-4 min-[690px]:grid-cols-2">{tracks.concat([{ subject: "Chemistry", title: "Atoms in orbit", detail: "Ready for your first step", percent: 0, color: "bg-[#ffb69a]", icon: "⚛" }]).map((track) => <TrackCard key={track.title} track={track} />)}</div></>; }

function SuggestedPage() { const suggestions = [["Because you enjoyed Galileo’s story", "Why do planets stay in orbit?", "A space mystery with a history clue", "🚀"], ["You may be ready for", "Forces and motion", "Build from gravity into Newton’s laws", "⚡"], ["Worth a small revisit", "Mass vs weight", "You were unsure of this 10 days ago", "🔁"], ["Made for your practical side", "Atoms in everyday objects", "A mini kitchen-science investigation", "🧪"]]; return <><p className="eyebrow">Your teacher noticed</p><h1>Suggested for you.</h1><p className="intro">Not random topics—these come from your questions, favourites, and next best steps.</p><div className="mt-7 grid gap-4 min-[700px]:grid-cols-2">{suggestions.map(([reason, title, detail, icon]) => <Card key={title} className="p-5"><span className="text-2xl">{icon}</span><p className="mt-5 text-[10px] font-extrabold uppercase tracking-[.8px] text-[#6b806e]">{reason}</p><h2 className="mt-1 text-[24px]">{title}</h2><p className="mt-2 text-sm text-[#6a7c6f]">{detail}</p><Link href="/dashboard/learn" className="mt-5 inline-block text-sm font-extrabold text-[#246946]">Explore this →</Link></Card>)}</div></>; }

function ProgressPage() { const rows = [["Basic gravity", "Strong", "86%", "bg-[#56b878]"], ["Mass vs weight", "Strong", "82%", "bg-[#56b878]"], ["Why objects orbit", "Growing", "62%", "bg-[#ffd53d]"], ["Force vs motion", "Needs attention", "34%", "bg-[#ffb69a]"]]; return <><p className="eyebrow">Your growing map</p><h1>Progress with a purpose.</h1><p className="intro">This is not just a score. It shows what has clicked and where your teacher can help next.</p><Card className="mt-7 overflow-hidden"><div className="border-b border-[#e5ecdf] bg-[#f0f9ef] p-5"><p className="eyebrow">Physics</p><h2 className="mt-1">Your gravity learning path</h2></div><div className="divide-y divide-[#e8eee4]">{rows.map(([name, status, amount, color]) => <div key={name} className="p-5"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-extrabold">{name}</p><p className="mt-1 text-xs text-[#687d6d]">{status}</p></div><span className="text-sm font-extrabold text-[#246946]">{amount}</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-[#edf1e9]"><div className={`h-full rounded-full ${color}`} style={{ width: amount }} /></div></div>)}</div></Card><Card className="mt-5 border-[#edd77b] bg-[#fff8d9] p-5"><p className="eyebrow text-[#80660b]">Next best step</p><h2 className="mt-1 text-[24px]">A 10-minute lesson: Why the Moon does not fall</h2><p className="mt-2 text-sm text-[#71632c]">This helps clear the “force vs motion” gap you ran into.</p><Link href="/dashboard/learn" className="mt-4 inline-block rounded-xl bg-[#246946] px-4 py-3 text-sm font-extrabold text-white">Help me clear it →</Link></Card></>; }

function TestsPage() { const [mode, setMode] = useState("Quick check"); return <><p className="eyebrow">Ready when you are</p><h1>Tests without the scary part.</h1><p className="intro">Pick a style. Wrong answers become a clue for the next lesson, never a dead end.</p><div className="mt-7 grid gap-3 min-[650px]:grid-cols-2">{[["Quick check", "3 friendly questions · 4 min"], ["Practice test", "10 questions · take your time"], ["Explain it back", "Teach Faraday in your own words"], ["Weak areas test", "Only the concepts needing care"]].map(([name, detail]) => <Choice key={name} selected={mode === name} onClick={() => setMode(name)}><span className="block text-base">{name}</span><span className="mt-1 block text-xs font-medium text-[#69806e]">{detail}</span></Choice>)}</div><Card className="mt-5 bg-[#eff8ee] p-6"><p className="eyebrow">{mode}</p><h2 className="mt-2 text-[26px]">Ready to try Physics: Gravity?</h2><p className="mt-2 text-sm text-[#587163]">If anything feels unclear, you can pause and ask Faraday right inside the question card.</p><button className="mt-5 rounded-xl bg-[#246946] px-4 py-3 text-sm font-extrabold text-white">Start when I&apos;m ready →</button></Card></>; }

function MemoryPage() { const memories = [["Learning style", "You usually enjoy practical and sports-based examples."], ["Growing strength", "Basic gravity and mass versus weight are clicking."], ["A thread to revisit", "Orbits feel easier after a visual or real-life example."], ["Your interests", "Space, history stories, and football examples make learning more fun."]]; return <><p className="eyebrow">Your teacher&apos;s notebook</p><h1>What Faraday remembers.</h1><p className="intro">These small notes help lessons feel personal. You are always in control of them.</p><div className="mt-7 space-y-3">{memories.map(([title, detail]) => <Card key={title} className="flex flex-col gap-3 p-5 min-[600px]:flex-row min-[600px]:items-center"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#dff5e5] text-[#246946]">✓</div><div className="min-w-0 flex-1"><h2 className="text-lg">{title}</h2><p className="mt-1 text-sm text-[#66796b]">{detail}</p></div><button className="text-sm font-extrabold text-[#246946]">Edit</button></Card>)}</div><p className="mt-5 text-xs leading-relaxed text-[#718173]">Later, you&apos;ll be able to remove any memory or turn off personalised suggestions here.</p></>; }

function SettingsPage() { return <><p className="eyebrow">Your space</p><h1>Settings.</h1><p className="intro">Personalisation controls and account preferences will live here.</p><Card className="mt-7 p-5"><h2 className="text-[23px]">Learning preferences</h2><p className="mt-2 text-sm text-[#687d6d]">Choose how much personalisation you want Faraday to use.</p><div className="mt-5 flex items-center justify-between rounded-xl bg-[#f2f8ee] p-4"><span className="text-sm font-extrabold">Personalised lesson suggestions</span><span className="rounded-full bg-[#246946] px-3 py-1 text-xs font-extrabold text-white">On</span></div></Card></>; }

export function LearningExperience({ firstName, page }: Props) {
  const content = { learning: <LearningHome firstName={firstName} />, learn: <LearnPage />, lessons: <LessonsPage />, suggested: <SuggestedPage />, progress: <ProgressPage />, tests: <TestsPage />, memory: <MemoryPage />, settings: <SettingsPage /> }[page];
  return <main className="min-h-screen bg-[#f4f8ef] p-0 text-[#17352a] min-[800px]:h-screen min-[800px]:overflow-hidden min-[800px]:p-4"><div className="mx-auto flex min-h-screen max-w-[1540px] overflow-hidden bg-[#fffdf8] shadow-[0_18px_60px_rgba(28,65,45,.12)] min-[800px]:h-full min-[800px]:min-h-0 min-[800px]:rounded-[30px] min-[800px]:border min-[800px]:border-[#dce5d3]">
    <aside className="hidden h-full w-[278px] shrink-0 flex-col border-r border-[#e1e9d8] bg-[#f7faef] p-5 min-[800px]:flex"><Link href="/" className="group mb-8 flex items-center gap-2 text-xl font-extrabold tracking-[-1.2px]"><Image className="size-10 object-contain transition group-hover:rotate-6" src="/brand/logo.png" width={42} height={42} alt=""/>Faraday AI</Link><p className="mb-3 px-3 text-[10px] font-extrabold uppercase tracking-[1.4px] text-[#819080]">Learn</p><nav className="space-y-1 text-sm font-extrabold">{nav.map(([href, id, label, icon]) => <Link key={id} href={href} className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 transition ${page === id ? "bg-[#dff5e5] text-[#1d7648] shadow-[inset_0_0_0_1px_#b8ebc9]" : "text-[#607565] hover:bg-[#eaf1e1] hover:text-[#246946]"}`}><span className={`grid size-8 place-items-center rounded-xl text-base ${page === id ? "bg-[#246946] text-white" : "bg-[#e4ebda]"}`}>{icon}</span>{label}</Link>)}</nav><div className="mt-auto space-y-3"><div className="rounded-2xl border border-[#d9e5cd] bg-white p-3.5"><div className="flex justify-between text-xs font-extrabold"><span className="text-[#4d6856]">Weekly goal</span><span className="text-[#246946]">3 / 5</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e5ecdc]"><div className="h-full w-[60%] rounded-full bg-[#56b878]"/></div></div><Link href="/dashboard/learn" className="block w-full rounded-2xl bg-[#ffd53d] px-4 py-3 text-center text-sm font-extrabold shadow-[0_4px_0_#dcae10]">+ New session</Link><Link href="/dashboard/settings" className="block text-center text-xs font-extrabold text-[#607565] hover:text-[#246946]">Settings</Link><div className="flex items-center gap-3 border-t border-[#dfe7d5] pt-4"><UserButton/><span className="text-xs font-bold text-[#617668]">Your account</span></div></div></aside>
    <section className="min-w-0 flex-1 overflow-y-auto p-5 min-[800px]:p-8 min-[1100px]:p-10"><div className="mx-auto max-w-[1040px] pb-8"><header className="mb-7 flex items-center justify-between min-[800px]:hidden"><Link href="/dashboard" className="flex items-center gap-2 font-extrabold"><Image className="size-8" src="/brand/logo.png" width={32} height={32} alt=""/>Faraday AI</Link><UserButton/></header><div className="mb-5 flex justify-end"><span className="rounded-full border border-[#ece4be] bg-[#fff9df] px-3 py-2 text-xs font-extrabold text-[#725904]">3 day streak 🔥</span></div>{content}</div></section>
  </div></main>;
}

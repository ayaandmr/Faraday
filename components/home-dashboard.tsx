"use client";

import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useState } from "react";

type HomeDashboardProps = { firstName: string };

const lessons = [
  { title: "Forces in motion", detail: "Physics · 8 min", color: "bg-[#ffd53d]", icon: "↗", progress: "72%" },
  { title: "The Galileo clue", detail: "History · 6 min", color: "bg-[#ded5ff]", icon: "✦", progress: "45%" },
  { title: "Atoms in orbit", detail: "Chemistry · 10 min", color: "bg-[#b8ebc9]", icon: "◌", progress: "30%" },
];

const navItems = [
  ["⌂", "My learning", true],
  ["◎", "Lessons", false],
  ["◔", "My progress", false],
] as const;

export function HomeDashboard({ firstName }: HomeDashboardProps) {
  const [prompt, setPrompt] = useState("");
  const [started, setStarted] = useState(false);

  function startSession() {
    if (prompt.trim()) setStarted(true);
  }

  return (
    <main className="min-h-screen bg-[#f5f8ef] p-0 text-[#17352a] min-[800px]:h-screen min-[800px]:overflow-hidden min-[800px]:p-4">
      <div className="mx-auto flex min-h-screen max-w-[1540px] overflow-hidden bg-[#fffdf8] shadow-[0_18px_60px_rgba(28,65,45,.12)] min-[800px]:h-full min-[800px]:min-h-0 min-[800px]:rounded-[30px] min-[800px]:border min-[800px]:border-[#dce5d3]">
        <aside className="hidden h-full w-[278px] shrink-0 flex-col border-r border-[#e1e9d8] bg-[#f7faef] p-5 min-[800px]:flex">
          <Link href="/" className="group mb-8 flex items-center gap-2 text-xl font-extrabold tracking-[-1.2px]">
            <Image className="size-10 object-contain transition duration-300 group-hover:rotate-6 group-hover:scale-110" src="/brand/logo.png" width={42} height={42} alt="" /> Faraday AI
          </Link>
          <p className="mb-3 px-3 text-[10px] font-extrabold uppercase tracking-[1.4px] text-[#819080]">Learn</p>
          <nav className="space-y-1.5 text-sm font-extrabold">
            {navItems.map(([icon, label, active]) => active ? (
              <a key={label} className="flex items-center gap-3 rounded-2xl bg-[#dff5e5] px-3 py-3 text-[#1d7648] shadow-[inset_0_0_0_1px_#b8ebc9]" href="/dashboard"><span className="grid size-8 place-items-center rounded-xl bg-[#246946] text-base text-white shadow-[0_3px_0_#175033]">{icon}</span>{label}</a>
            ) : (
              <button key={label} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-[#607565] transition duration-200 hover:translate-x-1 hover:bg-[#eaf1e1] hover:text-[#246946]"><span className="grid size-8 place-items-center rounded-xl bg-[#e4ebda] text-base">{icon}</span>{label}</button>
            ))}
          </nav>

          <div className="mt-auto space-y-3">
            <div className="rounded-2xl border border-[#d9e5cd] bg-white p-3.5">
              <div className="flex items-center justify-between"><span className="text-xs font-extrabold text-[#4d6856]">Weekly goal</span><span className="text-xs font-extrabold text-[#246946]">3 / 5</span></div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e5ecdc]"><div className="h-full w-[60%] rounded-full bg-[#56b878]" /></div>
            </div>
            <button onClick={() => document.getElementById("new-session")?.focus()} className="w-full rounded-2xl bg-[#ffd53d] px-4 py-3 text-sm font-extrabold shadow-[0_4px_0_#dcae10] transition duration-200 hover:-translate-y-0.5 hover:bg-[#ffe36b] active:translate-y-0 active:shadow-none">+ New session</button>
            <button className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-[#d3e1c6] bg-white px-4 py-3 text-sm font-extrabold text-[#246946] transition hover:border-[#8ecfa5] hover:bg-[#eff9ed]"><span className="transition group-hover:scale-125">⚡</span> Upgrade</button>
            <div className="flex items-center gap-3 border-t border-[#dfe7d5] pt-4"><UserButton /><span className="text-xs font-bold text-[#617668]">Your account</span></div>
          </div>
        </aside>

        <section className="min-w-0 flex-1 overflow-y-auto overscroll-contain p-5 min-[800px]:p-8 min-[1100px]:p-10">
          <div className="mx-auto max-w-[1120px] pb-8">
            <header className="mb-7 flex items-start justify-between gap-4 min-[800px]:mb-8">
              <div><p className="text-[11px] font-extrabold uppercase tracking-[1.25px] text-[#246946]">Your learning space</p><h1 className="mt-2 text-[clamp(31px,4vw,52px)] font-bold leading-none tracking-[-2.5px]">Good to see you, {firstName}.</h1><p className="mt-2 text-sm font-medium text-[#6c806f]">One small win is waiting for you today.</p></div>
              <div className="flex items-center gap-2 min-[800px]:hidden"><span className="rounded-full bg-[#fff1b4] px-2.5 py-1 text-xs font-extrabold text-[#725904]">3 day streak 🔥</span><UserButton /></div>
              <div className="hidden items-center gap-2 rounded-full border border-[#ece4be] bg-[#fff9df] px-3 py-2 text-xs font-extrabold text-[#725904] min-[800px]:flex">3 day streak <span>🔥</span></div>
            </header>

            <div className="relative overflow-hidden rounded-[28px] border border-[#e6cf70] bg-[#fff1b9] p-6 shadow-[0_8px_0_#ead579] min-[800px]:p-8">
              <div className="absolute inset-y-0 right-0 hidden w-[43%] bg-[linear-gradient(90deg,rgba(255,241,185,1),rgba(255,241,185,.1)),url('https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=85')] bg-cover bg-center min-[950px]:block" />
              <div className="absolute -top-16 -right-16 size-56 rounded-full border-[22px] border-white/40 min-[950px]:right-[32%]" />
              <div className="relative max-w-[620px]"><p className="mb-3 text-[11px] font-extrabold uppercase tracking-[1.25px] text-[#80660b]">Your next best step</p><h2 className="text-[clamp(26px,3.2vw,43px)] font-bold leading-[.98] tracking-[-2px]">What would you like to understand today?</h2><p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[#705f25]">Ask anything. Faraday meets you where you are, then finds the next idea that clicks.</p></div>
              <div className="relative mt-6 flex rounded-2xl border border-[#d7bd4c] bg-white p-2 shadow-[0_5px_0_#e7cf6b] focus-within:ring-4 focus-within:ring-[#fff8d9] min-[950px]:max-w-[680px]">
                <input id="new-session" value={prompt} onChange={(event) => { setPrompt(event.target.value); setStarted(false); }} onKeyDown={(event) => event.key === "Enter" && startSession()} placeholder="Try: Why do planets stay in orbit?" className="min-w-0 flex-1 bg-transparent px-3 py-2 text-[15px] outline-none placeholder:text-[#94a091]" />
                <button onClick={startSession} className="rounded-xl bg-[#246946] px-4 py-3 text-sm font-extrabold text-white shadow-[0_3px_0_#143d2b] transition hover:-translate-y-0.5 hover:bg-[#2c7b52] active:translate-y-0 active:shadow-none">Start <span className="hidden min-[480px]:inline">for now</span> →</button>
              </div>
              {started && <p className="relative mt-5 max-w-[680px] rounded-xl bg-white/80 px-4 py-3 text-sm font-bold text-[#246946]">Your new session is ready: “{prompt}”</p>}
            </div>

            <div className="mt-8 mb-4 flex items-end justify-between"><div><p className="text-[11px] font-extrabold uppercase tracking-[1.25px] text-[#246946]">Continue learning</p><h2 className="mt-1 text-2xl font-bold tracking-[-1.2px]">Pick up a thread</h2></div><button className="rounded-xl px-3 py-2 text-sm font-extrabold text-[#246946] transition hover:bg-[#eaf5ea]">See all →</button></div>
            <div className="grid gap-4 min-[650px]:grid-cols-3">
              {lessons.map((lesson) => <article key={lesson.title} className="group rounded-2xl border border-[#e2e6d8] bg-white p-4 transition duration-300 hover:-translate-y-1 hover:border-[#bcd8c3] hover:shadow-[0_12px_28px_rgba(28,65,45,.12)]"><div className={`mb-6 grid size-12 place-items-center rounded-2xl text-2xl shadow-[0_4px_0_rgba(23,53,42,.10)] transition duration-300 group-hover:rotate-6 group-hover:scale-110 ${lesson.color}`}>{lesson.icon}</div><div className="flex items-center justify-between gap-2"><p className="text-[11px] font-extrabold uppercase tracking-wide text-[#6d8173]">{lesson.detail}</p><span className="text-[11px] font-extrabold text-[#246946]">{lesson.progress}</span></div><h3 className="mt-1 text-xl font-bold tracking-[-1px]">{lesson.title}</h3><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#eaf0e5]"><div className="h-full rounded-full bg-[#56b878]" style={{ width: lesson.progress }} /></div><button className="mt-4 text-sm font-extrabold text-[#246946] transition group-hover:translate-x-1">Continue →</button></article>)}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

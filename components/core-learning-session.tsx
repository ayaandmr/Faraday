"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type RefObject } from "react";
import type { GradeLevel, LearnerLevel, LearningError, LearningTurn, LessonHistoryItem, ProfileState, ResponseFormat, TeachingStyle, TurnAction } from "../lib/learning/contracts";

const styleOptions: Array<{ value: TeachingStyle; label: string }> = [
  { value: "practical", label: "Real life" }, { value: "sports", label: "Sports" }, { value: "story", label: "Stories" },
  { value: "space", label: "Space" }, { value: "game-like", label: "Game-like" }, { value: "direct", label: "Direct" },
];
const formatOptions: Array<{ value: ResponseFormat; label: string; detail: string }> = [
  { value: "visual_cards", label: "Visual cards", detail: "A concept map in small pieces" },
  { value: "real_examples", label: "Examples", detail: "Every idea with a real example" },
  { value: "step_by_step", label: "Step by step", detail: "Slow and ordered explanations" },
  { value: "video_style", label: "Video-style", detail: "A scene-by-scene walkthrough" },
];
const levelOptions: Array<{ value: LearnerLevel; label: string; detail: string }> = [
  { value: "new", label: "Brand new", detail: "Start from what the topic means" },
  { value: "some_knowledge", label: "I know a little", detail: "Connect to what I may know" },
  { value: "test_me", label: "I am revising", detail: "Refresh the key ideas clearly" },
];

function Choice({ active, children, onClick, disabled }: { active?: boolean; children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  const classes = "rounded-2xl border p-4 text-left transition disabled:opacity-60 " + (active ? "border-[#246946] bg-[#dff5e5] text-[#1d6a42] shadow-[0_3px_0_#8bcba0]" : "border-[#d9e3d4] bg-white text-[#486252] hover:-translate-y-0.5 hover:border-[#8fc7a1]");
  return <button type="button" disabled={disabled} onClick={onClick} className={classes}>{children}</button>;
}

async function payload(response: Response) {
  const data = await response.json() as LearningTurn | LearningError | ProfileState;
  if (!response.ok || "error" in data) throw new Error("error" in data ? data.error.message : "Faraday could not continue.");
  return data;
}

function LessonResponse({ turn, latest, progressLabel, busy, draft, onDraftChange, onAsk, onUnderstood, onConfused, onNewTopic, responseRef }: {
  turn: LessonHistoryItem; latest: boolean; progressLabel: string; busy: boolean; draft: string;
  onDraftChange: (value: string) => void; onAsk: () => void; onUnderstood: () => void; onConfused: () => void; onNewTopic: () => void;
  responseRef: RefObject<HTMLDivElement | null>;
}) {
  return <div ref={latest ? responseRef : undefined} className="scroll-mt-6">
    <div className="ml-auto max-w-[760px] rounded-[22px_22px_6px_22px] border border-[#c9d9c7] bg-white p-5">
      <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#6d8173]">You</p>
      <p className="mt-2 text-lg font-bold">{turn.studentMessage || "I started this topic."}</p>
    </div>
    <div className="learning-card mt-4 rounded-[6px_28px_28px_28px] border-2 border-[#b9d8c1] bg-white p-5 shadow-[0_10px_35px_rgba(28,65,45,.10)] min-[700px]:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow">Faraday AI</p>
        {latest && <span className="rounded-full bg-[#dff5e5] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#246946]">Personalized lesson</span>}
      </div>
      <p className="mt-4 max-w-[850px] text-[clamp(18px,2.2vw,24px)] font-bold leading-relaxed text-[#244c38]">{turn.teacherMessage}</p>

      {turn.ui.type === "teaching_cards" && <>
        <h2 className="mt-8 text-[clamp(27px,4vw,39px)]">{turn.ui.title}</h2>
        <div className="mt-5 grid gap-4">{turn.ui.cards.map((card, index) => <article key={card.id} className="rounded-[22px] border border-[#dbe6d8] bg-[#f8fbf4] p-5 min-[700px]:p-6">
          <div className="flex items-start gap-4"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#246946] text-sm font-extrabold text-white">{index + 1}</span><div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#6d8173]">{card.kind}</p>
            <h3 className="mt-1 text-[22px] font-bold tracking-[-.8px]">{card.title}</h3>
            <p className="mt-3 text-base leading-7 text-[#38564a]">{card.body}</p>
            {card.example && <div className="mt-4 rounded-xl border border-[#e6cf70] bg-[#fff5c6] p-4 text-sm leading-6 text-[#705f25]"><strong>Easy example:</strong> {card.example}</div>}
          </div></div>
        </article>)}</div>
        {latest && <div className="mt-6 grid gap-3 min-[560px]:grid-cols-2">
          <button type="button" disabled={busy} onClick={onUnderstood} className="rounded-2xl bg-[#246946] px-5 py-4 text-base font-extrabold text-white shadow-[0_4px_0_#143d2b] disabled:opacity-60">I understood</button>
          <button type="button" disabled={busy} onClick={onConfused} className="rounded-2xl border-2 border-[#e0be44] bg-[#fff5c6] px-5 py-4 text-base font-extrabold text-[#705604] disabled:opacity-60">I&apos;m confused - make it easier</button>
        </div>}
      </>}

      {turn.ui.type === "lesson_complete" && <div className="mt-7 rounded-2xl border border-[#b8dfc3] bg-[#eaf8ed] p-5">
        <p className="text-xs font-extrabold uppercase tracking-wide text-[#246946]">Lesson completed</p>
        <h2 className="mt-2 text-[28px]">You built this topic step by step.</h2>
        <p className="mt-2 text-sm leading-6 text-[#466453]">{turn.ui.summary}</p>
        <Link href="/dashboard/lessons" className="mt-4 inline-block rounded-xl bg-[#246946] px-4 py-3 text-sm font-extrabold text-white">See your lessons</Link>
      </div>}

      {latest && turn.ui.type !== "lesson_complete" && <div className="mt-7 border-t border-[#e3ebe0] pt-5">
        <label htmlFor="follow-up" className="text-sm font-extrabold text-[#38564a]">Still wondering something? Ask here.</label>
        <div className="mt-2 flex rounded-2xl border border-[#d6e1d0] bg-[#f8fbf4] p-2 focus-within:ring-4 focus-within:ring-[#e2f4dd]">
          <input id="follow-up" value={draft} disabled={busy} onChange={(event) => onDraftChange(event.target.value)} onKeyDown={(event) => event.key === "Enter" && onAsk()} placeholder="Example: Explain card 2 with football" className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none disabled:opacity-60"/>
          <button type="button" disabled={busy} onClick={onAsk} className="rounded-xl bg-[#246946] px-4 text-sm font-extrabold text-white disabled:opacity-60">{busy ? "Thinking..." : "Ask"}</button>
        </div>
        {busy && <p role="status" className="mt-3 text-sm font-bold text-[#246946]">Faraday is building the next clear cards...</p>}
      </div>}
      {latest && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-[#687d6d]"><span>{progressLabel}</span><button type="button" onClick={onNewTopic} className="font-extrabold text-[#246946]">Start a different topic</button></div>}
    </div>
  </div>;
}

export function CoreLearningSession() {
  const [profile, setProfile] = useState<ProfileState | null>(null);
  const [topic, setTopic] = useState("");
  const [setupOpen, setSetupOpen] = useState(false);
  const [grade, setGrade] = useState<GradeLevel>(9);
  const [style, setStyle] = useState<TeachingStyle>("practical");
  const [format, setFormat] = useState<ResponseFormat>("real_examples");
  const [level, setLevel] = useState<LearnerLevel>("new");
  const [consent, setConsent] = useState(false);
  const [lesson, setLesson] = useState<LearningTurn | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const responseRef = useRef<HTMLDivElement>(null);

  useEffect(() => { void (async () => {
    try {
      const loaded = await payload(await fetch("/api/learning/profile", { cache: "no-store" })) as ProfileState;
      setProfile(loaded);
      if (loaded.gradeLevel) setGrade(loaded.gradeLevel);
      if (loaded.preferredStyle) setStyle(loaded.preferredStyle);
      if (loaded.preferredFormat) setFormat(loaded.preferredFormat);
      const query = new URLSearchParams(window.location.search);
      const sessionId = query.get("session");
      if (sessionId) {
        const restored = await payload(await fetch("/api/learning/sessions/" + encodeURIComponent(sessionId), { cache: "no-store" })) as LearningTurn;
        setLesson(restored);
        setTopic(restored.topic);
      } else if (query.get("topic")) {
        setTopic(query.get("topic") ?? "");
        setSetupOpen(true);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Faraday could not open your learning space.");
    }
  })(); }, []);

  useEffect(() => {
    if (!lesson) return;
    const frame = requestAnimationFrame(() => responseRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    return () => cancelAnimationFrame(frame);
  }, [lesson]);

  function beginSetup() {
    if (!topic.trim()) { setError("Tell Faraday what you want to learn first."); return; }
    setError("");
    setSetupOpen(true);
  }

  async function startLesson() {
    if (busy || (!profile?.complete && !consent)) {
      if (!profile?.complete) setError("Please accept the pilot notice first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const created = await payload(await fetch("/api/learning/sessions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), style, format, level, gradeLevel: profile?.complete ? undefined : grade, pilotConsent: profile?.complete ? undefined : consent }),
      })) as LearningTurn;
      setLesson(created);
      setSetupOpen(false);
      setProfile({ complete: true, gradeLevel: grade, preferredStyle: style, preferredFormat: format });
      window.history.replaceState(null, "", "/dashboard/learn?session=" + encodeURIComponent(created.sessionId));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Faraday could not build the lesson.");
    } finally {
      setBusy(false);
    }
  }

  async function sendTurn(action: TurnAction, value?: string) {
    if (!lesson || busy) return;
    setBusy(true);
    setError("");
    try {
      const next = await payload(await fetch("/api/learning/sessions/" + encodeURIComponent(lesson.sessionId) + "/turns", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "ask_follow_up" ? { action, answer: value } : { action }),
      })) as LearningTurn;
      setLesson(next);
      setDraft("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Faraday could not continue the lesson.");
    } finally {
      setBusy(false);
    }
  }

  function ask() {
    if (!draft.trim()) { setError("Write your question first."); return; }
    void sendTurn("ask_follow_up", draft.trim());
  }

  function newTopic() {
    setLesson(null);
    setTopic("");
    setSetupOpen(false);
    setError("");
    window.history.replaceState(null, "", "/dashboard/learn");
  }

  const history = lesson?.history.length ? lesson.history : lesson ? [{ id: "current", studentMessage: lesson.studentMessage, teacherMessage: lesson.teacherMessage, ui: lesson.ui }] : [];

  return <>
    <p className="eyebrow">Your personal teacher</p>
    <h1>What do you want to understand?</h1>
    <p className="intro">Ask normally. Faraday starts with the basics, explains one idea at a time, and remembers how you like to learn.</p>

    {!lesson && <section className="learning-card mt-7 rounded-[24px] border border-[#dfe7d7] bg-white p-5 min-[700px]:p-7">
      <label htmlFor="topic" className="text-sm font-extrabold text-[#38564a]">Ask Faraday</label>
      <div className="mt-3 flex rounded-2xl border border-[#d2dfc9] bg-[#f8fbf4] p-2 focus-within:ring-4 focus-within:ring-[#e2f4dd]">
        <input id="topic" value={topic} onChange={(event) => { setTopic(event.target.value); setSetupOpen(false); }} onKeyDown={(event) => event.key === "Enter" && beginSetup()} placeholder="Example: What is quantum mechanics?" className="min-w-0 flex-1 bg-transparent px-3 py-3 text-base outline-none placeholder:text-[#91a092]"/>
        <button type="button" onClick={beginSetup} className="rounded-xl bg-[#246946] px-5 py-3 text-sm font-extrabold text-white shadow-[0_3px_0_#143d2b]">Send</button>
      </div>
    </section>}

    {setupOpen && <div className="mt-6 space-y-4">
      <div className="ml-auto max-w-[760px] rounded-[22px_22px_6px_22px] border border-[#c9d9c7] bg-white p-5"><p className="text-[10px] font-extrabold uppercase tracking-wider text-[#6d8173]">You</p><p className="mt-2 text-lg font-bold">{topic}</p></div>
      <section className="learning-card max-w-[900px] rounded-[6px_24px_24px_24px] border border-[#e6cf70] bg-[#fff5c6] p-5 min-[700px]:p-7">
        <p className="eyebrow text-[#80660b]">Faraday AI</p><h2 className="mt-2 text-[27px]">Got it. One quick check before I teach.</h2><p className="mt-2 text-sm text-[#75652b]">How much do you know about this topic?</p>
        <div className="mt-4 grid gap-3 min-[650px]:grid-cols-3">{levelOptions.map((item) => <Choice key={item.value} active={level === item.value} onClick={() => setLevel(item.value)}><strong className="block">{item.label}</strong><span className="mt-1 block text-xs font-medium">{item.detail}</span></Choice>)}</div>
        {!profile?.complete && <div className="mt-6 border-t border-[#dfc970] pt-5">
          <p className="text-sm font-extrabold text-[#705f25]">Set this once - Faraday remembers it.</p>
          <p className="mt-4 text-xs font-extrabold uppercase tracking-wide text-[#80660b]">Your grade</p>
          <div className="mt-2 grid grid-cols-5 gap-2">{([8, 9, 10, 11, 12] as GradeLevel[]).map((item) => <Choice key={item} active={grade === item} onClick={() => setGrade(item)}>Grade {item}</Choice>)}</div>
          <p className="mt-4 text-xs font-extrabold uppercase tracking-wide text-[#80660b]">Examples you enjoy</p>
          <div className="mt-2 grid grid-cols-2 gap-2 min-[650px]:grid-cols-3">{styleOptions.map((item) => <Choice key={item.value} active={style === item.value} onClick={() => setStyle(item.value)}>{item.label}</Choice>)}</div>
          <p className="mt-4 text-xs font-extrabold uppercase tracking-wide text-[#80660b]">How should answers look?</p>
          <div className="mt-2 grid gap-2 min-[650px]:grid-cols-2">{formatOptions.map((item) => <Choice key={item.value} active={format === item.value} onClick={() => setFormat(item.value)}><strong className="block">{item.label}</strong><span className="mt-1 block text-xs font-medium">{item.detail}</span></Choice>)}</div>
          <label className="mt-4 flex gap-3 rounded-xl bg-white/75 p-4 text-sm text-[#705f25]"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-0.5 size-4 accent-[#246946]"/><span><strong>I&apos;m 13 or older.</strong> Save my learning progress and preferences. Raw lesson messages are removed after 90 days.</span></label>
        </div>}
        {profile?.complete && <p className="mt-5 rounded-xl bg-white/70 px-4 py-3 text-sm text-[#705f25]">Using your saved learning style. You can change it anytime in <Link href="/dashboard/memory" className="font-extrabold underline">Memory & preferences</Link>.</p>}
        <button type="button" disabled={busy || (!profile?.complete && !consent)} onClick={() => void startLesson()} className="mt-5 rounded-xl bg-[#246946] px-5 py-3 text-sm font-extrabold text-white shadow-[0_3px_0_#143d2b] disabled:cursor-wait disabled:opacity-50">{busy ? "Building clear cards..." : "Teach me from the beginning"}</button>
      </section>
    </div>}

    {error && <p role="alert" className="mt-5 rounded-xl border border-[#e6b895] bg-[#fff0d3] px-4 py-3 text-sm font-bold text-[#72551e]">{error}</p>}
    {lesson && <section className="mt-7 space-y-7">{history.map((turn, index) => <LessonResponse key={turn.id} turn={turn} latest={index === history.length - 1} progressLabel={lesson.progress.evidenceLabel} busy={busy} draft={draft} onDraftChange={setDraft} onAsk={ask} onUnderstood={() => void sendTurn("understand")} onConfused={() => void sendTurn("confused")} onNewTopic={newTopic} responseRef={responseRef}/>)}</section>}
  </>;
}

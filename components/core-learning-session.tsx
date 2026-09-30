"use client";

import { useEffect, useState } from "react";
import type { GradeLevel, LearnerLevel, LearningError, LearningTurn, ProfileState, TeachingStyle, TurnAction } from "../lib/learning/contracts";

const styleOptions: Array<{ value: TeachingStyle; label: string; detail: string }> = [
  { value: "sports", label: "Sports", detail: "Use matches, moves, and teamwork" }, { value: "practical", label: "Practical", detail: "Use real-life examples" }, { value: "story", label: "Story", detail: "Turn ideas into a tale" },
  { value: "space", label: "Space", detail: "Explore it like a mission" }, { value: "game-like", label: "Game-like", detail: "Make it a small challenge" }, { value: "direct", label: "Just explain", detail: "Keep it clear and simple" },
];
const levelOptions: Array<{ value: LearnerLevel; label: string }> = [{ value: "new", label: "I'm brand new" }, { value: "some_knowledge", label: "I know a little" }, { value: "test_me", label: "Test me first" }];

function SelectionButton({ active, disabled, children, onClick }: { active?: boolean; disabled?: boolean; children: React.ReactNode; onClick: () => void }) {
  return <button type="button" disabled={disabled} onClick={onClick} className={`rounded-xl border px-3 py-3 text-left text-sm font-extrabold transition disabled:cursor-wait disabled:opacity-60 ${active ? "border-[#246946] bg-[#dff5e5] text-[#1d6a42] shadow-[0_2px_0_#8bcba0]" : "border-[#d9e3d4] bg-white text-[#486252] hover:-translate-y-0.5 hover:border-[#8fc7a1] hover:bg-[#f4fbf1]"}`}>{children}</button>;
}

async function responsePayload(response: Response) {
  const payload = await response.json() as LearningTurn | LearningError | ProfileState;
  if (!response.ok || "error" in payload) throw new Error("error" in payload ? payload.error.message : "Faraday could not prepare the lesson.");
  return payload;
}

export function CoreLearningSession() {
  const [topic, setTopic] = useState(""); const [setupOpen, setSetupOpen] = useState(false); const [style, setStyle] = useState<TeachingStyle>("sports"); const [level, setLevel] = useState<LearnerLevel>("some_knowledge");
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>(9); const [pilotConsent, setPilotConsent] = useState(false); const [onboardingReady, setOnboardingReady] = useState(false); const [profile, setProfile] = useState<ProfileState | null>(null); const [lesson, setLesson] = useState<LearningTurn | null>(null);
  const [draft, setDraft] = useState(""); const [selectedChoice, setSelectedChoice] = useState(""); const [busy, setBusy] = useState(false); const [loadingResume, setLoadingResume] = useState(true); const [error, setError] = useState("");

  useEffect(() => { void (async () => {
    try {
      const loadedProfile = await responsePayload(await fetch("/api/learning/profile", { cache: "no-store" })) as ProfileState;
      setProfile(loadedProfile); if (loadedProfile.gradeLevel) setGradeLevel(loadedProfile.gradeLevel); if (loadedProfile.preferredStyle) setStyle(loadedProfile.preferredStyle);
      const sessionId = new URLSearchParams(window.location.search).get("session");
      if (sessionId) { const restored = await responsePayload(await fetch(`/api/learning/sessions/${encodeURIComponent(sessionId)}`, { cache: "no-store" })) as LearningTurn; setLesson(restored); setTopic(restored.topic); }
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Faraday could not load this learning space."); } finally { setLoadingResume(false); }
  })(); }, []);

  function openSetup() { if (!topic.trim()) { setError("Enter a topic before starting."); return; } setError(""); setLesson(null); setDraft(""); setSelectedChoice(""); setOnboardingReady(Boolean(profile?.complete)); setSetupOpen(true); }
  async function startSession() {
    if (!topic.trim() || busy) return; if (!profile?.complete && !pilotConsent) { setError("Please accept the pilot notice before starting."); return; }
    setBusy(true); setError("");
    try {
      const created = await responsePayload(await fetch("/api/learning/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic: topic.trim(), style, level, gradeLevel: profile?.complete ? undefined : gradeLevel, pilotConsent: profile?.complete ? undefined : pilotConsent }) })) as LearningTurn;
      setLesson(created); setProfile({ complete: true, gradeLevel, preferredStyle: style }); setSetupOpen(false); window.history.replaceState(null, "", `/dashboard/learn?session=${encodeURIComponent(created.sessionId)}`);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Faraday could not start this lesson."); } finally { setBusy(false); }
  }
  async function sendTurn(action: TurnAction, value?: string) {
    if (!lesson || busy) return; setBusy(true); setError("");
    try {
      const next = await responsePayload(await fetch(`/api/learning/sessions/${encodeURIComponent(lesson.sessionId)}/turns`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(action === "ask_follow_up" ? { action, answer: value } : { action, choiceId: value }) })) as LearningTurn;
      setLesson(next); setDraft(""); setSelectedChoice("");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Faraday could not prepare the next step."); } finally { setBusy(false); }
  }
  function askQuestion() { if (!draft.trim()) { setError("Write a short question for Faraday first."); return; } void sendTurn("ask_follow_up", draft.trim()); }

  return <>
    <p className="eyebrow">Adaptive learning session</p><h1>What are you curious about?</h1><p className="intro">Choose a topic, a style, and one tiny mission. Faraday keeps the thread for when you return.</p>
    <section className="learning-card mt-7 rounded-[22px] border border-[#dfe7d7] bg-white p-5 min-[700px]:p-7"><label className="text-sm font-extrabold text-[#38564a]" htmlFor="core-topic">Your topic</label><div className="mt-3 flex rounded-2xl border border-[#d2dfc9] bg-[#f8fbf4] p-2 focus-within:ring-4 focus-within:ring-[#e2f4dd]"><input id="core-topic" value={topic} disabled={busy || Boolean(lesson)} onChange={(event) => { setTopic(event.target.value); setSetupOpen(false); }} onKeyDown={(event) => event.key === "Enter" && openSetup()} placeholder="Try: Why do planets stay in orbit?" className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-[#91a092] disabled:opacity-60"/><button type="button" disabled={busy || Boolean(lesson)} onClick={openSetup} className="rounded-xl bg-[#246946] px-4 py-3 text-sm font-extrabold text-white shadow-[0_3px_0_#143d2b] disabled:cursor-wait disabled:opacity-60">Let&apos;s go →</button></div></section>
    {loadingResume && <p className="mt-5 text-sm font-bold text-[#687d6d]">Opening your learning space…</p>}
    {setupOpen && !profile?.complete && !onboardingReady && <section className="learning-card mt-5 rounded-[22px] border border-[#e6cf70] bg-[#fff5c6] p-5 min-[700px]:p-7"><p className="eyebrow text-[#80660b]">A quick pilot check-in</p><h2 className="mt-2 text-[25px]">Which grade are you in?</h2><p className="mt-2 text-sm text-[#75652b]">Faraday uses this only to choose an age-appropriate starting point.</p><div className="mt-4 grid grid-cols-5 gap-2">{([8, 9, 10, 11, 12] as GradeLevel[]).map((grade) => <SelectionButton key={grade} active={gradeLevel === grade} onClick={() => setGradeLevel(grade)}>Grade {grade}</SelectionButton>)}</div><label className="mt-5 flex cursor-pointer gap-3 rounded-xl border border-[#dfc464] bg-white/70 p-4 text-sm text-[#705f25]"><input checked={pilotConsent} onChange={(event) => setPilotConsent(event.target.checked)} type="checkbox" className="mt-0.5 size-4 accent-[#246946]"/><span><strong>I&apos;m 13 or older.</strong> I understand this pilot stores my learning progress, preferences, and lesson summaries. Raw lesson messages are removed after 90 days, and I can delete my learning data in Settings.</span></label><button type="button" disabled={!pilotConsent} onClick={() => setOnboardingReady(true)} className="mt-5 rounded-xl bg-[#246946] px-4 py-3 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50">Continue →</button></section>}
    {setupOpen && (profile?.complete || onboardingReady) && <section className="learning-card mt-5 rounded-[22px] border border-[#e6cf70] bg-[#fff5c6] p-5 min-[700px]:p-7"><p className="eyebrow text-[#80660b]">Tiny mission: {topic}</p><h2 className="mt-2 text-[25px]">How should we explore it?</h2><p className="mt-2 text-sm text-[#75652b]">Pick what sounds fun. You can change your mind next time.</p><div className="mt-4 grid grid-cols-2 gap-2 min-[560px]:grid-cols-3">{styleOptions.map((option) => <SelectionButton key={option.value} active={style === option.value} onClick={() => setStyle(option.value)}><span className="block">{option.label}</span><span className="mt-1 block text-[11px] font-medium opacity-80">{option.detail}</span></SelectionButton>)}</div><p className="mt-5 text-sm font-extrabold text-[#705f25]">Where should we begin?</p><div className="mt-2 grid gap-2 min-[560px]:grid-cols-3">{levelOptions.map((option) => <SelectionButton key={option.value} active={level === option.value} onClick={() => setLevel(option.value)}>{option.label}</SelectionButton>)}</div><button type="button" disabled={busy} onClick={() => void startSession()} className="mt-5 rounded-xl bg-[#246946] px-4 py-3 text-sm font-extrabold text-white shadow-[0_3px_0_#143d2b] disabled:cursor-wait disabled:opacity-60">{busy ? "Preparing…" : "Build my lesson →"}</button></section>}
    {error && <p role="alert" className="mt-5 rounded-xl border border-[#e6b895] bg-[#fff0d3] px-4 py-3 text-sm font-bold text-[#72551e]">{error}</p>}
    {lesson && <section className="learning-card mt-5 rounded-[22px] border border-[#dfe7d7] bg-white p-5 min-[700px]:p-7"><div className="flex flex-wrap items-center justify-between gap-2"><p className="eyebrow">Faraday&apos;s next step</p><span className="rounded-full bg-[#eff8ee] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#315b40]">Saved learning session</span></div><div className="mt-4 rounded-2xl bg-[#eff8ee] p-4 text-sm leading-relaxed text-[#315b40]"><strong>Faraday:</strong> {lesson.teacherMessage}</div>
      {(lesson.ui.type === "subtopic_selection" || lesson.ui.type === "choice_question") && <><h2 className="mt-5 text-[24px]">{lesson.ui.prompt}</h2><div className="mt-4 grid gap-2">{lesson.ui.choices.map((choice) => <SelectionButton key={choice.id} active={selectedChoice === choice.id} disabled={busy} onClick={() => { setSelectedChoice(choice.id); void sendTurn(lesson.ui.type === "subtopic_selection" ? "choose_subtopic" : "answer", choice.id); }}><span className="block">{choice.label}</span><span className="mt-1 block text-xs font-medium opacity-80">{choice.detail}</span></SelectionButton>)}</div></>}
      {lesson.ui.type === "free_response" && <><h2 className="mt-5 text-[24px]">{lesson.ui.prompt}</h2><p className="mt-2 text-sm text-[#687d6d]">{lesson.ui.placeholder}</p></>}
      {lesson.ui.type === "lesson_complete" && <div className="mt-5 rounded-xl bg-[#dff5e5] p-4 text-sm text-[#245b3a]"><strong>Mission complete.</strong> {lesson.ui.summary}</div>}
      {lesson.progress.status === "confident" && lesson.ui.type !== "lesson_complete" && <button type="button" disabled={busy} onClick={() => void sendTurn("mark_confident")} className="mt-5 rounded-xl border border-[#8fc7a1] bg-[#eff8ee] px-4 py-3 text-sm font-extrabold text-[#246946]">I got it — finish this mission →</button>}
      {lesson.ui.type !== "lesson_complete" && <div className="mt-5 border-t border-[#e3ebe0] pt-4"><label className="text-sm font-extrabold text-[#38564a]" htmlFor="core-question">Ask in your own words</label><div className="mt-2 flex rounded-xl border border-[#d6e1d0] bg-[#f8fbf4] p-1.5"><input id="core-question" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => event.key === "Enter" && askQuestion()} placeholder="Explain that more simply…" className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none"/><button type="button" disabled={busy} onClick={askQuestion} className="rounded-lg bg-[#246946] px-3 text-sm font-extrabold text-white disabled:cursor-wait disabled:opacity-60">{busy ? "Thinking…" : "Ask →"}</button></div></div>}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#687d6d]"><span>{lesson.progress.evidenceLabel}</span><span>{lesson.meta.provider} · {lesson.meta.model}</span></div>
    </section>}
  </>;
}

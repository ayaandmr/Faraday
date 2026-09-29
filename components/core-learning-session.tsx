"use client";

import { useState } from "react";
import type { LearnerLevel, LearningAction, LearningError, LearningResponse, TeachingStyle } from "../lib/learning/contracts";

const styleOptions: Array<{ value: TeachingStyle; label: string }> = [
  { value: "sports", label: "Sports" },
  { value: "practical", label: "Practical" },
  { value: "story", label: "Story" },
  { value: "space", label: "Space" },
  { value: "game-like", label: "Game-like" },
  { value: "direct", label: "Just explain" },
];

const levelOptions: Array<{ value: LearnerLevel; label: string }> = [
  { value: "new", label: "I'm brand new" },
  { value: "some_knowledge", label: "I know a little" },
  { value: "test_me", label: "Test me first" },
];

function SelectionButton({ active, disabled, children, onClick }: { active?: boolean; disabled?: boolean; children: React.ReactNode; onClick: () => void }) {
  return <button type="button" disabled={disabled} onClick={onClick} className={`rounded-xl border px-3 py-3 text-left text-sm font-extrabold transition disabled:cursor-wait disabled:opacity-60 ${active ? "border-[#246946] bg-[#dff5e5] text-[#1d6a42] shadow-[0_2px_0_#8bcba0]" : "border-[#d9e3d4] bg-white text-[#486252] hover:-translate-y-0.5 hover:border-[#8fc7a1] hover:bg-[#f4fbf1]"}`}>{children}</button>;
}

export function CoreLearningSession() {
  const [topic, setTopic] = useState("");
  const [setupOpen, setSetupOpen] = useState(false);
  const [style, setStyle] = useState<TeachingStyle>("sports");
  const [level, setLevel] = useState<LearnerLevel>("some_knowledge");
  const [lesson, setLesson] = useState<LearningResponse | null>(null);
  const [draft, setDraft] = useState("");
  const [selectedChoice, setSelectedChoice] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function openSetup() {
    if (!topic.trim()) {
      setError("Enter a topic before starting.");
      return;
    }
    setError("");
    setLesson(null);
    setDraft("");
    setSelectedChoice("");
    setSetupOpen(true);
  }

  async function sendTurn(action: LearningAction, answer?: string) {
    if (!topic.trim() || busy) return;
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/learning/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          topic: topic.trim(),
          style,
          level,
          answer,
          sessionId: lesson?.sessionId,
          conceptId: lesson?.conceptId,
          sessionSummary: lesson?.sessionSummary,
        }),
      });

      const payload = await response.json() as LearningResponse | LearningError;
      if (!response.ok || "error" in payload) {
        setError("error" in payload ? payload.error.message : "Faraday could not prepare the lesson.");
        return;
      }

      setLesson(payload);
      setDraft("");
      setSelectedChoice("");
    } catch {
      setError("Faraday could not reach the learning service. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function chooseAnswer(id: string, label: string) {
    setSelectedChoice(id);
    await sendTurn("answer_check", label);
  }

  async function askQuestion() {
    if (!draft.trim()) {
      setError("Write a short question for Faraday first.");
      return;
    }
    await sendTurn("ask_follow_up", draft.trim());
  }

  return <>
    <p className="eyebrow">Adaptive learning session</p>
    <h1>What are you curious about?</h1>
    <p className="intro">Choose a topic, tell Faraday how you like learning, and begin one small teaching loop.</p>

    <section className="learning-card mt-7 rounded-[22px] border border-[#dfe7d7] bg-white p-5 min-[700px]:p-7">
      <label className="text-sm font-extrabold text-[#38564a]" htmlFor="core-topic">Your topic</label>
      <div className="mt-3 flex rounded-2xl border border-[#d2dfc9] bg-[#f8fbf4] p-2 focus-within:ring-4 focus-within:ring-[#e2f4dd]">
        <input id="core-topic" value={topic} onChange={(event) => { setTopic(event.target.value); setSetupOpen(false); setLesson(null); }} onKeyDown={(event) => event.key === "Enter" && openSetup()} placeholder="Try: Why do planets stay in orbit?" className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-[#91a092]" />
        <button type="button" onClick={openSetup} className="rounded-xl bg-[#246946] px-4 py-3 text-sm font-extrabold text-white shadow-[0_3px_0_#143d2b]">Let's go -&gt;</button>
      </div>
    </section>

    {setupOpen && <section className="learning-card mt-5 rounded-[22px] border border-[#e6cf70] bg-[#fff5c6] p-5 min-[700px]:p-7">
      <p className="eyebrow text-[#80660b]">Tiny mission: {topic}</p>
      <h2 className="mt-2 text-[25px]">How should we explore it?</h2>
      <p className="mt-2 text-sm text-[#75652b]">These choices become structured context for the teaching engine.</p>
      <div className="mt-4 grid grid-cols-2 gap-2 min-[560px]:grid-cols-3">{styleOptions.map((option) => <SelectionButton key={option.value} active={style === option.value} onClick={() => setStyle(option.value)}>{option.label}</SelectionButton>)}</div>
      <p className="mt-5 text-sm font-extrabold text-[#705f25]">Where should we begin?</p>
      <div className="mt-2 grid gap-2 min-[560px]:grid-cols-3">{levelOptions.map((option) => <SelectionButton key={option.value} active={level === option.value} onClick={() => setLevel(option.value)}>{option.label}</SelectionButton>)}</div>
      <button type="button" disabled={busy} onClick={() => sendTurn("start_topic")} className="mt-5 rounded-xl bg-[#246946] px-4 py-3 text-sm font-extrabold text-white shadow-[0_3px_0_#143d2b] disabled:cursor-wait disabled:opacity-60">{busy ? "Preparing..." : "Build my lesson ->"}</button>
    </section>}

    {error && <p role="alert" className="mt-5 rounded-xl border border-[#e6b895] bg-[#fff0d3] px-4 py-3 text-sm font-bold text-[#72551e]">{error}</p>}

    {lesson && <section className="learning-card mt-5 rounded-[22px] border border-[#dfe7d7] bg-white p-5 min-[700px]:p-7">
      <div className="flex flex-wrap items-center justify-between gap-2"><p className="eyebrow">Faraday's next step</p><span className="rounded-full bg-[#eff8ee] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#315b40]">API connected - mock teacher</span></div>
      <div className="mt-4 rounded-2xl bg-[#eff8ee] p-4 text-sm leading-relaxed text-[#315b40]"><strong>Faraday:</strong> {lesson.teacherMessage}</div>

      {lesson.ui.type === "choice_question" && <>
        <h2 className="mt-5 text-[24px]">{lesson.ui.prompt}</h2>
        <div className="mt-4 grid gap-2">{lesson.ui.choices.map((choice) => <SelectionButton key={choice.id} active={selectedChoice === choice.id} disabled={busy} onClick={() => chooseAnswer(choice.id, choice.label)}>{choice.label}</SelectionButton>)}</div>
      </>}

      {lesson.ui.type === "free_response" && <><h2 className="mt-5 text-[24px]">{lesson.ui.prompt}</h2><p className="mt-2 text-sm text-[#687d6d]">{lesson.ui.placeholder}</p></>}
      {lesson.ui.type === "lesson_complete" && <div className="mt-5 rounded-xl bg-[#dff5e5] p-4 text-sm text-[#245b3a]">{lesson.ui.summary}</div>}

      <div className="mt-5 border-t border-[#e3ebe0] pt-4">
        <label className="text-sm font-extrabold text-[#38564a]" htmlFor="core-question">Ask a follow-up in your own words</label>
        <div className="mt-2 flex rounded-xl border border-[#d6e1d0] bg-[#f8fbf4] p-1.5"><input id="core-question" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => event.key === "Enter" && askQuestion()} placeholder="Explain that more simply..." className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none" /><button type="button" disabled={busy} onClick={askQuestion} className="rounded-lg bg-[#246946] px-3 text-sm font-extrabold text-white disabled:cursor-wait disabled:opacity-60">{busy ? "Thinking..." : "Ask ->"}</button></div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#687d6d]"><span>{lesson.progress.evidenceLabel}</span><span>Provider: {lesson.meta.provider} / {lesson.meta.model}</span></div>
    </section>}
  </>;
}

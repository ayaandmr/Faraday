"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type RefObject } from "react";
import type { GradeLevel, IntakeQuestion, LearnerLevel, LearningError, LearningTurn, LessonHistoryItem, ProfileState, ResponseFormat, TeachingStyle, TurnAction } from "../lib/learning/contracts";
import { ChapterMap } from "./chapter-map";

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
  return <button type="button" aria-pressed={Boolean(active)} disabled={disabled} onClick={onClick} className={classes}>{children}</button>;
}

async function payload(response: Response) {
  const data = await response.json() as LearningTurn | LearningError | ProfileState | IntakeQuestion;
  if (!response.ok || "error" in data) throw new Error("error" in data ? data.error.message : "Faraday could not continue.");
  return data;
}

type RoadmapStep = { id: string; label: string; state: "completed" | "current" | "upcoming" };

function visibleLessonHistory(history: LessonHistoryItem[]) {
  return history.reduce<LessonHistoryItem[]>((visible, turn) => {
    if (turn.ui.type !== "teaching_cards" || !turn.studentMessage.trim().toLowerCase().startsWith("i am confused") || turn.ui.stepIndex === undefined) return [...visible, turn];

    const stepIndex = turn.ui.stepIndex;
    const stage = turn.ui.stage ?? "basic";
    const withoutOldVersion = visible.filter((earlier) => {
      if (earlier.ui.type !== "teaching_cards" && earlier.ui.type !== "step_check") return true;
      const earlierStep = earlier.ui.stepIndex;
      const earlierStage = earlier.ui.stage ?? "basic";
      return earlierStep !== stepIndex || earlierStage !== stage;
    });
    return [...withoutOldVersion, turn];
  }, []);
}

function topicRoadmap(history: LessonHistoryItem[], lesson: LearningTurn) {
  if ("plan" in lesson.ui && lesson.ui.plan) {
    const allSteps = lesson.ui.plan.chapters.flatMap((chapter) => chapter.steps);
    const finished = lesson.ui.type === "lesson_complete";
    const currentIndex = "stepIndex" in lesson.ui ? lesson.ui.stepIndex ?? 0 : allSteps.length;
    return {
      steps: allSteps.map((step, index): RoadmapStep => ({ id: step.id, label: step.title, state: finished || index < currentIndex ? "completed" : index === currentIndex ? "current" : "upcoming" })),
      percentage: finished ? 100 : Math.round(((currentIndex + 0.5) / allSteps.length) * 100),
    };
  }
  const completed: RoadmapStep[] = [];
  const normalized = new Set<string>();
  const add = (step: RoadmapStep) => {
    const key = step.label.toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (!key || normalized.has(key)) return;
    normalized.add(key);
    completed.push(step);
  };

  history.forEach((turn, index) => {
    if (turn.ui.type !== "teaching_cards") return;
    const nextMessage = history[index + 1]?.studentMessage.toLocaleLowerCase() ?? "";
    if (nextMessage.startsWith("i understand")) add({ id: `done-${turn.id}`, label: turn.ui.title, state: "completed" });
  });

  if (lesson.ui.type === "lesson_complete") return { steps: completed, percentage: 100 };

  const currentTurn = [...history].reverse().find((turn) => turn.ui.type === "teaching_cards");
  if (currentTurn?.ui.type === "teaching_cards") add({ id: `current-${currentTurn.id}`, label: currentTurn.ui.title, state: "current" });
  if (lesson.ui.type === "teaching_cards") lesson.ui.nextTopics.slice(0, 4).forEach((topic) => add({ id: `next-${topic.id}`, label: topic.label, state: "upcoming" }));

  const completedCount = completed.filter((step) => step.state === "completed").length;
  const currentCredit = completed.some((step) => step.state === "current") ? 0.5 : 0;
  const percentage = completed.length ? Math.round(((completedCount + currentCredit) / completed.length) * 100) : 0;
  return { steps: completed, percentage };
}

function TopicRoadmap({ history, lesson }: { history: LessonHistoryItem[]; lesson: LearningTurn }) {
  const { steps, percentage } = topicRoadmap(history, lesson);
  if (!steps.length) return null;
  const stage = "stage" in lesson.ui ? lesson.ui.stage ?? "basic" : "basic";
  const markedCurrentStep = steps.findIndex((step) => step.state === "current");
  const currentStepIndex = markedCurrentStep >= 0 ? markedCurrentStep : Math.max(0, steps.length - 1);
  const currentStep = steps[currentStepIndex] ?? steps.at(-1);
  const stages = stage === "advanced"
    ? [{ id: "basic", label: "Basic", percentage: 100 }, { id: "advanced", label: "Advanced", percentage }]
    : [{ id: "basic", label: "Basic", percentage }];

  function jumpTo(id: string) {
    document.getElementById(`${id}-section`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return <section className="lesson-progress-bar sticky top-0 z-40 w-full border-b-2 px-3 py-2 shadow-[0_5px_18px_rgba(35,70,20,.08)] backdrop-blur min-[700px]:px-5" aria-label={`${lesson.topic} progress`}>
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <span className="lesson-progress-current-label shrink-0 text-[9px] font-black uppercase tracking-[.8px]">Step {Math.min(currentStepIndex + 1, steps.length)} of {steps.length}</span>
          <strong className="lesson-progress-current-title truncate text-sm font-black min-[700px]:text-base">{currentStep?.label}</strong>
        </div>
        <div className="mt-2 grid min-w-0 gap-1.5" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage}>
          {steps.map((step, index) => <div key={step.id} className={`lesson-progress-step relative h-9 min-w-0 overflow-hidden rounded-lg border ${step.state === "completed" ? "is-complete" : step.state === "current" ? "is-current" : "is-upcoming"}`} title={`Step ${index + 1}: ${step.label}`}>
            <span className={`absolute inset-y-0 left-0 transition-all duration-500 ${step.state === "completed" ? "w-full" : step.state === "current" ? "w-1/2" : "w-0"}`} />
            <span className="relative z-10 flex h-full min-w-0 items-center gap-1 px-1.5 text-[9px] font-black min-[700px]:px-2 min-[700px]:text-[11px]"><b className="shrink-0">{step.state === "completed" ? "✓" : index + 1}</b><span className="truncate">{step.label}</span></span>
          </div>)}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div className="hidden gap-1 min-[760px]:flex">{stages.map((item) => <button type="button" key={item.id} onClick={() => jumpTo(item.id)} className={`lesson-progress-stage rounded-lg border px-2.5 py-2 text-[10px] font-black ${item.id === stage ? "is-active" : ""}`} title={`Jump to ${item.label}`}>{item.label}</button>)}</div>
        <div className="w-[62px] text-center min-[700px]:w-[76px]">
          <strong className="block text-[25px] font-black leading-none tracking-[-1.2px] text-[#58a700] min-[700px]:text-[30px]">{percentage}%</strong>
          <span className="lesson-progress-stage-name mt-1 block text-[8px] font-black uppercase tracking-[.7px]">{stage}</span>
        </div>
      </div>
    </div>
  </section>;
}

function LessonResponse({ turn, latest, progressLabel, busy, draft, onDraftChange, onAsk, onUnderstood, onSubmitCheck, onSkip, onConfused, onStartAdvanced, onNewTopic, responseRef }: {
  turn: LessonHistoryItem; latest: boolean; progressLabel: string; busy: boolean; draft: string;
  onDraftChange: (value: string) => void; onAsk: () => void; onUnderstood: () => void; onSubmitCheck: () => void; onSkip: () => void; onConfused: () => void; onStartAdvanced: () => void; onNewTopic: () => void;
  responseRef: RefObject<HTMLDivElement | null>;
}) {
  return <div ref={latest ? responseRef : undefined} className="scroll-mt-32">
    <div className="ml-auto max-w-[760px] rounded-[22px_22px_6px_22px] border border-[#c9d9c7] bg-white p-4 min-[700px]:p-5">
      <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#6d8173]">You</p>
      <p className="mt-2 text-lg font-bold">{turn.studentMessage || "I started this topic."}</p>
    </div>
    <div className="learning-card mt-3 rounded-[6px_28px_28px_28px] border-2 border-[#b9d8c1] bg-white p-5 shadow-[0_10px_35px_rgba(28,65,45,.10)] min-[700px]:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow">Faraday AI</p>
        {latest && <span className="rounded-full bg-[#dff5e5] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#246946]">Personalized lesson</span>}
      </div>
      <p className="mt-4 max-w-[850px] text-[clamp(18px,2.2vw,24px)] font-bold leading-relaxed text-[#244c38]">{turn.teacherMessage}</p>

      {turn.ui.type === "teaching_cards" && <>
        <h2 className="mt-6 text-[clamp(27px,4vw,39px)]">{turn.ui.title}</h2>
        <div className="mt-4 grid gap-3">{turn.ui.cards.map((card, index) => <article key={card.id} className="rounded-[22px] border border-[#dbe6d8] bg-[#f8fbf4] p-5">
          <div className="flex items-start gap-4"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#246946] text-sm font-extrabold text-white">{index + 1}</span><div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#6d8173]">{card.kind}</p>
            <h3 className="mt-1 text-[22px] font-bold tracking-[-.8px]">{card.title}</h3>
            <p className="mt-3 text-base leading-7 text-[#38564a]">{card.body}</p>
            {card.example && <div className="mt-4 rounded-xl border border-[#e6cf70] bg-[#fff5c6] p-4 text-sm leading-6 text-[#705f25]"><strong>Easy example:</strong> {card.example}</div>}
          </div></div>
        </article>)}</div>
        {latest && <div className="mt-6 grid gap-3 min-[560px]:grid-cols-2">
          <button type="button" disabled={busy} onClick={onUnderstood} className="rounded-2xl bg-[#246946] px-5 py-4 text-base font-extrabold text-white shadow-[0_4px_0_#143d2b] disabled:opacity-60">I understand — check me once</button>
          <button type="button" disabled={busy} onClick={onConfused} className="rounded-2xl border-2 border-[#e0be44] bg-[#fff5c6] px-5 py-4 text-base font-extrabold text-[#705604] disabled:opacity-60">I&apos;m confused - make it easier</button>
        </div>}
      </>}

      {turn.ui.type === "step_check" && <div className="mt-7 rounded-[22px] border-2 border-[#e0be44] bg-[#fff8d9] p-5 min-[700px]:p-6">
        <p className="text-[10px] font-black uppercase tracking-[1px] text-[#80660b]">One quick check · {turn.ui.stage}</p>
        <h2 className="mt-2 text-[clamp(23px,3vw,31px)]">{turn.ui.check.question}</h2>
        <p className="mt-2 text-sm text-[#705f25]">One or two sentences is enough. Spelling does not matter.</p>
        {turn.ui.check.feedback && <div role="status" className="mt-4 rounded-2xl border border-[#e7a45f] bg-[#fff0d9] p-4 text-sm leading-6 text-[#74491e]"><strong className="block text-base">Not quite yet — try once more.</strong><span>{turn.ui.check.feedback}</span></div>}
        {latest && <div className="mt-5 flex rounded-2xl border border-[#d7bd4c] bg-white p-2 focus-within:ring-4 focus-within:ring-[#f4e7a6]">
          <input value={draft} disabled={busy} onChange={(event) => onDraftChange(event.target.value)} onKeyDown={(event) => event.key === "Enter" && onSubmitCheck()} placeholder="Explain it in your own words" className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none disabled:opacity-60" />
          <button type="button" disabled={busy || !draft.trim()} onClick={onSubmitCheck} className="rounded-xl bg-[#246946] px-4 text-sm font-extrabold text-white disabled:opacity-60">{busy ? "Checking..." : "Check answer"}</button>
        </div>}
        {latest && <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <button type="button" disabled={busy} onClick={onConfused} className="rounded-xl border border-[#d7bd4c] bg-white px-4 py-2.5 text-sm font-extrabold text-[#705604] disabled:opacity-60">Explain this step again</button>
          <button type="button" disabled={busy} onClick={onSkip} className="rounded-xl px-4 py-2.5 text-sm font-extrabold text-[#6a746d] hover:bg-white/70 disabled:opacity-60">Skip for now →</button>
        </div>}
      </div>}

      {turn.ui.type === "lesson_complete" && <div className="mt-7 rounded-2xl border border-[#b8dfc3] bg-[#eaf8ed] p-5">
        <p className="text-xs font-extrabold uppercase tracking-wide text-[#246946]">{turn.ui.stage === "advanced" ? "Advanced completed" : "Basic lesson completed"}</p>
        <h2 className="mt-2 text-[28px]">{turn.ui.stage === "advanced" ? "You completed the full learning path." : "The basics are now 100% complete."}</h2>
        <p className="mt-2 text-sm leading-6 text-[#466453]">{turn.ui.summary}</p>
        {turn.ui.skippedSteps?.length ? <p className="mt-3 rounded-xl bg-white/70 px-4 py-3 text-sm font-bold text-[#705604]">{turn.ui.skippedSteps.length} skipped {turn.ui.skippedSteps.length === 1 ? "step is" : "steps are"} saved for review and not counted as understood.</p> : null}
        <div className="mt-5 flex flex-wrap gap-3">{turn.ui.canAdvance && latest && <button type="button" disabled={busy} onClick={onStartAdvanced} className="rounded-xl bg-[#58cc02] px-5 py-3 text-sm font-black text-[#173b0a] shadow-[0_4px_0_#3d9600] disabled:opacity-60">Learn advanced →</button>}<Link href="/dashboard/lessons" className="inline-block rounded-xl bg-[#246946] px-4 py-3 text-sm font-extrabold text-white">See your lessons</Link></div>
      </div>}

      {latest && turn.ui.type === "teaching_cards" && <div className="mt-7 border-t border-[#e3ebe0] pt-5">
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
  const [setupStep, setSetupStep] = useState<"profile" | "knowledge" | "focus" | "goal">("knowledge");
  const [grade, setGrade] = useState<GradeLevel>(9);
  const [style, setStyle] = useState<TeachingStyle>("practical");
  const [format, setFormat] = useState<ResponseFormat>("real_examples");
  const [level, setLevel] = useState<LearnerLevel | null>(null);
  const [goal, setGoal] = useState("");
  const [stickingPoint, setStickingPoint] = useState("");
  const [priorKnowledge, setPriorKnowledge] = useState("");
  const [intakeQuestion, setIntakeQuestion] = useState<IntakeQuestion | null>(null);
  const [questionNotice, setQuestionNotice] = useState("");
  const [planFeedback, setPlanFeedback] = useState("");
  const [consent, setConsent] = useState(false);
  const [lesson, setLesson] = useState<LearningTurn | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const responseRef = useRef<HTMLDivElement>(null);
  const setupRef = useRef<HTMLElement>(null);
  const planFeedbackRef = useRef<HTMLInputElement>(null);
  const scrollToResponse = useRef(false);
  const scrollToAdvanced = useRef(false);

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
        setSetupStep(loaded.complete ? "knowledge" : "profile");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Faraday could not open your learning space.");
    }
  })(); }, []);

  useEffect(() => {
    if (!lesson || lesson.ui.type === "plan_preview" || !scrollToResponse.current) return;
    scrollToResponse.current = false;
    const frame = requestAnimationFrame(() => responseRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    return () => cancelAnimationFrame(frame);
  }, [lesson]);

  useEffect(() => {
    if (!lesson || !scrollToAdvanced.current) return;
    scrollToAdvanced.current = false;
    const frame = requestAnimationFrame(() => document.getElementById("advanced-section")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    return () => cancelAnimationFrame(frame);
  }, [lesson]);

  useEffect(() => {
    if (!setupOpen || lesson) return;
    const frame = requestAnimationFrame(() => setupRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    return () => cancelAnimationFrame(frame);
  }, [setupOpen, setupStep, lesson]);

  function beginSetup() {
    if (!topic.trim()) { setError("Tell Faraday what you want to learn first."); return; }
    setError("");
    setSetupStep(profile?.complete ? "knowledge" : "profile");
    setSetupOpen(true);
  }

  async function askTopicQuestion() {
    if (!level || !priorKnowledge.trim()) { setError("Pick a starting point or tell Faraday what you know."); return; }
    setBusy(true);
    setError("");
    setQuestionNotice("");
    try {
      const result = await payload(await fetch("/api/learning/intake", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), level, priorKnowledge: priorKnowledge.trim(), gradeLevel: profile?.complete ? undefined : grade, pilotConsent: profile?.complete ? undefined : consent }),
      })) as IntakeQuestion;
      setIntakeQuestion(result);
    } catch {
      setIntakeQuestion({ prompt: `Which part of ${topic.trim().slice(0, 80)} should we clear up first?`, choices: ["What it means", "How it works", "A real example"] });
      setQuestionNotice("Faraday couldn't tailor this question right now. You can still tell it exactly what you need.");
    } finally {
      setSetupStep("focus");
      setBusy(false);
    }
  }

  async function startLesson() {
    if (busy || !level || !goal.trim() || !stickingPoint.trim() || !priorKnowledge.trim() || (!profile?.complete && !consent)) {
      if (!profile?.complete) setError("Please accept the pilot notice first.");
      else setError("Answer each quick question before building your map.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const created = await payload(await fetch("/api/learning/sessions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), style, format, level, goal, stickingPoint, priorKnowledge, focusQuestion: intakeQuestion?.prompt ?? `Which part of ${topic.trim().slice(0, 80)} should we clear up first?`, gradeLevel: profile?.complete ? undefined : grade, pilotConsent: profile?.complete ? undefined : consent }),
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
        body: JSON.stringify(action === "ask_follow_up" || action === "revise_plan" || action === "submit_check" ? { action, answer: value } : { action }),
      })) as LearningTurn;
      scrollToAdvanced.current = action === "start_advanced";
      scrollToResponse.current = action !== "accept_plan" && action !== "revise_plan" && action !== "start_advanced";
      setLesson(next);
      setDraft("");
      if (action === "revise_plan") setPlanFeedback("");
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

  function submitCheck() {
    if (!draft.trim()) { setError("Write one short answer first."); return; }
    void sendTurn("submit_check", draft.trim());
  }

  function newTopic() {
    setLesson(null);
    setTopic("");
    setSetupOpen(false);
    setError("");
    setPlanFeedback("");
    setGoal("");
    setStickingPoint("");
    setPriorKnowledge("");
    setLevel(null);
    setIntakeQuestion(null);
    setQuestionNotice("");
    window.history.replaceState(null, "", "/dashboard/learn");
  }

  function requestChapterChange(title: string) {
    setPlanFeedback(`Please change chapter "${title}". `);
    planFeedbackRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    planFeedbackRef.current?.focus({ preventScroll: true });
  }

  const history = lesson?.history.length ? lesson.history : lesson ? [{ id: "current", studentMessage: lesson.studentMessage, teacherMessage: lesson.teacherMessage, ui: lesson.ui }] : [];
  const advancedActive = Boolean(lesson && "stage" in lesson.ui && lesson.ui.stage === "advanced");
  const displayHistory = visibleLessonHistory(history);
  const basicHistory = displayHistory.filter((turn) => !("stage" in turn.ui) || !turn.ui.stage || turn.ui.stage === "basic");
  const advancedHistory = displayHistory.filter((turn) => "stage" in turn.ui && turn.ui.stage === "advanced");

  if (lesson?.ui.type === "plan_preview") return <main className="min-h-full bg-[#f4f7ef] px-4 py-8 min-[700px]:px-8 min-[700px]:py-10">
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">Your book of {lesson.topic}</p><h1 className="mt-2 text-[clamp(30px,5vw,52px)]">Your chapter map is ready.</h1><p className="mt-2 max-w-[600px] text-sm leading-6 text-[#617668]">Take a look at the small steps. Change anything you like before we begin.</p></div><button type="button" onClick={newTopic} className="rounded-xl border border-[#cedbca] bg-white px-4 py-2 text-sm font-extrabold text-[#38564a]">Change topic</button></div>
      <div className="grid items-start gap-5 min-[1200px]:grid-cols-[minmax(0,1fr)_340px]">
      <ChapterMap plan={lesson.ui.plan} stepIndex={0} preview onChapterClick={(chapter) => requestChapterChange(chapter.title)} />
      <div className="min-w-0 rounded-[24px] border border-[#e1e8d9] bg-white p-5 shadow-[0_8px_25px_rgba(28,65,45,.08)] min-[700px]:p-6 min-[1200px]:sticky min-[1200px]:top-5">
        <h2 className="text-[24px] font-black">Want to change the plan?</h2><p className="mt-1 text-sm text-[#687d6d]">Tap a chapter above, or tell Faraday what should feel different.</p>
        <div className="mt-4 flex flex-wrap gap-2">{["Make it easier", "Use more examples", "Make it shorter"].map((idea) => <button type="button" key={idea} onClick={() => setPlanFeedback(idea)} className="rounded-full border border-[#cfe1cc] bg-[#f2f9ef] px-3 py-2 text-xs font-extrabold text-[#315b3d] hover:bg-[#dff3d8]">{idea}</button>)}</div>
        <label htmlFor="plan-feedback" className="mt-5 block text-sm font-extrabold text-[#38564a]">Your changes</label><div className="mt-2 grid gap-2"><input ref={planFeedbackRef} id="plan-feedback" value={planFeedback} onChange={(event) => setPlanFeedback(event.target.value)} onKeyDown={(event) => event.key === "Enter" && planFeedback.trim() && void sendTurn("revise_plan", planFeedback.trim())} placeholder="Example: Start with an everyday story" className="w-full min-w-0 rounded-xl border border-[#d7e3d4] bg-[#f8fbf4] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#9ddd7f]"/><button type="button" disabled={busy || !planFeedback.trim()} onClick={() => void sendTurn("revise_plan", planFeedback.trim())} className="rounded-xl bg-[#eff4e7] px-4 py-3 text-sm font-extrabold text-[#2f5a31] disabled:opacity-50">Redo map</button></div>
        {error && <p role="alert" className="mt-4 rounded-xl bg-[#fff0d3] p-3 text-sm font-bold text-[#72551e]">{error}</p>}
        <button type="button" disabled={busy} onClick={() => void sendTurn("accept_plan")} className="mt-5 w-full rounded-2xl bg-[#58cc02] px-5 py-4 text-base font-black text-[#173b0a] shadow-[0_5px_0_#3d9600] disabled:opacity-50">{busy ? "Faraday is getting your chapter ready..." : "Looks good — start chapter 1"}</button>
      </div>
      </div>
    </div>
  </main>;

  if (lesson) {
    const currentPlan = "plan" in lesson.ui ? lesson.ui.plan : undefined;
    const currentStep = "stepIndex" in lesson.ui ? lesson.ui.stepIndex ?? 0 : 0;
    const basicPlan = advancedActive && "basicPlan" in lesson.ui ? lesson.ui.basicPlan : currentPlan;
    const currentTotal = currentPlan?.chapters.flatMap((chapter) => chapter.steps).length ?? 0;
    const visibleStep = lesson.ui.type === "lesson_complete" ? currentTotal : currentStep;
    const response = (turn: LessonHistoryItem, latest: boolean, sectionId?: string) => <div key={turn.id} id={sectionId} className="scroll-mt-32"><LessonResponse turn={turn} latest={latest} progressLabel={lesson.progress.evidenceLabel} busy={busy} draft={draft} onDraftChange={setDraft} onAsk={ask} onUnderstood={() => void sendTurn("understand")} onSubmitCheck={submitCheck} onSkip={() => void sendTurn("skip_step")} onConfused={() => void sendTurn("confused")} onStartAdvanced={() => void sendTurn("start_advanced")} onNewTopic={newTopic} responseRef={responseRef}/></div>;

    return <>
    <TopicRoadmap history={history} lesson={lesson} />
    <main className="mx-auto max-w-[1040px] px-4 py-5 min-[800px]:px-7 min-[1100px]:py-6">
      {error && <p role="alert" className="mb-5 rounded-xl border border-[#e6b895] bg-[#fff0d3] px-4 py-3 text-sm font-bold text-[#72551e]">{error}</p>}

      {advancedActive ? <>
        <section id="basic-section" className="scroll-mt-32">
          <div className="mb-4"><p className="eyebrow">Basic · completed</p><h2 className="mt-1 text-[clamp(28px,4vw,40px)]">Your foundation</h2></div>
          {basicPlan && <div className="mb-5"><ChapterMap plan={basicPlan} stepIndex={basicPlan.chapters.flatMap((chapter) => chapter.steps).length} /></div>}
          <div className="space-y-5">{basicHistory.map((turn) => response(turn, false))}</div>
        </section>

        <section id="advanced-section" className="mt-10 scroll-mt-32 border-t-4 border-[#58cc02] pt-7">
          <div className="advanced-path-banner mb-5 rounded-[24px] p-5 min-[700px]:p-6"><p className="text-[11px] font-black uppercase tracking-[1.2px]">Advanced path</p><h2 className="mt-1 text-[clamp(30px,5vw,48px)]">Now go beyond the basics.</h2><p className="mt-1 text-sm">A deeper path for your grade, inside the same lesson.</p></div>
          {currentPlan && <div className="mb-5"><ChapterMap plan={currentPlan} stepIndex={visibleStep} /><a href="#current-lesson" className="mx-auto mt-3 block max-w-[340px] rounded-2xl bg-[#58cc02] px-5 py-3 text-center text-sm font-black text-[#173b0a] shadow-[0_4px_0_#3d9600]">Read the advanced step ↓</a></div>}
          <div className="space-y-5">{advancedHistory.map((turn, index) => response(turn, index === advancedHistory.length - 1, index === advancedHistory.length - 1 ? "current-lesson" : undefined))}</div>
        </section>
      </> : <section id="basic-section" className="scroll-mt-32">
        {currentPlan && <div className="mb-5"><ChapterMap plan={currentPlan} stepIndex={visibleStep}/><a href="#current-lesson" className="mx-auto mt-3 block max-w-[340px] rounded-2xl bg-[#58cc02] px-5 py-3 text-center text-sm font-black text-[#173b0a] shadow-[0_4px_0_#3d9600]">{lesson.ui.type === "lesson_complete" ? "Review the final step ↓" : "Read the current step ↓"}</a></div>}
        <div className="space-y-5">{basicHistory.map((turn, index) => response(turn, index === basicHistory.length - 1, index === basicHistory.length - 1 ? "current-lesson" : undefined))}</div>
      </section>}
    </main>
  </>;
  }

  return <>
    <div className="mx-auto max-w-[1040px] px-5 py-7 min-[800px]:px-8 min-[1100px]:py-10">
    <p className="eyebrow">Your personal teacher</p>
    <h1>What do you want to understand?</h1>
    <p className="intro">Ask normally. Faraday starts with the basics, explains one idea at a time, and remembers how you like to learn.</p>

    {!lesson && <section className="learning-card mt-7 rounded-[24px] border border-[#dfe7d7] bg-white p-5 min-[700px]:p-7">
      <label htmlFor="topic" className="text-sm font-extrabold text-[#38564a]">Ask Faraday</label>
      <div className="mt-3 flex rounded-2xl border border-[#d2dfc9] bg-[#f8fbf4] p-2 focus-within:ring-4 focus-within:ring-[#e2f4dd]">
        <input id="topic" value={topic} onChange={(event) => { setTopic(event.target.value); setSetupOpen(false); setLevel(null); setPriorKnowledge(""); setStickingPoint(""); setGoal(""); setIntakeQuestion(null); }} onKeyDown={(event) => event.key === "Enter" && beginSetup()} placeholder="Example: What is quantum mechanics?" className="min-w-0 flex-1 bg-transparent px-3 py-3 text-base outline-none placeholder:text-[#91a092]"/>
        <button type="button" onClick={beginSetup} className="rounded-xl bg-[#246946] px-5 py-3 text-sm font-extrabold text-white shadow-[0_3px_0_#143d2b]">Send</button>
      </div>
    </section>}

    {setupOpen && <div className="mt-6 space-y-4">
      <div className="ml-auto max-w-[760px] rounded-[22px_22px_6px_22px] border border-[#c9d9c7] bg-white p-5"><p className="text-[10px] font-extrabold uppercase tracking-wider text-[#6d8173]">You</p><p className="mt-2 text-lg font-bold">{topic}</p></div>
      <section ref={setupRef} className="learning-card max-w-[760px] scroll-mt-5 rounded-[6px_24px_24px_24px] border border-[#e6cf70] bg-[#fff5c6] p-5 min-[700px]:p-7">
        <div className="flex items-center justify-between gap-3"><p className="eyebrow text-[#80660b]">Faraday AI · before the map</p><span className="text-xs font-extrabold text-[#80660b]">{setupStep === "profile" ? "Setup" : setupStep === "knowledge" ? "1 of 3" : setupStep === "focus" ? "2 of 3" : "3 of 3"}</span></div>
        {setupStep === "knowledge" && <><h2 className="mt-3 text-[clamp(22px,3vw,29px)]">What do you already know?</h2><p className="mt-2 text-sm text-[#75652b]">About your topic above. No test—just tell me where we should begin.</p>
          <div className="mt-4 grid gap-2 min-[650px]:grid-cols-3">{levelOptions.map((item) => <Choice key={item.value} active={level === item.value} onClick={() => { setLevel(item.value); setPriorKnowledge(item.value === "new" ? "Nothing yet" : item.value === "some_knowledge" ? "I have heard a little" : "I know the basics and want a refresher"); }}><strong className="block">{item.label}</strong><span className="mt-1 block text-xs font-medium">{item.detail}</span></Choice>)}</div>
          <label htmlFor="prior-knowledge" className="mt-5 block text-sm font-extrabold text-[#705f25]">Anything you already know? You can change this answer.</label><input id="prior-knowledge" value={priorKnowledge} onChange={(event) => setPriorKnowledge(event.target.value)} maxLength={160} placeholder="Example: I know what speed is, but not acceleration" className="mt-2 w-full rounded-xl border border-[#dbc264] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#e9d982]"/>
          <button type="button" disabled={busy || !level || !priorKnowledge.trim()} onClick={() => void askTopicQuestion()} className="mt-5 w-full rounded-xl bg-[#246946] px-5 py-3 text-sm font-extrabold text-white disabled:opacity-50">{busy ? "Thinking of one useful question..." : "Next question →"}</button></>}
        {setupStep === "focus" && <><h2 className="mt-3 text-[clamp(22px,3vw,29px)]">{intakeQuestion?.prompt ?? `Which part of ${topic} should we clear up first?`}</h2><p className="mt-2 text-sm text-[#75652b]">Pick one, or tell me your own.</p>
          <div className="mt-4 grid gap-2 min-[650px]:grid-cols-3">{intakeQuestion?.choices.map((item) => <Choice key={item} active={stickingPoint === item} onClick={() => setStickingPoint(item)}>{item}</Choice>)}</div>
          <label htmlFor="sticking-point" className="mt-5 block text-sm font-extrabold text-[#705f25]">Your answer</label><input id="sticking-point" value={stickingPoint} onChange={(event) => setStickingPoint(event.target.value)} maxLength={160} placeholder="Example: I don't get how it starts" className="mt-2 w-full rounded-xl border border-[#dbc264] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#e9d982]"/>
          {questionNotice && <p role="status" className="mt-2 text-xs text-[#705f25]">{questionNotice}</p>}
          <button type="button" disabled={!stickingPoint.trim()} onClick={() => setSetupStep("goal")} className="mt-5 w-full rounded-xl bg-[#246946] px-5 py-3 text-sm font-extrabold text-white disabled:opacity-50">One last question →</button></>}
        {setupStep === "goal" && <><h2 className="mt-3 text-[clamp(22px,3vw,29px)]">What do you want from these 8 minutes?</h2><p className="mt-2 text-sm text-[#75652b]">I&apos;ll use this to keep the chapters focused.</p><div className="mt-4 grid gap-2 min-[650px]:grid-cols-3">{["Understand the basics", "Help with schoolwork", "Prepare for an exam"].map((item) => <Choice key={item} active={goal === item} onClick={() => setGoal(item)}>{item}</Choice>)}</div><label htmlFor="learning-goal" className="mt-5 block text-sm font-extrabold text-[#705f25]">Your goal</label><input id="learning-goal" value={goal} onChange={(event) => setGoal(event.target.value)} maxLength={160} placeholder="Example: Explain this to my friend" className="mt-2 w-full rounded-xl border border-[#dbc264] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#e9d982]"/><button type="button" disabled={busy || !goal.trim()} onClick={() => void startLesson()} className="mt-5 w-full rounded-xl bg-[#246946] px-5 py-3 text-sm font-extrabold text-white disabled:opacity-50">{busy ? "Building your chapter map..." : "Build my chapter map →"}</button></>}
        {setupStep === "profile" && <div>
          <h2 className="mt-3 text-[clamp(22px,3vw,29px)]">First, make this your learning space.</h2>
          <p className="text-sm font-extrabold text-[#705f25]">Set this once - Faraday remembers it.</p>
          <p className="mt-4 text-xs font-extrabold uppercase tracking-wide text-[#80660b]">Your grade</p>
          <div className="mt-2 grid grid-cols-5 gap-2">{([8, 9, 10, 11, 12] as GradeLevel[]).map((item) => <Choice key={item} active={grade === item} onClick={() => setGrade(item)}>Grade {item}</Choice>)}</div>
          <p className="mt-4 text-xs font-extrabold uppercase tracking-wide text-[#80660b]">Examples you enjoy</p>
          <div className="mt-2 grid grid-cols-2 gap-2 min-[650px]:grid-cols-3">{styleOptions.map((item) => <Choice key={item.value} active={style === item.value} onClick={() => setStyle(item.value)}>{item.label}</Choice>)}</div>
          <p className="mt-4 text-xs font-extrabold uppercase tracking-wide text-[#80660b]">How should answers look?</p>
          <div className="mt-2 grid gap-2 min-[650px]:grid-cols-2">{formatOptions.map((item) => <Choice key={item.value} active={format === item.value} onClick={() => setFormat(item.value)}><strong className="block">{item.label}</strong><span className="mt-1 block text-xs font-medium">{item.detail}</span></Choice>)}</div>
          <label className="mt-4 flex gap-3 rounded-xl bg-white/75 p-4 text-sm text-[#705f25]"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-0.5 size-4 accent-[#246946]"/><span><strong>I&apos;m 13 or older.</strong> Save my learning progress and preferences. Raw lesson messages are removed after 90 days.</span></label>
          <button type="button" disabled={!consent} onClick={() => setSetupStep("knowledge")} className="mt-5 w-full rounded-xl bg-[#246946] px-5 py-3 text-sm font-extrabold text-white disabled:opacity-50">Let&apos;s begin →</button>
        </div>}
        {setupStep !== "profile" && setupStep !== "knowledge" && <button type="button" onClick={() => setSetupStep(setupStep === "goal" ? "focus" : "knowledge")} className="mt-4 text-xs font-extrabold text-[#705f25]">← Previous question</button>}
      </section>
    </div>}

    {error && <p role="alert" className="mt-5 rounded-xl border border-[#e6b895] bg-[#fff0d3] px-4 py-3 text-sm font-bold text-[#72551e]">{error}</p>}
    </div>
  </>;
}

"use client";

import type { LearningPlan, PlanChapter } from "../lib/learning/contracts";

export function ChapterMap({ plan, stepIndex = -1, compact = false, preview = false, onChapterClick }: {
  plan: LearningPlan; stepIndex?: number; compact?: boolean; preview?: boolean; onChapterClick?: (chapter: PlanChapter) => void;
}) {
  const total = plan.chapters.reduce((count, chapter) => count + chapter.steps.length, 0);
  const completed = stepIndex >= total ? total : Math.max(0, stepIndex);

  if (compact) return <div className="mt-4 grid gap-2" aria-label={`${plan.title} chapter map`}>
    {plan.chapters.map((chapter, chapterIndex) => {
      const chapterStart = plan.chapters.slice(0, chapterIndex).reduce((count, item) => count + item.steps.length, 0);
      const chapterDone = Math.max(0, Math.min(chapter.steps.length, completed - chapterStart));
      const compactState = chapterDone === chapter.steps.length ? "is-complete" : chapterStart <= stepIndex ? "is-active" : "is-locked";
      return <div key={chapter.id} className="chapter-map-compact-item flex items-center gap-3 rounded-xl border px-3 py-2">
        <span className={`chapter-map-compact-number ${compactState} grid size-8 shrink-0 place-items-center rounded-full text-xs font-black`}>{chapterDone === chapter.steps.length ? "✓" : chapterIndex + 1}</span>
        <span className="chapter-map-compact-title min-w-0 flex-1 truncate text-sm font-extrabold">{chapter.title}</span>
        <span className="chapter-map-compact-count text-[11px] font-black">{chapterDone}/{chapter.steps.length}</span>
      </div>;
    })}
  </div>;

  return <div className="chapter-map-shell relative w-full overflow-hidden rounded-[24px] p-3 shadow-[0_14px_32px_rgba(20,27,51,.18)] min-[650px]:p-5">
    <div className="chapter-map-dots pointer-events-none absolute inset-0" />
    <div className="relative z-10 mx-auto max-w-[880px]">
      <div className="chapter-map-panel rounded-[20px] border p-4 min-[650px]:p-5">
        <span className="chapter-map-book-pill inline-block rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide">Your learning path</span>
        <div className="mt-3 flex items-end justify-between gap-3"><h2 className="chapter-map-title text-[clamp(22px,3vw,32px)] font-black leading-tight tracking-[-1px]">{plan.title}</h2><strong className="chapter-map-percentage shrink-0 text-2xl font-black">{Math.round(completed / Math.max(1, total) * 100)}%</strong></div>
        <div className="chapter-map-progress-track mt-4 h-2 overflow-hidden rounded-full"><div className="chapter-map-progress-value h-full rounded-full transition-all duration-500" style={{ width: `${Math.round(completed / Math.max(1, total) * 100)}%` }} /></div>
      </div>
      <div className="mt-3 grid gap-2">
        {plan.chapters.map((chapter, chapterIndex) => {
          const chapterStart = plan.chapters.slice(0, chapterIndex).reduce((count, previous) => count + previous.steps.length, 0);
          const chapterDone = Math.max(0, Math.min(chapter.steps.length, completed - chapterStart));
          return <section key={chapter.id} className="chapter-map-panel rounded-[20px] border p-3 min-[650px]:p-4">
            <div className="flex items-center gap-3">
              <span className={`grid size-10 shrink-0 place-items-center rounded-full text-sm font-black ${["bg-[#20a883]", "bg-[#5279b7]", "bg-[#8057ad]"][chapterIndex % 3]}`}>{chapterIndex + 1}</span>
              <div className="min-w-0 flex-1"><span className="chapter-map-chapter-kicker text-[10px] font-black uppercase tracking-wide">Chapter {chapterIndex + 1} · {chapterDone}/{chapter.steps.length} done</span><h3 className="chapter-map-chapter-title text-lg font-black leading-tight">{chapter.title}</h3></div>
              {onChapterClick && <button type="button" onClick={() => onChapterClick(chapter)} className="chapter-map-change shrink-0 rounded-xl border px-2.5 py-2 text-xs font-black">Change</button>}
            </div>
            <div className="mt-3 grid gap-2 min-[550px]:grid-cols-2">{chapter.steps.map((step, offset) => {
              const index = chapterStart + offset;
              const isDone = index < completed;
              const isCurrent = index === stepIndex;
              return <div key={step.id} className={`chapter-map-step flex min-w-0 items-start gap-2.5 rounded-xl border p-3 ${isDone ? "is-done" : isCurrent ? "is-current" : "is-later"}`}>
                <span className={`chapter-map-step-number grid size-8 shrink-0 place-items-center rounded-full text-sm font-black ${isDone ? "is-done" : isCurrent ? "is-current" : "is-later"}`}>{isDone ? "✓" : index + 1}</span>
                <div className="min-w-0"><span className={`chapter-map-step-label text-[9px] font-black uppercase tracking-wide ${isCurrent ? "is-current" : ""}`}>{isDone ? "Completed" : isCurrent ? preview ? "Start here" : "You're here" : "Later in this lesson"}</span><h4 className="chapter-map-step-title text-sm font-black leading-5">{step.title}</h4></div>
              </div>;
            })}</div>
          </section>;
        })}
      </div>
    </div>
  </div>;
}

"use client";

import { useState, type ReactNode } from "react";

const styles = ["Sports", "Practical", "Story", "Space", "Game-like", "Just explain"];

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`learning-card rounded-[22px] border border-[#dfe7d7] bg-white p-5 min-[700px]:p-7 ${className}`}>{children}</section>;
}

function Option({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`rounded-xl border px-3 py-3 text-left text-sm font-extrabold transition ${active ? "border-[#246946] bg-[#dff5e5] text-[#1d6a42] shadow-[0_2px_0_#8bcba0]" : "border-[#d9e3d4] bg-white text-[#486252] hover:-translate-y-0.5 hover:border-[#8fc7a1] hover:bg-[#f4fbf1]"}`}>{children}</button>;
}

function Dialog({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return <div className="fixed inset-0 z-[100] grid place-items-center bg-[#10251b]/55 p-4" role="dialog" aria-modal="true" aria-label={title} onMouseDown={onClose}><div className="w-full max-w-[540px] rounded-[26px] border border-[#d5e3d1] bg-[#fffdf8] p-5 shadow-[0_24px_80px_rgba(6,25,15,.35)] min-[600px]:p-7" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><h2 className="text-[26px]">{title}</h2><button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-full bg-[#edf3e9] text-lg font-bold text-[#315641]" aria-label="Close dialog">x</button></div>{children}</div></div>;
}

export function TopicStarter() {
  const [topic, setTopic] = useState("");
  const [started, setStarted] = useState(false);
  const [style, setStyle] = useState("Sports");
  const [startingPoint, setStartingPoint] = useState("I know a little");
  const [missionStep, setMissionStep] = useState<"setup" | "question" | "answer">("setup");
  const [answer, setAnswer] = useState("");
  const [teacherReply, setTeacherReply] = useState("");

  function begin() {
    if (!topic.trim()) return;
    setStarted(true);
    setMissionStep("setup");
    setTeacherReply("");
  }

  function askFaraday() {
    if (!answer.trim()) return;
    setTeacherReply(`Great question. For this prototype, Faraday would explain ${topic} with a ${style.toLowerCase()} example, then check that the idea clicked with one tiny follow-up question.`);
  }

  return <>
    <p className="eyebrow">Start a new learning mission</p>
    <h1>What are you curious about?</h1>
    <p className="intro">Name a topic. Faraday will help you choose a friendly place to begin.</p>

    <Panel className="mt-7">
      <label className="text-sm font-extrabold text-[#38564a]" htmlFor="topic">Your topic</label>
      <div className="mt-3 flex rounded-2xl border border-[#d2dfc9] bg-[#f8fbf4] p-2 focus-within:ring-4 focus-within:ring-[#e2f4dd]">
        <input id="topic" value={topic} onChange={(event) => { setTopic(event.target.value); setStarted(false); }} onKeyDown={(event) => event.key === "Enter" && begin()} placeholder="Try: Why do planets stay in orbit?" className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-[#91a092]" />
        <button type="button" onClick={begin} className="rounded-xl bg-[#246946] px-4 py-3 text-sm font-extrabold text-white shadow-[0_3px_0_#143d2b]">Let&apos;s go -&gt;</button>
      </div>
      {!topic && <p className="mt-3 text-xs text-[#718173]">Try a school subject, a homework question, or something you simply find interesting.</p>}
    </Panel>

    {started && <div className="mt-5 space-y-5">
      <Panel className="border-[#e6cf70] bg-[#fff5c6]">
        <p className="eyebrow text-[#80660b]">Tiny mission: {topic}</p>
        <h2 className="mt-2 text-[25px]">How should we explore it?</h2>
        <p className="mt-2 text-sm text-[#75652b]">Pick what sounds fun. You can change your mind at any time.</p>
        <div className="mt-4 grid grid-cols-2 gap-2 min-[560px]:grid-cols-3">{styles.map((item) => <Option key={item} active={style === item} onClick={() => setStyle(item)}>{item}</Option>)}</div>
        <p className="mt-5 text-sm font-extrabold text-[#705f25]">Where should we begin?</p>
        <div className="mt-2 grid gap-2 min-[560px]:grid-cols-3">{["I'm brand new", "I know a little", "Test me first"].map((item) => <Option key={item} active={startingPoint === item} onClick={() => setStartingPoint(item)}>{item}</Option>)}</div>
        <button type="button" onClick={() => setMissionStep("question")} className="mt-5 rounded-xl bg-[#246946] px-4 py-3 text-sm font-extrabold text-white shadow-[0_3px_0_#143d2b]">Build my lesson -&gt;</button>
      </Panel>

      {missionStep !== "setup" && <Panel>
        <p className="eyebrow">First tiny check</p>
        <h2 className="mt-2 text-[25px]">What do you think keeps something moving after you throw it?</h2>
        <p className="mt-2 text-sm text-[#687d6d]">There is no pressure here. Pick a thought, or tell Faraday in your own words.</p>
        <div className="mt-4 grid gap-2 min-[560px]:grid-cols-3">
          {["It keeps its motion", "A force keeps pushing it", "I'm not sure yet"].map((item) => <Option key={item} active={answer === item} onClick={() => { setAnswer(item); setMissionStep("answer"); }}>{item}</Option>)}
        </div>
        <div className="mt-5 border-t border-[#e3ebe0] pt-4">
          <label className="text-sm font-extrabold text-[#38564a]" htmlFor="faraday-question">Ask Faraday anything</label>
          <div className="mt-2 flex rounded-xl border border-[#d6e1d0] bg-[#f8fbf4] p-1.5"><input id="faraday-question" value={answer} onChange={(event) => setAnswer(event.target.value)} onKeyDown={(event) => event.key === "Enter" && askFaraday()} placeholder="Explain it with cricket..." className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none" /><button type="button" onClick={askFaraday} className="rounded-lg bg-[#246946] px-3 text-sm font-extrabold text-white">Ask -&gt;</button></div>
        </div>
        {teacherReply && <div className="mt-4 rounded-xl bg-[#eff8ee] p-4 text-sm leading-relaxed text-[#315b40]"><strong>Faraday says:</strong> {teacherReply}</div>}
      </Panel>}
    </div>}
  </>;
}

export function TestPrototype() {
  const [mode, setMode] = useState("Quick check");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const options = ["It is moving sideways as gravity pulls it", "Earth's gravity is too weak", "The Moon has no gravity"];

  return <>
    <p className="eyebrow">Ready when you are</p><h1>Tests without the scary part.</h1><p className="intro">Wrong answers become a clue for the next lesson, never a dead end.</p>
    <div className="mt-7 grid gap-3 min-[650px]:grid-cols-2">{[["Quick check", "3 friendly questions - 4 min"], ["Practice test", "10 questions - take your time"], ["Explain it back", "Teach Faraday in your own words"], ["Weak areas test", "Only the concepts needing care"]].map(([name, detail]) => <Option key={name} active={mode === name} onClick={() => setMode(name)}><span className="block text-base">{name}</span><span className="mt-1 block text-xs font-medium text-[#69806e]">{detail}</span></Option>)}</div>
    <Panel className="mt-5 bg-[#eff8ee]"><p className="eyebrow">{mode}</p><h2 className="mt-2 text-[26px]">Ready to try Physics: Gravity?</h2><p className="mt-2 text-sm text-[#587163]">You can pause at any question and ask Faraday for a clearer explanation.</p><button type="button" onClick={() => { setSelected(null); setOpen(true); }} className="mt-5 rounded-xl bg-[#246946] px-4 py-3 text-sm font-extrabold text-white">Start when I&apos;m ready -&gt;</button></Panel>
    {open && <Dialog title="Gravity quick check" onClose={() => setOpen(false)}><p className="mt-3 text-sm text-[#687d6d]">Question 1 of 3</p><p className="mt-2 text-lg font-extrabold">Why does the Moon not crash into Earth?</p><div className="mt-5 grid gap-2">{options.map((item) => <Option key={item} active={selected === item} onClick={() => setSelected(item)}>{item}</Option>)}</div>{selected && <div className={`mt-4 rounded-xl p-4 text-sm ${selected === options[0] ? "bg-[#dff5e5] text-[#245b3a]" : "bg-[#fff0d3] text-[#72551e]"}`}><strong>{selected === options[0] ? "Nice work!" : "Useful clue!"}</strong> {selected === options[0] ? "The Moon keeps moving sideways while Earth's gravity bends its path into an orbit." : "Gravity is strong enough to pull the Moon inward, but its sideways motion is the important missing piece. Faraday would revisit that next."}</div>}<div className="mt-5 flex justify-end"><button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-[#b8d5c0] px-4 py-2.5 text-sm font-extrabold text-[#246946]">Save this mock result</button></div></Dialog>}
  </>;
}

const initialMemories = [
  ["Learning style", "You usually enjoy practical and sports-based examples."],
  ["Growing strength", "Basic gravity and mass versus weight are clicking."],
  ["A thread to revisit", "Orbits feel easier after a visual or real-life example."],
  ["Your interests", "Space, history stories, and football examples make learning more fun."],
];

export function MemoryPrototype() {
  const [memories, setMemories] = useState(initialMemories);
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  function edit(index: number) { setEditing(index); setDraft(memories[index][1]); setNotice(""); }
  function save() { if (editing === null || !draft.trim()) return; setMemories((items) => items.map((item, index) => index === editing ? [item[0], draft.trim()] : item)); setEditing(null); setNotice("Saved in this prototype session. Real memory storage comes later."); }
  return <>
    <p className="eyebrow">Your teacher&apos;s notebook</p><h1>What Faraday remembers.</h1><p className="intro">These notes help lessons feel personal. You are always in control of them.</p>
    <div className="mt-7 space-y-3">{memories.map(([title, detail], index) => <Panel key={title} className="flex flex-col gap-3 p-5 min-[600px]:flex-row min-[600px]:items-center"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#dff5e5] font-bold text-[#246946]">OK</div><div className="min-w-0 flex-1"><h2 className="text-lg">{title}</h2><p className="mt-1 text-sm text-[#66796b]">{detail}</p></div><button type="button" onClick={() => edit(index)} className="rounded-lg px-3 py-2 text-sm font-extrabold text-[#246946] hover:bg-[#eaf5ea]">Edit</button></Panel>)}</div>
    {notice && <p className="mt-5 rounded-xl bg-[#eff8ee] px-4 py-3 text-sm font-bold text-[#315b40]">{notice}</p>}
    {editing !== null && <Dialog title={`Edit: ${memories[editing][0]}`} onClose={() => setEditing(null)}><label htmlFor="memory-detail" className="mt-5 block text-sm font-extrabold text-[#38564a]">What should Faraday remember?</label><textarea id="memory-detail" value={draft} onChange={(event) => setDraft(event.target.value)} className="mt-2 min-h-28 w-full rounded-xl border border-[#d2dfc9] bg-[#f8fbf4] p-3 text-sm outline-none focus:ring-4 focus:ring-[#e2f4dd]" /><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setEditing(null)} className="rounded-xl px-4 py-3 text-sm font-extrabold text-[#4d6856]">Cancel</button><button type="button" onClick={save} className="rounded-xl bg-[#246946] px-4 py-3 text-sm font-extrabold text-white">Save memory</button></div></Dialog>}
  </>;
}

export function SettingsPrototype() {
  const [personalised, setPersonalised] = useState(true);
  const [reviewReminders, setReviewReminders] = useState(true);
  const [grade, setGrade] = useState("Grade 9");
  const [saved, setSaved] = useState(false);
  return <><p className="eyebrow">Your space</p><h1>Settings.</h1><p className="intro">Choose how this prototype should personalise your learning experience.</p><Panel className="mt-7"><label htmlFor="grade" className="text-sm font-extrabold">School level</label><select id="grade" value={grade} onChange={(event) => { setGrade(event.target.value); setSaved(false); }} className="mt-2 block rounded-xl border border-[#d2dfc9] bg-[#f8fbf4] px-3 py-2.5 text-sm font-bold outline-none"><option>Grade 8</option><option>Grade 9</option><option>Grade 10</option><option>Grade 11</option><option>Grade 12</option></select><div className="mt-6 space-y-3"><Toggle label="Personalised lesson suggestions" description="Use your interests and learning preferences." checked={personalised} onChange={() => { setPersonalised(!personalised); setSaved(false); }} /><Toggle label="Gentle review reminders" description="Surface topics that may need another look." checked={reviewReminders} onChange={() => { setReviewReminders(!reviewReminders); setSaved(false); }} /></div><button type="button" onClick={() => setSaved(true)} className="mt-6 rounded-xl bg-[#246946] px-4 py-3 text-sm font-extrabold text-white">Save prototype preferences</button>{saved && <p className="mt-3 text-sm font-bold text-[#246946]">Saved for this browser session: {grade} learning profile.</p>}</Panel></>;
}

function Toggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: () => void }) {
  return <button type="button" role="switch" aria-checked={checked} onClick={onChange} className="flex w-full items-center justify-between gap-4 rounded-xl bg-[#f2f8ee] p-4 text-left"><span><strong className="block text-sm">{label}</strong><span className="mt-1 block text-xs font-medium text-[#607565]">{description}</span></span><span className={`rounded-full px-3 py-1 text-xs font-extrabold ${checked ? "bg-[#246946] text-white" : "bg-[#dce6d9] text-[#526b59]"}`}>{checked ? "On" : "Off"}</span></button>;
}

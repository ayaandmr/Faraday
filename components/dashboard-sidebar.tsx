"use client";

import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { ThemeToggle } from "./theme-toggle";

export type DashboardSidebarPage = "learning" | "learn" | "lessons" | "suggested" | "progress" | "tests" | "memory" | "settings";

type DashboardSidebarProps = { activePage: DashboardSidebarPage };

const navigation = [
  { href: "/dashboard", id: "learning", label: "My learning", icon: "home" },
  { href: "/dashboard/learn", id: "learn", label: "Start a topic", icon: "sparkle" },
  { href: "/dashboard/lessons", id: "lessons", label: "Lessons", icon: "book" },
  { href: "/dashboard/progress", id: "progress", label: "My progress", icon: "chart" },
  { href: "/dashboard/tests", id: "tests", label: "Tests", icon: "checklist" },
  { href: "/dashboard/settings", id: "settings", label: "Settings", icon: "settings" },
] as const;

type SidebarIconName = (typeof navigation)[number]["icon"];

function SidebarIcon({ name }: { name: SidebarIconName }) {
  const paths: Record<SidebarIconName, ReactNode> = {
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" /><path d="M9 21v-6h6v6" /></>,
    sparkle: <><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7Z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7Z" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21Z" /><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5A2.5 2.5 0 0 1 20 21Z" /></>,
    chart: <><path d="M4 20V4" /><path d="M4 20h17" /><path d="m7 15 4-4 3 2 5-6" /><path d="M16 7h3v3" /></>,
    checklist: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 3.5h6v3H9z" /><path d="m8.5 11 1.5 1.5 3-3" /><path d="M14.5 11H16" /><path d="m8.5 16 1.5 1.5 3-3" /><path d="M14.5 16H16" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.08 2.08-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56v.12h-3v-.12a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-2.08-2.08.06-.06A1.7 1.7 0 0 0 7.14 15a1.7 1.7 0 0 0-1.56-1.03h-.12v-3h.12A1.7 1.7 0 0 0 7.14 9.94 1.7 1.7 0 0 0 6.8 8.06L6.74 8l2.08-2.08.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.03-1.56v-.12h3v.12a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06L19.94 8l-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03h.12v3h-.12A1.7 1.7 0 0 0 19.4 15Z" /></>,
  };

  return <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export function DashboardSidebar({ activePage }: DashboardSidebarProps) {
  const selectedPage = activePage === "memory" ? "settings" : activePage;

  return <aside className="hidden h-full w-[196px] shrink-0 flex-col border-r border-[#e1e9d8] bg-[#f7faef] p-3 min-[800px]:flex">
    <Link href="/" className="group mb-4 flex items-center gap-1.5 text-base font-extrabold tracking-[-.8px]">
      <Image className="size-7 object-contain transition group-hover:rotate-6" src="/brand/logo.png" width={28} height={28} alt="" />
      Faraday AI
    </Link>
    <p className="mb-1.5 px-2 text-[9px] font-extrabold uppercase tracking-[1px] text-[#819080]">Learn</p>
    <nav className="space-y-0.5 text-[13px] font-extrabold" aria-label="Dashboard navigation">
      {navigation.map((item) => {
        const active = selectedPage === item.id;
        return <Link key={item.id} href={item.href} className={`flex items-center gap-2 rounded-lg px-2 py-2 transition ${active ? "bg-[#dff5e5] text-[#1d7648] shadow-[inset_0_0_0_1px_#b8ebc9]" : "text-[#607565] hover:bg-[#eaf1e1] hover:text-[#246946]"}`}>
          <span className={`grid size-6 shrink-0 place-items-center rounded-md text-xs ${active ? "bg-[#246946] text-white" : "bg-[#e4ebda]"}`}><SidebarIcon name={item.icon} /></span>
          <span className="whitespace-nowrap">{item.label}</span>
        </Link>;
      })}
    </nav>
    <div className="mt-auto space-y-2">
      <div className="rounded-lg border border-[#d9e5cd] bg-white p-2.5">
        <div className="flex justify-between text-[11px] font-extrabold"><span className="text-[#4d6856]">Weekly goal</span><span className="text-[#246946]">3 / 5</span></div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#e5ecdc]"><div className="h-full w-[60%] rounded-full bg-[#56b878]" /></div>
      </div>
      <Link href="/dashboard/learn" className="block w-full rounded-lg bg-[#ffd53d] px-2 py-2 text-center text-xs font-extrabold shadow-[0_2px_0_#dcae10]">+ New session</Link>
      <div className="flex items-center justify-between gap-2 border-t border-[#dfe7d5] pt-2.5"><div className="flex min-w-0 items-center gap-1.5"><UserButton /><span className="truncate text-[11px] font-bold text-[#617668]">Your account</span></div><ThemeToggle compact /></div>
    </div>
  </aside>;
}

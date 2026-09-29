"use client";

import { useEffect, useState } from "react";

const THEME_KEY = "faraday-theme";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const syncTheme = () => setDark(document.documentElement.classList.contains("dark"));
    const frame = window.requestAnimationFrame(syncTheme);
    window.addEventListener("faraday-theme-change", syncTheme);
    window.addEventListener("storage", syncTheme);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("faraday-theme-change", syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  function toggleTheme() {
    const nextTheme = !dark;
    setDark(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme);
    window.localStorage.setItem(THEME_KEY, nextTheme ? "dark" : "light");
    window.dispatchEvent(new Event("faraday-theme-change"));
  }

  return <button type="button" onClick={toggleTheme} aria-label={`Switch to ${dark ? "light" : "dark"} mode`} title={`Switch to ${dark ? "light" : "dark"} mode`} className={`theme-toggle ${compact ? "theme-toggle-compact" : ""}`}><svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">{dark ? <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"/></> : <path d="M20.5 14.4A8 8 0 0 1 9.6 3.5 8.5 8.5 0 1 0 20.5 14.4Z"/>}</svg><span className="theme-toggle-label">{dark ? "Light" : "Dark"}</span></button>;
}

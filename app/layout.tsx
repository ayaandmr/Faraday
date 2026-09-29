import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Faraday AI | A learning path for every student",
  description:
    "Faraday AI helps teachers shape AI-assisted learning paths that meet every student where they are.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth scroll-pt-[126px]" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('faraday-theme');var d=t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}})()` }} />
      </head>
      <body className="m-0 bg-[#fffdf5] font-[Arial,Helvetica,sans-serif] text-[#17352a]"><ClerkProvider>{children}</ClerkProvider></body>
    </html>
  );
}

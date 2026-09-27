import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Farady | A learning path for every student",
  description:
    "Farady helps teachers shape AI-assisted learning paths that meet every student where they are.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

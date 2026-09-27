"use client";

import { useState } from "react";

type PilotCtaProps = {
  className?: string;
  label?: string;
};

export function PilotCta({ className = "", label = "Join the pilot" }: PilotCtaProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className={`button button-primary ${className}`} onClick={() => setIsOpen(true)}>
        {label} <span aria-hidden="true">→</span>
      </button>
      {isOpen && (
        <div className="dialog-backdrop" role="presentation" onMouseDown={() => setIsOpen(false)}>
          <section
            aria-labelledby="pilot-dialog-title"
            aria-modal="true"
            className="pilot-dialog"
            role="dialog"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <span className="dialog-spark" aria-hidden="true">✦</span>
            <h2 id="pilot-dialog-title">The pilot is coming soon.</h2>
            <p>
              We&apos;re preparing Farady for its first classroom pilots. There&apos;s nothing to sign up for yet—check back soon.
            </p>
            <button autoFocus className="button button-dark" onClick={() => setIsOpen(false)}>
              Got it
            </button>
          </section>
        </div>
      )}
    </>
  );
}

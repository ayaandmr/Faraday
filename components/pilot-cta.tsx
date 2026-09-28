import Link from "next/link";

type PilotCtaProps = {
  className?: string;
  label?: string;
};

export function PilotCta({ className = "", label = "Join the pilot" }: PilotCtaProps) {
  return (
    <Link
      className={`inline-flex min-h-[48px] cursor-pointer items-center rounded-[13px] border-0 bg-[#ffd53d] px-[10px] py-[13px] text-[11px] font-extrabold text-[#17352a] shadow-[0_4px_0_#e3b615] transition hover:-translate-y-0.5 hover:bg-[#ffe36b] min-[651px]:min-h-0 min-[651px]:px-[22px] min-[651px]:py-4 min-[651px]:text-[15px] ${className}`}
      href="/dashboard"
    >
      {label} <span aria-hidden="true">→</span>
    </Link>
  );
}

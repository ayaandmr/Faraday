import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "./site-footer";
import { ThemeToggle } from "./theme-toggle";

type InfoPageProps = {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
};

export function InfoPage({ eyebrow, title, children }: InfoPageProps) {
  return (
    <main className="info-page">
      <nav className="mx-auto mt-[17px] flex min-h-[67px] w-[calc(100%-40px)] items-center justify-between rounded-2xl border-2 border-[#dde0d1] px-[15px] py-[9px] shadow-[0_5px_0_#e7e8dc] min-[651px]:mt-[26px] min-[651px]:min-h-[74px] min-[651px]:w-[min(calc(100%-64px),1080px)] min-[651px]:px-6" aria-label="Main navigation">
        <Link className="inline-flex items-center gap-[7px] text-[18px] font-extrabold tracking-[-1px] min-[651px]:gap-[9px] min-[651px]:text-[22px]" href="/">
          <Image className="block size-[29px] object-contain min-[651px]:size-[34px]" src="/brand/logo.png" alt="" width={42} height={42} priority />
          <span>Faraday AI</span>
        </Link>
        <div className="flex items-center gap-2"><ThemeToggle compact /><Link className="text-[14px] font-extrabold text-[#246946]" href="/">← Back to home</Link></div>
      </nav>
      <article className="mx-auto max-w-[820px] px-[22px] pt-[72px] pb-[72px] min-[651px]:min-h-[calc(100vh-290px)] min-[651px]:px-[30px] min-[651px]:pt-[106px] min-[651px]:pb-[106px] [&>p:not(:first-child)]:mb-[22px] [&>p:not(:first-child)]:max-w-[720px] [&>p:not(:first-child)]:text-[16px] [&>p:not(:first-child)]:leading-[1.65] [&>p:not(:first-child)]:text-[#4c6559] min-[651px]:[&>p:not(:first-child)]:text-[18px] [&_strong]:text-[14px] [&_strong]:text-[#17352a]">
        <p className="m-0 text-[11px] font-extrabold uppercase tracking-[1.25px] text-[#246946]">{eyebrow}</p>
        <h1 className="mt-4 mb-[35px] text-[clamp(43px,5.4vw,70px)] leading-none tracking-[-2.5px] min-[651px]:tracking-[-3px]">{title}</h1>
        {children}
      </article>
      <SiteFooter />
    </main>
  );
}

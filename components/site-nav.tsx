import Image from "next/image";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export function SiteNav() {
  return (
    <nav aria-label="Main navigation" className="fixed top-3 left-1/2 z-50 flex min-h-[63px] w-[calc(100%-28px)] -translate-x-1/2 items-center gap-2 rounded-[18px] border border-white/55 bg-[#fffdf5]/55 px-[13px] py-2 shadow-[0_8px_32px_rgba(20,61,43,.14)] backdrop-blur-lg min-[651px]:top-5 min-[651px]:min-h-[68px] min-[651px]:w-[min(calc(100%-52px),1080px)] min-[651px]:gap-6 min-[651px]:px-[18px] min-[651px]:py-[9px]">
      <a className="inline-flex items-center gap-[7px] text-[18px] font-extrabold tracking-[-1px] min-[651px]:gap-[9px] min-[651px]:text-[22px] min-[651px]:tracking-[-1.2px]" href="#top" aria-label="Faraday AI home">
        <Image className="block size-[29px] object-contain min-[651px]:size-[34px]" src="/brand/logo.png" alt="" width={42} height={42} priority />
        <span>Faraday AI</span>
      </a>
      <div className="ml-auto hidden gap-7 text-sm font-bold text-[#38584a] min-[651px]:flex">
        <a href="#how-it-works">How it grows</a>
        <a href="#for-students">For students</a>
        <a href="#pilot">Pilot</a>
      </div>
      <Show when="signed-out">
        <div className="ml-auto flex items-center gap-2 min-[651px]:ml-0">
          <SignInButton><button className="whitespace-nowrap px-2 py-2 text-[11px] font-extrabold text-[#17352a] hover:text-[#246946] min-[651px]:px-3 min-[651px]:text-sm">Log in</button></SignInButton>
          <SignUpButton><button className="whitespace-nowrap rounded-xl bg-[#ffd53d] px-[10px] py-[11px] text-[11px] font-extrabold text-[#17352a] shadow-[0_4px_0_#e3b615] transition hover:-translate-y-0.5 hover:bg-[#ffe36b] min-[651px]:px-[18px] min-[651px]:py-[13px] min-[651px]:text-sm">Sign up</button></SignUpButton>
        </div>
      </Show>
      <Show when="signed-in"><div className="ml-auto min-[651px]:ml-0"><UserButton /></div></Show>
    </nav>
  );
}

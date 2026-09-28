import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="grid grid-cols-2 gap-x-5 gap-y-8 bg-[#143d2b] px-[22px] pt-[72px] pb-[42px] text-center text-[13px] text-[#b9cdbf] shadow-[0_0_0_100vmax_#143d2b] [clip-path:inset(0_-100vmax)] min-[651px]:mx-auto min-[651px]:grid-cols-3 min-[651px]:max-w-[1240px] min-[651px]:gap-[34px] min-[651px]:px-10 min-[651px]:pt-[72px] min-[651px]:pb-[34px]">
      <div className="col-span-2 flex flex-col items-center gap-[11px] min-[651px]:col-span-1">
        <h2 className="flex items-center justify-center gap-[9px] text-[20px] font-bold tracking-[-1px] text-white">
          <Image className="block size-[38px] object-contain" src="/brand/logo.png" alt="" width={52} height={52} />
          <span>Faraday AI</span>
        </h2>
        <Link href="/about">About us</Link>
        <Link href="/#pilot">School pilot</Link>
      </div>
      <div className="flex flex-col items-center gap-[11px] [&_h2]:mb-[6px] [&_h2]:text-[15px] [&_h2]:font-bold [&_h2]:text-white [&_a:hover]:text-[#ffd53d]">
        <h2>Explore</h2>
        <Link href="/#how-it-works">How it works</Link>
        <Link href="/#for-teachers">For teachers</Link>
        <Link href="/#pilot">School pilot</Link>
      </div>
      <div className="flex flex-col items-center gap-[11px] [&_h2]:mb-[6px] [&_h2]:text-[15px] [&_h2]:font-bold [&_h2]:text-white [&_a:hover]:text-[#ffd53d]">
        <h2>Learning</h2>
        <Link href="/#top">Personal learning paths</Link>
        <Link href="/#for-teachers">Teacher-planned lessons</Link>
        <Link href="/#for-teachers">Learning resources</Link>
      </div>
      <div className="flex flex-col items-center gap-[11px] [&_h2]:mb-[6px] [&_h2]:text-[15px] [&_h2]:font-bold [&_h2]:text-white [&_a:hover]:text-[#ffd53d]">
        <h2>Classrooms</h2>
        <Link href="/#for-teachers">Progress check-ins</Link>
        <Link href="/#for-teachers">Student feedback</Link>
        <Link href="/#pilot">Pilot classrooms</Link>
      </div>
      <div className="flex flex-col items-center gap-[11px] [&_h2]:mb-[6px] [&_h2]:text-[15px] [&_h2]:font-bold [&_h2]:text-white [&_a:hover]:text-[#ffd53d]">
        <h2>Legal</h2>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </div>
      <p className="col-span-full mt-5 border-t border-white/15 pt-5 text-center text-xs text-[#8ea897] min-[651px]:mt-9">© {new Date().getFullYear()} Faraday AI</p>
    </footer>
  );
}

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="relative grid h-[100dvh] place-items-center overflow-hidden bg-[#f6efcf] px-5 py-5">
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,244,207,.93),rgba(255,253,245,.72)),url('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1800&q=85')] bg-cover bg-center" />
      <div className="relative flex w-full max-w-[640px] flex-col items-center">
        <p className="mb-5 text-center text-[11px] font-extrabold uppercase tracking-[1.25px] text-[#246946]">Welcome back to Faraday AI</p>
        <SignIn fallbackRedirectUrl="/dashboard" forceRedirectUrl="/dashboard" appearance={{ elements: { rootBox: "w-full", card: "w-full max-w-none rounded-[28px] border border-white/80 shadow-[0_24px_80px_rgba(32,65,37,.22)]" } }} />
      </div>
    </main>
  );
}

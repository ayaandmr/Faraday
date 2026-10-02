import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PilotCta } from "../components/pilot-cta";
import { SiteFooter } from "../components/site-footer";
import { SiteNav } from "../components/site-nav";

const learningLoop = [
  ["01", "Understand", "Faraday AI listens to the question behind the question."],
  ["02", "Find the gap", "It notices exactly what is missing, not just what is wrong."],
  ["03", "Teach", "The explanation changes to fit the student in front of it."],
  ["04", "Test", "A small check reveals whether the idea has really landed."],
  ["05", "Learn", "Every answer, hesitation, and win becomes useful context."],
  ["06", "Grow", "Faraday AI chooses the next best thing to teach."],
];

const features = [
  { number: "01", title: "A memory for your learning", body: "Faraday AI remembers the ideas that clicked, the mistakes that keep returning, and the concepts that deserve another angle.", accent: "yellow" },
  { number: "02", title: "Explanations in your world", body: "Gravitation can start with a historical mystery, a chemistry experiment, or the thing you already care about.", accent: "lilac" },
  { number: "03", title: "A gap finder, not a guesser", body: "Short checks help Faraday AI see the missing link before it turns into a bigger confidence problem.", accent: "mint" },
  { number: "04", title: "Progress you can feel", body: "Your learning path keeps moving, so every session starts a little closer to what you need next.", accent: "coral" },
];

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <main className="landing-page">

      <SiteNav />



      <section id="top" className="mx-auto grid min-h-0 max-w-[1400px] grid-cols-1 items-center gap-17 px-[22px] pt-[145px] pb-[112px] min-[921px]:min-h-[900px] min-[921px]:grid-cols-[minmax(0,.95fr)_minmax(520px,1.05fr)] min-[921px]:gap-[100px] min-[921px]:px-10 min-[921px]:pt-[182px] min-[921px]:pb-[142px]">
        <div className="px-[3px] [&>h1]:mt-5 [&>h1]:mb-[25px] [&>h1]:max-w-[800px] [&>h1]:text-[clamp(48px,15vw,80px)] [&>h1]:leading-[.97] [&>h1]:tracking-[-2.8px] [&>h1_em]:font-[Georgia,serif] [&>h1_em]:font-normal [&>h1_em]:text-[#246946] min-[651px]:px-0 min-[651px]:[&>h1]:mt-[18px] min-[651px]:[&>h1]:mb-5 min-[651px]:[&>h1]:text-[clamp(50px,6.5vw,90px)] min-[651px]:[&>h1]:leading-[.95] min-[651px]:[&>h1]:tracking-[-5px]">
          <p className="m-0 text-[11px] font-extrabold uppercase tracking-[1.25px] text-[#246946]">For students in grades 8-12</p>
          <h1>Your teacher.<br /><em>Growing with you.</em></h1>
          <p className="max-w-[34ch] text-[18px] leading-[1.6] text-[#4c6559] min-[651px]:max-w-[530px] min-[651px]:text-[19px] min-[651px]:leading-[1.55]">Faraday AI does not just answer your questions. It learns how you learn, finds the gaps holding you back, and helps you take the next step with confidence.</p>
          <div className="mx-auto mt-[34px] flex w-[94%] flex-nowrap items-center justify-between gap-3 px-1 min-[651px]:mx-0 min-[651px]:mt-[32px] min-[651px]:w-auto min-[651px]:flex-wrap min-[651px]:gap-5.5 min-[651px]:px-0">
            <PilotCta label="Meet Your New Teacher" />
            <a className="inline-flex min-h-[48px] items-center justify-center whitespace-nowrap rounded-[13px] border-2 border-[#17352a] bg-white px-[10px] py-[13px] text-[11px] font-extrabold shadow-[0_3px_0_#17352a] transition hover:-translate-y-0.5 hover:bg-[#fff9dc] min-[651px]:min-h-0 min-[651px]:px-[22px] min-[651px]:py-4 min-[651px]:text-[15px] min-[651px]:shadow-[0_4px_0_#17352a]" href="#how-it-works">See the learning loop <span aria-hidden="true">&darr;</span></a>
          </div>
          <p className="mt-[27px] max-w-[31ch] text-xs leading-[1.55] text-[#718277]">Your personal learning memory. Built to grow with you over time.</p>
        </div>

        <div className="group relative h-[365px] overflow-hidden rounded-[32px] border border-[#e6d77e] bg-[#fff4cf] shadow-[0_18px_45px_rgba(112,91,14,.12)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_25px_55px_rgba(112,91,14,.20)] before:absolute before:inset-x-[-10%] before:bottom-[-38%] before:h-[55%] before:rounded-t-[50%] before:bg-[#f8e4a0] min-[651px]:h-[530px] min-[921px]:h-[600px]" aria-label="Illustration of Faraday AI building a student's growing learning map" role="img">
          <div className="absolute -top-[135px] -right-[94px] size-[288px] rounded-full bg-[#ffd53d] min-[651px]:-top-[110px] min-[651px]:-right-[50px] min-[651px]:size-[315px]" />
          <div className="absolute top-5 left-5 z-[2] rounded-full border border-[#d5bf4c] bg-[#fff9dc] px-3 py-[9px] text-[11px] font-extrabold text-[#6f5b0e] min-[651px]:top-7 min-[651px]:left-7">Faraday AI is paying attention</div>
          <div className="absolute top-24 left-[18px] z-[1] h-[196px] w-[305px] rotate-[-19deg] rounded-full border-[1.5px] border-dashed border-[#c4ae42] min-[651px]:top-[88px] min-[651px]:left-[74px] min-[651px]:h-[226px] min-[651px]:w-[385px]" />
          <div className="absolute top-[157px] left-[136px] z-[1] hidden h-[192px] w-[340px] rotate-[27deg] rounded-full border-[1.5px] border-dashed border-[#c4ae42] min-[651px]:block" />
          <div className="absolute top-[89px] left-1/2 z-[3] w-[212px] -translate-x-1/2 rotate-[-3deg] rounded-[21px] border border-[#f0ead8] bg-[#fffefa] p-[19px] shadow-[0_18px_28px_rgba(80,69,15,.14)] transition duration-500 group-hover:rotate-0 group-hover:scale-[1.03] min-[651px]:top-[114px] min-[651px]:w-[230px] min-[651px]:p-5">
            <span className="block text-[10px] font-extrabold uppercase tracking-[.8px] text-[#6d7c71]">Maya&apos;s learning map</span>
            <strong>Gravitation</strong>
            <div className="mt-[17px] flex justify-between text-[11px] font-bold text-[#587164]"><span>Understands force</span><b className="text-[#246946]">86%</b></div>
            <div className="my-2 h-[7px] overflow-hidden rounded-[9px] bg-[#e7ece3]"><i className="block h-full w-[86%] rounded-[inherit] bg-[#b8ebc9]" /></div>
            <div className="rounded-[10px] bg-[#ecf9ee] p-[10px] text-[11px] font-extrabold text-[#246043]">Next: why orbits work <span className="float-right">&rarr;</span></div>
          </div>
          <div className="absolute top-[270px] left-[22px] z-[4] rotate-[-7deg] rounded-[14px] bg-[#ded5ff] px-[13px] py-[11px] text-[#4a3a85] shadow-[0_7px_15px_rgba(53,69,45,.09)] [&>span]:block [&>span]:text-[11px] [&>span]:font-extrabold [&>small]:mt-[3px] [&>small]:block [&>small]:text-[10px]">History<small>Use a Galileo story</small></div>
          <div className="absolute top-[145px] left-[38px] z-[2] size-3 rounded-full border-2 border-[#246946] bg-[#ffd53d]" />
        </div>
      </section>

      <section id="how-it-works" className="bg-[#143d2b] py-[98px] text-[#f8f6e9] min-[921px]:py-[142px]">
        <div className="mx-auto max-w-[1240px] px-[22px] min-[921px]:px-10">
          <div className="max-w-[720px] [&>h2]:mt-[18px] [&>h2]:mb-5 [&>h2]:max-w-[750px] [&>h2]:text-[clamp(39px,5vw,64px)] [&>h2]:leading-[.95] [&>h2]:tracking-[-1.5px] min-[651px]:[&>h2]:tracking-[-3.7px] [&>p:last-child]:mt-[25px] [&>p:last-child]:max-w-[600px] [&>p:last-child]:text-[17px] [&>p:last-child]:leading-[1.6] [&>p:last-child]:text-[#cad8ce]">
            <p className="m-0 text-[11px] font-extrabold uppercase tracking-[1.25px] text-[#ffd53d]">Not a chat. A relationship.</p>
            <h2>A teacher who keeps paying attention.</h2>
            <p>Each session gives Faraday AI a clearer picture of one particular student, so the next lesson can feel a little more like it was made for them.</p>
          </div>
          <ol className="mt-[46px] grid list-none grid-cols-2 p-0 min-[651px]:mt-[58px] min-[651px]:grid-cols-3 min-[921px]:grid-cols-6 [&_li]:min-h-[205px] [&_li]:border-l [&_li]:border-white/20 [&_li]:p-[21px_14px] [&_li:nth-child(odd)]:border-l-0 min-[651px]:[&_li]:min-h-[237px] min-[651px]:[&_li]:p-[20px_16px_18px] min-[921px]:[&_li:first-child]:border-l-0 [&_h3]:mt-[34px] [&_h3]:mb-[10px] [&_h3]:text-[18px] [&_h3]:tracking-[-1px] min-[651px]:[&_h3]:mt-11 min-[651px]:[&_h3]:text-xl [&_p]:m-0 [&_p]:text-[13px] [&_p]:leading-[1.5] [&_p]:text-[#c6d3ca]">
            {learningLoop.map(([number, title, body]) => (
              <li key={number}><span className="text-xs font-extrabold text-[#ffd53d]">{number}</span><h3>{title}</h3><p>{body}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section id="for-students" className="mx-auto max-w-[1240px] px-[22px] py-[116px] min-[921px]:px-10 min-[921px]:py-[160px]">
        <div className="max-w-[720px] [&>h2]:mt-[18px] [&>h2]:mb-5 [&>h2]:text-[clamp(40px,5vw,65px)] [&>h2]:leading-[.95] [&>h2]:tracking-[-3.7px] [&_em]:font-[Georgia,serif] [&_em]:font-normal [&_em]:text-[#246946]">
          <p className="m-0 text-[11px] font-extrabold uppercase tracking-[1.25px] text-[#246946]">Your brain is not a blank profile</p>
          <h2>Faraday AI gets better at teaching <em>you.</em></h2>
        </div>
        <div className="mt-11 grid grid-cols-1 gap-6 min-[651px]:grid-cols-2 min-[921px]:mt-12 min-[921px]:grid-cols-4 min-[921px]:gap-4">
          {features.map((feature) => (
            <article className={`relative min-h-[276px] overflow-hidden rounded-[24px] border border-[#17352a]/10 p-[27px] transition hover:-translate-y-1 ${feature.accent === "yellow" ? "bg-[#ffd53d] text-[#4c3a09]" : feature.accent === "lilac" ? "bg-[#ded5ff] text-[#433179]" : feature.accent === "mint" ? "bg-[#b8ebc9] text-[#1e5e40]" : "bg-[#ffb69a] text-[#6e3c2c]"}`} key={feature.number}>
              <span className="absolute top-[22px] right-[23px] text-[11px] font-extrabold opacity-65">{feature.number}</span>
              <div className="relative mt-1 size-[67px] [&_i]:absolute [&_i]:block [&_i]:rounded-full [&_i]:border-2 [&_i]:border-current [&_i:nth-child(1)]:top-[6px] [&_i:nth-child(1)]:left-[6px] [&_i:nth-child(1)]:size-[53px] [&_i:nth-child(2)]:top-[23px] [&_i:nth-child(2)]:left-[23px] [&_i:nth-child(2)]:size-[18px] [&_i:nth-child(2)]:bg-current [&_i:nth-child(3)]:top-0 [&_i:nth-child(3)]:right-px [&_i:nth-child(3)]:size-[11px]" aria-hidden="true"><i /><i /><i /></div>
              <h3 className="mt-[61px] mb-3 max-w-[220px] text-[25px] leading-[1.02] tracking-[-1.5px]">{feature.title}</h3><p className="m-0 text-sm leading-[1.55] text-current/75">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-16 px-[22px] pt-1 pb-[118px] min-[921px]:grid-cols-[.82fr_1.18fr] min-[921px]:gap-[104px] min-[921px]:px-10 min-[921px]:pt-6 min-[921px]:pb-[168px]">
        <div className="[&>h2]:mt-[18px] [&>h2]:mb-5 [&>h2]:text-[clamp(38px,4.5vw,60px)] [&>h2]:leading-[.95] [&>h2]:tracking-[-3.5px] [&>p:last-child]:max-w-[470px] [&>p:last-child]:text-[17px] [&>p:last-child]:leading-[1.6] [&>p:last-child]:text-[#4c6559]">
          <p className="m-0 text-[11px] font-extrabold uppercase tracking-[1.25px] text-[#246946]">The same lesson. Your own way in.</p>
          <h2>One topic can open up in more than one direction.</h2>
          <p>Two students can study gravitation on the same day and meet completely different explanations. Faraday AI uses what they enjoy to make the idea stick.</p>
        </div>
        <div className="grid gap-6 min-[921px]:gap-5.5">
          <article className="relative min-h-70.5 overflow-hidden rounded-[24px] bg-[#f3e7b9] px-6 pt-[26px] pb-[132px] text-[#513d10] min-[651px]:min-h-[218px] min-[651px]:px-[28px] min-[651px]:pt-[27px] min-[651px]:pb-[25px] min-[651px]:pr-[188px]">
            <span className="inline-block rounded-full bg-white/55 px-[10px] py-[7px] text-[11px] font-extrabold">Aarav loves history</span><h3 className="mt-[18px] mb-2 max-w-[310px] text-[24px] leading-[1.03] tracking-[-1.3px]">Why did Galileo drop things from a tower?</h3>
            <p className="m-0 max-w-87.5 text-[13px] leading-normal">Faraday AI starts with a question from the past, then builds toward gravity.</p><div className="absolute right-[19px] bottom-0 h-[170px] w-[135px] opacity-80 [&_i]:absolute [&_i]:bottom-0 [&_i]:left-[39px] [&_i]:h-[148px] [&_i]:w-[55px] [&_i]:border-8 [&_i]:border-current [&_i]:border-t-0 [&_b]:absolute [&_b]:bottom-[102px] [&_b]:left-[19px] [&_b]:h-[10px] [&_b]:w-[95px] [&_b]:rotate-[-9deg] [&_b]:bg-current" aria-hidden="true"><i /><b /></div>
          </article>
          <article className="relative min-h-70.5 overflow-hidden rounded-[24px] bg-[#c7eed7] px-6 pt-[26px] pb-[132px] text-[#174f35] min-[651px]:min-h-[218px] min-[651px]:px-[28px] min-[651px]:pt-[27px] min-[651px]:pb-[25px] min-[651px]:pr-[188px]">
            <span className="inline-block rounded-full bg-white/55 px-[10px] py-[7px] text-[11px] font-extrabold">Nora loves chemistry</span><h3 className="mt-[18px] mb-2 max-w-[310px] text-[24px] leading-[1.03] tracking-[-1.3px]">What keeps particles and planets moving?</h3>
            <p className="m-0 max-w-87.5 text-[13px] leading-normal">Faraday AI starts with forces you cannot see, then connects them to orbit.</p><div className="absolute right-[19px] bottom-0 h-[170px] w-[135px] opacity-80 [&_i]:absolute [&_i]:top-[38px] [&_i]:left-[19px] [&_i]:h-[62px] [&_i]:w-[100px] [&_i]:rotate-[33deg] [&_i]:rounded-full [&_i]:border-4 [&_i]:border-current [&_b]:absolute [&_b]:top-[38px] [&_b]:left-[19px] [&_b]:h-[62px] [&_b]:w-[100px] [&_b]:rotate-[-33deg] [&_b]:rounded-full [&_b]:border-4 [&_b]:border-current" aria-hidden="true"><i /><b /></div>
          </article>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-16 px-[22px] pb-[118px] min-[921px]:grid-cols-[.9fr_1fr] min-[921px]:gap-[112px] min-[921px]:px-10 min-[921px]:pb-[170px]">
        <div className="relative h-[310px] overflow-hidden rounded-[31px] border border-[#d7dfcc] bg-[#f4f8ee] min-[651px]:h-[335px]" aria-hidden="true">
          <span className="absolute top-6 left-6 text-[11px] font-extrabold uppercase tracking-[.8px] text-[#587165]">A learning path that moves</span><div className="absolute top-[168px] left-[44px] w-[calc(100%-88px)] rotate-[-9deg] border-t-[3px] border-dashed border-[#7ca88d]" />
          <div className="absolute top-[120px] left-[25px] rounded-[14px] bg-[#ffd53d] px-[14px] py-3 text-[12px] font-extrabold text-[#56450c] shadow-[0_6px_0_rgba(34,85,57,.11)]">What you know</div><div className="absolute top-[210px] left-[31%] rounded-[14px] bg-[#ffb69a] px-[14px] py-3 text-[12px] font-extrabold text-[#6c3829] shadow-[0_6px_0_rgba(34,85,57,.11)]">A gap</div><div className="absolute top-[85px] right-5 rounded-[14px] bg-[#b8ebc9] px-[14px] py-3 text-[12px] font-extrabold text-[#1d5b3e] shadow-[0_6px_0_rgba(34,85,57,.11)]">Your next win</div>
          <div className="absolute top-[84px] left-[39%] text-[31px] font-bold text-[#246946]">+</div><div className="absolute right-[20%] bottom-11 text-[31px] font-bold text-[#8e6ae8]">*</div>
        </div>
        <div className="[&>h2]:mt-[18px] [&>h2]:mb-5 [&>h2]:max-w-[750px] [&>h2]:text-[clamp(38px,4.5vw,59px)] [&>h2]:leading-[.95] [&>h2]:tracking-[-3.4px] [&>p:last-child]:m-0 [&>p:last-child]:max-w-[500px] [&>p:last-child]:text-[17px] [&>p:last-child]:leading-[1.6] [&>p:last-child]:text-[#4c6559]"><p className="m-0 text-[11px] font-extrabold uppercase tracking-[1.25px] text-[#246946]">Personal, not complicated</p><h2>Faraday AI keeps the thread when school gets busy.</h2><p>It remembers where you were, what you were working through, and what helped last time. That means less starting over and more real progress.</p></div>
      </section>

      <section className="mx-auto max-w-[1240px] px-[22px] pb-[118px] min-[921px]:px-10 min-[921px]:pb-[160px]">
        <div className="mb-9 flex flex-col justify-between gap-4 min-[651px]:mb-11 min-[651px]:flex-row min-[651px]:items-end">
          <div className="max-w-[590px]"><p className="m-0 text-[11px] font-extrabold uppercase tracking-[1.25px] text-[#246946]">Made for real learning days</p><h2 className="mt-[18px] mb-0 text-[clamp(38px,4.6vw,61px)] leading-[.95] tracking-[-3.5px]">More curiosity. <em className="font-[Georgia,serif] font-normal text-[#246946]">Less guessing.</em></h2></div>
          <p className="max-w-[360px] text-[16px] leading-[1.6] text-[#4c6559]">A calm space for the questions, small discoveries, and confidence that keep learning moving.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 min-[651px]:grid-cols-[1.1fr_.9fr_.9fr] min-[651px]:gap-5">
          <article className="group relative col-span-2 h-[300px] overflow-hidden rounded-[26px] bg-[#d9efd8] min-[651px]:col-span-1 min-[651px]:h-[385px]"><div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(20,61,43,.72)),url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85')] bg-cover bg-center transition duration-700 group-hover:scale-105" /><div className="absolute inset-x-0 bottom-0 p-6 text-white"><p className="text-[11px] font-extrabold uppercase tracking-[1px] text-[#d6f6dc]">Find your way in</p><h3 className="mt-2 text-[28px] leading-none tracking-[-1.4px]">Ask the question you actually have.</h3></div></article>
          <article className="group relative h-[210px] overflow-hidden rounded-[26px] bg-[#ded5ff] min-[651px]:h-[385px]"><div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgba(52,38,101,.68)),url('https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=700&q=85')] bg-cover bg-center transition duration-700 group-hover:scale-105" /><div className="absolute inset-x-0 bottom-0 p-5 text-white"><p className="text-[11px] font-extrabold uppercase tracking-[1px] text-[#eeeaff]">Build the thread</p><h3 className="mt-2 text-[22px] leading-[1.02] tracking-[-1px]">Every lesson leads somewhere.</h3></div></article>
          <article className="group relative h-[210px] overflow-hidden rounded-[26px] bg-[#ffd53d] min-[651px]:h-[385px]"><div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgba(86,64,5,.64)),url('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=700&q=85')] bg-cover bg-center transition duration-700 group-hover:scale-105" /><div className="absolute inset-x-0 bottom-0 p-5 text-white"><p className="text-[11px] font-extrabold uppercase tracking-[1px] text-[#fff1a7]">Feel the progress</p><h3 className="mt-2 text-[22px] leading-[1.02] tracking-[-1px]">Small wins add up.</h3></div></article>
        </div>
      </section>

      <section id="pilot" className="relative mx-auto mb-[84px] grid w-[calc(100%-44px)] max-w-[1160px] overflow-hidden rounded-[30px] border border-[#dec254] bg-[#ffd53d] px-[22px] pt-[58px] pb-[58px] min-[651px]:mb-[92px] min-[651px]:grid-cols-[1fr_190px] min-[651px]:gap-[50px] min-[651px]:px-[30px] min-[651px]:pt-[69px] min-[651px]:pb-[69px] min-[921px]:mb-[110px] min-[921px]:grid-cols-[1fr_260px] min-[921px]:px-10 min-[921px]:pt-[86px] min-[921px]:pb-[86px]">
        <div className="relative z-[1] [&>h2]:mt-5 [&>h2]:mb-6 [&>h2]:max-w-[730px] [&>h2]:text-[clamp(39px,4.8vw,62px)] [&>h2]:leading-[.95] [&>h2]:tracking-[-3.4px] [&>p:last-of-type]:mb-8 [&>p:last-of-type]:max-w-[620px] [&>p:last-of-type]:text-[16px] [&>p:last-of-type]:leading-[1.55] [&>p:last-of-type]:text-[#614c10]">
          <p className="m-0 text-[11px] font-extrabold uppercase tracking-[1.25px] text-[#68520a]">First classrooms, first learning stories</p><h2>Help us build a teacher that grows with every student.</h2>
          <p>Faraday AI is getting ready for its first school pilot. We are building it carefully with students, teachers, and the moments when learning needs to feel more personal.</p><PilotCta className="!bg-[#143d2b] !text-white !shadow-[0_4px_0_#0b281b]" label="Follow the pilot" />
        </div>
        <div className="relative z-[1] hidden size-[186px] place-items-center rounded-full border-2 border-[#143d2b] text-center text-[#143d2b] min-[651px]:grid" aria-hidden="true"><div className="absolute inset-[11px] rounded-[inherit] border border-dashed border-[#143d2b]" /><span className="text-[25px] font-extrabold leading-[.94] tracking-[-1.4px]">Ready to<br />learn?</span><i className="absolute -top-[18px] right-[23px] text-[26px] not-italic">+</i><b className="absolute -bottom-[17px] left-[25px] text-[26px]">*</b></div>
      </section>

      <SiteFooter />
    </main>
  );
}

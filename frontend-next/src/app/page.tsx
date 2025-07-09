"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useModeStore } from "@/lib/useModeStore";

import dynamic from "next/dynamic";

import Hero from "@/components/Hero";
import DailyPoll from "@/components/DailyPoll";
import ModesGrid from "@/components/ModesGrid";
import Poll from "@/components/Poll";
import QuickPoll from "@/components/QuickPoll";
import QuickPollForm from "@/components/QuickPollForm";
import PollsHome from "@/components/PollsHome";
import WouldYouRather from "@/components/WouldYouRather"; // ✅ NY!
import PollsTabs from "@/components/PollsTabs";

const SpinTheWheel = dynamic(() => import("@/components/SpinTheWheel"), {
  ssr: false,
});

function HomePageInner() {
  const searchParams = useSearchParams();
  const pollId = searchParams.get("poll");
  const quickPollId = searchParams.get("quickpoll");
  const spinId = searchParams.get("id");
  const mode = searchParams.get("mode");

  const { activeMode } = useModeStore();

  return (
    <>
      {pollId ? (
        <Poll />
      ) : quickPollId ? (
        <QuickPoll />
      ) : activeMode === "quickpoll" ? (
        <QuickPollForm />
      ) : spinId || mode === "spin" || activeMode === "spin" ? (
        <SpinTheWheel />
      ) : activeMode === "wyr" || mode === "wyr" ? (
        <WouldYouRather /> // ✅ NYT: Viser Would You Rather form!
      ) : activeMode === "polls" ? (
        <PollsHome />
      ) : (
      <>
        <div className="w-full max-w-7xl mx-auto px-4 pb-8">
          <Hero />
        </div>

        {/* === Content Grid === */}
        <section className="
          w-full max-w-7xl mx-auto px-4
          grid grid-cols-1 md:grid-cols-3 
          gap-6 md:gap-8
          items-start justify-items-stretch
          pb-12
        ">
          {/* Trending Polls */}
          <section className="card bg-base-200 shadow rounded-box p-4 w-full max-w-[350px] min-h-[250px]">
            <PollsTabs />
          </section>

          {/* Modes Grid */}
          <section className="
            card bg-base-200 shadow rounded-box p-6
            w-full h-full
          ">
            <ModesGrid />
          </section>

          {/* Daily Poll */}
          <section className="
            card bg-base-200 shadow rounded-box p-6
            w-full h-full
          ">
            <DailyPoll />
          </section>
        </section>
      </>

      )}
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageInner />
    </Suspense>
  );
}

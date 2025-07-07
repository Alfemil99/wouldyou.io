"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useModeStore } from "@/lib/useModeStore";

import dynamic from "next/dynamic";

import Hero from "@/components/Hero";
import TrendingPolls from "@/components/TrendingPolls";
import DailyPoll from "@/components/DailyPoll";
import ModesGrid from "@/components/ModesGrid";
import Poll from "@/components/Poll";
import QuickPoll from "@/components/QuickPoll";
import QuickPollForm from "@/components/QuickPollForm";
import PollsHome from "@/components/PollsHome";

const SpinTheWheel = dynamic(() => import("@/components/SpinTheWheel"), { ssr: false });

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
      ) : activeMode === "polls" ? (
        <PollsHome />
      ) : (
        <>
          <div className="w-full max-w-7xl mx-auto px-4">
            <Hero />
          </div>

          <section className="w-full max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-start justify-items-center">
            <section className="card bg-base-200 shadow rounded-box p-4 w-full max-w-[350px] min-h-[250px]">
              <TrendingPolls />
            </section>
            <section className="card bg-base-200 shadow rounded-box p-4 w-full max-w-[350px] min-h-[250px]">
              <ModesGrid />
            </section>
            <section className="card bg-base-200 shadow rounded-box p-4 w-full max-w-[350px] min-h-[250px]">
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

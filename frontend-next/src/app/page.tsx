"use client";

import { useSearchParams } from "next/navigation";
import { useModeStore } from "@/lib/useModeStore";

import Hero from "@/components/Hero";
import TrendingPolls from "@/components/TrendingPolls";
import DailyPoll from "@/components/DailyPoll";
import ModesGrid from "@/components/ModesGrid";
import Poll from "@/components/Poll";
import QuickPoll from "@/components/QuickPoll";
import SpinTheWheel from "@/components/SpinTheWheel";
import CategoriesGrid from "@/components/CategoriesGrid";

export default function HomePage() {
  const searchParams = useSearchParams();
  const pollId = searchParams.get("poll");
  const quickPollId = searchParams.get("quickpoll");
  const spinId = searchParams.get("spin");

  const { activeMode } = useModeStore();

  return (
    <>
      {pollId ? (
        <Poll />
      ) : quickPollId || activeMode === "quickpoll" ? (
        <QuickPoll />
      ) : spinId || activeMode === "spin" ? (
        <SpinTheWheel />
      ) : activeMode === "polls" ? (
        <CategoriesGrid />
      ) : (
        <>
          {/* Hero intro */}
          <Hero />

          {/* 3-column Dashboard */}
          <section className="w-full max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-start justify-items-center">
            {/* Venstre: Trending Polls */}
            <section className="w-full max-w-[350px] mx-auto" style={{ minHeight: "300px" }}>
              <TrendingPolls />
            </section>

            {/* Midten: Modes */}
            <section className="w-full max-w-[350px] mx-auto" style={{ minHeight: "300px" }}>
              <ModesGrid />
            </section>

            {/* Højre: Daily Poll */}
            <section className="w-full max-w-[350px] mx-auto" style={{ minHeight: "300px" }}>
              <DailyPoll />
            </section>
          </section>
        </>
      )}
    </>
  );
}

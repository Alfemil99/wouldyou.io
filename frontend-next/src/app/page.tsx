"use client";

import { useSearchParams } from "next/navigation";
import { useModeStore } from "@/lib/useModeStore";

import dynamic from "next/dynamic";

import Hero from "@/components/Hero";
import TrendingPolls from "@/components/TrendingPolls";
import DailyPoll from "@/components/DailyPoll";
import ModesGrid from "@/components/ModesGrid";
import Poll from "@/components/Poll";
import QuickPoll from "@/components/QuickPoll";
import CategoriesGrid from "@/components/CategoriesGrid";

// Dynamic Spin to skip SSR window error
const SpinTheWheel = dynamic(() => import("@/components/SpinTheWheel"), { ssr: false });

export default function HomePage() {
  const searchParams = useSearchParams();
  const pollId = searchParams.get("poll");
  const quickPollId = searchParams.get("quickpoll");
  const spinId = searchParams.get("id");  // 👈 Korrekt param navn!
  const mode = searchParams.get("mode");  // 👈 Fanger mode

  const { activeMode } = useModeStore();

  return (
    <>
      {pollId ? (
        <Poll />
      ) : quickPollId || activeMode === "quickpoll" ? (
        <QuickPoll />
      ) : spinId || mode === "spin" || activeMode === "spin" ? (   // 👈 MATCH spinId ELLER ?mode=spin
        <SpinTheWheel />
      ) : activeMode === "polls" ? (
        <CategoriesGrid />
      ) : (
        <>
          <Hero />
          <section className="w-full max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-start justify-items-center">
            <section className="w-full max-w-[350px] mx-auto" style={{ minHeight: "300px" }}>
              <TrendingPolls />
            </section>
            <section className="w-full max-w-[350px] mx-auto" style={{ minHeight: "300px" }}>
              <ModesGrid />
            </section>
            <section className="w-full max-w-[350px] mx-auto" style={{ minHeight: "300px" }}>
              <DailyPoll />
            </section>
          </section>
        </>
      )}
    </>
  );
}

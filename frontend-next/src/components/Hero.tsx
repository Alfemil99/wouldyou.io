"use client";

import { useRouter } from "next/navigation";
import { useModeStore } from "@/lib/useModeStore";

export default function Hero() {
  const router = useRouter();
  const { setMode } = useModeStore();

  const handleStartPolling = () => {
    router.push("/?mode=polls");
    setMode("polls");
  };

  return (
    <section className="hero py-12 bg-base-100 text-center">
      <div className="hero-content flex flex-col items-center gap-6">
        <h1 className="text-4xl md:text-5xl font-bold">WOULDYOU.IO</h1>

        <p className="max-w-2xl text-base md:text-lg text-base-content/70">
          Create, share and vote on polls — from fun “Would You Rather”
          questions to trending topics and quick live polls. See what people
          really think — instantly!
        </p>

        <button
          onClick={handleStartPolling}
          className="btn btn-primary px-6"
        >
          🚀 Start Polling Now
        </button>

        {/* === Small feature cards === */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
          <div className="card bg-base-200 shadow rounded-box p-4">
            <h3 className="text-lg font-semibold mb-2">💡 Create Polls</h3>
            <p className="text-sm opacity-70">
              Make quick questions for your audience or friends. Share them in
              seconds.
            </p>
          </div>
          <div className="card bg-base-200 shadow rounded-box p-4">
            <h3 className="text-lg font-semibold mb-2">📈 Live Results</h3>
            <p className="text-sm opacity-70">
              Watch votes come in real-time and see trends and insights instantly.
            </p>
          </div>
          <div className="card bg-base-200 shadow rounded-box p-4">
            <h3 className="text-lg font-semibold mb-2">🔗 Share Anywhere</h3>
            <p className="text-sm opacity-70">
              Copy a link and spread your poll on social media, chat or anywhere.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

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
    <section className="hero py-2 bg-base-100 text-center">
      <div className="hero-content flex flex-col items-center gap-4">
        <h1 className="text-3xl md:text-4xl font-bold">WOULDYOU.IO</h1>

        <p className="max-w-2xl text-sm md:text-base text-base-content/70">
          Create, share and vote on polls — fun “Would You Rather”, trending topics,
          quick live polls. See what people really think — instantly!
        </p>

        <button
          onClick={handleStartPolling}
          className="btn btn-primary px-6"
        >
          🚀 Start Polling Now
        </button>

        {/* === Small feature cards === */}
        <div className="mt-2 flex flex-col sm:flex-row flex-wrap gap-3 w-full max-w-7xl justify-center">
          <div className="card bg-base-200 shadow rounded-box p-4 flex-1 max-w-[200px]">
            <h3 className="text-lg font-semibold mb-2">💡 Create Polls</h3>
            <p className="text-sm opacity-70">
              Make quick questions for your audience or friends. Share them in seconds.
            </p>
          </div>
          <div className="card bg-base-200 shadow rounded-box p-4 flex-1 max-w-[200px]">
            <h3 className="text-lg font-semibold mb-2">📈 Live Results</h3>
            <p className="text-sm opacity-70">
              Watch votes come in real-time and see trends and insights instantly.
            </p>
          </div>
          <div className="card bg-base-200 shadow rounded-box p-4 flex-1 max-w-[200px]">
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

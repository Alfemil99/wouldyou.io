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
    <section className="w-full py-4 text-center bg-base-100">
      <div className="w-full max-w-4xl mx-auto px-4 flex flex-col items-center gap-4">
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

        <div className="mt-2 flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 w-full">
          <div className="card bg-base-200 shadow rounded-box p-4 max-w-[220px] w-full sm:w-auto mx-auto">
            <h3 className="text-lg font-semibold mb-2">💡 Create Polls</h3>
            <p className="text-sm opacity-70">
              Make quick questions for your audience or friends. Share them in seconds.
            </p>
          </div>
          <div className="card bg-base-200 shadow rounded-box p-4 max-w-[220px] w-full sm:w-auto mx-auto">
            <h3 className="text-lg font-semibold mb-2">📈 Live Results</h3>
            <p className="text-sm opacity-70">
              Watch votes come in real-time and see trends and insights instantly.
            </p>
          </div>
          <div className="card bg-base-200 shadow rounded-box p-4 max-w-[220px] w-full sm:w-auto mx-auto">
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

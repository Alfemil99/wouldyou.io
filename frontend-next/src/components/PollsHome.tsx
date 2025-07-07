"use client";

import TrendingPolls from "@/components/TrendingPolls";
import LatestPolls from "@/components/LatestPolls";
import CategoriesGrid from "@/components/CategoriesGrid";
import SubmitPollFormModal from "@/components/SubmitPollFormModal";

export default function PollsHome() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-12 flex flex-col gap-12">
      {/* === Top Grid: Trending + Latest === */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card bg-base-200 border border-base-300 shadow rounded-box p-6">
          <TrendingPolls />
        </div>
        <div className="card bg-base-200 border border-base-300 shadow rounded-box p-6">
          <LatestPolls />
        </div>
      </div>

      {/* === Categories === */}
      <div className="card bg-base-200 border border-base-300 shadow rounded-box p-6">
        <CategoriesGrid />
      </div>

      {/* === Submit Poll === */}
      <div className="card bg-base-200 border border-base-300 shadow rounded-box p-6 mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Got a question? 🤔</h2>
        <SubmitPollFormModal />
      </div>
    </section>
  );
}

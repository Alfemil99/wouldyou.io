"use client";

import TrendingPolls from "@/components/TrendingPolls";
import LatestPolls from "@/components/LatestPolls";
import CategoriesGrid from "@/components/CategoriesGrid";
import SubmitPollFormModal from "@/components/SubmitPollFormModal";

export default function PollsHome() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-12 text-center">
      {/* Top grid: Trending + Latest */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 items-start">
        <div className="w-full max-w-md mx-auto">
          <TrendingPolls />
        </div>
        <div className="w-full max-w-md mx-auto">
          <LatestPolls />
        </div>
      </div>

      {/* Categories grid */}
      <CategoriesGrid />

      {/* CTA: Submit Poll Modal */}
      <div className="mt-12">
        <SubmitPollFormModal />
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import TrendingPolls from "./TrendingPolls";
import LatestPolls from "./LatestPolls";

export default function PollsTabs() {
  const [activeTab, setActiveTab] = useState<"trending" | "latest">("trending");

  return (
    <section className="w-full max-w-md mx-auto">
      {/* Tabs header */}
      <div className="tabs tabs-boxed mb-4">
        <a
          role="tab"
          className={`tab ${activeTab === "trending" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("trending")}
        >
          🔥 Trending
        </a>
        <a
          role="tab"
          className={`tab ${activeTab === "latest" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("latest")}
        >
          🆕 Latest
        </a>
      </div>

      {/* Tab content */}
      <div className="w-full">
        {activeTab === "trending" && <TrendingPolls />}
        {activeTab === "latest" && <LatestPolls />}
      </div>
    </section>
  );
}

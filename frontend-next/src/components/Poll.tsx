"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import socket from "@/lib/socket";
import { useModeStore } from "@/lib/useModeStore";
import TrendingPolls from "@/components/TrendingPolls";
import SubmitPollFormModal from "@/components/SubmitPollFormModal";

interface PollOption {
  text: string;
  votes: number;
}

interface PollData {
  _id: string;
  question_text: string;
  options: PollOption[];
  category: string;
}

const colors = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-pink-500",
];

export default function Poll() {
  const [poll, setPoll] = useState<PollData | null>(null);
  const [voted, setVoted] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const pollId = searchParams.get("poll");
  const { setMode } = useModeStore();

  // === Load poll by ID ===
  useEffect(() => {
    if (pollId) {
      socket.emit("get-poll-by-id", { pollId });
    }

    const handlePollData = (data: PollData | null) => {
      if (data) {
        setPoll(data);
        setActiveCategory(data.category);
        setVoted(false);
      } else {
        setPoll(null);
      }
    };

    socket.on("poll-data", handlePollData);

    return () => {
      socket.off("poll-data", handlePollData);
    };
  }, [pollId]);

  const handleVote = (index: number) => {
    if (!poll || voted) return;

    socket.emit("vote", { pollId: poll._id, optionIndex: index });

    socket.once("vote-result", (result: PollData) => {
      setPoll(result);
      setVoted(true);
    });
  };

  const getPercent = (votes: number) => {
    if (!poll) return 0;
    const total = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
    return total ? Math.round((votes / total) * 100) : 0;
  };

  const copyLink = () => {
    if (!poll) return;
    const url = `${window.location.origin}/?poll=${poll._id}`;
    navigator.clipboard.writeText(url).then(() => alert("✅ Link copied!"));
  };

  const goBack = () => {
    setMode("polls");
    window.history.pushState(null, "", "/?mode=polls");
  };

  const nextPoll = () => {
    if (activeCategory) {
      socket.emit("get-random-poll", { category: activeCategory });
    }
  };

  if (!pollId) return <p className="text-center py-12">No poll ID provided.</p>;
  if (!poll) return <p className="text-center py-12">Poll not found.</p>;

  return (
    <section className="w-full max-w-lg mx-auto px-4 py-8 text-center">
      {/* === Poll Card === */}
      <div className="card bg-base-200 shadow rounded-box p-8 flex flex-col gap-6">
        <h2 className="text-xl md:text-2xl font-bold text-center leading-tight">
          {poll.question_text}
        </h2>

        <div className="flex flex-col gap-3 w-full">
          {poll.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleVote(idx)}
              disabled={voted}
              className={`relative btn btn-block justify-start text-white ${colors[idx % colors.length]}`}
            >
              <div
                className="absolute inset-0 bg-black bg-opacity-20 rounded-box"
                style={{
                  width: voted ? `${getPercent(opt.votes)}%` : "0%",
                  transition: "width 0.5s ease",
                }}
              />
              <span className="relative z-10 font-medium">
                {opt.text}{" "}
                {voted && `– ${getPercent(opt.votes)}% (${opt.votes} votes)`}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* === Poll Navigation === */}
      <div className="flex flex-wrap gap-2 mt-4 justify-center flex-nowrap">
        <button onClick={goBack} className="btn btn-sm btn-ghost">
          ← Back to Polls
        </button>
        <button onClick={copyLink} className="btn btn-sm btn-outline">
          🔗 Share
        </button>
        <button onClick={nextPoll} className="btn btn-sm btn-primary">
          → Next Poll
        </button>
      </div>

      {/* === CTA: Submit Your Own Poll === */}
      <div className="mt-6">
        <SubmitPollFormModal category={activeCategory || ""} />
      </div>

      {/* === Trending Polls === */}
      {activeCategory && (
        <div className="mt-8">
          <TrendingPolls category={activeCategory} />
        </div>
      )}
    </section>
  );
}

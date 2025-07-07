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

export default function Poll() {
  const [poll, setPoll] = useState<PollData | null>(null);
  const [voted, setVoted] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [relatedPolls, setRelatedPolls] = useState<PollData[]>([]);

  const searchParams = useSearchParams();
  const pollId = searchParams.get("poll");
  const { resetMode } = useModeStore();

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

  // === Load related polls ===
  useEffect(() => {
    if (activeCategory) {
      socket.emit("get-random-polls", { category: activeCategory, size: 5 });

      const handleRelated = (polls: PollData[]) => {
        setRelatedPolls(polls);
      };

      socket.on("related-polls", handleRelated);

      return () => {
        socket.off("related-polls", handleRelated);
      };
    }
  }, [activeCategory]);

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
    resetMode();
    window.history.pushState(null, "", "/");
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
      {/* Poll Navigation */}
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        <button
          onClick={goBack}
          className="px-3 py-2 rounded-full border border-white/20 bg-white/10 text-sm hover:bg-primary/20 transition"
        >
          ← Back
        </button>
        <button
          onClick={copyLink}
          className="px-3 py-2 rounded-full border border-white/20 bg-white/10 text-sm hover:bg-primary/20 transition"
        >
          🔗 Share
        </button>
        <button
          onClick={nextPoll}
          className="px-3 py-2 rounded-full border border-white/20 bg-white/10 text-sm hover:bg-primary/20 transition"
        >
          → Next Poll
        </button>
      </div>

      {/* Poll Card */}
      <div className="rounded-2xl border border-white/20 bg-white/10 p-4 md:p-6 flex flex-col gap-3 items-center text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-2">
          {poll.question_text}
        </h2>

        <div className="w-full flex flex-col gap-3">
          {poll.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleVote(idx)}
              disabled={voted}
              className="relative w-full px-4 py-2 rounded-full border border-white/20 bg-white/10 text-sm overflow-hidden transition hover:bg-primary/20"
            >
              <div
                className="absolute inset-0 bg-primary/50 transition-all"
                style={{ width: voted ? `${getPercent(opt.votes)}%` : "0%" }}
              />
              <span className="relative z-10 font-medium">
                {opt.text}{" "}
                {voted &&
                  `– ${getPercent(opt.votes)}% (${opt.votes} votes)`}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* CTA: Submit Your Own Poll */}
      <div className="mt-6">
        <SubmitPollFormModal category={activeCategory || ""} />
      </div>

      {/* Related Polls */}
      {relatedPolls.length > 0 && (
        <div className="mt-8">
          <h3 className="text-base font-semibold mb-2">
            Other polls in {activeCategory}
          </h3>
          <div className="flex overflow-x-auto gap-2">
            {relatedPolls.map((preview) => (
              <button
                key={preview._id}
                onClick={() => {
                  window.history.pushState(null, "", `/?poll=${preview._id}`);
                  socket.emit("get-poll-by-id", { pollId: preview._id });
                }}
                className="min-w-[180px] p-3 rounded-lg border border-white/10 bg-white/5 text-sm hover:bg-primary/10 transition"
              >
                {preview.question_text.slice(0, 50)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Trending Polls */}
      {activeCategory && (
        <div className="mt-8">
          <TrendingPolls category={activeCategory} />
        </div>
      )}
    </section>
  );
}

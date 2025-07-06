"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import socket from "@/lib/socket";
import { useModeStore } from "@/lib/useModeStore";

interface PollOption {
  text: string;
  votes: number;
}

interface PollData {
  _id: string;
  question_text: string;
  options: PollOption[];
}

export default function Poll() {
  const [poll, setPoll] = useState<PollData | null>(null);
  const [voted, setVoted] = useState(false);

  const searchParams = useSearchParams();
  const pollId = searchParams.get("poll");

  const { resetMode } = useModeStore();

  useEffect(() => {
    if (pollId) {
      socket.emit("get-poll-by-id", { pollId });
    }

    socket.on("poll-data", (data: PollData | null) => {
      if (data) {
        setPoll(data);
        setVoted(false);
      } else {
        setPoll(null);
      }
    });

    return () => {
      socket.off("poll-data");
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
    resetMode();
    window.history.pushState(null, "", "/");
  };

  if (!pollId) return <p className="text-center">No poll ID provided.</p>;
  if (!poll) return <p className="text-center">Poll not found.</p>;

  return (
    <section className="col-span-12 md:col-span-8 md:col-start-3 py-12">
      <button
        onClick={goBack}
        className="mb-4 px-4 py-2 rounded-full border border-white/20 bg-white/10 backdrop-blur hover:bg-primary/20 transition"
      >
        ← Back
      </button>

      <div className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-lg p-8 shadow-xl">
        <h2 className="text-3xl font-extrabold mb-6 tracking-tight">{poll.question_text}</h2>

        <div className="flex flex-col gap-4 mb-6">
          {poll.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleVote(idx)}
              disabled={voted}
              className="relative w-full px-6 py-4 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-left overflow-hidden transition hover:bg-primary/20"
            >
              <div
                className="absolute inset-0 bg-primary/50 transition-all"
                style={{
                  width: voted ? `${getPercent(opt.votes)}%` : "0%",
                }}
              />
              <span className="relative z-10 font-medium">
                {opt.text} {voted && `– ${getPercent(opt.votes)}% (${opt.votes} votes)`}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={copyLink}
          className="px-6 py-3 rounded-full border border-white/20 bg-white/10 backdrop-blur hover:bg-primary/20 transition"
        >
          🔗 Share Poll
        </button>
      </div>
    </section>
  );
}

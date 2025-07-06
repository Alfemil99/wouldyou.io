"use client";

import { useEffect, useState } from "react";
import socket from "@/lib/socket";

interface PollOption {
  text: string;
  votes: number;
}

interface Poll {
  _id: string;
  question_text: string;
  options: PollOption[];
}

export default function DailyPoll() {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    socket.emit("get-daily-poll");
    socket.on("daily-poll", (data: Poll) => {
      setPoll(data);
      setVoted(false);
    });

    return () => {
      socket.off("daily-poll");
    };
  }, []);

  const handleVote = (optionIndex: number) => {
    if (!poll || voted) return;

    socket.emit("vote", { pollId: poll._id, optionIndex });

    socket.once("vote-result", (result: Poll) => {
      setPoll(result);
      setVoted(true);
    });
  };

  const getPercent = (votes: number) => {
    if (!poll) return 0;
    const total = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
    return total ? Math.round((votes / total) * 100) : 0;
  };

  if (!poll) {
    return (
      <section className="w-full max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          📅 Daily Poll
        </h2>
        <p>No daily poll today!</p>
      </section>
    );
  }

  return (
    <section className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        📅 Daily Poll
      </h2>

      <div
        className="rounded-2xl border border-base-300 bg-base-200 p-6 shadow flex flex-col gap-4"
        style={{ minHeight: "250px" }}
      >
        <h3 className="text-lg font-semibold">{poll.question_text}</h3>
        {poll.options.map((opt, idx) => (
          <button
            key={idx}
            disabled={voted}
            onClick={() => handleVote(idx)}
            className="relative w-full px-4 py-3 rounded-full border border-base-300 bg-base-100 text-left overflow-hidden transition hover:bg-primary/20"
          >
            <div
              className="absolute inset-0 bg-primary/50 transition-all"
              style={{
                width: voted ? `${getPercent(opt.votes)}%` : "0%",
              }}
            />
            <span className="relative z-10 font-medium">
              {opt.text}{" "}
              {voted &&
                `– ${getPercent(opt.votes)}% (${opt.votes} votes)`}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

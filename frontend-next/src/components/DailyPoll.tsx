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
  options?: PollOption[];
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

export default function DailyPoll() {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    socket.emit("get-daily-poll");
    socket.on("daily-poll", (data: Poll | null) => {
      setPoll(data);
      setVoted(false);
    });

    return () => {
      socket.off("daily-poll");
    };
  }, []);

  const handleVote = (optionIndex: number) => {
    if (!poll || !poll.options || voted) return;

    socket.emit("vote", { pollId: poll._id, optionIndex });

    socket.once("vote-result", (result: Poll) => {
      setPoll(result);
      setVoted(true);
    });
  };

  const getPercent = (votes: number) => {
    if (!poll || !poll.options) return 0;
    const total = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
    return total ? Math.round((votes / total) * 100) : 0;
  };

  if (!poll || !poll.options || poll.options.length === 0) {
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

      <div className="card bg-base-200 shadow rounded-box p-6 flex flex-col gap-4 min-h-[250px]">
        <h3 className="text-lg font-semibold">{poll.question_text}</h3>

        {poll.options.map((opt, idx) => (
          <button
            key={idx}
            disabled={voted}
            onClick={() => handleVote(idx)}
            className={`relative w-full text-left btn text-white ${colors[idx % colors.length]} transition`}
          >
            <div
              className="absolute inset-0 bg-black bg-opacity-20 rounded-box"
              style={{
                width: voted ? `${getPercent(opt.votes)}%` : "0%",
                transition: "width 0.5s ease",
              }}
            />
            <span className="relative z-10">
              {opt.text}{" "}
              {voted && `– ${getPercent(opt.votes)}% (${opt.votes} votes)`}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

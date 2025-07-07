"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import socket from "@/lib/socket";
import { useModeStore } from "@/lib/useModeStore";

interface PollOption {
  text: string;
  votes: number;
}

interface QuickPollData {
  _id?: string;
  question_text: string;
  options: PollOption[];
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

export default function QuickPoll() {
  const [poll, setPoll] = useState<QuickPollData | null>(null);
  const [voted, setVoted] = useState(false);

  const searchParams = useSearchParams();
  const quickPollId = searchParams.get("quickpoll");
  const { resetMode } = useModeStore();

  useEffect(() => {
    if (quickPollId) {
      socket.emit("join-quickpoll", { pollId: quickPollId });
      socket.emit("get-quickpoll-by-id", { pollId: quickPollId });
    }

    socket.on("quickpoll-data", (data: QuickPollData | null) => {
      if (data) setPoll(data);
      else setPoll(null);
    });

    return () => {
      socket.emit("leave-quickpoll", { pollId: quickPollId });
      socket.off("quickpoll-data");
    };
  }, [quickPollId]);

  const handleVote = (index: number) => {
    if (!poll || voted) return;
    socket.emit("vote-quickpoll", { pollId: poll._id, optionIndex: index });
    setVoted(true);
  };

  const getPercent = (votes: number) => {
    if (!poll) return 0;
    const total = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
    return total ? Math.round((votes / total) * 100) : 0;
  };

  const goBack = () => {
    resetMode();
    window.history.pushState(null, "", "/");
  };

  if (!quickPollId) return <p className="text-center mt-10">No QuickPoll ID provided.</p>;
  if (!poll) return <p className="text-center mt-10">QuickPoll not found or expired.</p>;

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <div className="w-full max-w-lg bg-base-200 p-8 rounded-box shadow">
        <button onClick={goBack} className="btn btn-sm btn-ghost mb-4">
          ← Back
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">{poll.question_text}</h2>

        <div className="flex flex-col gap-4">
          {poll.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleVote(idx)}
              disabled={voted}
              className={`btn relative text-white ${colors[idx % colors.length]} transition-all`}
            >
              <div
                className="absolute top-0 left-0 h-full bg-black bg-opacity-20 rounded-box"
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
      </div>
    </div>
  );
}

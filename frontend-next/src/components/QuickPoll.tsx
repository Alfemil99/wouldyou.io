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

const colors = ["#B71C1C", "#8D6E63", "#616161", "#4CAF50", "#2196F3", "#FFC107", "#FF5722"];

export default function QuickPoll() {
  const [poll, setPoll] = useState<QuickPollData | null>(null);
  const [voted, setVoted] = useState(false);

  const searchParams = useSearchParams();
  const quickPollId = searchParams.get("quickpoll");
  const { resetMode } = useModeStore();

  // Load QuickPoll
  useEffect(() => {
    if (quickPollId) {
      console.log(`🔗 Loading QuickPoll: ${quickPollId}`);
      socket.emit("get-quickpoll-by-id", { pollId: quickPollId });
    }

    socket.on("quickpoll-data", (data: QuickPollData | null) => {
      console.log("📥 QuickPoll loaded:", data);
      if (data) {
        setPoll(data);
        setVoted(false);
      } else {
        setPoll(null);
      }
    });

    return () => {
      socket.off("quickpoll-data");
    };
  }, [quickPollId]);

  const handleVote = (index: number) => {
    if (!poll || voted) return;
    socket.emit("vote", { pollId: poll._id, optionIndex: index });

    socket.once("vote-result", (result: QuickPollData) => {
      console.log("📊 QuickPoll vote result:", result);
      setPoll(result);
      setVoted(true);
    });
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

  if (!quickPollId) return <p>No QuickPoll ID provided.</p>;
  if (!poll) return <p>QuickPoll not found or expired.</p>;

  return (
    <section className="py-8">
      <button
        onClick={goBack}
        className="mb-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
      >
        ← Back
      </button>

      <h2 className="text-2xl font-bold mb-4">{poll.question_text}</h2>
      <div className="flex flex-col gap-4 mb-6">
        {poll.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleVote(idx)}
            disabled={voted}
            className="relative text-left p-3 rounded text-white overflow-hidden"
            style={{ backgroundColor: colors[idx % colors.length] }}
          >
            <div
              className="absolute top-0 left-0 h-full bg-black bg-opacity-20"
              style={{
                width: voted ? `${getPercent(opt.votes)}%` : "0%",
                transition: "width 0.5s ease"
              }}
            />
            <span className="relative z-10">
              {opt.text} {voted && `– ${getPercent(opt.votes)}% (${opt.votes} votes)`}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import socket from "@/lib/socket";
import SubmitWYRFormModal from "./SubmitWYRFormModal";

interface WYR {
  _id: string;
  question_text: string;
  optionA: { text: string; votes: number };
  optionB: { text: string; votes: number };
}

export default function WouldYouRather() {
  const [wyr, setWYR] = useState<WYR | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [voted, setVoted] = useState(false);
  const [selected, setSelected] = useState<"A" | "B" | null>(null);

  // === JOIN ROOM + GET ===
  useEffect(() => {
    socket.emit("join-wyr");
    socket.emit("get-random-wyr");

    const handleWYR = (data: any) => {
      console.log("✅ New WYR:", data);
      if (data?.wyr) {
        setWYR(data.wyr);
        setStartedAt(data.startedAt);
        setVoted(false);
        setSelected(null);
      }
    };

    const handleResult = (updated: WYR) => {
      setWYR(updated);
    };

    socket.on("wyr-data", handleWYR);
    socket.on("wyr-result", handleResult);

    return () => {
      socket.off("wyr-data", handleWYR);
      socket.off("wyr-result", handleResult);
    };
  }, []);

  // === Synced countdown ===
  useEffect(() => {
    const interval = setInterval(() => {
      if (startedAt) {
        const elapsed = Math.floor((Date.now() - startedAt) / 1000);
        const remaining = Math.max(0, 10 - elapsed);
        setTimeLeft(remaining);

        if (elapsed >= 15) {
          socket.emit("get-random-wyr");
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  const handleVote = (option: "A" | "B") => {
    if (!wyr || voted) return;

    socket.emit("vote-wyr", { wyrId: wyr._id, option });
    setSelected(option);
    setVoted(true);
  };

  const getPercent = (votes: number) => {
    if (!wyr) return 0;
    const total = wyr.optionA.votes + wyr.optionB.votes;
    return total ? Math.round((votes / total) * 100) : 0;
  };

  const share = () => {
    const url = `${window.location.origin}/?wyr=${wyr?._id}`;
    navigator.clipboard.writeText(url).then(() =>
      alert(`✅ Link copied:\n${url}`)
    );
  };

  if (!wyr) return <p className="text-center py-12">Loading...</p>;

  return (
    <section className="flex justify-center items-center min-h-[80vh]">
      <div className="card bg-base-200 shadow-xl p-8 w-full max-w-lg text-center space-y-6">
        <h2 className="text-2xl font-bold">{wyr.question_text}</h2>

        <div className="text-center">
          <span className="font-semibold">⏳ </span>
          <span className="countdown text-xl">
            <span style={{ "--value": timeLeft } as React.CSSProperties} />
            s
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {["A", "B"].map((opt) => {
            const option = opt === "A" ? wyr.optionA : wyr.optionB;
            const percent = getPercent(option.votes);

            return (
              <button
                key={opt}
                onClick={() => handleVote(opt as "A" | "B")}
                disabled={voted}
                className={`relative btn h-20 text-white ${
                  opt === "A" ? "bg-red-500" : "bg-blue-500"
                }`}
              >
                {/* Progress fill */}
                {selected && (
                  <div
                    className={`absolute left-0 top-0 h-full ${
                      opt === "A" ? "bg-black/20" : "bg-black/20"
                    }`}
                    style={{
                      width: `${percent}%`,
                      transition: "width 0.5s ease",
                    }}
                  />
                )}
                <span className="relative z-10 font-semibold text-lg">
                  {option.text}
                  {selected && ` — ${percent}% (${option.votes} votes)`}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <button onClick={share} className="btn btn-outline btn-sm">
            🔗 Share
          </button>
          <SubmitWYRFormModal />
        </div>
      </div>
    </section>
  );
}

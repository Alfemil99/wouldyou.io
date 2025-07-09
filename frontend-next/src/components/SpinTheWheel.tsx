"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import socket from "@/lib/socket";
import { useSearchParams } from "next/navigation";

// Dynamic import for SSR-safe roulette
const Wheel = dynamic(
  () => import("react-custom-roulette").then((mod) => mod.Wheel),
  { ssr: false }
);

export default function SpinTheWheel() {
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const spinId = searchParams.get("id");

  // Load wheel from DB if ID is set
  useEffect(() => {
    if (spinId) {
      socket.emit("get-spin-by-id", { spinId });
      socket.once("spinwheel-data", (wheel) => {
        if (wheel) {
          setOptions(wheel.items || []);
        } else {
          alert("The wheel does not exist or has expired.");
        }
      });
    }
  }, [spinId]);

  const data =
    options.length >= 2
      ? options.map((opt) => ({ option: opt }))
      : [];

  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newOption.trim();
    if (trimmed && options.length < 20 && !options.includes(trimmed)) {
      setOptions([...options, trimmed]);
      setNewOption("");
    }
  };

  const handleRemoveOption = (option: string) => {
    setOptions(options.filter((opt) => opt !== option));
  };

  const handleSpinClick = () => {
    if (data.length < 2) {
      alert("Please add at least 2 options to spin!");
      return;
    }
    const newPrizeNumber = Math.floor(Math.random() * data.length);
    setPrizeNumber(newPrizeNumber);
    setMustSpin(true);
  };

  const handleSaveWheel = () => {
    if (data.length < 2) {
      alert("Please add at least 2 options to save!");
      return;
    }
    socket.emit("submit-spinwheel", { items: options });
    socket.once("spinwheel-created", ({ id }) => {
      const shareLink = `${window.location.origin}/?mode=spin&id=${id}`;
      navigator.clipboard.writeText(shareLink).then(() => {
        alert(`✅ Your wheel is saved for 1 hour!\nLink copied:\n${shareLink}`);
      });
    });
  };

  return (
    <section className="w-full min-h-screen flex flex-col items-center justify-center text-center p-4">
      <h2 className="text-3xl font-bold mb-4">🎡 Spin the Wheel</h2>

      <form onSubmit={handleAddOption} className="flex flex-wrap gap-2 mb-4 max-w-md">
        <input
          type="text"
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          placeholder="Enter an option"
          className="input input-bordered flex-grow"
        />
        <button type="submit" className="btn btn-primary">
          Add
        </button>
      </form>

      <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-md">
        {options.map((opt) => (
          <div
            key={opt}
            className="px-3 py-1 bg-base-200 rounded-full flex items-center gap-2"
          >
            <span>{opt}</span>
            <button
              onClick={() => handleRemoveOption(opt)}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {data.length >= 2 && (
        <div className="mb-6">
          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={data}
            onStopSpinning={() => {
              setMustSpin(false);
              setWinner(options[prizeNumber]);
            }}
          />
        </div>
      )}

      {data.length < 2 && (
        <p className="opacity-70 mb-6">Please add at least 2 options to spin!</p>
      )}

      <div className="flex gap-4">
        <button onClick={handleSpinClick} className="btn btn-accent">
          SPIN!
        </button>
        <button onClick={handleSaveWheel} className="btn btn-outline btn-primary">
          💾 Save & Share
        </button>
      </div>

      {winner && (
        <div className="mt-4 text-xl font-bold">
          🎉 Winner: {winner}
        </div>
      )}
    </section>
  );
}

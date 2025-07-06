"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import socket from "@/lib/socket";
import { useSearchParams } from "next/navigation";

// Dynamically import Wheel to skip SSR window error
const Wheel = dynamic(() => import("react-custom-roulette").then(mod => mod.Wheel), { ssr: false });

export default function SpinTheWheel() {
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);

  const searchParams = useSearchParams();
  const spinId = searchParams.get("id");

  // Load wheel from DB if spinId exists
  useEffect(() => {
    if (spinId) {
      socket.emit("get-spin-by-id", { spinId });
      socket.once("spinwheel-data", (wheel) => {
        if (wheel) {
          setOptions(wheel.items);
        } else {
          alert("Hjulet findes ikke længere eller er udløbet.");
        }
      });
    }
  }, [spinId]);

  const data = options.map((opt) => ({ option: opt }));

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
    if (options.length === 0) return;
    const newPrizeNumber = Math.floor(Math.random() * options.length);
    setPrizeNumber(newPrizeNumber);
    setMustSpin(true);
  };

  const handleSaveWheel = () => {
    if (options.length < 2) {
      alert("Tilføj mindst 2 valgmuligheder for at gemme hjulet.");
      return;
    }
    socket.emit("submit-spinwheel", { items: options });
    socket.once("spinwheel-created", ({ id }) => {
      const shareLink = `${window.location.origin}/?mode=spin&id=${id}`;
      navigator.clipboard.writeText(shareLink);
      alert(`Dit hjul er gemt i 1 time!\nLinket er kopieret:\n${shareLink}`);
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
          placeholder="Indtast en valgmulighed"
          className="input input-bordered flex-grow"
        />
        <button type="submit" className="btn btn-primary">
          Tilføj
        </button>
      </form>

      {/* Chips */}
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

      {options.length > 0 && (
        <>
          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={data}
            backgroundColors={["#FFDEDE", "#FFF5DE", "#DEFFEB", "#DEF1FF"]}
            textColors={["#000"]}
            onStopSpinning={() => setMustSpin(false)}
          />

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSpinClick}
              className="btn btn-accent"
            >
              SPIN!
            </button>
            <button
              onClick={handleSaveWheel}
              className="btn btn-secondary"
            >
              Gem & Del
            </button>
          </div>

          {!mustSpin && options[prizeNumber] && (
            <div className="mt-4 text-xl font-bold">
              🎉 Vinderen er: {options[prizeNumber]}
            </div>
          )}
        </>
      )}

      {options.length === 0 && (
        <p className="text-neutral-content">
          Tilføj op til 20 valgmuligheder for at dreje hjulet!
        </p>
      )}
    </section>
  );
}

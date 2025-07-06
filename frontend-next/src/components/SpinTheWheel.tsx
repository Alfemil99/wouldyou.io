"use client";

import { useState } from "react";
import { Wheel } from "react-custom-roulette";

export default function SpinTheWheel() {
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);

  const data = options.map((opt) => ({ option: opt }));

  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newOption.trim();
    if (trimmed && options.length < 20) {
      setOptions([...options, trimmed]);
      setNewOption("");
    }
  };

  const handleSpinClick = () => {
    if (options.length === 0) return;
    const newPrizeNumber = Math.floor(Math.random() * options.length);
    setPrizeNumber(newPrizeNumber);
    setMustSpin(true);
  };

  return (
    <section className="w-full max-w-md mx-auto text-center">
      <h2 className="text-2xl font-bold mb-4">🎡 Spin the Wheel</h2>

      <form onSubmit={handleAddOption} className="flex gap-2 mb-4">
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

          <button
            onClick={handleSpinClick}
            className="btn btn-accent mt-4"
          >
            SPIN!
          </button>

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

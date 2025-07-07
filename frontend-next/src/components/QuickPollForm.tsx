"use client";

import { useState } from "react";
import socket from "@/lib/socket";
import { useModeStore } from "@/lib/useModeStore";

export default function QuickPollForm() {
  const { resetMode } = useModeStore();

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");
  const [ttl, setTtl] = useState(60); // default: 60 min

  const addOption = () => {
    const trimmed = newOption.trim();
    if (trimmed && options.length < 10) {
      setOptions([...options, trimmed]);
      setNewOption("");
    }
  };

  const handleSubmit = () => {
    if (!question || options.length < 2) {
      alert("Please fill out all fields and add at least 2 options.");
      return;
    }

    socket.emit("submit-quickpoll", {
      question_text: question,
      options,
      ttlMinutes: ttl,
    });

    socket.once("quickpoll-created", ({ id }) => {
      const url = `${window.location.origin}/?quickpoll=${id}`;
      navigator.clipboard.writeText(url).then(() => {
        alert(`✅ QuickPoll created!\nLink copied:\n${url}`);
        resetMode();
        window.location.href = `/?quickpoll=${id}`;
      });
    });
  };

  return (
    <section className="flex justify-center items-center min-h-[80vh] px-4">
      <div className="card bg-base-200 shadow rounded-box p-8 w-full max-w-lg">
        <h2 className="text-3xl font-bold mb-6 text-center">
          🕒 Create Quick Poll
        </h2>

        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Question</span>
          </label>
          <input
            type="text"
            placeholder="Your question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Add Option</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Option text..."
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              className="input input-bordered flex-grow"
            />
            <button onClick={addOption} className="btn btn-primary">
              Add
            </button>
          </div>
        </div>

        {options.length > 0 && (
          <div className="mb-6">
            <label className="label">
              <span className="label-text">Your Options</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {options.map((opt, idx) => (
                <div
                  key={idx}
                  className="badge badge-lg gap-2 bg-base-100 border border-base-300 cursor-pointer"
                >
                  {opt}
                  <button
                    onClick={() =>
                      setOptions(options.filter((_, i) => i !== idx))
                    }
                    className="ml-1 text-error"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="form-control mb-6">
          <label className="label">
            <span className="label-text">Expires after (minutes)</span>
          </label>
          <input
            type="number"
            min="5"
            max="1440"
            value={ttl}
            onChange={(e) => setTtl(Number(e.target.value))}
            className="input input-bordered w-full"
          />
        </div>

        <button onClick={handleSubmit} className="btn btn-success w-full">
          ✅ Submit & Copy Link
        </button>
      </div>
    </section>
  );
}

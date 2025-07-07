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
        alert(`✅ QuickPoll created!\nLink copied to clipboard:\n${url}`);
        resetMode();
        window.location.href = `/?quickpoll=${id}`;
      });
    });
  };

  return (
    <section className="py-8">
      <h2 className="text-3xl font-bold mb-4">🕒 Create Quick Poll</h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full p-3 rounded bg-neutral-800 text-white mb-2"
        />

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add option..."
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            className="flex-grow p-3 rounded bg-neutral-800 text-white"
          />
          <button
            onClick={addOption}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Add
          </button>
        </div>
      </div>

      <ul className="mb-4">
        {options.map((opt, idx) => (
          <li key={idx} className="bg-neutral-700 p-2 rounded mb-1">{opt}</li>
        ))}
      </ul>

      <div className="mb-4">
        <label className="block mb-2">Expires after (minutes):</label>
        <input
          type="number"
          min="5"
          max="1440"
          value={ttl}
          onChange={(e) => setTtl(Number(e.target.value))}
          className="w-full p-3 rounded bg-neutral-800 text-white"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        ✅ Submit & Copy Link
      </button>
    </section>
  );
}

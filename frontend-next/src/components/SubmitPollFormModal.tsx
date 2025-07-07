"use client";

import { useState, useEffect } from "react";
import socket from "@/lib/socket";

const categories = [
  "Anime",
  "Gaming",
  "Esports",
  "Movies & TV",
  "Music",
  "Memes & Internet",
  "Food & Drink",
  "Travel & Places",
  "Lifestyle & Trends",
  "Relationships",
  "Politics & Society",
  "Tech & Gadgets",
];

interface SubmitPollFormModalProps {
  category?: string; // Optional prop
}

export default function SubmitPollFormModal({
  category: initialCategory,
}: SubmitPollFormModalProps) {
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState(initialCategory || "");
  const [options, setOptions] = useState<string[]>(["", ""]);

  // If prop changes → update local state too:
  useEffect(() => {
    setCategory(initialCategory || "");
  }, [initialCategory]);

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addOption = () => {
    if (options.length >= 5) {
      alert("Max 5 options allowed.");
      return;
    }
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    const updated = options.filter((_, i) => i !== index);
    setOptions(updated);
  };

  const handleSubmit = () => {
    if (!question.trim() || !category.trim()) {
      alert("Please fill out question and category.");
      return;
    }
    const validOptions = options.filter((opt) => opt.trim());
    if (validOptions.length < 2) {
      alert("Please add at least 2 valid options.");
      return;
    }

    socket.emit("submit-poll", {
      question_text: question.trim(),
      category: category.trim(),
      options: validOptions,
    });

    alert("✅ Poll submitted for review!");
    setQuestion("");
    setCategory(initialCategory || "");
    setOptions(["", ""]);

    const checkbox = document.getElementById(
      "submitPollModal"
    ) as HTMLInputElement;
    if (checkbox) checkbox.checked = false;
  };

  return (
    <>
      {/* Trigger */}
      <label htmlFor="submitPollModal" className="btn btn-primary">
        ➕ Submit Your Own Poll
      </label>

      {/* Modal */}
      <input type="checkbox" id="submitPollModal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box w-full max-w-lg text-left">
          <h3 className="font-bold text-lg mb-4 text-center">Submit Your Own Poll</h3>

          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Your poll question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="input input-bordered w-full"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <div className="flex flex-col gap-2">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    className="input input-bordered flex-1"
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => removeOption(i)}
                      className="btn btn-sm btn-error"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {options.length < 5 && (
                <button onClick={addOption} className="btn btn-sm btn-outline">
                  ➕ Add Option
                </button>
              )}
            </div>
          </div>

          <div className="modal-action">
            <button onClick={handleSubmit} className="btn btn-primary">
              ✅ Submit
            </button>
            <label htmlFor="submitPollModal" className="btn">
              ✕ Close
            </label>
          </div>
        </div>
      </div>
    </>
  );
}

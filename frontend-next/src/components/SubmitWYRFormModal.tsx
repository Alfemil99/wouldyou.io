"use client";

import { useState } from "react";
import socket from "@/lib/socket";

export default function SubmitWYRFormModal() {
  const [question, setQuestion] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");

  const handleSubmit = () => {
    if (!question.trim() || !optionA.trim() || !optionB.trim()) {
      alert("Fill out all fields!");
      return;
    }
    socket.emit("submit-wyr", {
      question_text: question.trim(),
      optionA: optionA.trim(),
      optionB: optionB.trim(),
    });

    alert("✅ WYR submitted for review!");
    setQuestion("");
    setOptionA("");
    setOptionB("");

    const checkbox = document.getElementById(
      "submitWYRModal"
    ) as HTMLInputElement;
    if (checkbox) checkbox.checked = false;
  };

  return (
    <>
      <label htmlFor="submitWYRModal" className="btn btn-primary btn-sm">
        ➕ Submit WYR
      </label>

      <input type="checkbox" id="submitWYRModal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box w-full max-w-lg text-left">
          <h3 className="font-bold text-lg mb-4 text-center">
            Submit Would You Rather
          </h3>

          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Your question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="input input-bordered w-full"
            />
            <input
              type="text"
              placeholder="Option A..."
              value={optionA}
              onChange={(e) => setOptionA(e.target.value)}
              className="input input-bordered w-full"
            />
            <input
              type="text"
              placeholder="Option B..."
              value={optionB}
              onChange={(e) => setOptionB(e.target.value)}
              className="input input-bordered w-full"
            />
          </div>

          <div className="modal-action">
            <button onClick={handleSubmit} className="btn btn-primary">
              ✅ Submit
            </button>
            <label htmlFor="submitWYRModal" className="btn btn-outline">
              ✕ Cancel
            </label>
          </div>
        </div>
      </div>
    </>
  );
}

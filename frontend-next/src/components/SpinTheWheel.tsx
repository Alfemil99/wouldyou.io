"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import socket from "@/lib/socket";
import { useModeStore } from "@/lib/useModeStore";

export default function SpinTheWheel() {
  const [items, setItems] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [newItem, setNewItem] = useState("");
  const [createdId, setCreatedId] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const spinId = searchParams.get("spin");
  const { resetMode } = useModeStore();

  // Load existing wheel
  useEffect(() => {
    if (spinId) {
      console.log(`🔗 Loading SpinWheel: ${spinId}`);
      socket.emit("get-spin-by-id", { spinId });
    }

    socket.on("spinwheel-data", (data) => {
      if (data?.items) {
        console.log("🎡 Loaded SpinWheel:", data);
        setItems(data.items);
        setCreatedId(data._id);
      }
    });

    return () => {
      socket.off("spinwheel-data");
    };
  }, [spinId]);

  const addItem = () => {
    const trimmed = newItem.trim();
    if (trimmed && items.length < 12) {
      setItems([...items, trimmed]);
      setNewItem("");
    }
  };

  const handleSpin = () => {
    if (items.length < 2) {
      alert("Add at least 2 items!");
      return;
    }
    const pick = items[Math.floor(Math.random() * items.length)];
    setResult(pick);
  };

  const handleShare = () => {
    if (items.length < 2) {
      alert("Add at least 2 items before sharing.");
      return;
    }

    socket.emit("submit-spinwheel", { items });

    socket.once("spinwheel-created", ({ id }) => {
      console.log(`🎉 SpinWheel saved: ${id}`);
      const url = `${window.location.origin}/?spin=${id}`;
      navigator.clipboard.writeText(url).then(() => {
        alert(`✅ Link copied! ${url}`);
        setCreatedId(id);
      });
    });
  };

  const goBack = () => {
    resetMode();
    window.history.pushState(null, "", "/");
  };

  return (
    <section className="py-8">
      <button
        onClick={goBack}
        className="mb-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
      >
        ← Back
      </button>

      <h2 className="text-2xl font-bold mb-4">🎡 Spin the Wheel</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Add item..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button
          onClick={addItem}
          className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Add
        </button>
      </div>

      <ul className="mb-4">
        {items.map((item, idx) => (
          <li key={idx} className="border p-2 mb-1 rounded">
            {item}
          </li>
        ))}
      </ul>

      <div className="flex gap-4 mb-4">
        <button
          onClick={handleSpin}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🎯 Spin
        </button>
        <button
          onClick={handleShare}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          🔗 Share Wheel
        </button>
      </div>

      {result && (
        <p className="text-xl font-bold">🎉 Result: {result}</p>
      )}
    </section>
  );
}

"use client";

import socket from "@/lib/socket";
import { useModeStore } from "@/lib/useModeStore";
import Image from "next/image";

const categories = [
  { name: "Anime", image: "/images/anime.png" },
  { name: "Games", image: "/images/games.png" },
  { name: "Entertainment", image: "/images/entertainment.png" },
  { name: "Politics", image: "/images/politics.png" },
  { name: "Funny", image: "/images/funny.png" },
  { name: "➕ Add Your Own", image: "/images/add.svg" },
];

export default function CategoriesGrid() {
  const { setMode } = useModeStore();

  const handleClick = (category: string) => {
    if (category === "➕ Add Your Own") {
      alert("Coming soon: Submit your own poll!");
      return;
    }

    socket.emit("get-random-poll", { category });

    socket.once("poll-data", (poll) => {
      if (poll?._id) {
        window.history.pushState(null, "", `/?poll=${poll._id}`);
        setMode("poll");
      } else {
        alert("No polls found in this category.");
      }
    });
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-12 text-center">
      <h2 className="text-3xl font-bold mb-8 text-white">📂 Categories</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 place-items-center">
        {categories.map((cat) => (
          <div
            key={cat.name}
            onClick={() => handleClick(cat.name)}
            className="
            relative
            w-full aspect-square max-w-full
            sm:max-w-[12rem]
            md:max-w-[15rem]
            rounded-2xl overflow-hidden cursor-pointer group
            border border-white/20 bg-white/10 backdrop-blur-md
            transition-all hover:scale-105 hover:border-primary hover:shadow-lg
            "
          >
            <Image
              src={cat.image}
              alt={cat.name}
              fill
              className="object-cover opacity-40 group-hover:opacity-30 transition"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/10 group-hover:from-black/30 transition"></div>
            <span className="relative z-10 flex items-center justify-center h-full text-white font-semibold text-xl text-center px-4">
              {cat.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

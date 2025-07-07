"use client";

import socket from "@/lib/socket";
import { useModeStore } from "@/lib/useModeStore";
import Image from "next/image";

const categories = [
  { name: "Anime", image: "/images/anime.png" },
  { name: "Gaming", image: "/images/gaming.png" },
  { name: "Esports", image: "/images/esports.png" },
  { name: "Movies & TV", image: "/images/movies_tv.png" },
  { name: "Music", image: "/images/music.png" },
  { name: "Memes & Internet", image: "/images/memes.png" },
  { name: "Food & Drink", image: "/images/food_drink.png" },
  { name: "Travel & Places", image: "/images/travel.png" },
  { name: "Lifestyle & Trends", image: "/images/lifestyle.png" },
  { name: "Relationships", image: "/images/relationships.png" },
  { name: "Politics & Society", image: "/images/politics.png" },
  { name: "Tech & Gadgets", image: "/images/tech.png" },
];

// ✅ Tilføj en Poll type
type Poll = {
  _id?: string;
};

export default function CategoriesGrid() {
  const { setMode } = useModeStore();

  const handleClick = (category: string) => {
    socket.emit("get-random-poll", { category });

    // ✅ Brug din type Poll her:
    const handlePoll = (poll: Poll) => {
      if (poll?._id) {
        window.history.pushState(null, "", `/?poll=${poll._id}`);
        setMode("poll");
      } else {
        alert(`No polls found in category: ${category}`);
      }
    };

    socket.once("poll-data", handlePoll);
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

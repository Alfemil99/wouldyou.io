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

type Poll = {
  _id?: string;
};

export default function CategoriesGrid() {
  const { setMode } = useModeStore();

  const handleClick = (category: string) => {
    socket.emit("get-random-poll", { category });

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
    <section className="w-full max-w-7xl mx-auto px-4">
      {/* Fjernet overskriften for clean look */}

      <div className="
        grid 
        grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]
        gap-4 sm:gap-6 md:gap-8 
        place-items-center
      ">
        {categories.map((cat) => (
          <div
            key={cat.name}
            onClick={() => handleClick(cat.name)}
            className="
              relative w-full aspect-square 
              max-w-full sm:max-w-[12rem] md:max-w-[15rem]
              rounded-box overflow-hidden cursor-pointer group
              bg-base-200 border border-base-300 shadow-md transition-all duration-200
              hover:scale-105 hover:border-primary hover:ring-2 hover:ring-primary hover:shadow-lg
            "
          >
            <Image
              src={cat.image}
              alt={cat.name}
              fill
              className="object-cover opacity-40 group-hover:opacity-30 transition-all duration-200"
            />
            <div className="
              absolute inset-0 bg-gradient-to-t 
              from-black/50 to-black/10 
              group-hover:from-black/30 
              transition-all duration-200
            "></div>
            <span className="
              relative z-10 flex items-center justify-center h-full 
              text-base-content font-semibold text-xl text-center px-4
            ">
              {cat.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

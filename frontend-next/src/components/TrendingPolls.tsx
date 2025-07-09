"use client";

import { useEffect, useState } from "react";
import socket from "@/lib/socket";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

interface Poll {
  _id: string;
  question_text: string;
  totalVotes: number;
}

interface TrendingPollsProps {
  category?: string;
}

export default function TrendingPolls({ category }: TrendingPollsProps) {
  const [polls, setPolls] = useState<Poll[]>([]);

  useEffect(() => {
    socket.emit("get-trending-polls", { category });

    const handleTrending = (data: Poll[]) => {
      setPolls(data.slice(0, 5));
    };

    socket.on("trending-polls", handleTrending);

    return () => {
      socket.off("trending-polls", handleTrending);
    };
  }, [category]);

  if (polls.length === 0) return null;

  return (
    <section className="w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        🔥 Trending Polls {category && `in ${category}`}
      </h2>

      <Swiper
        modules={[Autoplay, Pagination]}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 5000 }}
        pagination={{ clickable: true }}
        className="rounded-box"
      >
        {polls.map((poll) => (
          <SwiperSlide key={poll._id}>
            <div
              onClick={() => (window.location.href = `/?poll=${poll._id}`)}
              className="
                card border border-base-300 bg-base-200 p-6 
                shadow-md rounded-box cursor-pointer flex flex-col 
                justify-center items-center h-[200px]
                transition hover:ring-2 hover:ring-primary hover:scale-95
              "
            >
              <h3 className="text-base font-semibold text-center mb-2 line-clamp-4">
                {poll.question_text}
              </h3>
              <p className="text-xs opacity-70">{poll.totalVotes} votes</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

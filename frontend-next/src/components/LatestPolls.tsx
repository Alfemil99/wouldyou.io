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
}

export default function LatestPolls() {
  const [polls, setPolls] = useState<Poll[]>([]);

  useEffect(() => {
    socket.emit("get-latest-polls", { size: 5 });

    const handleLatest = (data: Poll[]) => {
      setPolls(data);
    };

    socket.on("latest-polls", handleLatest);

    return () => {
      socket.off("latest-polls", handleLatest);
    };
  }, []);

  if (polls.length === 0) {
    return (
      <section className="w-full max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          🆕 Latest Polls
        </h2>
        <p className="text-sm opacity-70">No latest polls yet.</p>
      </section>
    );
  }

  return (
    <section className="w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        🆕 Latest Polls
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
              onClick={() =>
                (window.location.href = `/?poll=${poll._id}`)
              }
              className="
                card border border-base-300 bg-base-200 p-4 
                shadow-sm rounded-box cursor-pointer flex flex-col justify-center 
                h-[200px] hover:ring-2 hover:ring-primary transition
              "
            >
              <h3 className="text-base font-semibold line-clamp-4">
                {poll.question_text}
              </h3>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

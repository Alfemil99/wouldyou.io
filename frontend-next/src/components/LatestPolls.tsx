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

    // 👇 ALDRIG inline her — altid gem i const:
    const handleLatest = (data: Poll[]) => setPolls(data);

    socket.on("latest-polls", handleLatest);

    // ✅ Korrekt cleanup:
    return () => {
      socket.off("latest-polls", handleLatest);
    };
  }, []);

  return (
    <section className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        🆕 Latest Polls
      </h2>

      {polls.length > 0 ? (
        <Swiper
          modules={[Autoplay, Pagination]}
          slidesPerView={1}
          loop={true}
          autoplay={{ delay: 4000 }}
          pagination={{ clickable: true }}
          className="rounded-2xl"
        >
          {polls.map((poll) => (
            <SwiperSlide key={poll._id}>
              <div
                onClick={() =>
                  (window.location.href = `/?poll=${poll._id}`)
                }
                className="rounded-2xl border border-base-300 bg-base-200 p-6 shadow flex flex-col justify-center h-[250px] cursor-pointer hover:ring-1 hover:ring-primary transition"
              >
                <h3 className="text-lg font-semibold mb-2 line-clamp-4">
                  {poll.question_text}
                </h3>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <p className="text-sm opacity-70">No latest polls yet.</p>
      )}
    </section>
  );
}

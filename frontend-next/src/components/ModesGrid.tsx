"use client";

import { useModeStore, Mode } from "@/lib/useModeStore";
import { useRouter } from "next/navigation";
import Image from "next/image";

const modes: { name: string; mode: Mode; icon: string }[] = [
  { name: "Polls", mode: "polls", icon: "/images/polls.svg" },
  { name: "Quick Poll", mode: "quickpoll", icon: "/images/quickpoll.svg" },
  { name: "Would You Rather", mode: "wyr", icon: "/images/wyr.svg" },
  { name: "Spin the Wheel", mode: "spin", icon: "/images/spin.svg" },
];

export default function ModesGrid() {
  const { setMode } = useModeStore();
  const router = useRouter();

  const handleClick = (mode: Mode) => {
    setMode(mode);
    router.push(`/?mode=${mode}`);
  };

  return (
    <section className="w-full max-w-[350px] mx-auto min-h-[300px]">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">🎮 Modes</h2>
      <div className="grid grid-cols-2 gap-4">
        {modes.map((m) => (
          <div
            key={m.name}
            onClick={() => handleClick(m.mode)}
            className="
              card border border-base-300 bg-base-200 shadow-md p-4 
              flex flex-col items-center justify-center gap-2 cursor-pointer transition 
              hover:ring-2 hover:ring-primary hover:scale-105 rounded-box
            "
          >
            <Image
              src={m.icon}
              alt={m.name}
              width={50}
              height={50}
              className="mb-1"
            />
            <span className="font-medium text-center text-sm">{m.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";

const modes = [
  { name: "Polls", href: "/?mode=polls", icon: "/images/polls.svg" },
  { name: "Quick Poll", href: "/?mode=quickpoll", icon: "/images/quickpoll.svg" },
  { name: "Would You Rather", href: "/?mode=wyr", icon: "/images/wyr.svg" },
  { name: "Spin the Wheel", href: "/?mode=spin", icon: "/images/spin.svg" },
];

export default function ModesGrid() {
  return (
    <section className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        🎮 Modes
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {modes.map((mode) => (
          <Link href={mode.href} key={mode.name}>
            <div className="rounded-2xl border border-base-300 bg-base-200 p-4 flex flex-col items-center justify-center shadow cursor-pointer hover:ring-1 hover:ring-primary transition">
              <Image
                src={mode.icon}
                alt={mode.name}
                width={40}
                height={40}
                className="mb-2"
              />
              <span className="font-semibold text-center">{mode.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

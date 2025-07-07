"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useModeStore } from "@/lib/useModeStore";
import Image from "next/image";
import socket from "@/lib/socket";

type KPI = {
  title: string;
  value: string;
};

type KPIUpdate = {
  votes: number;
  polls: number;
  users: number;
};

export default function Header() {
  const router = useRouter();
  const { setMode, resetMode } = useModeStore();

  const [kpis, setKpis] = useState<KPI[]>([
    { title: "VOTES", value: "0" },
    { title: "POLLS", value: "0" },
    { title: "USERS", value: "0" },
  ]);

  useEffect(() => {
    const handleKpiUpdate = (data: KPIUpdate) => {
      setKpis([
        { title: "VOTES", value: data.votes.toLocaleString() },
        { title: "POLLS", value: data.polls.toString() },
        { title: "USERS", value: data.users.toString() },
      ]);
    };

    socket.on("kpi-update", handleKpiUpdate);
    return () => {
      socket.off("kpi-update", handleKpiUpdate);
    };
  }, []);

  return (
    <header className="w-full sticky top-0 z-50">
      {/* === Navbar === */}
      <div className="navbar w-full max-w-7xl mx-auto flex flex-wrap justify-between items-center bg-base-100 border-b border-base-300 shadow-sm px-4">
        {/* Logo */}
        <div className="flex-1">
          <button
            onClick={() => {
              router.push("/");
              resetMode();
            }}
            className="btn btn-ghost normal-case text-lg md:text-xl"
          >
            WOULDYOU.IO
          </button>
        </div>

        {/* Mode icons */}
        <div className="flex flex-wrap gap-1 md:gap-2">
          <button
            onClick={() => {
              router.push("/?mode=polls");
              setMode("polls");
            }}
            className="btn btn-ghost btn-sm"
          >
            <Image
              src="/images/polls.svg"
              alt="Polls"
              width={20}
              height={20}
            />
          </button>
          <button
            onClick={() => {
              router.push("/?mode=quickpoll");
              setMode("quickpoll");
            }}
            className="btn btn-ghost btn-sm"
          >
            <Image
              src="/images/quickpoll.svg"
              alt="Quickpoll"
              width={20}
              height={20}
            />
          </button>
          <button
            onClick={() => {
              router.push("/?mode=spin");
              setMode("spin");
            }}
            className="btn btn-ghost btn-sm"
          >
            <Image
              src="/images/spin.svg"
              alt="Spin"
              width={20}
              height={20}
            />
          </button>
          <button
            onClick={() => {
              router.push("/?mode=wyr");
              setMode("wyr");
            }}
            className="btn btn-ghost btn-sm"
          >
            <Image
              src="/images/wyr.svg"
              alt="Would You Rather"
              width={20}
              height={20}
            />
          </button>
        </div>
      </div>

      {/* === Slim horizontal KPI Bar === */}
      <div className="w-full bg-base-200 flex flex-wrap justify-center items-center gap-4 text-xs px-4 py-1 border-b border-base-300">
        {kpis.map((kpi) => (
          <div key={kpi.title} className="flex items-baseline gap-1">
            <span className="opacity-60">{kpi.title}:</span>
            <span className="font-semibold">{kpi.value}</span>
          </div>
        ))}
      </div>
    </header>
  );
}

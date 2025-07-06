"use client";

import { useRouter } from "next/navigation";
import { useModeStore } from "@/lib/useModeStore";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  const router = useRouter();
  const { setMode, resetMode } = useModeStore();

  // Dummy KPI data
  const kpis = [
    { title: "VOTES", value: "1,234", change: "+5%" },
    { title: "POLLS", value: "12", change: "+2%" },
    { title: "USERS", value: "350", change: "+8%" },
  ];

  return (
    <header className="w-full sticky top-0 z-50">
      {/* Main Navbar */}
      <div className="navbar bg-base-100 shadow">
        <div className="flex-1">
          <button
            onClick={() => {
              router.push("/");
              resetMode();
            }}
            className="btn btn-ghost normal-case text-xl"
          >
            WOULDYOU.IO
          </button>
        </div>

        <div className="flex-none flex gap-2">
          <button
            onClick={() => {
              router.push("/?mode=polls");
              setMode("polls");
            }}
            className="btn btn-ghost p-2"
          >
            <Image src="/images/polls.svg" alt="Polls" width={28} height={28} />
          </button>

          <button
            onClick={() => {
              router.push("/?mode=quickpoll");
              setMode("quickpoll");
            }}
            className="btn btn-ghost p-2"
          >
            <Image src="/images/quickpoll.svg" alt="Quickpoll" width={28} height={28} />
          </button>

          <button
            onClick={() => {
              router.push("/?mode=spin");
              setMode("spin");
            }}
            className="btn btn-ghost p-2"
          >
            <Image src="/images/spin.svg" alt="Spin" width={28} height={28} />
          </button>

          <button
            onClick={() => {
              router.push("/?mode=wyr");
              setMode("wyr");
            }}
            className="btn btn-ghost p-2"
          >
            <Image src="/images/wyr.svg" alt="Would You Rather" width={28} height={28} />
          </button>
        </div>
      </div>

      {/* Slim horizontal KPI Bar */}
      <div className="flex flex-wrap justify-center items-center gap-4 px-4 py-1 bg-base-200 text-xs shadow overflow-x-auto whitespace-nowrap">
        {kpis.map((kpi) => (
          <div key={kpi.title} className="flex items-baseline gap-1">
            <span className="opacity-70">{kpi.title}:</span>
            <span className="font-bold">{kpi.value}</span>
            <span
              className={`text-xs ${kpi.change.startsWith("+") ? "text-green-400" : "text-red-400"
                }`}
            >
              {kpi.change}
            </span>
          </div>
        ))}
      </div>
    </header>
  );
}

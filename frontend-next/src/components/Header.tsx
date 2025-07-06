"use client";

import { useRouter } from "next/navigation";
import { useModeStore } from "@/lib/useModeStore";
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
    <header className="w-full sticky top-0 z-50 overflow-x-hidden">
      {/* Main Navbar */}
      <div className="navbar bg-base-100 shadow container mx-auto px-4">
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

        <div className="flex-none flex gap-1 flex-wrap justify-end">
          <button
            onClick={() => {
              router.push("/?mode=polls");
              setMode("polls");
            }}
            className="btn btn-ghost p-1 md:p-2"
          >
            <Image
              src="/images/polls.svg"
              alt="Polls"
              width={20}
              height={20}
              className="md:w-[28px] md:h-[28px]"
            />
          </button>

          <button
            onClick={() => {
              router.push("/?mode=quickpoll");
              setMode("quickpoll");
            }}
            className="btn btn-ghost p-1 md:p-2"
          >
            <Image
              src="/images/quickpoll.svg"
              alt="Quickpoll"
              width={20}
              height={20}
              className="md:w-[28px] md:h-[28px]"
            />
          </button>

          <button
            onClick={() => {
              router.push("/?mode=spin");
              setMode("spin");
            }}
            className="btn btn-ghost p-1 md:p-2"
          >
            <Image
              src="/images/spin.svg"
              alt="Spin"
              width={20}
              height={20}
              className="md:w-[28px] md:h-[28px]"
            />
          </button>

          <button
            onClick={() => {
              router.push("/?mode=wyr");
              setMode("wyr");
            }}
            className="btn btn-ghost p-1 md:p-2"
          >
            <Image
              src="/images/wyr.svg"
              alt="Would You Rather"
              width={20}
              height={20}
              className="md:w-[28px] md:h-[28px]"
            />
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
              className={`text-xs ${
                kpi.change.startsWith("+") ? "text-green-400" : "text-red-400"
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

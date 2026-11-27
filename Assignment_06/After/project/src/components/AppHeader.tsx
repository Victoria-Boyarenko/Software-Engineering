import { Clock, CalendarCheck } from "lucide-react";
import { minutesToLabel } from "@/lib/time";

interface AppHeaderProps {
  now: number;
}

export default function AppHeader({ now }: AppHeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <CalendarCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight text-slate-900 sm:text-xl">
              Smart Campus Room Availability Checker
            </h1>
            <p className="text-xs text-slate-500">Prototype v1 · Northfield University</p>
          </div>
        </div>
        <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 sm:flex">
          <Clock className="h-4 w-4" />
          Current time: {minutesToLabel(now)}
        </div>
      </div>
    </header>
  );
}

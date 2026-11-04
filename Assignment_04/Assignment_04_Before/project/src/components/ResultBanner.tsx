import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import type { AvailabilityResult } from "@/lib/availability";

interface ResultBannerProps {
  result: AvailabilityResult | null;
}

export default function ResultBanner({ result }: ResultBannerProps) {
  if (!result) return null;

  const cfg = {
    available: {
      icon: CheckCircle2,
      wrap: "bg-emerald-50 border-emerald-200 text-emerald-900",
      iconCls: "text-emerald-600",
      label: "Available",
    },
    unavailable: {
      icon: XCircle,
      wrap: "bg-rose-50 border-rose-200 text-rose-900",
      iconCls: "text-rose-600",
      label: "Unavailable",
    },
    error: {
      icon: AlertTriangle,
      wrap: "bg-amber-50 border-amber-200 text-amber-900",
      iconCls: "text-amber-600",
      label: "Check your input",
    },
  }[result.kind];

  const Icon = cfg.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-start gap-3 rounded-xl border p-4 ${cfg.wrap} animate-[fadeIn_0.2s_ease-out]`}
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${cfg.iconCls}`} />
      <div>
        <p className="font-bold">{cfg.label}</p>
        <p className="text-sm opacity-90">{result.message}</p>
      </div>
    </div>
  );
}

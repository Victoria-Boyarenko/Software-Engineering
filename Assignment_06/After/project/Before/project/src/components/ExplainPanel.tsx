import { Sparkles, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { explainAvailability } from "@/lib/mockLLM";
import type { ExplainInput } from "@/lib/explain";

interface ExplainPanelProps {
  input: ExplainInput | null;
}

export default function ExplainPanel({ input }: ExplainPanelProps) {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!input) {
      setText(null);
      return;
    }
    setLoading(true);
    explainAvailability(input)
      .then((res) => {
        if (cancelled) return;
        setText(res.output.explanation);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [input]);

  if (!input) return null;

  return (
    <div
      className="mt-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3"
      aria-live="polite"
    >
      <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Sparkles className="h-3.5 w-3.5" aria-hidden />
        AI explanation
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Generating explanation…
        </div>
      ) : (
        <p className="text-sm text-slate-600">{text}</p>
      )}
      <p className="mt-2 text-[11px] text-slate-400">
        Explanatory text only — the confirmed availability status above is authoritative.
      </p>
    </div>
  );
}

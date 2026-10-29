import { HelpCircle, AlertOctagon, XCircle } from "lucide-react"
import type { Claim } from "@/types"

interface UnresolvedTabProps {
  unresolved: Claim[]
  rejected: Claim[]
  onSelectClaim: (claim: Claim) => void
}

export function UnresolvedTab({
  unresolved,
  rejected,
  onSelectClaim,
}: UnresolvedTabProps) {
  return (
    <div className="space-y-6">
      {/* Active Historiographical Debates */}
      <div>
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-xs uppercase tracking-wider mb-3">
          <HelpCircle className="w-4 h-4" />
          <span>Active Historiographical Questions & Plausible Hypotheses ({unresolved.length})</span>
        </div>

        {unresolved.length === 0 ? (
          <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-center text-slate-500 dark:text-slate-400 text-xs shadow-xs dark:shadow-none">
            No unresolved hypotheses detected for this inquiry.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {unresolved.map((c, i) => (
              <div
                key={c.id || i}
                onClick={() => onSelectClaim(c)}
                className="p-4 rounded-xl border border-amber-300/40 dark:border-amber-500/20 bg-amber-50/70 dark:bg-amber-950/10 hover:bg-amber-100/70 dark:hover:bg-amber-950/20 hover:border-amber-400 dark:hover:border-amber-500/40 transition-all cursor-pointer shadow-sm dark:shadow-md"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 font-bold">
                    {c.id || `H${i + 1}`}
                  </span>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {c.status || "Working Hypothesis"}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-relaxed mb-2">
                  {c.claim}
                </p>
                {c.reason && (
                  <div className="text-[11px] text-amber-900 dark:text-amber-300/90 bg-amber-100/70 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200 dark:border-amber-500/20">
                    <span className="font-semibold text-amber-950 dark:text-amber-200">Scholarly Limitation: </span>
                    {c.reason}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rejected / Unsubstantiated Claims */}
      {rejected.length > 0 && (
        <div>
          <div className="flex items-center gap-2 text-rose-600 dark:text-red-400 font-semibold text-xs uppercase tracking-wider mb-3">
            <XCircle className="w-4 h-4" />
            <span>Unsubstantiated or Anachronistic Claims ({rejected.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {rejected.map((c, i) => (
              <div
                key={c.id || i}
                onClick={() => onSelectClaim(c)}
                className="p-4 rounded-xl border border-rose-200 dark:border-red-500/20 bg-rose-50/70 dark:bg-red-950/10 hover:bg-rose-100/70 dark:hover:bg-red-950/20 transition-all cursor-pointer shadow-sm dark:shadow-md"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-100 dark:bg-red-950 text-rose-800 dark:text-red-300 border border-rose-300 dark:border-red-500/30 font-bold">
                    {c.id || `R${i + 1}`}
                  </span>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-red-950/80 text-rose-700 dark:text-red-400 border border-rose-300 dark:border-red-500/30">
                    Rejected
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-relaxed line-through decoration-rose-500/60 mb-2">
                  {c.claim}
                </p>
                {c.reason && (
                  <div className="flex items-start gap-1.5 text-[11px] text-rose-900 dark:text-red-300/90 bg-rose-100/70 dark:bg-red-950/30 p-2 rounded-lg border border-rose-200 dark:border-red-500/20">
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <span>{c.reason}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

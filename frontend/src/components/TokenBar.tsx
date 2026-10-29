import { Coins, ArrowDownLeft, ArrowUpRight, RotateCcw, Cpu } from "lucide-react"
import type { TokenStats } from "@/types"

interface TokenBarProps {
  stats: TokenStats | null
  onReset: () => void
}

export function TokenBar({ stats, onReset }: TokenBarProps) {
  if (!stats) return null

  const pct = Math.min(100, Math.max(0, stats.percentage_used || 0))

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white/90 dark:bg-slate-950/80 p-3.5 backdrop-blur-xl shadow-sm dark:shadow-xl transition-colors duration-200">
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Credits Remaining */}
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Credits Remaining</div>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                {Number(stats.credits_remaining || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-slate-400 dark:text-slate-500 text-[11px]">/ 1,000</span>
            </div>
          </div>
        </div>

        {/* Tokens Used */}
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Tokens Consumed</div>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-slate-900 dark:text-slate-100 font-semibold text-sm">
                {Number(stats.total_tokens_used || 0).toLocaleString()}
              </span>
              <span className="text-slate-400 dark:text-slate-500 text-[11px]">/ 1,000,000</span>
            </div>
          </div>
        </div>

        {/* Breakdown In / Out */}
        <div className="hidden md:flex items-center gap-3 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl font-mono text-[11px]">
          <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300" title="Prompt input tokens">
            <ArrowDownLeft className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="text-slate-400 dark:text-slate-500">In:</span> {Number(stats.prompt_tokens || 0).toLocaleString()}
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300" title="Completion output tokens">
            <ArrowUpRight className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-slate-400 dark:text-slate-500">Out:</span> {Number(stats.completion_tokens || 0).toLocaleString()}
          </span>
        </div>

        {/* Allocation Progress Bar */}
        <div className="flex-1 min-w-35 max-w-xs flex flex-col gap-1">
          <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            <span>Quota Utilization</span>
            <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{pct.toFixed(2)}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700/40">
            <div
              className="h-full rounded-full bg-linear-to-r from-cyan-500 via-indigo-500 to-amber-500 transition-all duration-700 ease-out shadow-sm shadow-cyan-500/50"
              style={{ width: `${Math.max(1, pct)}%` }}
            />
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/70 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-xs font-medium cursor-pointer"
          title="Reset session token consumption counters"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:rotate-180 transition-transform" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  )
}

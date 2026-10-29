import { Layers, GitBranch, Split, Sparkles, Compass } from "lucide-react"
import { MarkdownRenderer } from "@/components/MarkdownRenderer"
import type { Source } from "@/types"

interface FullPictureTabProps {
  reportText: string
  sources?: Record<string, Source>
}

export function FullPictureTab({ reportText }: FullPictureTabProps) {
  if (!reportText) {
    return (
      <div className="text-center py-20 text-slate-400 dark:text-slate-500 text-sm">
        <Layers className="w-10 h-10 mx-auto mb-3 opacity-40 text-indigo-500" />
        <p>Run a research inquiry to generate the 4-Level Theory Architecture.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 4-Level Header Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-500/20 bg-linear-to-r from-indigo-50/80 via-white to-slate-50 dark:from-indigo-950/40 dark:via-slate-900/60 dark:to-slate-950 text-xs shadow-sm dark:shadow-md transition-colors duration-200">
        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Output 2 &middot; 4-Level Historiographical Architecture</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
            L1: Core Theories
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
            L2: Historical Revisions
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
            L3: Working Hypotheses
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/30 font-bold">
            L4: Master Synthesis
          </span>
        </div>
      </div>

      {/* Main Full-Picture Narrative Dossier */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/60 p-6 backdrop-blur-xl shadow-sm dark:shadow-xl transition-colors duration-200">
        <div className="text-slate-800 dark:text-slate-300 font-sans">
          <MarkdownRenderer content={reportText} />
        </div>
      </div>

      {/* Synthesis Pillars Callout Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-emerald-300/40 dark:border-emerald-500/20 bg-emerald-50/70 dark:bg-emerald-950/15 backdrop-blur-md shadow-xs">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs mb-2">
            <GitBranch className="w-4 h-4" />
            <span>Common Bedrock Points</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            Incontrovertible empirical baseline verified by physical artifacts, multi-agency records, and independent cross-source telemetry.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-amber-300/40 dark:border-amber-500/20 bg-amber-50/70 dark:bg-amber-950/15 backdrop-blur-md shadow-xs">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs mb-2">
            <Split className="w-4 h-4" />
            <span>Critical Pivot Points</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            Key junctures where evidence supports divergent interpretative schools, preserved transparently rather than artificially harmonized.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/70 dark:bg-indigo-950/15 backdrop-blur-md shadow-xs">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs mb-2">
            <Compass className="w-4 h-4" />
            <span>Compatible Determining Factors</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            Multi-tiered operational, strategic, and economic drivers that operate concurrently to produce unified historical outcomes.
          </p>
        </div>
      </div>
    </div>
  )
}

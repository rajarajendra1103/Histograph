import { useState, useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Calendar, AlertTriangle, Quote, Clock, Filter, Sparkles } from "lucide-react"
import type { Claim } from "@/types"
import { cn } from "@/lib/utils"

interface TimelineTabProps {
  timeline: Claim[]
  dateConflicts: Array<{
    claim1: string
    date1: string
    claim2: string
    date2: string
    difference_years: number
    warning: string
  }>
  onSelectClaim: (claim: Claim) => void
}

export function TimelineTab({
  timeline,
  dateConflicts,
  onSelectClaim,
}: TimelineTabProps) {
  const [filterCategory, setFilterCategory] = useState("ALL")
  const [showConflicts, setShowConflicts] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Scroll Progress for Animated Timeline Line
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 20%", "end 80%"],
  })

  // Dynamic beam fill height based on scroll
  const beamHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])

  const filtered = timeline.filter((c) => {
    if (filterCategory === "ALL") return true
    return (c.category || "").toLowerCase() === filterCategory.toLowerCase()
  })

  if (timeline.length === 0) {
    return (
      <div className="text-center py-20 text-slate-400 dark:text-slate-500 text-sm">
        <Clock className="w-10 h-10 mx-auto mb-3 opacity-40 text-amber-500" />
        <p>No chronology events extracted yet. Run a research inquiry to assemble the timeline.</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Date Conflicts Warning Banner (Collapsible) */}
      {dateConflicts && dateConflicts.length > 0 && (
        <div className="rounded-2xl border border-amber-300/60 dark:border-amber-500/30 bg-amber-50/80 dark:bg-amber-950/20 p-4 backdrop-blur-md space-y-2 shadow-xs dark:shadow-none transition-colors">
          <div
            onClick={() => setShowConflicts(!showConflicts)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Detected Chronological Divergences ({dateConflicts.length})</span>
            </div>
            <span className="text-[11px] text-amber-700 dark:text-amber-300 font-mono underline font-medium">
              {showConflicts ? "Hide Details ▲" : "View Divergences ▼"}
            </span>
          </div>

          {showConflicts && (
            <div className="space-y-2 text-xs pt-2 border-t border-amber-200 dark:border-amber-500/20">
              {dateConflicts.map((dc: any, idx: number) => {
                const c1Text = dc.claim1 || dc.claim1_text || dc.claim_1 || "Claim 1"
                const c2Text = dc.claim2 || dc.claim2_text || dc.claim_2 || "Claim 2"
                const d1Text = dc.date1 || dc.date1_text || (dc.year_1 ? `${dc.year_1}` : "Date 1")
                const d2Text = dc.date2 || dc.date2_text || (dc.year_2 ? `${dc.year_2}` : "Date 2")
                const warnText = dc.warning || dc.note || "Chronological divergence"

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/80 border border-amber-300/50 dark:border-amber-500/20 flex flex-col gap-1.5 font-mono text-[11px] text-slate-700 dark:text-slate-300 shadow-2xs"
                  >
                    <div className="text-amber-700 dark:text-amber-300 font-bold">{warnText}</div>
                    <div>
                      <span className="text-cyan-700 dark:text-cyan-400 font-bold">[{d1Text}]:</span> {c1Text}
                    </div>
                    <div>
                      <span className="text-indigo-700 dark:text-indigo-400 font-bold">[{d2Text}]:</span> {c2Text}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Filter Row & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span className="font-bold text-slate-800 dark:text-slate-200">
            Scroll Animated Chronology ({filtered.length} Events)
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-cyan-600 dark:text-cyan-400 font-mono">
            <Sparkles className="w-3 h-3" /> Scroll to trace timeline
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-1 rounded-xl text-xs">
          <Filter className="w-3 h-3 text-slate-400 ml-1.5" />
          {["ALL", "established", "competing", "minority", "hypothesis"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={cn(
                "px-2.5 py-1 rounded-lg capitalize transition-colors cursor-pointer text-[11px] font-medium",
                filterCategory === cat
                  ? "bg-white dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-slate-200 dark:border-cyan-500/30 shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Scroll Animated Spine Container */}
      <div className="relative pl-7 sm:pl-10 space-y-7 my-6 ml-2 sm:ml-4">
        {/* Inactive Static Background Line */}
        <div className="absolute left-2.5 sm:left-3.5 top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-800 rounded-full" />

        {/* Dynamic Glowing Animated Fill Beam on Scroll */}
        <motion.div
          style={{ height: beamHeight }}
          className="absolute left-2.5 sm:left-3.5 top-2 w-0.5 rounded-full bg-linear-to-b from-cyan-400 via-indigo-500 to-amber-400 shadow-[0_0_8px_rgba(56,189,248,0.7)] z-10"
        />

        {/* Timeline Events Animated Cards */}
        {filtered.map((item, idx) => (
          <motion.div
            key={item.id || idx}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.35, delay: Math.min(idx * 0.04, 0.25) }}
            className="relative group"
          >
            {/* Spine Node Dot with Pulsing Halo */}
            <div className="absolute -left-7.75 sm:-left-9.75 top-3.5 z-20 flex items-center justify-center">
              <span className="w-3.5 h-3.5 rounded-full bg-white dark:bg-slate-950 border-2 border-cyan-500 dark:border-cyan-400 shadow-md group-hover:scale-125 group-hover:border-amber-500 transition-all" />
              <span className="absolute w-6 h-6 rounded-full bg-cyan-400/20 animate-ping pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Event Content Card */}
            <div
              onClick={() => onSelectClaim(item)}
              className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50/80 dark:hover:bg-slate-900/95 hover:border-cyan-400/60 dark:hover:border-cyan-500/40 transition-all cursor-pointer shadow-sm dark:shadow-md hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 px-3 py-0.5 rounded-full shadow-2xs">
                  <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  {item.date_text || (item.year ? `${Math.abs(item.year)} ${item.year < 0 ? "BCE" : "CE"}` : "Undated")}
                </span>

                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {item.category || "Consensus"}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed mb-2.5">
                {item.claim}
              </p>

              {item.quote && (
                <div className="text-[11px] italic text-slate-600 dark:text-slate-400 border-l-2 border-cyan-500/60 pl-3 py-1 mt-2.5 bg-cyan-50/40 dark:bg-slate-950/40 rounded-r flex items-start gap-1.5">
                  <Quote className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">&ldquo;{item.quote}&rdquo;</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

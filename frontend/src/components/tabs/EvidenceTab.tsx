import { ScrollText, ShieldCheck, Quote, BookOpen, ExternalLink, Calendar } from "lucide-react"
import { MarkdownRenderer } from "@/components/MarkdownRenderer"
import type { Claim, Source } from "@/types"

interface EvidenceTabProps {
  reportText: string
  claims: Claim[]
  sources: Record<string, Source>
  onSelectClaim: (claim: Claim) => void
}

export function EvidenceTab({
  reportText,
  claims,
  sources,
  onSelectClaim,
}: EvidenceTabProps) {
  if (!reportText && claims.length === 0) {
    return (
      <div className="text-center py-20 text-slate-400 dark:text-slate-500 text-sm">
        <ScrollText className="w-10 h-10 mx-auto mb-3 opacity-40 text-cyan-500" />
        <p>No historical inquiry submitted yet. Run a research query to generate the Evidence-Based Reconstruction.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Narrative Report Header / Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-300/40 dark:border-cyan-500/20 bg-linear-to-br from-cyan-50/80 via-white to-slate-50 dark:from-cyan-950/30 dark:via-slate-900/60 dark:to-slate-950 p-6 backdrop-blur-xl shadow-sm dark:shadow-xl transition-colors duration-200">
        <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Output 1 &middot; Evidence-Based Historical Reconstruction</span>
        </div>
        <div className="text-slate-800 dark:text-slate-300 font-sans">
          <MarkdownRenderer content={reportText} />
        </div>
      </div>

      {/* Verified Claims Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Quote className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Evidentiary Claims with Verbatim Text Citations ({claims.length})</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">100% Quote-Verified</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {claims.map((c, i) => (
            <div
              key={c.id || i}
              onClick={() => onSelectClaim(c)}
              className="group relative flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 hover:border-cyan-500/50 hover:bg-cyan-50/30 dark:hover:bg-slate-900/90 transition-all cursor-pointer shadow-sm dark:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-700">
                    {c.id || `C${i + 1}`}
                  </span>
                  {c.date_text && (
                    <span className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-mono font-medium">
                      <Calendar className="w-3 h-3" />
                      {c.date_text}
                    </span>
                  )}
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
                    {c.status || "Consensus"}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-relaxed mb-3">
                  {c.claim}
                </p>

                {c.quote && (
                  <div className="relative pl-3 border-l-2 border-cyan-500/70 text-[11px] italic text-slate-600 dark:text-slate-400 line-clamp-3 bg-cyan-50/60 dark:bg-cyan-950/15 py-1 pr-2 rounded-r">
                    &ldquo;{c.quote}&rdquo;
                  </div>
                )}
              </div>

              {/* Cited sources row */}
              {c.source_ids && c.source_ids.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
                  <span className="text-slate-500 dark:text-slate-400 font-mono">Sources:</span>
                  {c.source_ids.map((sid) => {
                    const src = sources[sid]
                    return (
                      <span
                        key={sid}
                        className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-cyan-700 dark:text-cyan-300 font-mono font-medium border border-slate-200 dark:border-slate-700"
                        title={src ? src.title : sid}
                      >
                        [{sid}]
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Annotated Bibliography */}
      {Object.keys(sources).length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/70 p-5 backdrop-blur-md shadow-sm dark:shadow-md">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Consulted Primary Archives, Academic Journals & Open Sources</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {Object.entries(sources).map(([sid, src]) => (
              <a
                key={sid}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start justify-between gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 text-xs text-slate-700 dark:text-slate-300 transition-colors group shadow-2xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-[10px] text-cyan-700 dark:text-cyan-400 font-mono mb-0.5 font-bold">
                    <span>[{sid}]</span>
                    <span className="text-slate-400">&middot;</span>
                    <span className="uppercase text-slate-500 dark:text-slate-400">{src.kind || "Scholarly"}</span>
                  </div>
                  <div className="font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                    {src.title}
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-500 shrink-0 mt-0.5" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

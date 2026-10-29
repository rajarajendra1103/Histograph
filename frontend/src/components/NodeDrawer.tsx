import { useState } from "react"
import { X, Copy, Check, Quote, Calendar, ExternalLink, ShieldCheck } from "lucide-react"
import type { Source } from "@/types"

interface NodeDrawerProps {
  nodeData: any | null
  sources: Record<string, Source>
  onClose: () => void
}

export function NodeDrawer({ nodeData, sources, onClose }: NodeDrawerProps) {
  const [copied, setCopied] = useState(false)

  if (!nodeData) return null

  const title = nodeData.label || nodeData.name || nodeData.id || "Entity"
  const type = nodeData.kind || nodeData.type || "Historical Claim"
  const text = nodeData.text || nodeData.claim || ""
  const quote = nodeData.quote || ""
  const date = nodeData.date || nodeData.date_text || (nodeData.year ? `${Math.abs(nodeData.year)} ${nodeData.year < 0 ? "BCE" : "CE"}` : "")
  const sourceIds: string[] = nodeData.source_ids || []
  const reason = nodeData.reason || ""

  const handleCopyQuote = () => {
    if (!quote) return
    navigator.clipboard.writeText(quote)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Panel */}
      <aside className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white/95 dark:bg-slate-950/95 border-l border-slate-200 dark:border-slate-800 p-6 shadow-2xl backdrop-blur-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300 transition-colors">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-cyan-700 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-500/30 px-2 py-0.5 rounded-full">
                {type}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-2 leading-snug">
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Date Tag */}
          {date && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-mono font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>{date}</span>
            </div>
          )}

          {/* Core Content */}
          {text && text !== title && (
            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              {text}
            </div>
          )}

          {/* Verbatim Citation Quote Box */}
          {quote && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                <span className="flex items-center gap-1 text-cyan-700 dark:text-cyan-400 font-medium">
                  <Quote className="w-3.5 h-3.5" />
                  <span>Verbatim Source Quotation</span>
                </span>
                <button
                  onClick={handleCopyQuote}
                  className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <div className="p-3.5 rounded-xl border border-cyan-300/60 dark:border-cyan-500/30 bg-cyan-50/60 dark:bg-cyan-950/15 text-xs italic text-slate-800 dark:text-slate-200 leading-relaxed">
                &ldquo;{quote}&rdquo;
              </div>
            </div>
          )}

          {/* Historiographical note / reason */}
          {reason && (
            <div className="p-3 rounded-xl border border-amber-300/40 dark:border-amber-500/20 bg-amber-50/70 dark:bg-amber-950/15 text-xs text-amber-900 dark:text-amber-300/90 leading-relaxed">
              <span className="font-semibold text-amber-950 dark:text-amber-200">Epistemic Evaluation: </span>
              {reason}
            </div>
          )}

          {/* Cited Sources List */}
          {sourceIds.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Corroborating Primary & Scholarly Sources
              </span>
              <div className="space-y-1.5">
                {sourceIds.map((sid) => {
                  const src = sources[sid]
                  if (!src) return null
                  return (
                    <a
                      key={sid}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start justify-between gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 text-xs text-slate-700 dark:text-slate-300 transition-colors group"
                    >
                      <div className="min-w-0">
                        <div className="text-[10px] text-cyan-700 dark:text-cyan-400 font-mono font-bold">[{sid}] &middot; {src.kind || "Source"}</div>
                        <div className="font-medium truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                          {src.title}
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-500 shrink-0 mt-0.5" />
                    </a>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Audit Verified</span>
          </span>
          <span>Histograph Knowledge Graph</span>
        </div>
      </aside>
    </>
  )
}

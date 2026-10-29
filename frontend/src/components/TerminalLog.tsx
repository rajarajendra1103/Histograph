import { useState, useRef, useEffect } from "react"
import { Terminal, ChevronDown, ChevronUp, CheckCircle, AlertTriangle, Clock, FileCode, BookOpen, Video, MessageSquare, Search } from "lucide-react"

interface TerminalLogProps {
  logs: string[]
  isStreaming: boolean
}

// 5 Crawler Modalities cycling every 3 seconds
const CRAWLER_ROTATION = [
  { label: "Web Search", detail: "Google Scholar & SerpAPI", icon: Search, symbol: "🌐", color: "text-cyan-600 dark:text-cyan-400" },
  { label: "Trafilatura Scraper", detail: "HTML Extraction & Clean Text", icon: FileCode, symbol: "🕷️", color: "text-emerald-600 dark:text-emerald-400" },
  { label: "Library Archives", detail: "Library of Congress & IA Wayback", icon: BookOpen, symbol: "📰", color: "text-amber-600 dark:text-amber-400" },
  { label: "YouTube Transcripts", detail: "Captions & Whisper Audio", icon: Video, symbol: "📺", color: "text-rose-600 dark:text-rose-400" },
  { label: "Reddit Discussions", detail: "r/AskHistorians & Expert Threads", icon: MessageSquare, symbol: "💬", color: "text-indigo-600 dark:text-indigo-400" },
]

export function TerminalLog({ logs, isStreaming }: TerminalLogProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [activeCrawlerIndex, setActiveCrawlerIndex] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [finalDurationMs, setFinalDurationMs] = useState<number | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll logs
  useEffect(() => {
    if (!collapsed) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [logs, collapsed])

  // Timer tracking execution duration
  useEffect(() => {
    let interval: any = null

    if (isStreaming) {
      if (!startTime) {
        const now = Date.now()
        setStartTime(now)
        setElapsedMs(0)
        setFinalDurationMs(null)
      }
      interval = setInterval(() => {
        if (startTime) {
          setElapsedMs(Date.now() - startTime)
        }
      }, 100)
    } else {
      if (startTime && !finalDurationMs && elapsedMs > 0) {
        setFinalDurationMs(elapsedMs)
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isStreaming, startTime, elapsedMs, finalDurationMs])

  // Reset timer on new search
  useEffect(() => {
    if (isStreaming && logs.length <= 1) {
      setStartTime(Date.now())
      setElapsedMs(0)
      setFinalDurationMs(null)
    }
  }, [isStreaming, logs.length])

  // 3-second animated loop for crawler sources
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCrawlerIndex((prev) => (prev + 1) % CRAWLER_ROTATION.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  // Format mm:ss.s
  const formatTimer = (ms: number) => {
    const totalSecs = ms / 1000
    const mins = Math.floor(totalSecs / 60)
    const secs = (totalSecs % 60).toFixed(1)
    const paddedSecs = parseFloat(secs) < 10 ? `0${secs}` : secs
    return `${mins < 10 ? `0${mins}` : mins}:${paddedSecs}`
  }

  const activeCrawler = CRAWLER_ROTATION[activeCrawlerIndex]

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/90 backdrop-blur-xl overflow-hidden shadow-xs dark:shadow-xl text-xs font-mono transition-colors duration-200">
      {/* Header */}
      <div
        onClick={() => setCollapsed(!collapsed)}
        className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800/80 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors gap-2"
      >
        <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-300">
          <Terminal className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span className="font-bold tracking-wide">Agent Activity Stream</span>

          {isStreaming ? (
            <span className="flex items-center gap-1.5 text-[10px] text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
              <span className="animate-pulse w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400" />
              LIVE
            </span>
          ) : logs.length > 0 ? (
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
              DONE ({logs.length})
            </span>
          ) : (
            <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              STANDBY
            </span>
          )}
        </div>

        {/* Right Info: 3s Crawler Symbol Loop & Elapsed Timer */}
        <div className="flex items-center gap-3">
          {/* Active 3s Rotating Crawler Modality */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs">
            <span className="text-xs select-none">{activeCrawler.symbol}</span>
            <span className="font-semibold">{activeCrawler.label}</span>
            <span className="text-[10px] text-slate-400">({activeCrawlerIndex + 1}/5)</span>
          </div>

          {/* Execution Stopwatch Timer */}
          {(isStreaming || (finalDurationMs ?? 0) > 0) && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold shadow-2xs">
              <Clock className="w-3 h-3 text-amber-500 animate-spin-slow" />
              <span>{formatTimer(finalDurationMs ?? elapsedMs)}</span>
            </div>
          )}

          <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 ml-1">
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      {!collapsed && (
        <div className="p-3.5 max-h-48 overflow-y-auto space-y-1.5 bg-slate-50/70 dark:bg-black/50 text-slate-800 dark:text-slate-300">
          {logs.length === 0 ? (
            <div className="text-slate-400 dark:text-slate-500 py-3 text-xs flex items-center gap-2">
              <span className="text-cyan-600 dark:text-cyan-400 font-bold select-none">&gt;</span>
              <span>Ready. Select an inquiry prompt above or click <strong>Research</strong> to execute the 6-stage evidentiary pipeline.</span>
            </div>
          ) : (
            logs.map((log, idx) => {
              const isError = log.includes("ERROR") || log.includes("failure")
              const isSuccess = log.includes("complete") || log.includes("assembled") || log.includes("verified")

              return (
                <div key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-slate-400 dark:text-slate-600 select-none text-[11px]">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  {isError ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  ) : isSuccess ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <span className="text-cyan-600 dark:text-cyan-400 select-none font-bold">&gt;</span>
                  )}
                  <span className={isError ? "text-rose-600 dark:text-rose-300" : isSuccess ? "text-emerald-700 dark:text-emerald-300 font-medium" : "text-slate-800 dark:text-slate-200"}>
                    {log}
                  </span>
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  )
}

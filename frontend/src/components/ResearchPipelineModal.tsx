"use client"

import { useState, useEffect, useRef } from "react"
import { 
  X, 
  Clock, 
  Terminal, 
  FileCode, 
  BookOpen, 
  Video, 
  MessageSquare, 
  Search, 
  CheckCircle2, 
  Loader2,
  Minimize2,
  Maximize2,
  Activity,
  Layers,
  Sparkles
} from "lucide-react"

interface ResearchPipelineModalProps {
  isOpen: boolean
  onClose: () => void
  isStreaming: boolean
  currentStep: string | null
  logs: string[]
  query: string
  model: string
  hasResult: boolean
}

// 5 Crawler Sources cycling ONE BY ONE every 3 seconds
const CRAWLER_SOURCES = [
  {
    id: "web-search",
    title: "Open Web Search",
    subtitle: "Querying Google Scholar, SerpAPI & Primary Document Indexes",
    icon: Search,
    symbol: "🌐",
    color: "text-cyan-400",
    border: "border-cyan-500/50",
    bg: "bg-cyan-950/40",
    glow: "shadow-cyan-500/30",
  },
  {
    id: "web-scraping",
    title: "Trafilatura & Web Scraping",
    subtitle: "Extracting Full Text, Citations & Metadata from Primary Web Pages",
    icon: FileCode,
    symbol: "🕷️",
    color: "text-emerald-400",
    border: "border-emerald-500/50",
    bg: "bg-emerald-950/40",
    glow: "shadow-emerald-500/30",
  },
  {
    id: "library-archives",
    title: "News & Library Archives",
    subtitle: "Querying Library of Congress, Chronicling America & Internet Archive",
    icon: BookOpen,
    symbol: "📰",
    color: "text-amber-400",
    border: "border-amber-500/50",
    bg: "bg-amber-950/40",
    glow: "shadow-amber-500/30",
  },
  {
    id: "youtube-media",
    title: "YouTube & Audio Transcripts",
    subtitle: "Pulling Historical Audio Subtitles & Whisper Speech-to-Text Feeds",
    icon: Video,
    symbol: "📺",
    color: "text-rose-400",
    border: "border-rose-500/50",
    bg: "bg-rose-950/40",
    glow: "shadow-rose-500/30",
  },
  {
    id: "reddit-forums",
    title: "Reddit & Scholarly Communities",
    subtitle: "Scanning r/AskHistorians, Academic Discourse & Expert Threads",
    icon: MessageSquare,
    symbol: "💬",
    color: "text-indigo-400",
    border: "border-indigo-500/50",
    bg: "bg-indigo-950/40",
    glow: "shadow-indigo-500/30",
  },
]

// 6 Core Histograph Pipeline Stages
const PIPELINE_STAGES = [
  { id: "planner", num: "01", name: "Planner", desc: "Query Decomposition" },
  { id: "search", num: "02", name: "Search & Archives", desc: "Multi-Source Gathering" },
  { id: "extractor", num: "03", name: "Extractor", desc: "Claims & Verbatim Quotes" },
  { id: "graph", num: "04", name: "Graph Builder", desc: "Knowledge Graph" },
  { id: "verify", num: "05", name: "Verification", desc: "Epistemic Source Criticism" },
  { id: "synthesis", num: "06", name: "Reconstruction", desc: "4-Level Architecture" },
]

export function ResearchPipelineModal({
  isOpen,
  onClose,
  isStreaming,
  currentStep,
  logs,
  query,
  model,
  hasResult,
}: ResearchPipelineModalProps) {
  const [activeSourceIndex, setActiveSourceIndex] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [finalDurationMs, setFinalDurationMs] = useState<number | null>(null)
  const [isMaximized, setIsMaximized] = useState(false)
  const logsEndRef = useRef<HTMLDivElement>(null)

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

  // 3-SECOND ONE-BY-ONE SYMBOL ANIMATION LOOP
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSourceIndex((prev) => (prev + 1) % CRAWLER_SOURCES.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  // Auto-scroll logs
  useEffect(() => {
    if (isOpen) {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [logs, isOpen])

  if (!isOpen) return null

  // Format mm:ss.s
  const formatTimer = (ms: number) => {
    const totalSecs = ms / 1000
    const mins = Math.floor(totalSecs / 60)
    const secs = (totalSecs % 60).toFixed(1)
    const paddedSecs = parseFloat(secs) < 10 ? `0${secs}` : secs
    return `${mins < 10 ? `0${mins}` : mins}:${paddedSecs}`
  }

  // Active Stage Index
  const currentStepLower = (currentStep || "").toLowerCase()
  const stageKeys = ["planner", "search", "extractor", "graph", "verify", "synthesis"]
  let activeIdx = stageKeys.indexOf(currentStepLower)
  if (currentStepLower === "done" || hasResult) activeIdx = 6
  if (currentStepLower === "evidence" || currentStepLower === "full") activeIdx = 5

  const currentSource = CRAWLER_SOURCES[activeSourceIndex]
  const SourceIcon = currentSource.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Clean Rectangular Panel */}
      <div 
        className={`relative flex flex-col bg-slate-950 dark:bg-slate-950 border border-slate-800 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isMaximized ? "w-full h-full max-w-none rounded-none" : "w-full max-w-4xl max-h-[92vh]"
        }`}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 shadow-sm shadow-cyan-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-100 tracking-tight uppercase">
                  Investigation Pipeline
                </h2>
                {isStreaming ? (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/40 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    RUNNING
                  </span>
                ) : hasResult ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    COMPLETED
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-slate-800 text-slate-400">
                    IDLE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-mono truncate max-w-md sm:max-w-xl">
                {query || "Historical Epistemic Verification Architecture"}
              </p>
            </div>
          </div>

          {/* Right Action Controls: Timer & Close */}
          <div className="flex items-center gap-3">
            {/* Live Elapsed Execution Timer */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/70 shadow-inner">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
              <div className="flex flex-col text-right">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">
                  {isStreaming ? "Elapsed" : "Time"}
                </span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {formatTimer(finalDurationMs ?? elapsedMs)}
                </span>
              </div>
            </div>

            {/* Maximize Toggle */}
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer hidden sm:block"
              title={isMaximized ? "Restore size" : "Maximize"}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Rectangular Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* SECTION 1: 6 STAGES IN PIPELINE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Pipeline Execution Stages
              </span>
              <span className="font-mono text-[11px] text-cyan-400">
                Stage {Math.min(6, Math.max(1, activeIdx + 1))} / 6
              </span>
            </div>

            {/* Rectangular Stage Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {PIPELINE_STAGES.map((stg, idx) => {
                const isPassed = activeIdx > idx || activeIdx === 6 || hasResult
                const isRunning = isStreaming && activeIdx === idx

                return (
                  <div
                    key={stg.id}
                    className={`relative p-2.5 rounded-xl border flex flex-col justify-between transition-all duration-300 ${
                      isRunning
                        ? "bg-cyan-950/50 border-cyan-500 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/50"
                        : isPassed
                          ? "bg-slate-900/60 border-emerald-500/40 text-emerald-300"
                          : "bg-slate-900/30 border-slate-800/80 text-slate-500 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold">
                        {stg.num}
                      </span>
                      {isRunning ? (
                        <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                      ) : isPassed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-700" />
                      )}
                    </div>

                    <div>
                      <div className={`text-xs font-bold leading-tight truncate ${isRunning ? "text-cyan-200" : isPassed ? "text-slate-100" : "text-slate-400"}`}>
                        {stg.name}
                      </div>
                      <div className="text-[9px] text-slate-400 truncate mt-0.5">
                        {stg.desc}
                      </div>
                    </div>

                    {isRunning && (
                      <div className="w-full h-0.5 bg-slate-800 rounded-full overflow-hidden mt-2">
                        <div className="h-full bg-cyan-400 animate-shimmer" style={{ width: "100%" }} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* SECTION 2: ONE-BY-ONE SYMBOL ANIMATION (APPEARING 3s THEN NEXT SYMBOL IN LOOP) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Live Source Crawler Telemetry
              </span>
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                3s Rotation Loop ({activeSourceIndex + 1}/{CRAWLER_SOURCES.length})
              </span>
            </div>

            {/* Single Symbol Spotlight Box */}
            <div 
              key={currentSource.id}
              className={`relative overflow-hidden p-5 rounded-2xl border ${currentSource.border} ${currentSource.bg} ${currentSource.glow} shadow-xl transition-all duration-500 flex flex-col sm:flex-row items-center gap-5`}
            >
              {/* Pulsing Animated Symbol Icon */}
              <div className="relative shrink-0 flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-950/80 border border-slate-700 shadow-inner group">
                <span className="text-3xl select-none animate-bounce">
                  {currentSource.symbol}
                </span>
                <div className={`absolute inset-0 rounded-2xl ring-2 ${currentSource.border} animate-ping opacity-25`} />
              </div>

              {/* Symbol Description Details */}
              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <SourceIcon className={`w-4 h-4 ${currentSource.color}`} />
                  <span className={`text-sm font-bold tracking-tight text-white`}>
                    {currentSource.title}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-cyan-300 border border-white/10">
                    CRAWLING
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {currentSource.subtitle}
                </p>
                <div className="text-[10px] font-mono text-slate-400 pt-1">
                  Active Modality: <span className="text-slate-200 font-semibold">{currentSource.id}</span> • Rotating every 3.0s until pipeline completion
                </div>
              </div>

              {/* 3s Visual Progress Bar */}
              <div className="w-full sm:w-28 shrink-0 flex flex-col items-center sm:items-end gap-1 font-mono text-[10px] text-slate-400">
                <span>Next in 3s</span>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 animate-pulse" style={{ width: "100%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: AGENT ACTIVITY STREAM (TERMINAL CONSOLE) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                Agent Activity Stream ({logs.length} telemetry logs)
              </span>
              {isStreaming && (
                <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-300">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Streaming live events...
                </span>
              )}
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#060911] p-3.5 font-mono text-xs max-h-48 overflow-y-auto shadow-inner scrollbar-thin">
              {logs.length === 0 ? (
                <div className="text-slate-500 py-6 text-center italic text-xs">
                  Awaiting dispatch. Click "Research" to execute historical verification stream.
                </div>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, idx) => {
                    const isError = log.toLowerCase().includes("error") || log.toLowerCase().includes("failed")
                    const isPassed = log.toLowerCase().includes("verified") || log.toLowerCase().includes("assembled") || log.toLowerCase().includes("done")

                    return (
                      <div key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-slate-600 select-none text-[10px] w-6 shrink-0 pt-0.5 text-right font-mono">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span className={`shrink-0 font-bold ${isError ? "text-rose-400" : isPassed ? "text-emerald-400" : "text-cyan-400"}`}>
                          {isError ? "✖" : isPassed ? "✔" : "❯"}
                        </span>
                        <span className={`${isError ? "text-rose-300" : isPassed ? "text-emerald-200" : "text-slate-300"} break-all`}>
                          {log}
                        </span>
                      </div>
                    )
                  })}
                  <div ref={logsEndRef} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-900/60 text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
            <span>Model: <span className="text-cyan-300">{model.split("/").pop()}</span></span>
            <span>•</span>
            <span>Logs: <span className="text-slate-200">{logs.length}</span></span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium transition-colors cursor-pointer"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  )
}

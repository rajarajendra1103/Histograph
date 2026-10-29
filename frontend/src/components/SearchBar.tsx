import { useState, useEffect } from "react"
import { Search, Loader2, FileDown, Layers } from "lucide-react"
import { ShimmerButton } from "./magicui/shimmer-button"
import { BorderBeam } from "./magicui/border-beam"
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button"

interface SearchBarProps {
  onSearch: (query: string, model: string) => void
  onDownloadPdf: () => void
  isLoading: boolean
  hasResult: boolean
  models: string[]
  defaultModel: string
}

const HISTORICAL_PROMPTS = [
  "What caused the decline of the Indus Valley Civilization?",
  "Was the Library of Alexandria destroyed in a single catastrophe or gradual decay?",
  "What triggered the Late Bronze Age Collapse in the Eastern Mediterranean?",
  "Did the Roman Empire fall primarily due to climate shocks or military invasions?",
]

export function SearchBar({
  onSearch,
  onDownloadPdf,
  isLoading,
  hasResult,
  models,
  defaultModel,
}: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [selectedModel, setSelectedModel] = useState(defaultModel || "meta/llama-3.2-11b-vision-instruct")
  const [placeholderIndex, setPlaceholderIndex] = useState(0)

  useEffect(() => {
    if (defaultModel) setSelectedModel(defaultModel)
  }, [defaultModel])

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % HISTORICAL_PROMPTS.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || isLoading) return
    onSearch(query.trim(), selectedModel)
  }

  const handleChipClick = (prompt: string) => {
    setQuery(prompt)
    if (!isLoading) {
      onSearch(prompt, selectedModel)
    }
  }

  return (
    <div className="space-y-3">
      {/* Search Container with glowing BorderBeam */}
      <div className="relative group rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl p-2.5 shadow-sm dark:shadow-2xl transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700/80">
        <BorderBeam size={220} duration={10} colorFrom="#38bdf8" colorTo="#818cf8" />

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Model Dropdown */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300">
            <Layers className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-transparent border-none text-slate-800 dark:text-slate-200 text-xs focus:outline-none cursor-pointer max-w-47.5 truncate"
              title="Select LLM Inference Model"
            >
              {models.map((m) => (
                <option key={m} value={m} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Query Input */}
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={HISTORICAL_PROMPTS[placeholderIndex]}
              className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <ShimmerButton
              type="submit"
              disabled={isLoading || !query.trim()}
              background="linear-gradient(135deg, #0ea5e9 0%, #2563eb 50%, #4f46e5 100%)"
              shimmerColor="rgba(255, 255, 255, 0.55)"
              className="w-full sm:w-auto h-10 px-6 text-white font-bold shadow-lg shadow-cyan-500/35 hover:shadow-cyan-400/55 hover:brightness-110 active:scale-95 transition-all cursor-pointer rounded-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span className="font-bold text-white tracking-wide">Investigating...</span>
                </>
              ) : (
                <span className="font-bold text-white tracking-wide">Research</span>
              )}
            </ShimmerButton>

            <LiquidMetalButton
              label="Download PDF"
              icon={<FileDown className="w-4 h-4 text-emerald-100" />}
              onClick={onDownloadPdf}
              disabled={!hasResult || isLoading}
              colorTheme="emerald"
              className="shadow-md shadow-emerald-600/30 hover:shadow-emerald-500/50 hover:brightness-110 transition-all"
            />
          </div>
        </form>
      </div>

      {/* Suggested Historical Queries Chips */}
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="text-slate-600 dark:text-slate-500 font-medium">Try inquiries:</span>
        {HISTORICAL_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleChipClick(prompt)}
            className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer truncate max-w-65 shadow-xs"
            title={prompt}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}

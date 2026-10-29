import { Zap, Sun, Moon } from "lucide-react"

interface NavbarProps {
  keyPreview: string
  provider: string
  theme: "dark" | "light"
  onSetTheme: (theme: "dark" | "light") => void
  currentPage?: "landing" | "workspace" | "must-know"
  onNavigate?: (page: "landing" | "workspace" | "must-know") => void
}

export function Navbar({
  keyPreview,
  provider,
  theme,
  onSetTheme,
  currentPage = "landing",
  onNavigate,
}: NavbarProps) {
  return (
    <header className="relative z-20 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/70 backdrop-blur-xl px-6 py-3.5 shadow-sm dark:shadow-2xl transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand identity */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => onNavigate && onNavigate("landing")}
          title="Return to Histograph Landing Page"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-slate-950 border border-amber-500/40 shadow-lg shadow-amber-500/20 overflow-hidden shrink-0">
            <img src="/logo.jpg" alt="Histograph Logo" className="w-full h-full object-cover" />
            <div className="absolute -inset-0.5 rounded-xl bg-amber-400/20 blur-sm -z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-slate-900 dark:text-slate-50 tracking-tight">Histograph</h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-500/30 px-2 py-0.5 rounded-full">
                Graph-RAG v0.3
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Agentic Historical Reconstruction &middot; Laya Epistemic Verification &middot; 4-Level Architecture
            </p>
          </div>
        </div>

        {/* Navigation & Status / Engine Pills */}
        <div className="flex items-center gap-3">
          {/* Segmented Page Navigation: Landing | Must Know | Workspace */}
          {onNavigate && (
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-0.5 rounded-xl text-xs shadow-inner">
              <button
                type="button"
                onClick={() => onNavigate("landing")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  currentPage === "landing"
                    ? "bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm border border-slate-200 dark:border-slate-700"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
                title="Historical Enigmas & Forensic Flowchart"
              >
                🏛️ Landing
              </button>
              <button
                type="button"
                onClick={() => onNavigate("must-know")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  currentPage === "must-know"
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
                title="Historiographical Concepts, Pivot Points & 4-Level Architecture"
              >
                📖 Must Know
              </button>
              <button
                type="button"
                onClick={() => onNavigate("workspace")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  currentPage === "workspace"
                    ? "bg-linear-to-r from-cyan-500 to-indigo-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
                title="Interactive Investigation & Truth Ledger"
              >
                🚀 Workspace
              </button>
            </div>
          )}
          {/* Segmented Theme Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-0.5 rounded-xl text-xs shadow-inner">
            <button
              type="button"
              onClick={() => onSetTheme("light")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                theme === "light"
                  ? "bg-white text-amber-600 shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
              title="Light Mode"
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px]">Light</span>
            </button>
            <button
              type="button"
              onClick={() => onSetTheme("dark")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                theme === "dark"
                  ? "bg-slate-800 text-cyan-300 shadow-sm border border-slate-700"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
              title="Dark Mode"
            >
              <Moon className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px]">Dark</span>
            </button>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 px-3 py-1.5 rounded-full text-xs shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-slate-600 dark:text-slate-400 font-medium">{provider}:</span>
            <code className="text-cyan-700 dark:text-cyan-300 font-mono text-[11px] bg-slate-200 dark:bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-800">
              {keyPreview || "Active"}
            </code>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 px-2.5 py-1.5 rounded-lg">
            <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>NVIDIA NIM Accelerated</span>
          </div>
        </div>
      </div>
    </header>
  )
}

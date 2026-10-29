import { useState, useEffect } from "react"
import { Navbar } from "@/components/Navbar"
import { TokenBar } from "@/components/TokenBar"
import { SearchBar } from "@/components/SearchBar"
import { AgentStepper } from "@/components/AgentStepper"
import { TerminalLog } from "@/components/TerminalLog"
import { LandingPage } from "@/components/LandingPage"
import { MustKnowPage } from "@/components/MustKnowPage"
import { EvidenceTab } from "@/components/tabs/EvidenceTab"
import { FullPictureTab } from "@/components/tabs/FullPictureTab"
import { TimelineTab } from "@/components/tabs/TimelineTab"
import { GraphTab } from "@/components/tabs/GraphTab"
import { UnresolvedTab } from "@/components/tabs/UnresolvedTab"
import { NodeDrawer } from "@/components/NodeDrawer"
import { DotPattern } from "@/components/magicui/dot-pattern"
import { LiquidNavbar, type LiquidNavItem } from "@/components/ui/liquid-glass-navbar"
import { Tiles } from "@/components/ui/tiles"
import type { TokenStats, ResearchResult, Claim } from "@/types"
import { ScrollText, Layers, Clock, Network, HelpCircle } from "lucide-react"

const TAB_CONFIG: Array<{ id: string; label: string; icon: React.ReactNode; fx: "glow" | "spin" | "wave" | "drop" | "pop" }> = [
  { id: "evidence", label: "Evidence-Based Reconstruction", icon: <ScrollText className="w-4 h-4" />, fx: "glow" },
  { id: "full", label: "Full-Picture (4-Level Architecture)", icon: <Layers className="w-4 h-4" />, fx: "spin" },
  { id: "timeline", label: "Vertical Timeline", icon: <Clock className="w-4 h-4" />, fx: "wave" },
  { id: "graph", label: "Knowledge Graph", icon: <Network className="w-4 h-4" />, fx: "drop" },
  { id: "unresolved", label: "Unresolved Debates", icon: <HelpCircle className="w-4 h-4" />, fx: "pop" },
]

export default function App() {
  const [tokenStats, setTokenStats] = useState<TokenStats | null>(null)
  const [models, setModels] = useState<string[]>([])
  const [defaultModel, setDefaultModel] = useState<string>("meta/llama-3.2-11b-vision-instruct")
  const [currentStep, setCurrentStep] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [isStreaming, setIsStreaming] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>("evidence")
  const [result, setResult] = useState<ResearchResult | null>(null)
  const [currentPage, setCurrentPage] = useState<"landing" | "workspace" | "must-know">("landing")
  const [selectedNode, setSelectedNode] = useState<any | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("histograph_theme")
    return saved === "light" || saved === "dark" ? saved : "dark"
  })

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    localStorage.setItem("histograph_theme", theme)
  }, [theme])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Fetch token stats
  const fetchTokens = async () => {
    try {
      const res = await fetch("/api/tokens")
      if (res.ok) {
        const data = await res.json()
        setTokenStats(data)
      }
    } catch (e) {
      console.warn("Failed to fetch token stats", e)
    }
  }

  // Fetch models
  const fetchModels = async () => {
    try {
      const res = await fetch("/api/models?provider=nvidia")
      if (res.ok) {
        const data = await res.json()
        setModels(data.models || [])
        setDefaultModel(data.default || "meta/llama-3.2-11b-vision-instruct")
      }
    } catch (e) {
      console.warn("Failed to load models", e)
    }
  }

  // Reset tokens
  const handleResetTokens = async () => {
    try {
      const res = await fetch("/api/tokens/reset", { method: "POST" })
      if (res.ok) {
        const data = await res.json()
        setTokenStats(data.stats)
        showToast("Token counters reset to 0")
      }
    } catch (e) {
      showToast("Failed to reset token counters")
    }
  }

  useEffect(() => {
    fetchTokens()
    fetchModels()
  }, [])

  // Start Research via SSE stream
  const handleSearch = async (query: string, model: string) => {
    setIsStreaming(true)
    setCurrentPage("workspace")
    setLogs([])
    setCurrentStep("planner")
    setResult(null)

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-nvidia-model": model || "",
        },
        body: JSON.stringify({ query }),
      })

      if (!response.body) throw new Error("No response body received")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const msg = JSON.parse(line)
            if (msg.type === "tokens" && msg.stats) {
              setTokenStats(msg.stats)
            } else if (msg.type === "log") {
              setLogs((prev) => [...prev, msg.msg])
              if (msg.step) setCurrentStep(msg.step)
            } else if (msg.type === "error") {
              setLogs((prev) => [...prev, `ERROR: ${msg.msg}`])
              showToast(`Error: ${msg.msg}`)
            } else if (msg.type === "result") {
              const resData = msg.data as ResearchResult
              setResult(resData)
              if (resData.token_stats) setTokenStats(resData.token_stats)
              setCurrentStep("done")
              showToast("Historical reconstructions generated!")
              setActiveTab("evidence")
            }
          } catch (err) {
            console.error("Failed to parse stream line:", err)
          }
        }
      }
    } catch (err: any) {
      setLogs((prev) => [...prev, `Pipeline failure: ${err.message}`])
      showToast(`Pipeline failure: ${err.message}`)
    } finally {
      setIsStreaming(false)
      fetchTokens()
    }
  }

  // Download PDF
  const handleDownloadPdf = async () => {
    if (!result) return
    try {
      showToast("Generating academic PDF...")
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      })
      if (!res.ok) throw new Error("PDF generation failed")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `histograph_${Date.now()}.pdf`
      a.click()
      showToast("PDF downloaded successfully!")
    } catch (err: any) {
      showToast(`PDF Export failed: ${err.message}`)
    }
  }

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 dark:bg-[#070a12] dark:text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-800 dark:selection:text-cyan-200 transition-colors duration-200">
      {/* Interactive Hover Tiles Grid Background (Light & Dark default support) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex justify-center mask-[radial-gradient(ellipse_75%_55%_at_50%_25%,#000_70%,transparent_100%)]">
        <Tiles
          rows={32}
          cols={14}
          tileSize="md"
          className="opacity-35 pointer-events-auto"
        />
      </div>

      {/* Magic UI Dot Pattern Background */}
      <DotPattern
        width={32}
        height={32}
        cx={1.5}
        cy={1.5}
        cr={1.5}
        className="opacity-20 mask-[radial-gradient(ellipse_60%_50%_at_50%_20%,#000_70%,transparent_100%)] pointer-events-none"
      />

      {/* Top Navbar with Segmented Theme Switcher & Page Navigation */}
      <Navbar
        keyPreview={tokenStats?.key_preview || ""}
        provider={tokenStats?.provider || "NVIDIA NIM"}
        theme={theme}
        onSetTheme={(t) => setTheme(t)}
        currentPage={currentPage}
        onNavigate={(p) => setCurrentPage(p)}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Standalone Landing Page View */}
        {currentPage === "landing" ? (
          <LandingPage
            onSelectInquiry={(q) => {
              setCurrentPage("workspace")
              handleSearch(q, defaultModel)
            }}
            onOpenWorkspace={() => setCurrentPage("workspace")}
            onOpenMustKnow={() => setCurrentPage("must-know")}
          />
        ) : currentPage === "must-know" ? (
          /* Dedicated Must Know Methodology & Architecture Guide View */
          <MustKnowPage
            onOpenWorkspace={() => setCurrentPage("workspace")}
            onOpenLanding={() => setCurrentPage("landing")}
            onSelectInquiry={(q) => {
              setCurrentPage("workspace")
              handleSearch(q, defaultModel)
            }}
          />
        ) : (
          /* Main Project Investigation Workspace View */
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Token Analytics Dashboard */}
            <TokenBar stats={tokenStats} onReset={handleResetTokens} />

            {/* Search Command Center */}
            <SearchBar
              onSearch={handleSearch}
              onDownloadPdf={handleDownloadPdf}
              isLoading={isStreaming}
              hasResult={!!result}
              models={models}
              defaultModel={defaultModel}
            />

            {/* 6-Stage Agent Stepper */}
            <AgentStepper currentStep={currentStep} />

            {/* Terminal Activity Log */}
            <TerminalLog logs={logs} isStreaming={isStreaming} />

            {/* Nimbus Liquid Glass Waterline Tab Navigation */}
            <div className="flex justify-center items-center py-2.5 overflow-x-auto">
              <LiquidNavbar
                tone={theme}
                sound={true}
                active={Math.max(0, TAB_CONFIG.findIndex((t) => t.id === activeTab))}
                onChange={(index) => setActiveTab(TAB_CONFIG[index].id)}
                items={TAB_CONFIG as LiquidNavItem[]}
                className="shadow-2xl shadow-cyan-950/40 border border-slate-300 dark:border-slate-700/40"
              />
            </div>

            {/* Active Tab View */}
            <div className="pt-2">
              {activeTab === "evidence" && (
                <EvidenceTab
                  reportText={result?.evidence_report || ""}
                  claims={result?.evidence || []}
                  sources={result?.sources || {}}
                  onSelectClaim={(c: Claim) => setSelectedNode(c)}
                />
              )}

              {activeTab === "full" && (
                <FullPictureTab
                  reportText={result?.full_report || ""}
                  sources={result?.sources || {}}
                />
              )}

              {activeTab === "timeline" && (
                <TimelineTab
                  timeline={result?.timeline || []}
                  dateConflicts={result?.date_conflicts || []}
                  onSelectClaim={(c: Claim) => setSelectedNode(c)}
                />
              )}

              {activeTab === "graph" && (
                <GraphTab
                  graphData={result?.graph || null}
                  onSelectNode={(node) => setSelectedNode(node)}
                />
              )}

              {activeTab === "unresolved" && (
                <UnresolvedTab
                  unresolved={result?.unresolved || []}
                  rejected={result?.rejected || []}
                  onSelectClaim={(c: Claim) => setSelectedNode(c)}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Slide-over Node Inspector Drawer */}
      <NodeDrawer
        nodeData={selectedNode}
        sources={result?.sources || {}}
        onClose={() => setSelectedNode(null)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-slate-100 text-xs shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}

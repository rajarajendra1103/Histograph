import { useEffect, useRef, useState } from "react"
import mermaid from "mermaid"
import {
  Activity,
  Cpu
} from "lucide-react"

interface MermaidFlowchartProps {
  onSelectInquiry?: (query: string) => void
}

const FLOWCHART_DEFINITION = `
graph LR
    %% Forensic Pipeline Nodes (Enlarged Box Dimensions)
    A["<b>1. Inquiry Input</b><br/><small>Natural Language Query</small>"]
    B["<b>2. Multi-Modal Ingestion</b><br/><small>Web • Trafilatura • JSTOR • YouTube</small>"]
    C["<b>3. Laya Epistemic Audit</b><br/><small>Verbatim Quotes • Tiers 1-4</small>"]
    D["<b>4. Knowledge Graph</b><br/><small>NetworkX Directed Topology</small>"]
    E["<b>Output 1: Evidence-Based</b><br/><small>Primary Theory • Timeline • Ledger</small>"]
    F["<b>Output 2: Full-Picture</b><br/><small>4-Level Historiographical Synthesis</small>"]

    %% Connectors (Dispatched, Ingested Texts, Verified Claims, Synthesizes) with Spaced Badges
    A -->|"&nbsp;&nbsp;Dispatched&nbsp;&nbsp;"| B
    B -->|"&nbsp;&nbsp;Ingested Texts&nbsp;&nbsp;"| C
    C -->|"&nbsp;&nbsp;Verified Claims&nbsp;&nbsp;"| D
    D -->|"&nbsp;&nbsp;Synthesizes&nbsp;&nbsp;"| E
    D -->|"&nbsp;&nbsp;Synthesizes&nbsp;&nbsp;"| F

    %% Styling Classes with Increased Box Radius & Border Width
    classDef startNode fill:#0284c7,stroke:#38bdf8,stroke-width:2.5px,color:#ffffff,rx:14px,ry:14px;
    classDef crawlNode fill:#2563eb,stroke:#60a5fa,stroke-width:2.5px,color:#ffffff,rx:14px,ry:14px;
    classDef layaNode fill:#059669,stroke:#34d399,stroke-width:2.5px,color:#ffffff,rx:14px,ry:14px;
    classDef graphNode fill:#4f46e5,stroke:#818cf8,stroke-width:2.5px,color:#ffffff,rx:14px,ry:14px;
    classDef outNode fill:#0f172a,stroke:#38bdf8,stroke-width:2.5px,color:#f8fafc,rx:14px,ry:14px;

    class A startNode;
    class B crawlNode;
    class C layaNode;
    class D graphNode;
    class E,F outNode;
`

export function MermaidFlowchart({ onSelectInquiry: _onSelectInquiry }: MermaidFlowchartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svgContent, setSvgContent] = useState<string>("")
  const [renderError, setRenderError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const renderMermaid = async () => {
      try {
        const isDark = document.documentElement.classList.contains("dark")

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          theme: isDark ? "dark" : "neutral",
          themeVariables: {
            darkMode: isDark,
            primaryColor: isDark ? "#0284c7" : "#0284c7",
            primaryTextColor: "#ffffff",
            primaryBorderColor: "#38bdf8",
            lineColor: isDark ? "#38bdf8" : "#0284c7",
            secondaryColor: "#2563eb",
            tertiaryColor: "#059669",
            mainBkg: isDark ? "#090d16" : "#ffffff",
            nodeBorder: "#38bdf8",
            edgeLabelBackground: "#ea580c",
            labelBoxBkgColor: "#ea580c",
            labelBoxBorderColor: "#ffffff",
            labelTextColor: "#ffffff",
            nodePadding: 22,
          },
        })

        const uniqueId = `mermaid-flowchart-${Math.random().toString(36).substring(2, 9)}`
        const { svg } = await mermaid.render(uniqueId, FLOWCHART_DEFINITION)

        if (isMounted) {
          // Inject animated stream classes directly into rendered SVG
          const animatedSvg = svg
            .replace(
              "<style>",
              `<style>
                .edgePath path {
                  stroke: #38bdf8 !important;
                  stroke-width: 2.5px !important;
                  stroke-dasharray: 6 5 !important;
                  animation: mermaid-flow 1.5s linear infinite !important;
                }
                @keyframes mermaid-flow {
                  to { stroke-dashoffset: -22; }
                }
                /* Node Boxes - Increased Size, Rounded, Glowing */
                .node rect, .node polygon, .node circle {
                  rx: 14px !important;
                  ry: 14px !important;
                  stroke-width: 2.5px !important;
                  filter: drop-shadow(0 4px 14px rgba(14, 165, 233, 0.35)) !important;
                  transition: all 0.3s ease !important;
                }
                .node:hover rect, .node:hover polygon, .node:hover circle {
                  filter: drop-shadow(0 0 18px rgba(56, 189, 248, 0.75)) !important;
                  transform: scale(1.03);
                }
                .node .label {
                  font-family: inherit !important;
                  padding: 10px 16px !important;
                }

                /* Edge Labels: Dispatched, Ingested Texts, Verified Claims, Synthesizes */
                /* Orange background, white border, increased box size pill */
                .edgeLabel {
                  background-color: transparent !important;
                }
                .edgeLabel foreignObject {
                  overflow: visible !important;
                }
                .edgeLabel foreignObject > div {
                  overflow: visible !important;
                  display: flex !important;
                  justify-content: center !important;
                  align-items: center !important;
                }
                .edgeLabel span,
                .edgeLabel .label span,
                .edgeLabel div > span,
                span.edgeLabel {
                  background: #ea580c !important;
                  background-color: #ea580c !important;
                  color: #ffffff !important;
                  border: 2px solid #ffffff !important;
                  border-radius: 9999px !important;
                  padding: 6px 14px !important;
                  font-size: 11.5px !important;
                  font-weight: 800 !important;
                  letter-spacing: 0.03em !important;
                  box-shadow: 0 4px 14px rgba(234, 88, 12, 0.55), 0 0 10px rgba(255, 255, 255, 0.35) !important;
                  display: inline-block !important;
                  white-space: nowrap !important;
                  line-height: 1.2 !important;
                }
                .edgeLabel rect,
                .edgeLabel .label-container {
                  fill: #ea580c !important;
                  stroke: #ffffff !important;
                  stroke-width: 2.5px !important;
                  rx: 12px !important;
                  ry: 12px !important;
                  filter: drop-shadow(0 4px 12px rgba(234, 88, 12, 0.5)) !important;
                }
                .edgeLabel text {
                  fill: #ffffff !important;
                  color: #ffffff !important;
                  font-weight: 800 !important;
                  font-size: 11.5px !important;
                }
              `
            )
          setSvgContent(animatedSvg)
          setRenderError(null)
        }
      } catch (err: any) {
        console.warn("[MermaidFlowchart] Render error:", err)
        if (isMounted) {
          setRenderError(err?.message || "Failed to render Mermaid diagram.")
        }
      }
    }

    renderMermaid()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="space-y-4">
      {/* Animated Mermaid SVG Canvas */}
      <div className="relative overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/80 p-5 shadow-sm dark:shadow-xl transition-all">
        {/* Glow ambient background aura */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-32 bg-cyan-500/10 dark:bg-cyan-500/15 blur-3xl pointer-events-none rounded-full" />

        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span>Live Mermaid.js Forensic Architecture Diagram</span>
          </div>
          <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 flex items-center gap-1 font-semibold">
            <Activity className="w-3.5 h-3.5" />
            <span>Active Real-Time Pulse Flow</span>
          </span>
        </div>

        {/* SVG Container */}
        {svgContent ? (
          <div
            ref={containerRef}
            className="flex justify-center items-center py-4 min-w-[720px] transition-all overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : renderError ? (
          <div className="text-center py-10 text-xs text-rose-500 font-mono">
            {renderError}
          </div>
        ) : (
          <div className="flex items-center justify-center py-14 text-xs text-slate-400 font-mono gap-2">
            <Cpu className="w-4 h-4 animate-spin text-cyan-500" />
            <span>Compiling Mermaid Forensic Diagram...</span>
          </div>
        )}
      </div>
    </div>
  )
}

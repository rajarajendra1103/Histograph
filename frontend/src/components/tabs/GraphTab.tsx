import { useEffect, useRef, useState } from "react"
import cytoscape from "cytoscape"
import type { Core } from "cytoscape"
import { Share2, Maximize2, Network, GitFork, Disc } from "lucide-react"
import type { CytoscapeData } from "@/types"

interface GraphTabProps {
  graphData: CytoscapeData | null
  onSelectNode: (nodeData: any) => void
}

export function GraphTab({ graphData, onSelectNode }: GraphTabProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<Core | null>(null)
  const [layoutName, setLayoutName] = useState<string>("cose")

  useEffect(() => {
    if (!containerRef.current || !graphData || !graphData.elements) return

    if (cyRef.current) {
      cyRef.current.destroy()
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements: graphData.elements as any,
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
            color: "#f8fafc",
            "font-size": "11px",
            "font-weight": 600,
            "text-valign": "bottom",
            "text-margin-y": 6,
            "text-outline-color": "#070b12",
            "text-outline-width": 2,
            "background-color": (ele: any) => {
              const d = ele.data();
              if (d.color && typeof d.color === 'string' && d.color.startsWith('#')) return d.color;
              const cat = String(d.category || '').toLowerCase();
              if (cat === 'established') return '#16a34a';
              if (cat === 'competing') return '#eab308';
              if (cat === 'minority' || cat === 'hypothesis') return '#3b82f6';
              const kind = String(d.type || d.node_type || d.kind || '').toLowerCase();
              if (kind === 'event') return '#9333ea';
              if (kind === 'theory') return '#db2777';
              if (kind === 'person') return '#0891b2';
              if (kind === 'place') return '#d97706';
              if (kind === 'source') return '#64748b';
              return '#16a34a';
            },
            shape: "data(shape)" as any,
            width: 32,
            height: 32,
            "border-width": 1.5,
            "border-color": "#ffffff",
            "border-opacity": 0.4,
          },
        },
        {
          selector: "node:selected",
          style: {
            "border-width": 3,
            "border-color": "#38bdf8",
            "border-opacity": 1,
          },
        },
        {
          selector: "node[category='established']",
          style: {
            "background-color": "#16a34a",
          },
        },
        {
          selector: "node[category='competing']",
          style: {
            "background-color": "#eab308",
          },
        },
        {
          selector: "node[category='minority'], node[category='hypothesis']",
          style: {
            "background-color": "#3b82f6",
          },
        },
        {
          selector: "node[type='Event'], node[kind='Event']",
          style: {
            shape: "ellipse",
            "background-color": "#9333ea",
          },
        },
        {
          selector: "node[type='Theory'], node[kind='Theory']",
          style: {
            shape: "diamond",
            width: 38,
            height: 38,
            "background-color": "#db2777",
          },
        },
        {
          selector: "node[type='Person'], node[kind='Person']",
          style: {
            shape: "hexagon",
            "background-color": "#0891b2",
          },
        },
        {
          selector: "node[type='Place'], node[kind='Place']",
          style: {
            shape: "tag",
            "background-color": "#d97706",
          },
        },
        {
          selector: "node[kind='Source']",
          style: {
            shape: "barrel",
            "background-color": "#64748b",
            width: 26,
            height: 26,
          },
        },
        {
          selector: "edge",
          style: {
            width: 1.5,
            "line-color": "#334155",
            "target-arrow-color": "#475569",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            label: "data(label)",
            "font-size": "9px",
            color: "#94a3b8",
            "text-rotation": "autorotate",
            "text-background-opacity": 0.8,
            "text-background-color": "#090d16",
            "text-background-padding": "2px",
          },
        },
        {
          selector: "edge[type='CONTRADICTS']",
          style: {
            "line-color": "#ef4444",
            "target-arrow-color": "#ef4444",
            "line-style": "dashed",
            width: 2,
          },
        },
      ],
      layout: {
        name: layoutName,
        animate: true,
        animationDuration: 600,
      } as any,
    })

    cy.on("tap", "node", (evt) => {
      const node = evt.target
      onSelectNode(node.data())
    })

    cyRef.current = cy

    return () => {
      cy.destroy()
    }
  }, [graphData, layoutName])

  const handleRelayout = (name: string) => {
    setLayoutName(name)
    if (cyRef.current) {
      cyRef.current.layout({ name, animate: true, animationDuration: 500 } as any).run()
    }
  }

  const handleFit = () => {
    if (cyRef.current) {
      cyRef.current.fit(undefined, 30)
    }
  }

  const elementsCount = graphData?.elements?.nodes?.length || 0

  if (elementsCount === 0) {
    return (
      <div className="text-center py-20 text-slate-500 text-sm">
        <Network className="w-10 h-10 mx-auto mb-3 opacity-40 text-cyan-400" />
        <p>Run a research inquiry to construct the in-memory knowledge graph.</p>
      </div>
    )
  }

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl overflow-hidden shadow-sm dark:shadow-2xl transition-colors duration-200">
      {/* Floating Layout Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 p-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm dark:shadow-lg">
        <button
          onClick={() => handleRelayout("cose")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
            layoutName === "cose"
              ? "bg-cyan-100 text-cyan-800 border border-cyan-300 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
          title="Force-directed physics layout"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Force (COSE)</span>
        </button>

        <button
          onClick={() => handleRelayout("breadthfirst")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
            layoutName === "breadthfirst"
              ? "bg-cyan-100 text-cyan-800 border border-cyan-300 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
          title="Hierarchical tree layout"
        >
          <GitFork className="w-3.5 h-3.5" />
          <span>Hierarchy</span>
        </button>

        <button
          onClick={() => handleRelayout("concentric")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
            layoutName === "concentric"
              ? "bg-cyan-100 text-cyan-800 border border-cyan-300 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
          title="Radial concentric layout"
        >
          <Disc className="w-3.5 h-3.5" />
          <span>Concentric</span>
        </button>

        <div className="w-px h-4 bg-slate-300 dark:bg-slate-800 mx-1" />

        <button
          onClick={handleFit}
          className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 cursor-pointer"
          title="Fit view"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="w-full h-155 bg-slate-50/70 dark:bg-[#070b12]" />

      {/* Floating Legend */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-center gap-3 p-2 rounded-xl bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 backdrop-blur-md text-[11px] text-slate-700 dark:text-slate-300 shadow-sm dark:shadow-md">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#16a34a]" /> Consensus
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#eab308]" /> Competing Theory
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#3b82f6]" /> Hypothesis
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-[#9333ea]" /> Event
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rotate-45 bg-[#db2777]" /> Theory
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#0891b2]" /> Person
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#d97706]" /> Place
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#64748b]" /> Source
        </span>
      </div>
    </div>
  )
}

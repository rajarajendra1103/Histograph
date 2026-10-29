import {
  ArrowRight,
  ShieldCheck,
  Network,
  Layers,
  Clock,
  Waves,
  Landmark,
  Flame,
  Compass,
  CheckCircle2,
  Radio,
  BookOpen
} from "lucide-react"
import { MermaidFlowchart } from "@/components/MermaidFlowchart"

interface LandingPageProps {
  onSelectInquiry: (query: string) => void
  onOpenWorkspace: () => void
  onOpenMustKnow?: () => void
}

interface HistoricalEvent {
  id: string
  title: string
  era: string
  subtitle: string
  query: string
  image: string
  icon: React.ReactNode
  tag: string
  accentColor: string
  borderColor: string
  bgGradient: string
  evidenceAnchors: string[]
}

const HISTORICAL_EVENTS: HistoricalEvent[] = [
  {
    id: "indus",
    title: "Decline of the Indus Valley",
    era: "~1900 – 1300 BCE",
    subtitle: "Did hydro-climatic megadroughts, drying river channels, or invasions end South Asia's first great urban civilization?",
    query: "What caused the decline of the Indus Valley Civilization?",
    image: "/images/indus.jpg",
    icon: <Waves className="w-4 h-4 text-emerald-400" />,
    tag: "South Asian Bronze Age",
    accentColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-300/60 dark:border-emerald-500/30 hover:border-emerald-400 dark:hover:border-emerald-400",
    bgGradient: "bg-linear-to-br from-emerald-50/70 via-white to-slate-50 dark:from-emerald-950/25 dark:via-slate-900/60 dark:to-slate-950",
    evidenceAnchors: ["Speleothem d18O Records", "Ghaggar-Hakra Paleochannels", "Kotla Dahar Sediments"],
  },
  {
    id: "alexandria",
    title: "The Library of Alexandria",
    era: "~48 BCE – 642 CE",
    subtitle: "Was antiquity's greatest repository annihilated in a solitary conflagration or through five centuries of gradual institutional decay?",
    query: "Was the Library of Alexandria destroyed in a single catastrophe or gradual decay?",
    image: "/images/alexandria.jpg",
    icon: <Landmark className="w-4 h-4 text-amber-400" />,
    tag: "Ptolemaic & Roman Egypt",
    accentColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-300/60 dark:border-amber-500/30 hover:border-amber-400 dark:hover:border-amber-400",
    bgGradient: "bg-linear-to-br from-amber-50/70 via-white to-slate-50 dark:from-amber-950/25 dark:via-slate-900/60 dark:to-slate-950",
    evidenceAnchors: ["Strabo's Geographica", "Oxyrhynchus Papyri", "Alexandria Harbor Geoarchaeology"],
  },
  {
    id: "bronze-collapse",
    title: "Late Bronze Age Collapse",
    era: "~1200 – 1150 BCE",
    subtitle: "How did a synchronous cascade of megadroughts, earthquake storms, and Sea Peoples raiders collapse Mycenae, Ugarit, and Hattusa in 50 years?",
    query: "What triggered the Late Bronze Age Collapse in the Eastern Mediterranean?",
    image: "/images/bronze_age.jpg",
    icon: <Flame className="w-4 h-4 text-rose-400" />,
    tag: "Eastern Mediterranean",
    accentColor: "text-rose-600 dark:text-rose-400",
    borderColor: "border-rose-300/60 dark:border-rose-500/30 hover:border-rose-400 dark:hover:border-rose-400",
    bgGradient: "bg-linear-to-br from-rose-50/70 via-white to-slate-50 dark:from-rose-950/25 dark:via-slate-900/60 dark:to-slate-950",
    evidenceAnchors: ["Ugarit Amarna Famine Tablets", "Hattusa Upper City Burn Horizons", "Aegean Pollen Cores"],
  },
  {
    id: "rome-fall",
    title: "Fall of the Western Roman Empire",
    era: "~376 – 476 CE",
    subtitle: "Did climate deterioration (Late Antique Little Ice Age), pandemics, or federated military disintegration precipitate Rome's collapse?",
    query: "Did the Roman Empire fall primarily due to climate shocks or military invasions?",
    image: "/images/rome_fall.jpg",
    icon: <Compass className="w-4 h-4 text-indigo-400" />,
    tag: "Late Antiquity & Rome",
    accentColor: "text-indigo-600 dark:text-indigo-400",
    borderColor: "border-indigo-300/60 dark:border-indigo-500/30 hover:border-indigo-400 dark:hover:border-indigo-400",
    bgGradient: "bg-linear-to-br from-indigo-50/70 via-white to-slate-50 dark:from-indigo-950/25 dark:via-slate-900/60 dark:to-slate-950",
    evidenceAnchors: ["Alpine Ice-Core Lead Emissions", "Tree-Ring Dendroclimatology", "Numismatic Debasement"],
  },
]

interface IngestedSourceItem {
  id: string
  title: string
  logo: string
  associatedQuery: string
}

const INGESTED_SOURCES: IngestedSourceItem[] = [
  {
    id: "S1",
    title: "CrossRef",
    logo: "/logos/CrossRef.png",
    associatedQuery: "What caused the decline of the Indus Valley Civilization?",
  },
  {
    id: "S2",
    title: "Internet Archive",
    logo: "/logos/Internet_Archive_logo_and_wordmark.png",
    associatedQuery: "Was the Library of Alexandria destroyed in a single catastrophe or gradual decay?",
  },
  {
    id: "S3",
    title: "Library of Congress",
    logo: "/logos/Library of Congress.jpg",
    associatedQuery: "What triggered the Late Bronze Age Collapse in the Eastern Mediterranean?",
  },
  {
    id: "S4",
    title: "OpenAlex",
    logo: "/logos/OpenAlxe.jpg",
    associatedQuery: "Did the Roman Empire fall primarily due to climate shocks or military invasions?",
  },
  {
    id: "S5",
    title: "Research Papers",
    logo: "/logos/research-paper.png",
    associatedQuery: "What caused the decline of the Indus Valley Civilization?",
  },
  {
    id: "S6",
    title: "Web Search",
    logo: "/logos/web search.png",
    associatedQuery: "What caused the decline of the Indus Valley Civilization?",
  },
  {
    id: "S7",
    title: "Whisper Audio",
    logo: "/logos/whesper.png",
    associatedQuery: "Was the Library of Alexandria destroyed in a single catastrophe or gradual decay?",
  },
  {
    id: "S8",
    title: "Wikipedia",
    logo: "/logos/Wikipedia-logos.jpg",
    associatedQuery: "Was the Library of Alexandria destroyed in a single catastrophe or gradual decay?",
  },
  {
    id: "S9",
    title: "YouTube",
    logo: "/logos/youtube.png",
    associatedQuery: "What triggered the Late Bronze Age Collapse in the Eastern Mediterranean?",
  },
]

export function LandingPage({ onSelectInquiry, onOpenWorkspace, onOpenMustKnow }: LandingPageProps) {
  return (
    <div className="space-y-12 py-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* 1. Hero Introduction Banner */}
      <div className="text-center max-w-4xl mx-auto space-y-4 px-4">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Reconstruct Ancient History Through{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-600 via-blue-600 to-indigo-600 dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-400">
            Epistemic Evidence
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Histograph crawls multi-modal academic repositories, cross-checks physical excavation stratigraphy
          with ancient contemporary texts, and synthesizes dual historical models: an evidence-grounded truth ledger
          and a 4-level historiographical architecture.
        </p>

        {/* Primary CTA Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
          <button
            onClick={onOpenWorkspace}
            className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-linear-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:brightness-110 shadow-lg shadow-cyan-500/30 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Open Research Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          {onOpenMustKnow && (
            <button
              onClick={onOpenMustKnow}
              className="px-5 py-3 rounded-xl font-bold text-sm text-indigo-700 dark:text-indigo-300 bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-700/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 shadow-sm active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span>Must Know: Concepts &amp; 4-Level Architecture</span>
            </button>
          )}
        </div>

        {/* Feature Highlights Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-3 text-[11px] font-medium text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 100% Verbatim Quote Verification
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" /> Laya Epistemic Audit (Tiers 1-4)
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
            <Network className="w-3.5 h-3.5 text-indigo-500" /> In-Memory NetworkX Graph
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs">
            <Layers className="w-3.5 h-3.5 text-amber-500" /> 4-Level Master Synthesis
          </span>
        </div>
      </div>

      {/* 2. Featured Historical Events Grid with Real Downloaded Imagery */}
      <div className="space-y-4 px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Featured Historical Enigmas</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">Click card to launch direct investigation</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {HISTORICAL_EVENTS.map((event) => (
            <div
              key={event.id}
              onClick={() => onSelectInquiry(event.query)}
              className={`group relative overflow-hidden rounded-2xl border ${event.borderColor} ${event.bgGradient} p-4 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer backdrop-blur-xl flex flex-col justify-between`}
            >
              <div>
                {/* Visual Image Header */}
                <div className="relative h-48 w-full overflow-hidden rounded-xl mb-3.5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-95 group-hover:brightness-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

                  {/* Era pill */}
                  <span className="absolute bottom-2.5 left-2.5 text-[10px] font-mono px-2.5 py-1 rounded-md bg-slate-900/90 text-white border border-slate-700/80 font-bold shadow-xs">
                    {event.era}
                  </span>

                  {/* Tag pill */}
                  <span className={`absolute bottom-2.5 right-2.5 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md bg-white/95 dark:bg-slate-900/95 ${event.accentColor} border border-slate-200 dark:border-slate-800 shadow-xs`}>
                    {event.tag}
                  </span>
                </div>

                {/* Event Title & Subtitle */}
                <div className="flex items-start gap-2.5 mb-2">
                  <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs shrink-0 mt-0.5">
                    {event.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-50 text-base group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                      {event.subtitle}
                    </p>
                  </div>
                </div>

                {/* Evidence Anchors Chips */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-mono text-slate-500">Physical Proxies:</span>
                  {event.evidenceAnchors.map((anchor, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-[10px] font-medium text-slate-700 dark:text-slate-300"
                    >
                      {anchor}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Footer */}
              <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                  Investigate Primary Stratigraphy & Texts
                </span>
                <span className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 group-hover:translate-x-1.5 transition-transform font-bold">
                  <span>Start Inquiry</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Mermaid Forensic Architecture Flowchart with React Animation */}
      <div className="px-4 sm:px-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/70 p-6 backdrop-blur-xl shadow-sm dark:shadow-xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              <Radio className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Histograph Forensic Architecture Flowchart (Mermaid.js + React Animation)</span>
            </div>
            <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
              Real-time animated pulse stream
            </span>
          </div>

          <MermaidFlowchart onSelectInquiry={onSelectInquiry} />
        </div>
      </div>

      {/* 4. Live Ingested Sources Logo Ticker (Borderless, No Headline, No Download Button, Vertical Compact Card: Logo & Title Only) */}
      <div className="px-2 sm:px-4 py-3 overflow-hidden">
        <div className="relative overflow-hidden py-3 mask-[linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
          <div className="animate-marquee flex gap-4 items-center">
            {/* First Set of Items */}
            {INGESTED_SOURCES.map((src) => (
              <div
                key={`src-1-${src.id}`}
                onClick={() => onSelectInquiry(src.associatedQuery)}
                className="group flex flex-col items-center justify-center w-28 sm:w-32 h-32 sm:h-36 px-2.5 py-3 rounded-2xl bg-white/80 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 shrink-0 cursor-pointer backdrop-blur-md hover:-translate-y-1 text-center"
                title={`Click to investigate: ${src.associatedQuery}`}
              >
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 p-2 shadow-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                  <img
                    src={encodeURI(src.logo)}
                    alt={src.title}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2.5 truncate w-full group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  {src.title}
                </span>
              </div>
            ))}

            {/* Second Duplicate Set of Items for Seamless Infinite Loop */}
            {INGESTED_SOURCES.map((src) => (
              <div
                key={`src-2-${src.id}`}
                onClick={() => onSelectInquiry(src.associatedQuery)}
                className="group flex flex-col items-center justify-center w-28 sm:w-32 h-32 sm:h-36 px-2.5 py-3 rounded-2xl bg-white/80 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 shrink-0 cursor-pointer backdrop-blur-md hover:-translate-y-1 text-center"
                title={`Click to investigate: ${src.associatedQuery}`}
              >
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 p-2 shadow-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                  <img
                    src={encodeURI(src.logo)}
                    alt={src.title}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2.5 truncate w-full group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  {src.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Bottom Call to Action */}
      <div className="text-center py-6 px-4">
        <button
          onClick={onOpenWorkspace}
          className="px-8 py-3.5 rounded-2xl font-bold text-sm text-white bg-linear-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:brightness-110 shadow-xl shadow-cyan-500/35 active:scale-95 transition-all inline-flex items-center gap-2.5 cursor-pointer"
        >
          <span>Launch Custom Historical Investigation</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <p className="text-xs text-slate-500 mt-2">
          Or pick any historical enigma card above to start instantly
        </p>
      </div>
    </div>
  )
}

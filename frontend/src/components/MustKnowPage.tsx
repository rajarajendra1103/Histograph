import {
  Compass,
  Layers,
  Network,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText
} from "lucide-react"

interface MustKnowPageProps {
  onOpenWorkspace: () => void
  onOpenLanding: () => void
  onSelectInquiry: (query: string) => void
}

export function MustKnowPage({
  onOpenWorkspace,
  onOpenLanding,
  onSelectInquiry,
}: MustKnowPageProps) {
  return (
    <div className="space-y-12 py-4 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Page Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-linear-to-br from-cyan-950/40 via-slate-900/80 to-slate-950 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              HISTOGRAPH EPISTEMIC BLUEPRINT
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              METHODOLOGY & ARCHITECTURE GUIDE
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Must Know:{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 via-sky-300 to-indigo-400">
              Historiographical Architecture
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Why does Histograph reject simple one-sentence AI summaries? Ancient history is not a flat list of dates.
            It is a multi-dimensional tension between physical archaeological strata, contemporary epigraphic records,
            and competing modern historiographical schools. Here is the full guide to the concepts and 4-level architecture.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenWorkspace}
              className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-linear-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:brightness-110 shadow-lg shadow-cyan-500/30 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Open Research Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenLanding}
              className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Return to Landing Page</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: Core Concepts Demystified (Pivot Point, Scholar Assessment, Compatible Factors, Master Synthesis) */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Compass className="w-6 h-6 text-cyan-500" />
            <span>1. Core Historical Concepts: What They Are & Why They Matter</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            These four foundational constructs power Histograph&apos;s forensic reconstructions in Output 2.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Concept 1: Pivot Point */}
          <div className="rounded-2xl border border-cyan-300/60 dark:border-cyan-700/40 bg-white dark:bg-slate-900/70 p-6 shadow-sm dark:shadow-xl space-y-3.5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-100 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700/60">
                LOCATED IN: LEVEL 4 & TIMELINE
              </span>
              <Clock className="w-5 h-5 text-cyan-500" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              The Pivot Point
            </h3>

            <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                <strong className="text-slate-900 dark:text-white">What is it?</strong> The precise chronological juncture or systemic threshold where an ancient civilization&apos;s equilibrium irreversibly tipped from resilience into irreversible structural transformation or collapse.
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white">Why is it new?</strong> Traditional AI presents history as a vague, gradual blur (&quot;Rome declined over many centuries due to many factors&quot;). Histograph isolates the exact <em>Pivot Point</em> (such as the 4.2kBP Meghalayan megadrought shift in ~2200 BCE, or the 48 BCE Alexandrian Harbor conflagration) that precipitated the cascade.
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white">Why it matters:</strong> It distinguishes baseline background friction (*longue durée*) from the catalytic phase-shift that made recovery impossible.
              </p>
            </div>
          </div>

          {/* Concept 2: Scholar Assessment / Historiographical Schools */}
          <div className="rounded-2xl border border-indigo-300/60 dark:border-indigo-700/40 bg-white dark:bg-slate-900/70 p-6 shadow-sm dark:shadow-xl space-y-3.5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700/60">
                LOCATED IN: LEVEL 2
              </span>
              <BookOpen className="w-5 h-5 text-indigo-500" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Scholar Assessment & Historiographical Schools
            </h3>

            <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                <strong className="text-slate-900 dark:text-white">What is it?</strong> A rigorous comparative audit of how different historical traditions interpret the event—comparing the <em>Environmental/Climatic School</em>, the <em>Marxist/Materialist Tradition</em>, the <em>Institutional/Administrative School</em>, and the <em>Processual Archaeological Paradigm</em>.
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white">Why is it new?</strong> Rather than pretending all historians agree, Histograph explicitly computes the <strong>Scholarly Consensus Score</strong>, outlines the foundational texts of each school, and illuminates the active historiographical fault lines.
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white">Why it matters:</strong> Prevents modern ideological bias (&quot;presentism&quot;) by uncovering how historical interpretations themselves shifted from 19th-century colonial views to 21st-century bio-archaeology.
              </p>
            </div>
          </div>

          {/* Concept 3: Compatible Determining Factors */}
          <div className="rounded-2xl border border-emerald-300/60 dark:border-emerald-700/40 bg-white dark:bg-slate-900/70 p-6 shadow-sm dark:shadow-xl space-y-3.5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60">
                LOCATED IN: LEVEL 3 & GRAPH
              </span>
              <Network className="w-5 h-5 text-emerald-500" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Compatible Determining Factors
            </h3>

            <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                <strong className="text-slate-900 dark:text-white">What is it?</strong> The multi-vector synthesis showing how seemingly rival historical theories are not mutually exclusive, but rather operate together as complementary, interlocked gears of causation.
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white">Why is it new?</strong> Destroys the <em>Mono-Causal Fallacy</em> (&quot;Was it megadrought OR barbarian invasions?&quot;). Histograph maps the causal topology: Climate aridity (Factor A) caused agricultural surplus deficits, which triggered rural unrest (Factor B), which bankrupted military border garrisons (Factor C).
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white">Why it matters:</strong> Ancient civilizational systems were complex, hyper-connected networks; their devolution was always multi-vectored and synchronous.
              </p>
            </div>
          </div>

          {/* Concept 4: Master Synthesis Narrative */}
          <div className="rounded-2xl border border-amber-300/60 dark:border-amber-700/40 bg-white dark:bg-slate-900/70 p-6 shadow-sm dark:shadow-xl space-y-3.5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60">
                LOCATED IN: LEVEL 4 MASTER OUTPUT
              </span>
              <FileText className="w-5 h-5 text-amber-500" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              The Master Synthesis Narrative
            </h3>

            <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                <strong className="text-slate-900 dark:text-white">What is it?</strong> The culminating meta-historical reconstruction that weaves all hard physical strata, textual epigraphy, historiographical debates, and structural vectors into an authoritative, publication-ready academic dossier.
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white">Why is it new?</strong> Unlike generic chat models that bluff or hallucinate answers when data is missing, the Master Synthesis explicitly highlights <strong>Residual Enigmas</strong>—documenting exactly what remains unknown due to lost texts or unexcavated strata.
              </p>
              <p>
                <strong className="text-slate-900 dark:text-white">Why it matters:</strong> Delivers intellectual honesty and true academic utility. Researchers receive both the verified consensus and the frontiers of active discovery.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: The 4-Level Historiographical Architecture (Levels 1, 2, 3, 4 & WHY) */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-indigo-500" />
            <span>2. The 4-Level Historiographical Architecture: Why Each Level Exists</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Histograph synthesizes every historical inquiry across four distinct analytical strata.
          </p>
        </div>

        <div className="space-y-4">
          {/* Level 1 */}
          <div className="rounded-2xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/40 dark:bg-sky-950/20 p-5 sm:p-6 transition-all space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-sky-600 text-white font-bold font-mono text-sm shadow-md shadow-sky-600/30">
                  L1
                </span>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    Level 1: Primary Evidence & Physical Archaeological Grounding
                  </h3>
                  <span className="text-xs font-mono text-sky-700 dark:text-sky-300">
                    Strata &middot; Epigraphic Inscriptions &middot; Speleothems &middot; Radiocarbon &middot; Numismatics
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200 border border-sky-300 dark:border-sky-700">
                WHY IT EXISTS: Anti-Hallucination Anchor
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong>Why Level 1 is mandatory:</strong> Without hard empirical data, historical inquiries degrade into mythology or ideological propaganda. Level 1 enforces that every foundational claim is physically grounded in excavated archaeological strata (such as burn layers at Hattusa or mudbrick devolution at Mohenjo-daro) or primary isotopic proxy data (speleothem δ18O cores).
            </p>
          </div>

          {/* Level 2 */}
          <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 p-5 sm:p-6 transition-all space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold font-mono text-sm shadow-md shadow-indigo-600/30">
                  L2
                </span>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    Level 2: Competing Historiographical Schools & Scholarly Traditions
                  </h3>
                  <span className="text-xs font-mono text-indigo-700 dark:text-indigo-300">
                    Marxist &middot; Environmental &middot; Annales &middot; Institutional &middot; Consensus Metric
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-700">
                WHY IT EXISTS: Captures Academic Controversy
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong>Why Level 2 is mandatory:</strong> History is never settled by a single researcher. By cataloging the major scholarly traditions and assigning quantitative consensus scores, Histograph ensures the user sees both the established academic baseline and the unresolved debates between opposing historical schools.
            </p>
          </div>

          {/* Level 3 */}
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-5 sm:p-6 transition-all space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold font-mono text-sm shadow-md shadow-emerald-600/30">
                  L3
                </span>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    Level 3: Structural Vectors & Compatible Determining Factors
                  </h3>
                  <span className="text-xs font-mono text-emerald-700 dark:text-emerald-300">
                    Longue Durée &middot; Ecological Strain &middot; Trade Networks &middot; Institutional Vulnerability
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                WHY IT EXISTS: Multi-Causal System Dynamics
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong>Why Level 3 is mandatory:</strong> Civilizations operate on Fernand Braudel&apos;s concept of multiple temporalities: the slow, geological <em>longue durée</em> (shifts in river hydrology or climate) and the fast <em>temps court</em> (sudden military raids or palace coups). Level 3 connects these vectors into an interlocking causal matrix.
            </p>
          </div>

          {/* Level 4 */}
          <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-5 sm:p-6 transition-all space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-600 text-white font-bold font-mono text-sm shadow-md shadow-amber-600/30">
                  L4
                </span>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    Level 4: Master Synthesis Narrative & Metahistorical Resolution
                  </h3>
                  <span className="text-xs font-mono text-amber-700 dark:text-amber-300">
                    Epistemic Balance &middot; Pivot Point Identification &middot; Residual Enigmas &middot; PDF Dossier
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                WHY IT EXISTS: Definitive Academic Clarity
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong>Why Level 4 is mandatory:</strong> Raw evidence and academic debates are useless without synthesis. Level 4 synthesizes the entire corpus into an elegant, coherent master narrative, highlighting the exact Pivot Point while explicitly outlining what remains unproven due to lost records.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: Laya Epistemic Audit (Tiers 1, 2, 3, 4 & WHY) */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            <span>3. Laya Epistemic Audit: 4-Tier Source Hierarchy &amp; Verification Rules</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            How the automated Laya validator filters web corpora to ensure 100% evidentiary truth.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/50 dark:bg-emerald-950/30 p-4 space-y-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-600 text-white">
              TIER 1 (Gold Standard)
            </span>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Primary Empirical Records
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Physical excavation strata, contemporary epigraphic tablets, isotopic ice/cave cores, C14 dates.
            </p>
            <div className="pt-2 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              ✓ Full Authority to Confirm Claims
            </div>
          </div>

          <div className="rounded-xl border border-cyan-300 dark:border-cyan-700/60 bg-cyan-50/50 dark:bg-cyan-950/30 p-4 space-y-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-600 text-white">
              TIER 2 (High Trust)
            </span>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Contemporary Chronicles & Excavation Reports
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Eyewitness ancient historians (Strabo, Polybius), official Archaeological Survey publications.
            </p>
            <div className="pt-2 text-[11px] font-semibold text-cyan-700 dark:text-cyan-400">
              ✓ Audited Context &amp; Date Consistency
            </div>
          </div>

          <div className="rounded-xl border border-indigo-300 dark:border-indigo-700/60 bg-indigo-50/50 dark:bg-indigo-950/30 p-4 space-y-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-600 text-white">
              TIER 3 (Secondary)
            </span>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Peer-Reviewed Modern Scholarship
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Academic monographs, university press journals, peer-reviewed historiographical papers.
            </p>
            <div className="pt-2 text-[11px] font-semibold text-indigo-700 dark:text-indigo-400">
              ✓ Verified via Shingle Deduplication
            </div>
          </div>

          <div className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-4 space-y-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-500 text-white">
              TIER 4 (Restricted)
            </span>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              General Web Commentary
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Encyclopedic summaries, educational videos, general blog overviews.
            </p>
            <div className="pt-2 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
              ✕ Cannot Verify Claims Alone
            </div>
          </div>
        </div>

        {/* Laya Rules Card */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-xs text-slate-700 dark:text-slate-300 space-y-2">
          <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Strict Epistemic Invariants Enforced by Laya Engine:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 pl-1">
            <li><strong>Verbatim Quote Matching:</strong> Rejects fabricated or altered quotes using fuzzy normalized Levenshtein distance.</li>
            <li><strong>Anti-Circular Mirror Filtering:</strong> Uses 4-gram shingle Jaccard overlap to detect and purge web scrapers quoting secondary blogs.</li>
            <li><strong>Contradiction Demotion:</strong> If a higher tier source (Tier 1 physical stratum) contradicts a lower tier account, the lower claim is automatically demoted to <em>Qualified/Contested</em>.</li>
          </ul>
        </div>
      </div>

      {/* SECTION 4: Try a Demonstration Inquiry */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-linear-to-r from-cyan-50/50 via-white to-slate-50 dark:from-cyan-950/20 dark:via-slate-900/60 dark:to-slate-950 p-6 text-center space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
          Ready to Witness the 4-Level Epistemic Architecture in Action?
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Launch any of our featured historical enigmas to see live Laya verification, knowledge graph synthesis, and dual-output reports:
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button
            onClick={() => onSelectInquiry("What caused the decline of the Indus Valley Civilization?")}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-cyan-400 transition-all cursor-pointer shadow-xs"
          >
            🌊 Indus Valley Collapse
          </button>
          <button
            onClick={() => onSelectInquiry("Was the Library of Alexandria destroyed in a single catastrophe or gradual decay?")}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-amber-400 transition-all cursor-pointer shadow-xs"
          >
            🏛️ Library of Alexandria
          </button>
          <button
            onClick={() => onSelectInquiry("What triggered the Late Bronze Age Collapse in the Eastern Mediterranean?")}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-rose-400 transition-all cursor-pointer shadow-xs"
          >
            ⚔️ Late Bronze Age Collapse
          </button>
          <button
            onClick={() => onSelectInquiry("Did the Roman Empire fall primarily due to climate shocks or military invasions?")}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-400 transition-all cursor-pointer shadow-xs"
          >
            🦅 Fall of Western Rome
          </button>
        </div>
      </div>
    </div>
  )
}

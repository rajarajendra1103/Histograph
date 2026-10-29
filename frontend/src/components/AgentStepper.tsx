import { CheckCircle2, Circle, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface AgentStepperProps {
  currentStep: string | null
}

const STEPS = [
  { id: "planner", label: "1. Planner" },
  { id: "search", label: "2. Search & Archives" },
  { id: "extractor", label: "3. Extractor" },
  { id: "graph", label: "4. Graph Builder" },
  { id: "verify", label: "5. Evidentiary Verification" },
  { id: "synthesis", label: "6. Reconstructions" },
]

export function AgentStepper({ currentStep }: AgentStepperProps) {
  const getStepIndex = (stepId: string | null) => {
    if (!stepId) return -1
    if (stepId.startsWith("verify_") || stepId.startsWith("laya_") || stepId.startsWith("investigate_")) {
      return 4
    }
    const map: Record<string, number> = {
      planner: 0,
      search: 1,
      sources: 1,
      extractor: 2,
      graph: 3,
      verify: 4,
      synthesis: 5,
      done: 6,
    }
    return map[stepId] ?? -1
  }

  const activeIdx = getStepIndex(currentStep)

  return (
    <div className="relative overflow-x-auto py-1">
      <div className="flex items-center justify-between gap-1 min-w-170 bg-white/90 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-2.5 backdrop-blur-md shadow-xs dark:shadow-none transition-colors duration-200">
        {STEPS.map((step, idx) => {
          const isDone = activeIdx > idx || activeIdx === 6
          const isActive = activeIdx === idx
          const isPending = !isDone && !isActive

          return (
            <div key={step.id} className="flex items-center gap-1.5 flex-1 last:flex-none">
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 w-full",
                  isActive &&
                    "bg-cyan-100/80 dark:bg-cyan-500/15 border border-cyan-400 dark:border-cyan-500/40 text-cyan-900 dark:text-cyan-300 shadow-md shadow-cyan-500/10 scale-102",
                  isDone && "bg-emerald-50 dark:bg-slate-900/90 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
                  isPending && "bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 text-slate-400 dark:text-slate-500"
                )}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : isActive ? (
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
                  </span>
                ) : (
                  <Circle className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />
                )}
                <span className="truncate">{step.label}</span>
              </div>

              {idx < STEPS.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 shrink-0" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

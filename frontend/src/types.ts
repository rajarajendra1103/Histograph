export interface Source {
  id?: string
  title: string
  url: string
  kind?: string
  date?: string
  text?: string
}

export interface Claim {
  id?: string
  claim: string
  quote?: string
  year?: number | null
  date_text?: string
  category?: 'established' | 'competing' | 'minority' | 'hypothesis' | string
  status?: string
  verdict?: string
  reasons?: string[]
  reason?: string
  source_ids?: string[]
  entities?: Array<{ name: string; type?: string }>
  contradictions?: any[]
}

export interface TokenStats {
  key_configured: boolean
  key_preview: string
  provider: string
  model: string
  total_budget_tokens: number
  total_credits: number
  credits_used: number
  credits_remaining: number
  total_tokens_used: number
  prompt_tokens: number
  completion_tokens: number
  total_requests: number
  percentage_used: number
}

export interface CytoscapeData {
  elements: {
    nodes: Array<{
      data: {
        id: string
        label: string
        category?: string
        kind?: string
        verdict?: string
        quote?: string
        text?: string
        date?: string
        reasons?: string[]
        source_ids?: string[]
        url?: string
      }
    }>
    edges: Array<{
      data: {
        id: string
        source: string
        target: string
        label?: string
        type?: string
      }
    }>
  }
}

export interface ResearchResult {
  query: string
  evidence_report: string
  full_report: string
  evidence: Claim[]
  full: Claim[]
  timeline: Claim[]
  unresolved: Claim[]
  rejected: Claim[]
  date_conflicts: Array<{
    claim1: string
    date1: string
    claim2: string
    date2: string
    difference_years: number
    warning: string
  }>
  sources: Record<string, Source>
  graph: CytoscapeData
  token_stats: TokenStats
}

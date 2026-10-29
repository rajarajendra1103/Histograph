import React from "react"

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null

  // Process text into structural blocks (tables, headers, blockquotes, lists, paragraphs)
  const lines = content.split("\n")
  const blocks: React.ReactNode[] = []

  let i = 0
  let tableBuffer: string[] = []

  const flushTable = () => {
    if (tableBuffer.length === 0) return
    const headerLine = tableBuffer[0]
    const rowLines = tableBuffer.slice(2) // Skip separator line

    const parseCells = (row: string) =>
      row
        .split("|")
        .map((c) => c.trim())
        .filter((_c, idx, arr) => idx > 0 && idx < arr.length - 1)

    const headers = parseCells(headerLine)
    const rows = rowLines.map(parseCells)

    blocks.push(
      <div key={`table-${blocks.length}`} className="my-5 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 shadow-sm dark:shadow-xl">
        <table className="w-full text-left text-xs divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-100 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 font-semibold tracking-wider text-[11px] uppercase">
            <tr>
              {headers.map((h, hIdx) => (
                <th key={hIdx} className="px-4 py-3 text-cyan-700 dark:text-cyan-400">
                  {renderFormattedInline(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300 font-sans">
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-4 py-3 align-top leading-relaxed">
                    {renderFormattedInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
    tableBuffer = []
  }

  while (i < lines.length) {
    const rawLine = lines[i]
    const trimmed = rawLine.trim()

    // Table detection
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      tableBuffer.push(trimmed)
      i++
      continue
    } else if (tableBuffer.length > 0) {
      flushTable()
    }

    if (!trimmed) {
      i++
      continue
    }

    // Heading 1 (# ...)
    if (trimmed.startsWith("# ")) {
      blocks.push(
        <h1 key={i} className="text-xl font-bold tracking-tight mt-6 mb-3 pb-2 border-b border-slate-200 dark:border-slate-800/80 text-cyan-800 dark:text-cyan-300">
          {renderFormattedInline(trimmed.substring(2))}
        </h1>
      )
      i++
      continue
    }

    // Heading 2 (## ...)
    if (trimmed.startsWith("## ")) {
      blocks.push(
        <h2 key={i} className="text-base font-bold tracking-tight mt-6 mb-2.5 flex items-center gap-2 text-cyan-700 dark:text-cyan-400">
          <span className="w-1.5 h-4 rounded-full bg-cyan-500" />
          <span>{renderFormattedInline(trimmed.substring(3))}</span>
        </h2>
      )
      i++
      continue
    }

    // Heading 3 (### ...)
    if (trimmed.startsWith("### ")) {
      blocks.push(
        <h3 key={i} className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-2 pl-2 border-l-2 border-indigo-500/60">
          {renderFormattedInline(trimmed.substring(4))}
        </h3>
      )
      i++
      continue
    }

    // Blockquote (> ...)
    if (trimmed.startsWith("> ")) {
      blocks.push(
        <div key={i} className="my-3 pl-4 pr-3 py-2.5 border-l-3 border-cyan-500/70 bg-cyan-50/80 dark:bg-cyan-950/20 rounded-r-xl italic text-xs text-slate-700 dark:text-slate-200 leading-relaxed shadow-sm">
          {renderFormattedInline(trimmed.substring(2))}
        </div>
      )
      i++
      continue
    }

    // Bullet list (- ... or * ...)
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      blocks.push(
        <div key={i} className="flex items-start gap-2.5 my-1.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 mt-1.5 shrink-0" />
          <div className="flex-1">{renderFormattedInline(trimmed.substring(2))}</div>
        </div>
      )
      i++
      continue
    }

    // Numbered list (1. ... or 2. ...)
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/)
    if (numMatch) {
      blocks.push(
        <div key={i} className="flex items-start gap-2.5 my-1.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-1">
          <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-cyan-700 dark:text-cyan-400 border border-slate-200 dark:border-slate-700 shrink-0 mt-0.5">
            {numMatch[1]}
          </span>
          <div className="flex-1">{renderFormattedInline(numMatch[2])}</div>
        </div>
      )
      i++
      continue
    }

    // Standard paragraph
    blocks.push(
      <p key={i} className="my-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
        {renderFormattedInline(trimmed)}
      </p>
    )
    i++
  }

  if (tableBuffer.length > 0) {
    flushTable()
  }

  return <div className="space-y-1">{blocks}</div>
}

/**
 * Format inline text: **bold**, *italic*, and [S1] source citation tags
 */
function renderFormattedInline(text: string): React.ReactNode {
  if (!text) return null

  // Clean any leading # signs if line didn't catch it
  const cleanText = text.replace(/^[#]+\s*/, "")

  // Split tokens by **bold** or *italic* or [S...] citations
  const parts = cleanText.split(/(\*\*.*?\*\*|\*.*?\*|\[S\d+\])/g)

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={index} className="font-semibold text-slate-900 dark:text-slate-100">
          {part.substring(2, part.length - 2)}
        </strong>
      )
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={index} className="italic text-slate-700 dark:text-slate-300">
          {part.substring(1, part.length - 1)}
        </em>
      )
    }
    if (/^\[S\d+\]$/.test(part)) {
      return (
        <span
          key={index}
          className="inline-block px-1.5 py-0.5 mx-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-cyan-700 dark:text-cyan-400 font-mono text-[10px] font-bold"
        >
          {part}
        </span>
      )
    }
    // Remove any lone or orphaned ** or # characters
    return part.replace(/\*\*/g, "").replace(/^#+\s*/g, "")
  })
}

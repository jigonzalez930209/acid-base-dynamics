/**
 * Sankey diagram data builder for the DocDashboard.
 *
 * Nodes represent decision points:
 *   Layer 0: Assigned sample (A/B/C/D)
 *   Layer 1: pH range (low / correct / high)
 *   Layer 2: Indicator chosen (free text, normalized)
 *   Layer 3: Outcome (success / fail)
 *
 * Node id format: "<layer>:<value>"
 */

import type { ClassifiedRow } from "./classifier"

export type SankeyNode = {
  id: string
  label: string
  layer: 0 | 1 | 2 | 3
  count: number
}

export type SankeyLink = {
  source: string
  target: string
  value: number
}

export type SankeyData = {
  nodes: SankeyNode[]
  links: SankeyLink[]
}

// pH range classification thresholds
const PH_SAMPLE_RANGES: Record<1 | 2 | 3 | 4, [number, number]> = {
  1: [1.0, 3.0],   // H₃PO₄: initial pH ~1.5
  2: [3.5, 5.5],   // KH₂PO₄: initial pH ~4.5
  3: [6.5, 8.0],   // Buffer: initial pH ~7.2
  4: [8.0, 10.5],  // Na₂HPO₄: initial pH ~9.0
}

function phCategory(sample: 1 | 2 | 3 | 4, ph: number): "low" | "correct" | "high" {
  const [lo, hi] = PH_SAMPLE_RANGES[sample]
  if (ph < lo) return "low"
  if (ph > hi) return "high"
  return "correct"
}

function normalizeIndicator(s: string): string {
  return s.trim().toLowerCase()
    .replace(/fenolftale[ií]na/i, "fenolftaleína")
    .replace(/methyl.?red|rojo.?metilo/i, "rojo de metilo")
    .replace(/methyl.?orange|naranja.?metilo/i, "naranja de metilo")
    .replace(/bromocresol.?green|verde.?bromocresol/i, "verde de bromocresol")
    .replace(/phenolphthalein/i, "fenolftaleína")
    .replace(/thymolphthalein|timolftale[ií]na/i, "timolftaleína")
    || "otro"
}

export function buildSankeyData(rows: ClassifiedRow[]): SankeyData {
  const nodeMap = new Map<string, SankeyNode>()
  const linkMap = new Map<string, SankeyLink>()

  function ensureNode(id: string, label: string, layer: 0 | 1 | 2 | 3): SankeyNode {
    if (!nodeMap.has(id)) nodeMap.set(id, { id, label, layer, count: 0 })
    const n = nodeMap.get(id)!
    n.count++
    return n
  }

  function addLink(source: string, target: string) {
    const key = `${source}→${target}`
    if (!linkMap.has(key)) linkMap.set(key, { source, target, value: 0 })
    linkMap.get(key)!.value++
  }

  for (const row of rows) {
    const sampleId = `0:sample_${row.sample}`
    const sampleLabel = `Muestra ${row.sample}`
    ensureNode(sampleId, sampleLabel, 0)

    const phCat = phCategory(row.sample, row.phRead)
    const phLabel = phCat === "low" ? "pH bajo" : phCat === "correct" ? "pH correcto" : "pH alto"
    const phId = `1:ph_${phCat}`
    ensureNode(phId, phLabel, 1)
    addLink(sampleId, phId)

    const indNorm = normalizeIndicator(row.indicatorChosen)
    const indId = `2:ind_${indNorm}`
    ensureNode(indId, indNorm, 2)
    addLink(phId, indId)

    const outcome = row.successAttempt1 ? "éxito" : "fallo"
    const outcomeId = `3:${outcome}`
    ensureNode(outcomeId, outcome.charAt(0).toUpperCase() + outcome.slice(1), 3)
    addLink(indId, outcomeId)
  }

  return {
    nodes: Array.from(nodeMap.values()),
    links: Array.from(linkMap.values()),
  }
}

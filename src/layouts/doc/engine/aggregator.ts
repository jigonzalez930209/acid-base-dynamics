/**
 * Statistical aggregator for the DocDashboard.
 *
 * All functions are pure (no DOM, no side effects) and testable.
 */

import type { ClassifiedRow } from "./classifier"

export type GroupStats = {
  n: number
  mean: number
  median: number
  stdDev: number
  iqr: number
  p5: number
  p95: number
  successRate1: number
  successRate2: number | null
}

export type GroupKey = {
  sample?: number
  commission?: string
  week?: number
}

// ── Low-level statistics ───────────────────────────────────────────────────

function sorted(values: number[]): number[] {
  return [...values].sort((a, b) => a - b)
}

function mean(values: number[]): number {
  if (!values.length) return 0
  return values.reduce((s, v) => s + v, 0) / values.length
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0
  const m = mean(values)
  const variance = values.reduce((s, v) => s + (v - m) ** 2, 0) / (values.length - 1)
  return Math.sqrt(variance)
}

function percentile(sortedValues: number[], p: number): number {
  if (!sortedValues.length) return 0
  const idx = (p / 100) * (sortedValues.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return sortedValues[lo]
  return sortedValues[lo] + (sortedValues[hi] - sortedValues[lo]) * (idx - lo)
}

function median(sortedValues: number[]): number {
  return percentile(sortedValues, 50)
}

// ── Group statistics ───────────────────────────────────────────────────────

export function computeGroupStats(rows: ClassifiedRow[]): GroupStats {
  if (!rows.length) {
    return { n: 0, mean: 0, median: 0, stdDev: 0, iqr: 0, p5: 0, p95: 0, successRate1: 0, successRate2: null }
  }

  const errors1 = rows.map((r) => Math.abs(r.errorAttempt1))
  const s = sorted(errors1)

  const dupRows = rows.filter((r) => r.successDuplicate !== null)
  const successRate2 = dupRows.length > 0
    ? dupRows.filter((r) => r.successDuplicate).length / dupRows.length
    : null

  return {
    n: rows.length,
    mean: mean(errors1),
    median: median(s),
    stdDev: stdDev(errors1),
    iqr: percentile(s, 75) - percentile(s, 25),
    p5: percentile(s, 5),
    p95: percentile(s, 95),
    successRate1: rows.filter((r) => r.successAttempt1).length / rows.length,
    successRate2,
  }
}

// ── Multi-group aggregation ────────────────────────────────────────────────

type AggregatedGroup = {
  key: string
  label: string
  rows: ClassifiedRow[]
  stats: GroupStats
}

export function aggregateBy(
  rows: ClassifiedRow[],
  by: "sample" | "commission" | "week",
): AggregatedGroup[] {
  const map = new Map<string, ClassifiedRow[]>()
  for (const row of rows) {
    const key = String(row[by])
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(row)
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([key, groupRows]) => ({
      key,
      label: by === "sample" ? `Muestra ${key}` : by === "commission" ? `Comisión ${key}` : `Semana ${key}`,
      rows: groupRows,
      stats: computeGroupStats(groupRows),
    }))
}

// ── Error distribution (for histograms) ───────────────────────────────────

export type HistogramBin = { lo: number; hi: number; count: number }

export function buildHistogram(errors: number[], binWidth = 1, maxBin = 20): HistogramBin[] {
  const bins: HistogramBin[] = []
  for (let lo = 0; lo < maxBin; lo += binWidth) {
    bins.push({ lo, hi: lo + binWidth, count: 0 })
  }
  for (const e of errors) {
    const abs = Math.min(Math.abs(e), maxBin - 0.001)
    const idx = Math.floor(abs / binWidth)
    if (idx < bins.length) bins[idx].count++
  }
  return bins
}

// ── Violin distribution ────────────────────────────────────────────────────

export type ViolinPoint = { value: number; density: number }

/** Simple kernel density estimate (Gaussian, 1D) for violin plots. */
export function buildKDE(values: number[], bandwidth = 0.8, numPoints = 60): ViolinPoint[] {
  if (!values.length) return []
  const min = Math.max(0, Math.min(...values) - bandwidth * 2)
  const max = Math.min(30, Math.max(...values) + bandwidth * 2)
  const step = (max - min) / numPoints
  const result: ViolinPoint[] = []
  const n = values.length

  for (let i = 0; i <= numPoints; i++) {
    const x = min + i * step
    const density = values.reduce((sum, v) => {
      const z = (x - v) / bandwidth
      return sum + Math.exp(-0.5 * z * z)
    }, 0) / (n * bandwidth * Math.sqrt(2 * Math.PI))
    result.push({ value: x, density })
  }
  return result
}

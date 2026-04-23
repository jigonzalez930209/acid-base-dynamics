/**
 * Equivalence point locator using the second-derivative method.
 *
 * Scans the titration curve looking for maxima of |dpH/dV| (first derivative)
 * which correspond to minima of d²pH/dV² (inflection points on the curve).
 * Returns the list of equivalence point volumes in ascending order.
 */

import type { CurvePoint } from "./titration-curve"

export type EquivalencePoint = {
  /** Volume of NaOH at the equivalence point (mL) */
  volume: number
  /** pH at the equivalence point */
  pH: number
  /** Label, e.g. "V₁eq", "V₂eq" */
  label: string
}

const MIN_DPHDV = 0.8   // minimum slope to consider a jump (avoid flat regions)
const WINDOW = 5        // smoothing window for derivative

/**
 * Compute the first derivative dpH/dV using a central differences approach.
 */
function firstDerivative(points: CurvePoint[]): number[] {
  const n = points.length
  const d: number[] = new Array(n).fill(0)
  for (let i = 1; i < n - 1; i++) {
    const dV = points[i + 1].volume - points[i - 1].volume
    if (dV > 1e-9) {
      d[i] = (points[i + 1].pH - points[i - 1].pH) / dV
    }
  }
  d[0] = d[1]
  d[n - 1] = d[n - 2]
  return d
}

/**
 * Smooth an array with a simple box average of half-width `w`.
 */
function smooth(arr: number[], w: number): number[] {
  return arr.map((_, i) => {
    const lo = Math.max(0, i - w)
    const hi = Math.min(arr.length - 1, i + w)
    let sum = 0
    for (let j = lo; j <= hi; j++) sum += arr[j]
    return sum / (hi - lo + 1)
  })
}

/**
 * Find equivalence points in a titration curve.
 * Returns at most 3 equivalence points for H₃PO₄ (triprotic).
 */
export function findEquivalencePoints(points: CurvePoint[]): EquivalencePoint[] {
  if (points.length < 10) return []

  const d1 = smooth(firstDerivative(points), WINDOW)

  // Find local maxima in |d1| (works for both NaOH ascending and HCl descending curves)
  const candidates: { idx: number; slope: number }[] = []
  for (let i = WINDOW; i < points.length - WINDOW; i++) {
    const absS = Math.abs(d1[i])
    if (absS < MIN_DPHDV) continue
    // Check if it's a local max in a window
    let isMax = true
    for (let j = i - WINDOW; j <= i + WINDOW; j++) {
      if (j !== i && Math.abs(d1[j]) >= absS) { isMax = false; break }
    }
    if (isMax) candidates.push({ idx: i, slope: absS })
  }

  // Merge nearby candidates (within 2 mL)
  const merged: { idx: number; slope: number }[] = []
  for (const c of candidates) {
    const last = merged[merged.length - 1]
    if (last && Math.abs(points[c.idx].volume - points[last.idx].volume) < 2) {
      if (c.slope > last.slope) merged[merged.length - 1] = c
    } else {
      merged.push(c)
    }
  }

  const subscripts = ["₁", "₂", "₃"]
  return merged.slice(0, 3).map((c, i) => ({
    volume: points[c.idx].volume,
    pH: points[c.idx].pH,
    label: `V${subscripts[i]}eq`,
  }))
}

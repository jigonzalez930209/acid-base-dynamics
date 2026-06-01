/**
 * Error calculator for the phosphate TP.
 *
 * Computes the relative percentage error of the student's experimental volume
 * with respect to the nearest theoretical equivalence point.
 */

import type { EquivalencePoint } from "./equivalence-finder"

export type ErrorResult = {
  /** Theoretical equivalence volume used for comparison (mL) */
  vTheoretical: number
  /** Student's experimental volume (mL) */
  vExperimental: number
  /** Relative error in % – positive: overshoot, negative: undershoot */
  percentError: number
  /** The equivalence point label matched */
  matchedLabel: string
  /** Qualitative severity */
  severity: "excellent" | "acceptable" | "high"
}

const THRESHOLD_EXCELLENT = 2   // %
const THRESHOLD_ACCEPTABLE = 5  // %

/**
 * Compute the % error of an experimental volume against the nearest equivalence point.
 * Returns null if no equivalence points are provided.
 */
export function calcError(
  vExperimental: number,
  equivalencePoints: EquivalencePoint[],
): ErrorResult | null {
  if (equivalencePoints.length === 0) return null

  // Find closest equivalence point
  let nearest = equivalencePoints[0]
  for (const ep of equivalencePoints) {
    if (Math.abs(ep.volume - vExperimental) < Math.abs(nearest.volume - vExperimental)) {
      nearest = ep
    }
  }

  const diff = vExperimental - nearest.volume
  const percentError = (diff / nearest.volume) * 100

  const absPct = Math.abs(percentError)
  const severity: ErrorResult["severity"] =
    absPct <= THRESHOLD_EXCELLENT ? "excellent"
    : absPct <= THRESHOLD_ACCEPTABLE ? "acceptable"
    : "high"

  return {
    vTheoretical: nearest.volume,
    vExperimental,
    percentError,
    matchedLabel: nearest.label,
    severity,
  }
}

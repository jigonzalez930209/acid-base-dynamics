/**
 * Classifier: assigns a success/fail label to each student row
 * based on their measured volume vs the theoretical equivalence point.
 *
 * Theoretical equivalence volumes (V₁eq, V₂eq per sample):
 *   Sample A (H₃PO₄ 0.1M, Va=20mL, CB=0.1M): V₁eq=20mL, V₂eq=40mL
 *   Sample B (KH₂PO₄ 0.1M, Va=20mL, CB=0.1M): V₂eq=20mL (f_initial=1)
 *   Sample C (buffer, f=1.4, Va=20mL, CB=0.1M): V₂eq=12mL
 *   Sample D (Na₂HPO₄ 0.05M, Va=20mL, CB=0.1M): V₃eq=10mL (f_initial=2)
 */

import type { StudentRow } from "./schema"

// ── Theoretical equivalence volumes (mL) per sample ──────────────────────

const THEORETICAL: Record<1 | 2 | 3 | 4, number[]> = {
  1: [20.0, 40.0],
  2: [20.0],
  3: [12.0],
  4: [10.0],
}

/**
 * Find nearest theoretical equivalence volume for a given sample.
 */
export function nearestTheoretical(sample: 1 | 2 | 3 | 4, vExperimental: number): number {
  const eqs = THEORETICAL[sample]
  let nearest = eqs[0]
  for (const v of eqs) {
    if (Math.abs(v - vExperimental) < Math.abs(nearest - vExperimental)) nearest = v
  }
  return nearest
}

/**
 * Compute % error vs the nearest equivalence point.
 */
export function percentError(vExp: number, vTheor: number): number {
  return ((vExp - vTheor) / vTheor) * 100
}

export type ClassifiedRow = StudentRow & {
  vTheoretical: number
  errorAttempt1: number
  errorDuplicate: number | null
  successAttempt1: boolean
  successDuplicate: boolean | null
  /** improved: failed attempt1 but succeeded duplicate */
  improved: boolean
  /** degraded: succeeded attempt1 but failed duplicate */
  degraded: boolean
}

/**
 * Classify a dataset using the given error threshold (default 2%).
 */
export function classifyRows(
  rows: StudentRow[],
  thresholdPct = 2,
): ClassifiedRow[] {
  return rows.map((row) => {
    const vTheor = nearestTheoretical(row.sample, row.volumeAttempt1)
    const err1 = percentError(row.volumeAttempt1, vTheor)
    const success1 = Math.abs(err1) <= thresholdPct

    let err2: number | null = null
    let success2: boolean | null = null
    if (row.volumeDuplicate !== undefined && row.volumeDuplicate > 0) {
      const vTheor2 = nearestTheoretical(row.sample, row.volumeDuplicate)
      err2 = percentError(row.volumeDuplicate, vTheor2)
      success2 = Math.abs(err2) <= thresholdPct
    }

    return {
      ...row,
      vTheoretical: vTheor,
      errorAttempt1: err1,
      errorDuplicate: err2,
      successAttempt1: success1,
      successDuplicate: success2,
      improved: !success1 && success2 === true,
      degraded: success1 && success2 === false,
    }
  })
}

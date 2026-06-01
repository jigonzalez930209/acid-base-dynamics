/**
 * Internal sample auto-detection from student's pH reading + titrant choice.
 *
 * The student never sees which sample was detected — this is used internally
 * to select the correct theoretical reference curve for error calculation.
 *
 * Logic:
 *  NaOH titrant (acid → base): pH at equivalence point tells us where on the
 *  curve the student stopped.
 *    · pH < 5.5  → near V₁eq of H₃PO₄  → Sample A (f₀=0)
 *    · pH 5.5–9  → near V₂eq            → Sample B (f₀=1, KH₂PO₄)
 *    · pH > 9    → near V₃eq            → Sample D (f₀=2, Na₂HPO₄)
 *
 *  HCl titrant (base → acid): pH goes downward, equivalence points are reversed.
 *    · pH > 9    → near V₁eq of Na₂HPO₄ → Sample D (f₀=2)
 *    · pH 5–9    → near V₂eq             → Sample B (f₀=1)
 *    · pH < 5    → near V₃eq             → Sample A (f₀=0)
 */

import type { PhosphTitrant } from "../types"

export type DetectedSampleId = "A" | "B" | "C" | "D"

export function detectSampleId(
  pH: number,
  titrant: PhosphTitrant,
): DetectedSampleId {
  if (titrant === "NaOH") {
    if (pH <= 5.5) return "A"
    if (pH <= 9.2) return "B"
    return "D"
  } else {
    // HCl — going downward
    if (pH >= 9.2) return "D"
    if (pH >= 5.5) return "B"
    return "A"
  }
}

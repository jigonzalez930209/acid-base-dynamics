/**
 * Titration curve generator for the phosphate TP.
 *
 * Supports both NaOH (acid→base) and HCl (base→acid) titrations.
 *
 * NaOH formula (proton balance):
 *   V = Va × (CA × (α₁ + 2α₂ + 3α₃ − f₀) + [OH⁻] − [H⁺]) / (CB + [H⁺] − [OH⁻])
 *
 * HCl formula (reversed proton balance):
 *   V = Va × (CA × (f₀ − α₁ − 2α₂ − 3α₃) + [H⁺] − [OH⁻]) / (Ca_HCl + [OH⁻] − [H⁺])
 */

import { PKA, calcAlphas } from "./phosphate-system"
import type { PhosphateSample } from "./phosphate-system"
import type { PhosphTitrant } from "../types"

export type CurvePoint = { volume: number; pH: number }

const PH_STEPS = 600
const PH_MIN = 0.5
const PH_MAX = 13.5

/**
 * Generate the theoretical titration curve.
 * @param sample   - The detected phosphate sample
 * @param titrant  - "NaOH" or "HCl"
 * @param conc     - Titrant concentration in mol/L (uses sample.CB if 0)
 */
export function buildTitrationCurve(
  sample: PhosphateSample,
  titrant: PhosphTitrant = "NaOH",
  conc?: number,
): CurvePoint[] {
  const { CA, Va, f_initial } = sample
  const C = conc ?? sample.CB
  const { Kw } = PKA
  const points: CurvePoint[] = []

  for (let i = 0; i <= PH_STEPS; i++) {
    const pH = PH_MIN + (i / PH_STEPS) * (PH_MAX - PH_MIN)
    const h = 10 ** -pH
    const oh = Kw / h
    const [, a1, a2, a3] = calcAlphas(h)

    let V: number

    if (titrant === "NaOH") {
      // Singularity: denominator → 0 when oh → C (pH ≈ 14 + log(C))
      // Skip the region to prevent V → ∞ blowing up xMax
      if (oh > C * 0.7) continue
      const numerator = Va * (CA * (a1 + 2 * a2 + 3 * a3 - f_initial) + oh - h)
      const denominator = C + h - oh
      if (denominator <= 0) continue
      V = numerator / denominator
    } else {
      // HCl: proton balance reversed
      // Singularity: denominator → 0 when h → C (pH ≈ -log(C))
      if (h > C * 0.7) continue
      const numerator = Va * (CA * (f_initial - a1 - 2 * a2 - 3 * a3) + h - oh)
      const denominator = C + oh - h
      if (denominator <= 0) continue
      V = numerator / denominator
    }

    if (V < -0.01) continue
    points.push({ volume: Math.max(0, V), pH })
  }

  points.sort((a, b) => a.volume - b.volume)

  const filtered: CurvePoint[] = []
  for (const p of points) {
    if (filtered.length === 0 || p.volume - filtered[filtered.length - 1].volume > 0.02) {
      filtered.push(p)
    }
  }
  return filtered
}

/**
 * Compute the maximum x-axis value for the chart (rounded up, +5 mL margin).
 */
export function chartXMax(curve: CurvePoint[]): number {
  if (curve.length === 0) return 60
  const maxV = curve[curve.length - 1].volume
  return Math.ceil(maxV * 1.4 / 5) * 5 + 5
}


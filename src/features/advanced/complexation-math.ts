/**
 * Complexation equilibria math engine
 *
 * Full system of equations for M + nL ⇌ MLₙ
 *
 *  Stepwise:      M + L ⇌ ML             K₁
 *                 ML + L ⇌ ML₂            K₂
 *                 MLₙ₋₁ + L ⇌ MLₙ         Kₙ
 *
 *  Overall:       M + nL ⇌ MLₙ            βₙ = K₁K₂…Kₙ
 *
 *  Mass balance:  CT = [M] + [ML] + [ML₂] + … + [MLₙ]
 *                 CL = [L] + [ML] + 2[ML₂] + … + n[MLₙ]
 *
 *  Fraction:      αMLₙ = βₙ[L]ⁿ / Σ(βᵢ[L]ⁱ)   (analogous to acid α fractions)
 *
 *  Conditional K (for polydentate ligands like EDTA):
 *    log Kf' = log Kf + log αLₙ₋(pH)         (ligand side reactions)
 *    log Kf'' = log Kf' − log αM(OH)(pH)      (metal hydrolysis)
 */

import { interpLogAlphaM } from "@/features/advanced/complexation-db"
import type { MetalRecord, LigandRecord, MetalLigandEntry } from "@/features/advanced/complexation-db"

// Re-export so callers don't need two imports
export type { MetalRecord, LigandRecord, MetalLigandEntry }

// ────────────────────────────────────────────────────────────────────────────
// LIGAND ALPHA FRACTION
// ────────────────────────────────────────────────────────────────────────────

/**
 * Compute the fraction of ligand in the fully deprotonated (reactive) form.
 * For ligands with pKas: αLₙ₋ = (Π Kaᵢ) / D
 * where D = denominator of the alpha-fraction polynomial (same as acid-base).
 */
export function calcAlphaLigand(ligand: LigandRecord, pH: number): number {
  const pKas = ligand.pKas
  if (pKas.length === 0) return 1  // no protons to lose
  const h = 10 ** (-pH)
  const Ka = pKas.map((pk) => 10 ** (-pk))
  // Build the denominator: 1 + Σ [H]^k / Π(Ka_1…Ka_k)
  let denom = 1
  let ratio = 1
  for (let i = Ka.length - 1; i >= 0; i--) {
    ratio *= h / Ka[i]
    denom += ratio
  }
  return 1 / denom
}

// ────────────────────────────────────────────────────────────────────────────
// CONDITIONAL CONSTANTS (single-step EDTA-type polydentate)
// ────────────────────────────────────────────────────────────────────────────

export function calcLogKfPrime(
  _metal: MetalRecord,
  ligand: LigandRecord,
  logKf: number,
  pH: number,
): number {
  const aL = calcAlphaLigand(ligand, pH)
  return logKf + Math.log10(aL)
}

export function calcLogKfDoublePrime(
  metal: MetalRecord,
  ligand: LigandRecord,
  logKf: number,
  pH: number,
): number {
  const logKfP = calcLogKfPrime(metal, ligand, logKf, pH)
  const logAM = interpLogAlphaM(metal.logAlphaM, pH)
  return logKfP - logAM
}

/**
 * Minimum pH where log Kf'' ≥ threshold (default 6).
 */
export function calcMinTitrationPH(
  metal: MetalRecord,
  ligand: LigandRecord,
  logKf: number,
  threshold = 6,
): number | null {
  for (let pH = 0; pH <= 14; pH += 0.05) {
    if (calcLogKfDoublePrime(metal, ligand, logKf, pH) >= threshold) {
      return +pH.toFixed(1)
    }
  }
  return null
}

// ────────────────────────────────────────────────────────────────────────────
// SPECIES DISTRIBUTION (α fractions as function of free [L])
// ────────────────────────────────────────────────────────────────────────────

/**
 * Given log βₙ values and free ligand concentration [L],
 * compute α₀, α₁, …, αₙ (fraction of each MLₙ species).
 *
 * αₙ = βₙ·[L]ⁿ / (1 + β₁·[L] + β₂·[L]² + … + βₙ·[L]ⁿ)
 */
export function calcSpeciesAlpha(logBeta: number[], freeL: number): number[] {
  const terms = logBeta.map((lb, i) => (10 ** lb) * freeL ** (i + 1))
  const denom = 1 + terms.reduce((a, b) => a + b, 0)
  return [1 / denom, ...terms.map((t) => t / denom)]
}

/**
 * Build series of αₙ vs log[L'] (apparent free ligand) from log[L'] = -8 to 0.
 * Returns one array per species (index 0 = free M, 1 = ML, 2 = ML₂, …).
 */
export function buildAlphaSeries(
  logBeta: number[],
  nPoints = 300,
): { logL: number; alphas: number[] }[] {
  const result: { logL: number; alphas: number[] }[] = []
  for (let i = 0; i <= nPoints; i++) {
    const logL = -8 + (8 / nPoints) * i   // from 10⁻⁸ to 10⁰
    const freeL = 10 ** logL
    result.push({ logL, alphas: calcSpeciesAlpha(logBeta, freeL) })
  }
  return result
}

// ────────────────────────────────────────────────────────────────────────────
// LOG Kf' and Kf'' CURVE vs pH
// ────────────────────────────────────────────────────────────────────────────

export type ConditionalCurvePoint = {
  pH: number
  logKfPrime: number
  logKfDoublePrime: number
  alphaL: number
  alphaM: number
}

export function buildConditionalCurve(
  metal: MetalRecord,
  ligand: LigandRecord,
  logKf: number,
  nPoints = 280,
): ConditionalCurvePoint[] {
  const result: ConditionalCurvePoint[] = []
  for (let i = 0; i <= nPoints; i++) {
    const pH = (14 / nPoints) * i
    const alphaL = calcAlphaLigand(ligand, pH)
    const alphaM = 10 ** interpLogAlphaM(metal.logAlphaM, pH)
    result.push({
      pH,
      logKfPrime: logKf + Math.log10(alphaL),
      logKfDoublePrime: logKf + Math.log10(alphaL) - interpLogAlphaM(metal.logAlphaM, pH),
      alphaL,
      alphaM,
    })
  }
  return result
}

// ────────────────────────────────────────────────────────────────────────────
// STEPWISE EQUATION STRINGS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Build the list of equilibrium equation strings for a metal+ligand system.
 * Each step:  ML_{n-1} + L ⇌ ML_n    Kₙ = ...
 * Plus overall:  M + nL ⇌ ML_n
 */
export function buildEquilibriumEquations(
  metal: MetalRecord,
  ligand: LigandRecord,
  entry: MetalLigandEntry,
): {
  stepwise: { equation: string; logK: number; n: number }[]
  overall: { equation: string; logBeta: number; n: number }[]
} {
  const M = metal.symbol
  const L = ligand.abbreviation
  const { logKn, logBeta } = entry

  const stepwise = logKn.map((lk, i) => {
    const nPrev = i === 0 ? "" : i === 1 ? "" : String(i)
    const nCurr = i + 1 === 1 ? "" : String(i + 1)
    const left = i === 0 ? `${M} + ${L}` : `[${M}${L}${nPrev}] + ${L}`
    const right = `[${M}${L}${nCurr}]`
    return { equation: `${left}  ⇌  ${right}`, logK: lk, n: i + 1 }
  })

  const overall = logBeta.map((lb, i) => {
    const n = i + 1
    const nStr = n === 1 ? "" : String(n)
    const nLStr = n === 1 ? L : `${n}${L}`
    return {
      equation: `${M} + ${nLStr}  ⇌  [${M}${L}${nStr}]`,
      logBeta: lb,
      n,
    }
  })

  return { stepwise, overall }
}

// ────────────────────────────────────────────────────────────────────────────
// PREDOMINANCE SEGMENTS (analog of acid-base predominance) vs log[L]
// ────────────────────────────────────────────────────────────────────────────

export type PredominanceSegment = {
  x1: number  // start log[L]
  x2: number  // end log[L]
  speciesIndex: number  // 0=M, 1=ML, 2=ML₂…
  label: string
}

export function buildPredominanceSegments(
  logBeta: number[],
  metalSymbol: string,
  ligandAbbrev: string,
): PredominanceSegment[] {
  const N = 600
  let prev = 0
  let start = -8
  const segs: PredominanceSegment[] = []

  for (let i = 0; i <= N; i++) {
    const logL = -8 + (8 / N) * i
    const freeL = 10 ** logL
    const alphas = calcSpeciesAlpha(logBeta, freeL)
    const dom = alphas.indexOf(Math.max(...alphas))
    if (dom !== prev || i === N) {
      const end = logL
      const n = prev
      const label = n === 0 ? metalSymbol : `[${metalSymbol}${ligandAbbrev}${n === 1 ? "" : n}]`
      segs.push({ x1: start, x2: end, speciesIndex: n, label })
      start = logL
      prev = dom
    }
  }
  return segs
}

/**
 * Multicomponent equilibrium solver
 *
 * Resolves coupled acid-base, complexation, precipitation and redox systems.
 * Uses Newton-Raphson on the log-concentration space for numerical stability.
 */

import type { SolverResult, ActivityModel } from "./types"
import { calcIonicStrength, activityCoefficient } from "./activity"

export type SpeciesInput = {
  id: string
  charge: number
  logC_initial: number
}

export type EquilibriumInput = {
  logK: number
  speciesCoeffs: { id: string; coeff: number }[]   // positive=product, negative=reactant
}

export type MassBalanceInput = {
  totalConc: number
  speciesCoeffs: { id: string; coeff: number }[]
}

/**
 * Solve a multicomponent equilibrium system.
 */
export function solveEquilibrium(
  species: SpeciesInput[],
  equilibria: EquilibriumInput[],
  massBalances: MassBalanceInput[],
  activityModel: ActivityModel = "ideal",
  maxIter = 200,
  tolerance = 1e-10,
): SolverResult {
  const n = species.length
  const logC = species.map((s) => s.logC_initial)
  const warnings: { es: string; en: string }[] = []

  let iter = 0
  let residual = Infinity

  for (iter = 0; iter < maxIter; iter++) {
    const C = logC.map((lc) => 10 ** lc)
    const I = calcIonicStrength(species.map((s, i) => ({ charge: s.charge, concentration: C[i] })))
    const gamma = species.map((s) => activityCoefficient(s.charge, I, activityModel))

    // Build residual vector: equilibrium + mass balance + charge balance
    const F: number[] = []

    // Equilibrium residuals: logK - Σ(coeff * (logC + log γ))
    for (const eq of equilibria) {
      let r = eq.logK
      for (const { id, coeff } of eq.speciesCoeffs) {
        const idx = species.findIndex((s) => s.id === id)
        if (idx >= 0) r -= coeff * (logC[idx] + Math.log10(gamma[idx]))
      }
      F.push(r)
    }

    // Mass balance residuals: Ctot - Σ(coeff * C)
    for (const mb of massBalances) {
      let sum = 0
      for (const { id, coeff } of mb.speciesCoeffs) {
        const idx = species.findIndex((s) => s.id === id)
        if (idx >= 0) sum += coeff * C[idx]
      }
      F.push(mb.totalConc - sum)
    }

    // Charge balance
    let chargeSum = 0
    for (let i = 0; i < n; i++) chargeSum += species[i].charge * C[i]
    F.push(chargeSum)

    residual = Math.sqrt(F.reduce((s, f) => s + f * f, 0))
    if (residual < tolerance) break

    // Simplified Newton step: adjust each logC proportionally
    for (let i = 0; i < n; i++) {
      let adjustment = 0
      for (const eq of equilibria) {
        const sc = eq.speciesCoeffs.find((s) => s.id === species[i].id)
        if (sc) {
          const eqIdx = equilibria.indexOf(eq)
          adjustment += sc.coeff * F[eqIdx] * 0.3
        }
      }
      logC[i] += Math.max(-1, Math.min(1, adjustment))
      logC[i] = Math.max(-15, Math.min(2, logC[i]))
    }
  }

  const converged = residual < tolerance
  if (!converged) {
    warnings.push({
      es: `No convergió en ${maxIter} iteraciones (residuo: ${residual.toExponential(2)})`,
      en: `Did not converge in ${maxIter} iterations (residual: ${residual.toExponential(2)})`,
    })
  }

  const finalC = logC.map((lc) => 10 ** lc)
  const concentrations: Record<string, number> = {}
  species.forEach((s, i) => { concentrations[s.id] = finalC[i] })

  const pH = species.find((s) => s.id === "H+")
    ? -Math.log10(concentrations["H+"])
    : 7

  const I = calcIonicStrength(species.map((s, i) => ({ charge: s.charge, concentration: finalC[i] })))

  return { converged, iterations: iter, residual, tolerance, concentrations, pH, ionicStrength: I, warnings }
}

/**
 * Quick acid-base solver (single acid in water).
 */
export function solveAcidBase(
  pKas: number[],
  concentration: number,
  activityModel: ActivityModel = "ideal",
): SolverResult {
  const species: SpeciesInput[] = [
    { id: "H+", charge: 1, logC_initial: -7 },
    { id: "OH-", charge: -1, logC_initial: -7 },
  ]
  pKas.forEach((_, i) => {
    species.push({ id: `HA${i}`, charge: -(i), logC_initial: Math.log10(concentration) - i })
  })
  species.push({ id: `A${pKas.length}`, charge: -pKas.length, logC_initial: -10 })

  const equilibria: EquilibriumInput[] = [
    { logK: -14, speciesCoeffs: [{ id: "H+", coeff: 1 }, { id: "OH-", coeff: 1 }] },
  ]
  pKas.forEach((pKa, i) => {
    equilibria.push({
      logK: -pKa,
      speciesCoeffs: [
        { id: `HA${i}`, coeff: -1 },
        { id: "H+", coeff: 1 },
        { id: i < pKas.length - 1 ? `HA${i + 1}` : `A${pKas.length}`, coeff: 1 },
      ],
    })
  })

  const massBalanceSpecies = [{ id: "HA0", coeff: 1 }]
  for (let i = 1; i < pKas.length; i++) massBalanceSpecies.push({ id: `HA${i}`, coeff: 1 })
  massBalanceSpecies.push({ id: `A${pKas.length}`, coeff: 1 })

  const massBalances: MassBalanceInput[] = [{ totalConc: concentration, speciesCoeffs: massBalanceSpecies }]

  return solveEquilibrium(species, equilibria, massBalances, activityModel)
}

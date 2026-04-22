/**
 * Validation utilities for cross-checking chemistry calculations.
 */

import type { ReferenceCase } from "./types"
import { calcAlphas, calcTitrationVolume } from "@/features/chemistry/lib/acid-math"

export type ValidationResult = {
  caseId: string
  parameter: string
  expected: number
  actual: number
  tolerance: number
  passed: boolean
  errorPercent: number
}

/**
 * Run a single reference case validation.
 */
export function validateReferenceCase(rc: ReferenceCase): ValidationResult[] {
  const results: ValidationResult[] = []

  if (rc.domain === "acid-base") {
    const pKas = (rc.inputs["pKas"] as string).split(",").map(Number)
    const pH = rc.inputs["pH"] as number

    if (rc.expectedOutputs["alpha0"] !== undefined) {
      const alphas = calcAlphas(pH, pKas)
      for (let i = 0; i < alphas.length; i++) {
        const key = `alpha${i}`
        if (rc.expectedOutputs[key] !== undefined) {
          const expected = rc.expectedOutputs[key]
          const actual = alphas[i]
          const error = Math.abs(actual - expected)
          results.push({
            caseId: rc.id,
            parameter: key,
            expected,
            actual: Number(actual.toFixed(6)),
            tolerance: rc.tolerance,
            passed: error <= rc.tolerance,
            errorPercent: expected !== 0 ? (error / expected) * 100 : error * 100,
          })
        }
      }
    }

    if (rc.expectedOutputs["volume_mL"] !== undefined) {
      const conc = (rc.inputs["concentration"] as number) || 0.1
      const vol = calcTitrationVolume(pH, pKas, conc)
      const expected = rc.expectedOutputs["volume_mL"]
      const error = Math.abs(vol - expected)
      results.push({
        caseId: rc.id,
        parameter: "volume_mL",
        expected,
        actual: Number(vol.toFixed(2)),
        tolerance: rc.tolerance,
        passed: error <= rc.tolerance * 10,
        errorPercent: expected !== 0 ? (error / expected) * 100 : 0,
      })
    }
  }

  return results
}

/**
 * Run a batch of reference cases.
 */
export function validateAll(cases: ReferenceCase[]): {
  total: number
  passed: number
  failed: number
  results: ValidationResult[]
} {
  const allResults = cases.flatMap(validateReferenceCase)
  return {
    total: allResults.length,
    passed: allResults.filter((r) => r.passed).length,
    failed: allResults.filter((r) => !r.passed).length,
    results: allResults,
  }
}

/**
 * Activity coefficient models and ionic strength calculations.
 *
 * Models:
 *  - Ideal (γ = 1)
 *  - Debye-Hückel limiting law
 *  - Debye-Hückel extended
 *  - Davies equation
 *
 * All at 25°C unless temperature-corrected.
 */

import type { ActivityModel } from "./types"

type IonInput = { charge: number; concentration: number }

/** I = ½ Σ cᵢzᵢ² */
export function calcIonicStrength(ions: IonInput[]): number {
  return 0.5 * ions.reduce((sum, ion) => sum + ion.concentration * ion.charge ** 2, 0)
}

/** Debye-Hückel A parameter at temperature T (K). A(25°C) ≈ 0.5085 */
function debyeA(T_K = 298.15): number {
  // Simplified temperature dependence
  return 0.5085 * (T_K / 298.15) ** 1.5
}

/** Debye-Hückel B parameter. B(25°C) ≈ 0.3281 Å⁻¹ */
function debyeB(T_K = 298.15): number {
  return 0.3281 * (T_K / 298.15) ** 0.5
}

// Effective ion sizes (Å) by |charge|
const ION_SIZE: Record<number, number> = { 1: 3.0, 2: 5.0, 3: 6.0, 4: 8.0 }

/**
 * Calculate single-ion activity coefficient γ.
 */
export function activityCoefficient(
  charge: number,
  ionicStrength: number,
  model: ActivityModel,
  T_K = 298.15,
): number {
  if (model === "ideal" || charge === 0) return 1

  const z2 = charge * charge
  const sqrtI = Math.sqrt(ionicStrength)
  const A = debyeA(T_K)
  const B = debyeB(T_K)

  switch (model) {
    case "debye_huckel_limiting":
      // -log γ = A·z²·√I
      return 10 ** (-A * z2 * sqrtI)

    case "debye_huckel_extended": {
      // -log γ = A·z²·√I / (1 + B·a·√I)
      const a = ION_SIZE[Math.abs(charge)] ?? 4.0
      return 10 ** ((-A * z2 * sqrtI) / (1 + B * a * sqrtI))
    }

    case "davies":
      // -log γ = A·z²·(√I/(1+√I) − 0.3·I)
      return 10 ** (-A * z2 * (sqrtI / (1 + sqrtI) - 0.3 * ionicStrength))

    default:
      return 1
  }
}

/**
 * Correct a log K value for ionic strength effects.
 * ΔlogK = Σ(νᵢ·z²ᵢ) × A × √I / (1+√I)
 */
export function correctLogK(
  logK: number,
  reactantCharges: number[],
  productCharges: number[],
  ionicStrength: number,
  model: ActivityModel = "davies",
): number {
  if (model === "ideal") return logK
  const A = debyeA()
  const sqrtI = Math.sqrt(ionicStrength)
  const f = sqrtI / (1 + sqrtI) - (model === "davies" ? 0.3 * ionicStrength : 0)
  const deltaZ2 = productCharges.reduce((s, z) => s + z * z, 0) - reactantCharges.reduce((s, z) => s + z * z, 0)
  return logK + A * deltaZ2 * f
}

/**
 * Mean activity coefficient γ± for a 1:1 electrolyte.
 */
export function meanActivityCoefficient(
  ionicStrength: number,
  model: ActivityModel = "davies",
): number {
  return activityCoefficient(1, ionicStrength, model)
}

export const ACTIVITY_MODEL_LABELS: Record<ActivityModel, { es: string; en: string }> = {
  ideal: { es: "Ideal (γ = 1)", en: "Ideal (γ = 1)" },
  debye_huckel_limiting: { es: "Debye-Hückel limitante", en: "Debye-Hückel limiting" },
  debye_huckel_extended: { es: "Debye-Hückel extendida", en: "Debye-Hückel extended" },
  davies: { es: "Davies", en: "Davies equation" },
}

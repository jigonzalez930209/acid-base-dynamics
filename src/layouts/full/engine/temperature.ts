/**
 * Temperature correction engine for equilibrium constants.
 *
 * Van't Hoff equation:
 *   ln(K₂/K₁) = −(ΔH°/R)(1/T₂ − 1/T₁)
 *   pK(T) = pK(25°C) + (ΔH°/2.303R)(1/T − 1/298.15)
 *
 * Distinguishes tabulated from estimated data with confidence levels.
 */

const R = 8.314  // J/(mol·K)
const T_REF = 298.15  // 25°C in K

export type TempCorrectionResult = {
  originalPK: number
  correctedPK: number
  temperature_C: number
  deltaH_kJ: number
  isEstimated: boolean
  uncertainty: number
}

/** Standard enthalpy estimates for common acid-base systems (kJ/mol) */
export const DELTA_H_DEFAULTS: Record<string, number> = {
  "strong-acid": -55,
  "carboxylic": 0,
  "phosphoric-1": -8,
  "phosphoric-2": 4,
  "phosphoric-3": 12,
  "carbonic-1": 7.6,
  "carbonic-2": 14.8,
  "ammonium": 52,
  "phenol": 23,
  "water": 55.8,
  "default": 10,
}

/**
 * Correct pK for temperature using Van't Hoff.
 */
export function correctPKForTemperature(
  pK_25: number,
  temp_C: number,
  deltaH_kJ = 10,
  isTabulated = false,
): TempCorrectionResult {
  const T = temp_C + 273.15
  const shift = (deltaH_kJ * 1000) / (2.303 * R) * (1 / T - 1 / T_REF)
  const correctedPK = pK_25 + shift

  // Uncertainty grows with distance from 25°C
  const tempDelta = Math.abs(temp_C - 25)
  const uncertainty = isTabulated
    ? 0.01 * tempDelta
    : 0.03 * tempDelta + (deltaH_kJ === 10 ? 0.05 * tempDelta : 0)

  return {
    originalPK: pK_25,
    correctedPK: Number(correctedPK.toFixed(3)),
    temperature_C: temp_C,
    deltaH_kJ,
    isEstimated: !isTabulated,
    uncertainty: Number(uncertainty.toFixed(3)),
  }
}

/**
 * Correct Kw for temperature.
 * pKw(T) = 4470.99/T + 0.01706T − 6.0846
 * (Harned & Robinson correlation)
 */
export function pKwAtTemp(temp_C: number): number {
  const T = temp_C + 273.15
  return 4470.99 / T + 0.01706 * T - 6.0846
}

/**
 * Build a pK vs temperature curve for display.
 */
export function buildPKvsTempCurve(
  pK_25: number,
  deltaH_kJ = 10,
  minT = 0,
  maxT = 100,
  step = 5,
): { temp: number; pK: number; uncertainty: number }[] {
  const result: { temp: number; pK: number; uncertainty: number }[] = []
  for (let t = minT; t <= maxT; t += step) {
    const r = correctPKForTemperature(pK_25, t, deltaH_kJ)
    result.push({ temp: t, pK: r.correctedPK, uncertainty: r.uncertainty })
  }
  return result
}

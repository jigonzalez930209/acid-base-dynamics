import type { ChartPoint } from "@/features/chemistry/types/models"
import { calcAlphas, calcTitrationVolume } from "@/features/chemistry/lib/acid-math"

/**
 * Buffer capacity β = -dCb/dpH ≈ 2.303 * ([H+] + [OH-] + C * Σ αi*αj)
 * Numerically estimated via finite difference.
 */
export const buildBufferCapacitySeries = (
  pKas: number[],
  concentration = 0.1,
  startPH = 0,
  endPH = 14,
  step = 0.1
): ChartPoint[] => {
  const series: ChartPoint[] = []

  for (let pH = startPH; pH <= endPH + 1e-9; pH += step) {
    const H = 10 ** -pH
    const OH = 10 ** -(14 - pH)
    const alphas = calcAlphas(pH, pKas)
    // Σ αi * αj for i≠j (variance of distribution)
    const mean = alphas.reduce((s, a, i) => s + a * i, 0)
    const variance = alphas.reduce((s, a, i) => s + a * (i - mean) ** 2, 0)
    const beta = 2.303 * (H + OH + concentration * variance)
    series.push({ x: Number(pH.toFixed(2)), y: Number(beta.toFixed(5)) })
  }

  return series
}

/**
 * Sensitivity dα/dpH for each species (numerical derivative).
 */
export const buildSensitivitySeries = (
  pKas: number[],
  startPH = 0,
  endPH = 14,
  step = 0.1
): ChartPoint[][] => {
  const series: ChartPoint[][] = Array.from({ length: pKas.length + 1 }, () => [])
  const delta = 0.05

  for (let pH = startPH; pH <= endPH + 1e-9; pH += step) {
    const a1 = calcAlphas(pH + delta, pKas)
    const a0 = calcAlphas(Math.max(0, pH - delta), pKas)
    a1.forEach((_, i) => {
      const dAlpha = (a1[i] - (a0[i] ?? 0)) / (2 * delta)
      series[i].push({ x: Number(pH.toFixed(2)), y: Number(dAlpha.toFixed(5)) })
    })
  }

  return series
}

/**
 * For each pH point, returns the index of the dominant species (highest alpha).
 */
export const buildPredominanceSeries = (
  pKas: number[],
  startPH = 0,
  endPH = 14,
  step = 0.05
): Array<{ pH: number; dominant: number; alpha: number }> => {
  const result = []

  for (let pH = startPH; pH <= endPH + 1e-9; pH += step) {
    const alphas = calcAlphas(Number(pH.toFixed(2)), pKas)
    let maxIdx = 0
    alphas.forEach((a, i) => { if (a > alphas[maxIdx]) maxIdx = i })
    result.push({ pH: Number(pH.toFixed(2)), dominant: maxIdx, alpha: alphas[maxIdx] })
  }

  return result
}

/**
 * Equivalence point volumes for each pKa step.
 */
export const calcEquivalenceVolumes = (
  pKas: number[],
  acidConcentration = 0.1,
  initialVolumeMl = 100,
  baseConcentration = 0.1
) =>
  pKas.map((_, i) => {
    const n = i + 1
    return (acidConcentration * initialVolumeMl * n) / baseConcentration
  })

/**
 * Van't Hoff pKa temperature correction.
 * pKa(T) = pKa(25°C) + (ΔH / (2.303 × R)) × (1/T_K - 1/298.15)
 * ΔH in kJ/mol; positive = endothermic dissociation → pKa rises with T.
 */
export const calcTempAdjustedPKas = (
  pKas: number[],
  tempC: number,
  deltaH_kJ = 10
): number[] => {
  const R = 8.314
  const T_K = tempC + 273.15
  const shift = (deltaH_kJ * 1000) / (2.303 * R) * (1 / T_K - 1 / 298.15)
  return pKas.map((pKa) => Number((pKa + shift).toFixed(3)))
}

/**
 * Titration series at custom acid/base concentrations.
 */
export const buildTitrationSeriesAt = (
  pKas: number[],
  acidConc: number,
  baseConc = acidConc,
  startPH = 0,
  endPH = 14,
  step = 0.05
): ChartPoint[] => {
  const points: ChartPoint[] = []
  for (let pH = startPH; pH <= endPH + 1e-9; pH += step) {
    const V = calcTitrationVolume(pH, pKas, acidConc, 100, baseConc)
    if (V >= 0 && V <= 400) points.push({ x: Number(V.toFixed(2)), y: Number(pH.toFixed(2)) })
  }
  return points
}

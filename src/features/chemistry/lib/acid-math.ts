import type { ChartPoint } from "@/features/chemistry/types/models"

const productUntil = (values: number[], count: number) =>
  values.slice(0, count).reduce((accumulator, current) => accumulator * current, 1)

export const calcAlphas = (pH: number, pKas: number[]) => {
  if (pKas.length === 0) {
    return []
  }

  const protonConcentration = 10 ** -pH
  const acidConstants = pKas.map((pKa) => 10 ** -pKa)
  const terms = Array.from({ length: pKas.length + 1 }, (_, index) => {
    const protonPower = pKas.length - index
    return productUntil(acidConstants, index) * protonConcentration ** protonPower
  })

  const denominator = terms.reduce((sum, term) => sum + term, 0)

  return terms.map((term) => term / denominator)
}

export const calcAverageDeprotonation = (alphas: number[]) =>
  alphas.reduce((sum, alpha, index) => sum + alpha * index, 0)

export const calcTitrationVolume = (
  pH: number,
  pKas: number[],
  acidConcentration = 0.1,
  initialVolumeMl = 100,
  baseConcentration = 0.1
) => {
  if (pKas.length === 0) {
    return -1
  }

  const alphas = calcAlphas(pH, pKas)
  const protonConcentration = 10 ** -pH
  const hydroxideConcentration = 10 ** (-(14 - pH))
  const averageCharge = calcAverageDeprotonation(alphas)
  const numerator = acidConcentration * averageCharge - protonConcentration + hydroxideConcentration
  const denominator = baseConcentration + protonConcentration - hydroxideConcentration

  if (Math.abs(denominator) < 1e-12) {
    return -1
  }

  return initialVolumeMl * (numerator / denominator)
}

export const buildSpeciationSeries = (pKas: number[], startPH = 0, endPH = 14, step = 0.1) => {
  const series = Array.from({ length: pKas.length + 1 }, () => [] as ChartPoint[])

  for (let currentPH = startPH; currentPH <= endPH + 1e-9; currentPH += step) {
    const alphaValues = calcAlphas(Number(currentPH.toFixed(2)), pKas)
    alphaValues.forEach((alpha, index) => {
      series[index].push({ x: Number(currentPH.toFixed(2)), y: alpha })
    })
  }

  return series
}

export const buildTitrationSeries = (
  pKas: number[],
  acidConcentration = 0.1,
  baseConcentration = 0.1,
  maxVolume = 350,
  startPH = 0.5,
  endPH = 13.5,
  step = 0.05
) => {
  const series: ChartPoint[] = []

  for (let currentPH = startPH; currentPH <= endPH + 1e-9; currentPH += step) {
    const volume = calcTitrationVolume(Number(currentPH.toFixed(2)), pKas, acidConcentration, 100, baseConcentration)

    if (volume >= 0 && volume <= maxVolume) {
      series.push({ x: volume, y: Number(currentPH.toFixed(2)) })
    }
  }

  return series
}

export const classifyPH = (pH: number) => {
  if (pH < 6.5) {
    return "acidic"
  }

  if (pH > 7.5) {
    return "basic"
  }

  return "balanced"
}

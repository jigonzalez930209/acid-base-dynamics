/**
 * Engine unit tests — validates core computation functions
 * used across the pro layout modules.
 */
import { describe, it, expect } from "vitest"
import { calcAlphas, buildSpeciationSeries, buildTitrationSeries, classifyPH } from "@/features/chemistry/lib/acid-math"
import { buildBufferCapacitySeries, buildPredominanceSeries, buildSensitivitySeries, calcEquivalenceVolumes } from "@/features/advanced/advanced-math"

describe("calcAlphas", () => {
  it("returns empty for no pKas", () => {
    expect(calcAlphas(7, [])).toEqual([])
  })

  it("returns two fractions for monoprotic acid", () => {
    const alphas = calcAlphas(4.75, [4.75]) // at pH = pKa
    expect(alphas).toHaveLength(2)
    expect(alphas[0]).toBeCloseTo(0.5, 2)
    expect(alphas[1]).toBeCloseTo(0.5, 2)
  })

  it("sums to 1 for polyprotic", () => {
    const alphas = calcAlphas(7, [2.15, 7.20, 12.35]) // phosphoric acid
    const sum = alphas.reduce((s, a) => s + a, 0)
    expect(sum).toBeCloseTo(1, 10)
  })

  it("fully protonated at very low pH", () => {
    const alphas = calcAlphas(0, [4.75])
    expect(alphas[0]).toBeGreaterThan(0.99)
  })

  it("fully deprotonated at very high pH", () => {
    const alphas = calcAlphas(14, [4.75])
    expect(alphas[alphas.length - 1]).toBeGreaterThan(0.99)
  })
})

describe("buildSpeciationSeries", () => {
  it("generates correct number of series for triprotic", () => {
    const series = buildSpeciationSeries([2.15, 7.20, 12.35])
    expect(series).toHaveLength(4) // n+1 species
  })

  it("all values between 0 and 1", () => {
    const series = buildSpeciationSeries([4.75])
    for (const data of series) {
      for (const pt of data) {
        expect(pt.y).toBeGreaterThanOrEqual(0)
        expect(pt.y).toBeLessThanOrEqual(1 + 1e-10)
      }
    }
  })
})

describe("buildTitrationSeries", () => {
  it("generates points for monoprotic", () => {
    const data = buildTitrationSeries([4.75])
    expect(data.length).toBeGreaterThan(10)
    // All pH values should be between 0 and 14
    for (const pt of data) {
      expect(pt.y).toBeGreaterThanOrEqual(0)
      expect(pt.y).toBeLessThanOrEqual(14)
    }
  })
})

describe("classifyPH", () => {
  it("classifies acidic pH", () => expect(classifyPH(3)).toBe("acidic"))
  it("classifies basic pH", () => expect(classifyPH(10)).toBe("basic"))
  it("classifies balanced pH", () => expect(classifyPH(7)).toBe("balanced"))
})

describe("buildBufferCapacitySeries", () => {
  it("generates points with positive beta", () => {
    const data = buildBufferCapacitySeries([4.75], 0.1)
    expect(data.length).toBeGreaterThan(10)
    for (const pt of data) {
      expect(pt.y).toBeGreaterThanOrEqual(0)
    }
  })

  it("has elevated beta near pKa", () => {
    const data = buildBufferCapacitySeries([4.75], 0.1, 0, 14, 0.1)
    const atPKa = data.find((pt) => Math.abs(pt.x - 4.75) < 0.15)
    const atFarPH = data.find((pt) => Math.abs(pt.x - 9) < 0.15)
    expect(atPKa).toBeDefined()
    expect(atFarPH).toBeDefined()
    expect(atPKa!.y).toBeGreaterThan(atFarPH!.y)
  })
})

describe("buildPredominanceSeries", () => {
  it("returns entries with dominant species index", () => {
    const data = buildPredominanceSeries([4.75])
    expect(data.length).toBeGreaterThan(10)
    for (const pt of data) {
      expect(pt.dominant).toBeGreaterThanOrEqual(0)
      expect(pt.dominant).toBeLessThanOrEqual(1)
      expect(pt.alpha).toBeGreaterThan(0)
    }
  })
})

describe("buildSensitivitySeries", () => {
  it("returns n+1 series for monoprotic", () => {
    const series = buildSensitivitySeries([4.75])
    expect(series).toHaveLength(2)
  })
})

describe("calcEquivalenceVolumes", () => {
  it("returns volumes for each pKa step", () => {
    const volumes = calcEquivalenceVolumes([2.15, 7.20, 12.35], 0.1, 0.1)
    expect(volumes).toHaveLength(3)
    for (const v of volumes) {
      expect(v).toBeGreaterThan(0)
    }
  })
})

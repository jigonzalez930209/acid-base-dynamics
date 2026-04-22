/**
 * Complexation & precipitation math tests.
 */
import { describe, it, expect } from "vitest"
import { calcAlphaLigand, calcLogKfPrime, calcLogKfDoublePrime } from "@/features/advanced/complexation-math"
import { METALS, LIGANDS, COMPLEXATION_DATA } from "@/features/advanced/complexation-db"
import { HYDROXIDE_DATA } from "@/features/advanced/precipitation-data"
import { HALF_REACTIONS } from "@/features/advanced/redox-data"

describe("calcAlphaLigand", () => {
  const edta = LIGANDS.find((l) => l.abbreviation === "EDTA" || l.id.includes("edta"))

  it("α approaches 1 at high pH for EDTA", () => {
    if (!edta) return
    const alpha = calcAlphaLigand(edta, 12)
    expect(alpha).toBeGreaterThan(0.9)
  })

  it("α is very small at low pH for EDTA", () => {
    if (!edta) return
    const alpha = calcAlphaLigand(edta, 2)
    expect(alpha).toBeLessThan(0.01)
  })
})

describe("conditional constants", () => {
  it("log Kf' < log Kf at low pH", () => {
    const metal = METALS[0]
    const ligand = LIGANDS[0]
    const entry = COMPLEXATION_DATA.find((e) => e.metalId === metal.id && e.ligandId === ligand.id)
    if (!entry) return

    const logKf = entry.logBeta[entry.logBeta.length - 1]
    const logKfPrime = calcLogKfPrime(metal, ligand, logKf, 2)
    expect(logKfPrime).toBeLessThan(logKf)
  })

  it("log Kf'' <= log Kf'", () => {
    const metal = METALS[0]
    const ligand = LIGANDS[0]
    const entry = COMPLEXATION_DATA.find((e) => e.metalId === metal.id && e.ligandId === ligand.id)
    if (!entry) return

    const logKf = entry.logBeta[entry.logBeta.length - 1]
    const logKfP = calcLogKfPrime(metal, ligand, logKf, 7)
    const logKfPP = calcLogKfDoublePrime(metal, ligand, logKf, 7)
    expect(logKfPP).toBeLessThanOrEqual(logKfP + 0.01) // small tolerance
  })
})

describe("precipitation data", () => {
  it("has 10 hydroxides", () => {
    expect(HYDROXIDE_DATA).toHaveLength(10)
  })

  it("all have positive Ksp", () => {
    for (const entry of HYDROXIDE_DATA) {
      expect(entry.Ksp).toBeGreaterThan(0)
    }
  })

  it("Fe(OH)3 has smallest Ksp", () => {
    const feOH3 = HYDROXIDE_DATA.find((e) => e.id === "fe-oh3")
    expect(feOH3).toBeDefined()
    const minKsp = Math.min(...HYDROXIDE_DATA.map((e) => e.Ksp))
    expect(feOH3!.Ksp).toBe(minKsp)
  })
})

describe("redox data", () => {
  it("has half-reactions", () => {
    expect(HALF_REACTIONS.length).toBeGreaterThanOrEqual(10)
  })

  it("SHE has E0 = 0", () => {
    const she = HALF_REACTIONS.find((r) => r.id === "she")
    expect(she).toBeDefined()
    expect(she!.E0).toBe(0)
  })

  it("all have positive n", () => {
    for (const r of HALF_REACTIONS) {
      expect(r.n).toBeGreaterThan(0)
    }
  })
})

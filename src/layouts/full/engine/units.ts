/**
 * Unit conversion engine
 * Supports: mol/L, mmol/L, µmol/L, mg/L, ppm, %m/v
 * With coherent rounding, molar mass dependency warnings, and density assumptions.
 */

import type { ConcentrationUnit } from "./types"

export type ConversionResult = {
  value: number
  unit: ConcentrationUnit
  warning?: string
}

const UNIT_TO_MOL_FACTOR: Record<ConcentrationUnit, number> = {
  "mol/L": 1,
  "mmol/L": 1e-3,
  "µmol/L": 1e-6,
  "mg/L": -1,    // requires molar mass
  "ppm": -1,     // requires density assumption
  "%m/v": -1,    // requires molar mass
}

export function toMolPerL(
  value: number,
  from: ConcentrationUnit,
  molarMass?: number,
  density_g_mL = 1.0,
): ConversionResult {
  switch (from) {
    case "mol/L": return { value, unit: "mol/L" }
    case "mmol/L": return { value: value * 1e-3, unit: "mol/L" }
    case "µmol/L": return { value: value * 1e-6, unit: "mol/L" }
    case "mg/L":
      if (!molarMass) return { value: 0, unit: "mol/L", warning: "Molar mass required for mg/L conversion" }
      return { value: value / (molarMass * 1000), unit: "mol/L" }
    case "ppm":
      if (!molarMass) return { value: 0, unit: "mol/L", warning: "Molar mass required for ppm conversion" }
      return {
        value: (value * density_g_mL) / (molarMass * 1000),
        unit: "mol/L",
        warning: density_g_mL !== 1.0 ? undefined : "Assumes density ≈ 1.0 g/mL (dilute aqueous)",
      }
    case "%m/v":
      if (!molarMass) return { value: 0, unit: "mol/L", warning: "Molar mass required for %m/v conversion" }
      return { value: (value * 10) / molarMass, unit: "mol/L" }
  }
}

export function fromMolPerL(
  mol_L: number,
  to: ConcentrationUnit,
  molarMass?: number,
  density_g_mL = 1.0,
): ConversionResult {
  switch (to) {
    case "mol/L": return { value: mol_L, unit: to }
    case "mmol/L": return { value: mol_L * 1e3, unit: to }
    case "µmol/L": return { value: mol_L * 1e6, unit: to }
    case "mg/L":
      if (!molarMass) return { value: 0, unit: to, warning: "Molar mass required" }
      return { value: mol_L * molarMass * 1000, unit: to }
    case "ppm":
      if (!molarMass) return { value: 0, unit: to, warning: "Molar mass required" }
      return {
        value: (mol_L * molarMass * 1000) / density_g_mL,
        unit: to,
        warning: density_g_mL === 1.0 ? "Assumes density ≈ 1.0 g/mL" : undefined,
      }
    case "%m/v":
      if (!molarMass) return { value: 0, unit: to, warning: "Molar mass required" }
      return { value: (mol_L * molarMass) / 10, unit: to }
  }
}

export function convertUnits(
  value: number,
  from: ConcentrationUnit,
  to: ConcentrationUnit,
  molarMass?: number,
  density_g_mL = 1.0,
): ConversionResult {
  if (from === to) return { value, unit: to }
  const inMol = toMolPerL(value, from, molarMass, density_g_mL)
  if (inMol.warning && UNIT_TO_MOL_FACTOR[from] === -1) return inMol
  return fromMolPerL(inMol.value, to, molarMass, density_g_mL)
}

export function formatConcentration(value: number, unit: ConcentrationUnit, sigFigs = 4): string {
  if (value === 0) return `0 ${unit}`
  if (Math.abs(value) < 1e-4 || Math.abs(value) >= 1e6) {
    return `${value.toExponential(sigFigs - 1)} ${unit}`
  }
  return `${Number(value.toPrecision(sigFigs))} ${unit}`
}

export const ALL_UNITS: ConcentrationUnit[] = ["mol/L", "mmol/L", "µmol/L", "mg/L", "ppm", "%m/v"]

export const UNIT_LABELS: Record<ConcentrationUnit, string> = {
  "mol/L": "mol/L (molar)",
  "mmol/L": "mmol/L (millimolar)",
  "µmol/L": "µmol/L (micromolar)",
  "mg/L": "mg/L (milligrams per liter)",
  "ppm": "ppm (parts per million)",
  "%m/v": "% m/v (mass/volume percent)",
}

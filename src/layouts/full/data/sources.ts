/**
 * Master chemical database sources and metadata.
 * Each constant tracks: source, temperature, ionic strength, unit, validity note, revision date.
 */

import type { DataSource, LocalizedText, ModelAssumption } from "../engine/types"

export const PRIMARY_SOURCES: Record<string, DataSource> = {
  harris10: {
    reference: "Harris, D.C. Quantitative Chemical Analysis, 10th Ed. (2015)",
    temperature_C: 25,
    ionicStrength_M: 0.1,
    unit: "mol/L",
    validityNote: { es: "Valores tabulados Apéndice I–III, I ≈ 0.1 M", en: "Tabulated values App. I–III, I ≈ 0.1 M" },
    revisionDate: "2024-01-15",
  },
  skoog9: {
    reference: "Skoog, West, Holler. Fundamentals of Analytical Chemistry, 9th Ed.",
    temperature_C: 25,
    ionicStrength_M: 0,
    unit: "mol/L",
    validityNote: { es: "Constantes termodinámicas a dilución infinita", en: "Thermodynamic constants at infinite dilution" },
    revisionDate: "2024-01-15",
  },
  martellSmith: {
    reference: "Martell & Smith, Critical Stability Constants (NIST 46)",
    temperature_C: 25,
    ionicStrength_M: 0.1,
    unit: "mol/L",
    validityNote: { es: "Base NIST críticamente seleccionada", en: "NIST critically selected database" },
    revisionDate: "2024-03-01",
  },
  iupac2021: {
    reference: "IUPAC SC-database 2021",
    temperature_C: 25,
    ionicStrength_M: null,
    unit: "mol/L",
    validityNote: { es: "Valores IUPAC recomendados", en: "IUPAC recommended values" },
    revisionDate: "2024-06-01",
  },
  tablasPDF: {
    reference: "TABLAS.pdf (páginas 1–2): tablas de pKa ácido-base",
    temperature_C: 25,
    ionicStrength_M: 0.1,
    unit: "mol/L",
    validityNote: { es: "Datos base originales del proyecto, 25°C", en: "Original project base data, 25°C" },
    revisionDate: "2024-01-01",
  },
}

/** Per-domain model assumptions */
export const DOMAIN_ASSUMPTIONS: Record<string, ModelAssumption> = {
  "acid-base": {
    usesActivities: false,
    assumesIdealSolution: true,
    ignoresIonicStrength: true,
    validPHRange: [0, 14],
    validTempRange_C: [15, 40],
    notes: {
      es: "Usa concentraciones, no actividades. Solución ideal. Rango 0–14 pH. Válido 15–40 °C con corrección Van't Hoff.",
      en: "Uses concentrations, not activities. Ideal solution. Range 0–14 pH. Valid 15–40 °C with Van't Hoff correction.",
    },
  },
  complexation: {
    usesActivities: false,
    assumesIdealSolution: true,
    ignoresIonicStrength: false,
    validPHRange: [0, 14],
    validTempRange_C: [20, 30],
    notes: {
      es: "Constantes condicionales dependen del pH. I ≈ 0.1 M (Harris). Hidrólisis del metal como reacción lateral.",
      en: "Conditional constants are pH-dependent. I ≈ 0.1 M (Harris). Metal hydrolysis as side reaction.",
    },
  },
  precipitation: {
    usesActivities: false,
    assumesIdealSolution: true,
    ignoresIonicStrength: true,
    validPHRange: [0, 14],
    validTempRange_C: [20, 30],
    notes: {
      es: "Ksp tabuladas a 25°C. Ignora efecto salino. Precipitación homogénea asumida.",
      en: "Ksp tabulated at 25°C. Ignores salt effect. Homogeneous precipitation assumed.",
    },
  },
  redox: {
    usesActivities: false,
    assumesIdealSolution: true,
    ignoresIonicStrength: true,
    validPHRange: [0, 14],
    validTempRange_C: [20, 30],
    notes: {
      es: "Potenciales estándar vs SHE. Ecuación de Nernst a 25°C. No incluye sobrepotenciales.",
      en: "Standard potentials vs SHE. Nernst equation at 25°C. No overpotentials included.",
    },
  },
}

/** Molar masses for common species (g/mol) */
export const MOLAR_MASSES: Record<string, { formula: string; M: number; name: LocalizedText }> = {
  HCl: { formula: "HCl", M: 36.46, name: { es: "Ácido clorhídrico", en: "Hydrochloric acid" } },
  NaOH: { formula: "NaOH", M: 40.0, name: { es: "Hidróxido de sodio", en: "Sodium hydroxide" } },
  H2SO4: { formula: "H₂SO₄", M: 98.08, name: { es: "Ácido sulfúrico", en: "Sulfuric acid" } },
  CH3COOH: { formula: "CH₃COOH", M: 60.05, name: { es: "Ácido acético", en: "Acetic acid" } },
  Na2CO3: { formula: "Na₂CO₃", M: 105.99, name: { es: "Carbonato de sodio", en: "Sodium carbonate" } },
  H3PO4: { formula: "H₃PO₄", M: 98.0, name: { es: "Ácido fosfórico", en: "Phosphoric acid" } },
  KMnO4: { formula: "KMnO₄", M: 158.03, name: { es: "Permanganato de potasio", en: "Potassium permanganate" } },
  Na2EDTA: { formula: "Na₂H₂Y·2H₂O", M: 372.24, name: { es: "EDTA disódico dihidrato", en: "Disodium EDTA dihydrate" } },
  K2Cr2O7: { formula: "K₂Cr₂O₇", M: 294.19, name: { es: "Dicromato de potasio", en: "Potassium dichromate" } },
  AgNO3: { formula: "AgNO₃", M: 169.87, name: { es: "Nitrato de plata", en: "Silver nitrate" } },
  CaCO3: { formula: "CaCO₃", M: 100.09, name: { es: "Carbonato de calcio", en: "Calcium carbonate" } },
  NaCl: { formula: "NaCl", M: 58.44, name: { es: "Cloruro de sodio", en: "Sodium chloride" } },
  NH3: { formula: "NH₃", M: 17.03, name: { es: "Amoniaco", en: "Ammonia" } },
  H2C2O4: { formula: "H₂C₂O₄·2H₂O", M: 126.07, name: { es: "Ácido oxálico dihidrato", en: "Oxalic acid dihydrate" } },
  Na2S2O3: { formula: "Na₂S₂O₃·5H₂O", M: 248.18, name: { es: "Tiosulfato de sodio pentahidrato", en: "Sodium thiosulfate pentahydrate" } },
}

/**
 * Acid-base indicators used in the phosphate TP.
 *
 * Sources:
 *  - Skoog & West – Fundamentals of Analytical Chemistry, 9th ed., Table 11-3
 *  - Harris – Quantitative Chemical Analysis, 3rd ed., Appendix F
 *
 * All indicators are relevant for phosphoric acid titrations with NaOH.
 */

export type Indicator = {
  id: string
  name: { es: string; en: string }
  /** Lower pH of the transition range */
  pHLow: number
  /** Upper pH of the transition range */
  pHHigh: number
  /** Color in acid form */
  colorAcid: string
  /** Color in base form */
  colorBase: string
  /** CSS color for acid region (used in UI bands) */
  cssAcid: string
  /** CSS color for base region */
  cssBase: string
  /**
   * Which equivalence points this indicator is suitable for.
   * 1 = V₁eq (~pH 4.5), 2 = V₂eq (~pH 9.7)
   */
  suitableFor: (1 | 2)[]
  /** Short note on its use in this TP */
  note: { es: string; en: string }
}

export const INDICATORS: Indicator[] = [
  {
    id: "methyl_orange",
    name: { es: "Naranja de metilo", en: "Methyl orange" },
    pHLow: 3.1, pHHigh: 4.4,
    colorAcid: "rojo", colorBase: "amarillo",
    cssAcid: "#ef4444", cssBase: "#eab308",
    suitableFor: [],
    note: {
      es: "Vira antes del primer punto de equivalencia. No recomendado para esta titulación.",
      en: "Changes before the first equivalence point. Not recommended for this titration.",
    },
  },
  {
    id: "bromocresol_green",
    name: { es: "Verde de bromocresol", en: "Bromocresol green" },
    pHLow: 3.8, pHHigh: 5.4,
    colorAcid: "amarillo", colorBase: "azul",
    cssAcid: "#eab308", cssBase: "#3b82f6",
    suitableFor: [1],
    note: {
      es: "Viraje dentro del primer salto de pH. Aceptable para V₁eq.",
      en: "Transition within the first pH jump. Acceptable for V₁eq.",
    },
  },
  {
    id: "methyl_red",
    name: { es: "Rojo de metilo", en: "Methyl red" },
    pHLow: 4.4, pHHigh: 6.2,
    colorAcid: "rojo", colorBase: "amarillo",
    cssAcid: "#ef4444", cssBase: "#eab308",
    suitableFor: [1],
    note: {
      es: "Buen indicador para el primer punto de equivalencia (~pH 4.7).",
      en: "Good indicator for the first equivalence point (~pH 4.7).",
    },
  },
  {
    id: "phenol_red",
    name: { es: "Rojo de fenol", en: "Phenol red" },
    pHLow: 6.8, pHHigh: 8.4,
    colorAcid: "amarillo", colorBase: "rojo",
    cssAcid: "#eab308", cssBase: "#ef4444",
    suitableFor: [],
    note: {
      es: "Vira entre los dos equivalentes. No es selectivo para ninguno de los dos.",
      en: "Transitions between the two equivalence points. Not selective for either.",
    },
  },
  {
    id: "phenolphthalein",
    name: { es: "Fenolftaleína", en: "Phenolphthalein" },
    pHLow: 8.2, pHHigh: 10.0,
    colorAcid: "incoloro", colorBase: "rosa",
    cssAcid: "#f3f4f6", cssBase: "#ec4899",
    suitableFor: [2],
    note: {
      es: "Indicador recomendado para el segundo punto de equivalencia (~pH 9.7).",
      en: "Recommended indicator for the second equivalence point (~pH 9.7).",
    },
  },
  {
    id: "thymolphthalein",
    name: { es: "Timolftaleína", en: "Thymolphthalein" },
    pHLow: 9.3, pHHigh: 10.5,
    colorAcid: "incoloro", colorBase: "azul",
    cssAcid: "#f3f4f6", cssBase: "#3b82f6",
    suitableFor: [2],
    note: {
      es: "Alternativa a fenolftaleína para V₂eq. Viraje algo más tardío.",
      en: "Alternative to phenolphthalein for V₂eq. Slightly later transition.",
    },
  },
]

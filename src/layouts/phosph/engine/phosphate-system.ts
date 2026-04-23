/**
 * Phosphate system descriptor for the PhosphateLab TP module.
 *
 * Source: Skoog, West, Holler & Crouch – Fundamentos de Química Analítica (9ª ed.)
 *         Harris – Análisis Químico Cuantitativo (3ª ed.)
 * Temperature: 25 °C, ionic strength ≈ 0 (ideal solution assumption)
 * Model: concentrations = activities (no activity correction)
 */

// ── Thermodynamic constants ────────────────────────────────────────────────

export const PKA = {
  pKa1: 2.15,
  Ka1: 10 ** -2.15,
  pKa2: 7.20,
  Ka2: 10 ** -7.20,
  pKa3: 12.35,
  Ka3: 10 ** -12.35,
  Kw: 1e-14,
} as const

// ── Sample type ────────────────────────────────────────────────────────────

export type PhosphateSample = {
  id: "A" | "B" | "C" | "D"
  name: { es: string; en: string }
  description: { es: string; en: string }
  composition: { es: string; en: string }
  /** Total phosphate concentration (mol/L) */
  CA: number
  /** Sample volume (mL) */
  Va: number
  /** NaOH titrant concentration (mol/L) */
  CB: number
  /**
   * Initial neutralization fraction:
   * f_initial = Σ(i * αᵢ_initial)
   * 0 = pure H₃PO₄, 1 = pure H₂PO₄⁻, 2 = pure HPO₄²⁻, 3 = pure PO₄³⁻
   */
  f_initial: number
}

// ── The four TP samples ────────────────────────────────────────────────────

export const SAMPLES: PhosphateSample[] = [
  {
    id: "A",
    name: { es: "Muestra A – Ácido fosfórico", en: "Sample A – Phosphoric acid" },
    description: {
      es: "Solución de H₃PO₄ puro. Presenta dos saltos de pH bien definidos.",
      en: "Pure H₃PO₄ solution. Shows two well-defined pH jumps.",
    },
    composition: { es: "H₃PO₄ 0.100 mol/L", en: "H₃PO₄ 0.100 mol/L" },
    CA: 0.100, Va: 20.0, CB: 0.100,
    f_initial: 0,
  },
  {
    id: "B",
    name: { es: "Muestra B – Dihidrógenofosfato", en: "Sample B – Dihydrogen phosphate" },
    description: {
      es: "KH₂PO₄ puro. Un único salto de pH visible cerca de pH 9.7.",
      en: "Pure KH₂PO₄. Single visible pH jump near pH 9.7.",
    },
    composition: { es: "KH₂PO₄ 0.100 mol/L", en: "KH₂PO₄ 0.100 mol/L" },
    CA: 0.100, Va: 20.0, CB: 0.100,
    f_initial: 1,
  },
  {
    id: "C",
    name: { es: "Muestra C – Buffer fosfato pH 7.2", en: "Sample C – Phosphate buffer pH 7.2" },
    description: {
      es: "Mezcla H₂PO₄⁻/HPO₄²⁻ en zona de máxima capacidad tampón.",
      en: "H₂PO₄⁻/HPO₄²⁻ mixture in maximum buffer capacity zone.",
    },
    composition: { es: "NaH₂PO₄ 0.060 mol/L + Na₂HPO₄ 0.040 mol/L", en: "NaH₂PO₄ 0.060 mol/L + Na₂HPO₄ 0.040 mol/L" },
    CA: 0.100, Va: 20.0, CB: 0.100,
    // f_initial = 1 * 0.60 + 2 * 0.40 = 1.40
    f_initial: 1.40,
  },
  {
    id: "D",
    name: { es: "Muestra D – Hidrogenfosfato", en: "Sample D – Hydrogen phosphate" },
    description: {
      es: "Na₂HPO₄ puro. El único salto visible está cerca de pH 12.5.",
      en: "Pure Na₂HPO₄. Only visible jump near pH 12.5.",
    },
    composition: { es: "Na₂HPO₄ 0.050 mol/L", en: "Na₂HPO₄ 0.050 mol/L" },
    CA: 0.050, Va: 20.0, CB: 0.100,
    f_initial: 2,
  },
]

// ── Alpha fractions ────────────────────────────────────────────────────────

/**
 * Returns the four mole fractions of the phosphate system at a given [H⁺].
 * α₀ = H₃PO₄, α₁ = H₂PO₄⁻, α₂ = HPO₄²⁻, α₃ = PO₄³⁻
 */
export function calcAlphas(h: number): [number, number, number, number] {
  const { Ka1, Ka2, Ka3 } = PKA
  const D = h ** 3 + Ka1 * h ** 2 + Ka1 * Ka2 * h + Ka1 * Ka2 * Ka3
  return [h ** 3 / D, Ka1 * h ** 2 / D, Ka1 * Ka2 * h / D, Ka1 * Ka2 * Ka3 / D]
}

/** Fixed sample used for all student calculations (H₃PO₄ 0.100 M, Va=20 mL, NaOH 0.100 M) */
export const FIXED_SAMPLE = SAMPLES[0]

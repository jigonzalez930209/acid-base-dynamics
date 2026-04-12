/**
 * Complexation equilibria data – EDTA and stepwise ligand systems
 *
 * Kf  = thermodynamic formation constant (tabulated, 25 °C, I ≈ 0.1 M)
 * Kf' = conditional Kf accounting for ligand (EDTA) protonation side reactions:
 *         log Kf' = log Kf + log αY⁴⁻(pH)
 * Kf''= doubly-conditional Kf, additionally accounting for metal hydroxo side
 *         reactions:  log Kf'' = log Kf + log αY⁴⁻(pH) − log αM(OH)(pH)
 *
 * Sources: Harris "Quantitative Chemical Analysis" 10th ed.; Skoog et al.
 *          "Principles of Instrumental Analysis"; NIST critically selected values.
 */

// ---------------------------------------------------------------------------
// EDTA proton-dissociation constants (pKa1 … pKa6 for H6Y²⁺ → Y⁴⁻)
// ---------------------------------------------------------------------------
export const EDTA_PKA = [0.0, 1.5, 2.0, 2.67, 6.16, 10.26] as const

/**
 * Compute αY⁴⁻ = fraction of total EDTA present as the uncomplexed Y⁴⁻ form.
 * Uses the recursive denominator expansion.
 */
export function calcAlphaY4(pH: number): number {
  const h = 10 ** (-pH)
  const Ka = EDTA_PKA.map((pk) => 10 ** (-pk))
  //   α  =  1 / (1 + [H]/Ka6 + [H]²/(Ka5·Ka6) + … )
  let denom = 1
  let ratio = 1
  for (let i = Ka.length - 1; i >= 0; i--) {
    ratio *= h / Ka[i]
    denom += ratio
  }
  return 1 / denom
}

// ---------------------------------------------------------------------------
// Metal-EDTA formation constants
// ---------------------------------------------------------------------------
export type MetalEDTA = {
  id: string
  symbol: string
  /** Cation charge (n in M^n+) */
  charge: number
  label: { es: string; en: string }
  /** log Kf (thermodynamic, 25 °C) */
  logKf: number
  /**
   * Pre-computed log αM(OH) interpolation table.
   * Each entry is [pH, log(αM)] — αM is the side-reaction coefficient for
   * metal hydrolysis:  αM = [M'_total] / [M^n+_free] ≥ 1  (log αM ≥ 0).
   * Values from Harris App. I or Ringbom tables.  Interpolate linearly.
   */
  logAlphaM: [number, number][]
}

/** log Kf' at the given pH (accounts for EDTA protonation only) */
export function calcLogKfPrime(entry: MetalEDTA, pH: number): number {
  const aY = calcAlphaY4(pH)
  return entry.logKf + Math.log10(aY)
}

/** log Kf'' at the given pH (accounts for both EDTA protonation & metal hydrolysis) */
export function calcLogKfDoublePrime(entry: MetalEDTA, pH: number): number {
  const logKfP = calcLogKfPrime(entry, pH)
  const logAM  = interpLogAlphaM(entry.logAlphaM, pH)
  return logKfP - logAM
}

/** Linear interpolation on the logAlphaM table */
export function interpLogAlphaM(table: [number, number][], pH: number): number {
  if (table.length === 0) return 0
  if (pH <= table[0][0]) return table[0][1]
  if (pH >= table[table.length - 1][0]) return table[table.length - 1][1]
  for (let i = 0; i < table.length - 1; i++) {
    const [x0, y0] = table[i]
    const [x1, y1] = table[i + 1]
    if (pH >= x0 && pH <= x1) {
      return y0 + ((pH - x0) / (x1 - x0)) * (y1 - y0)
    }
  }
  return 0
}

/**
 * Minimum pH where log Kf'' ≥ THRESHOLD (default 8).
 * Returns null if the condition is never met in the range 0–14.
 */
export function minTitrationPH(
  entry: MetalEDTA,
  threshold = 8,
  step = 0.05,
): number | null {
  for (let pH = 0; pH <= 14; pH += step) {
    if (calcLogKfDoublePrime(entry, pH) >= threshold) return +pH.toFixed(2)
  }
  return null
}

// ---------------------------------------------------------------------------
// Dataset — logAlphaM from Harris App. I (interpolated at pH 2,4,6,8,10,12)
// ---------------------------------------------------------------------------
export const METAL_EDTA: MetalEDTA[] = [
  {
    id: "mg2",
    symbol: "Mg²⁺",
    charge: 2,
    label: { es: "Mg²⁺  (Magnesio)",    en: "Mg²⁺  (Magnesium)"  },
    logKf: 8.79,
    logAlphaM: [[0,0],[4,0],[6,0],[8,0],[10,0.5],[12,3.4]],
  },
  {
    id: "ca2",
    symbol: "Ca²⁺",
    charge: 2,
    label: { es: "Ca²⁺  (Calcio)",       en: "Ca²⁺  (Calcium)"    },
    logKf: 10.69,
    logAlphaM: [[0,0],[4,0],[6,0],[8,0],[10,0],[12,0.5]],
  },
  {
    id: "mn2",
    symbol: "Mn²⁺",
    charge: 2,
    label: { es: "Mn²⁺  (Manganeso)",    en: "Mn²⁺  (Manganese)"  },
    logKf: 13.87,
    logAlphaM: [[0,0],[4,0],[6,0],[8,0.2],[10,1.7],[12,5.4]],
  },
  {
    id: "fe2",
    symbol: "Fe²⁺",
    charge: 2,
    label: { es: "Fe²⁺  (Hierro II)",    en: "Fe²⁺  (Iron II)"    },
    logKf: 14.33,
    logAlphaM: [[0,0],[4,0],[6,0],[8,0.2],[10,1.8],[12,5.7]],
  },
  {
    id: "co2",
    symbol: "Co²⁺",
    charge: 2,
    label: { es: "Co²⁺  (Cobalto II)",   en: "Co²⁺  (Cobalt II)"  },
    logKf: 16.31,
    logAlphaM: [[0,0],[4,0],[6,0],[8,0.0],[10,1.0],[12,4.5]],
  },
  {
    id: "ni2",
    symbol: "Ni²⁺",
    charge: 2,
    label: { es: "Ni²⁺  (Níquel)",       en: "Ni²⁺  (Nickel)"     },
    logKf: 18.62,
    logAlphaM: [[0,0],[4,0],[6,0],[8,0.0],[10,1.0],[12,5.0]],
  },
  {
    id: "cu2",
    symbol: "Cu²⁺",
    charge: 2,
    label: { es: "Cu²⁺  (Cobre)",        en: "Cu²⁺  (Copper)"     },
    logKf: 18.80,
    logAlphaM: [[0,0],[4,0],[6,0],[8,2.0],[10,6.2],[12,12.2]],
  },
  {
    id: "zn2",
    symbol: "Zn²⁺",
    charge: 2,
    label: { es: "Zn²⁺  (Zinc)",         en: "Zn²⁺  (Zinc)"       },
    logKf: 16.50,
    logAlphaM: [[0,0],[4,0],[6,0],[8,0.2],[10,2.4],[12,8.5]],
  },
  {
    id: "cd2",
    symbol: "Cd²⁺",
    charge: 2,
    label: { es: "Cd²⁺  (Cadmio)",       en: "Cd²⁺  (Cadmium)"    },
    logKf: 16.46,
    logAlphaM: [[0,0],[4,0],[6,0],[8,0.1],[10,2.0],[12,5.7]],
  },
  {
    id: "pb2",
    symbol: "Pb²⁺",
    charge: 2,
    label: { es: "Pb²⁺  (Plomo)",        en: "Pb²⁺  (Lead)"       },
    logKf: 18.04,
    logAlphaM: [[0,0],[4,0],[6,0.1],[8,1.2],[10,3.8],[12,7.8]],
  },
  {
    id: "hg2",
    symbol: "Hg²⁺",
    charge: 2,
    label: { es: "Hg²⁺  (Mercurio)",     en: "Hg²⁺  (Mercury)"    },
    logKf: 21.80,
    logAlphaM: [[0,0],[4,0],[6,0.5],[8,2.5],[10,5.5],[12,9.5]],
  },
  {
    id: "al3",
    symbol: "Al³⁺",
    charge: 3,
    label: { es: "Al³⁺  (Aluminio)",     en: "Al³⁺  (Aluminum)"   },
    logKf: 16.13,
    logAlphaM: [[0,0],[2,0.4],[4,0.4],[6,2.4],[8,6.4],[10,10.4],[12,14.4]],
  },
  {
    id: "fe3",
    symbol: "Fe³⁺",
    charge: 3,
    label: { es: "Fe³⁺  (Hierro III)",   en: "Fe³⁺  (Iron III)"   },
    logKf: 25.10,
    logAlphaM: [[0,0],[2,0],[4,0.4],[6,4.4],[8,8.4],[10,12.4],[12,16.4]],
  },
  {
    id: "cr3",
    symbol: "Cr³⁺",
    charge: 3,
    label: { es: "Cr³⁺  (Cromo III)",    en: "Cr³⁺  (Chromium III)" },
    logKf: 23.40,
    logAlphaM: [[0,0],[4,0],[6,1.5],[8,4.5],[10,8.0],[12,13.0]],
  },
  {
    id: "bi3",
    symbol: "Bi³⁺",
    charge: 3,
    label: { es: "Bi³⁺  (Bismuto)",      en: "Bi³⁺  (Bismuth)"    },
    logKf: 22.80,
    logAlphaM: [[0,0],[2,3.2],[4,9.2],[6,13.0],[8,15.0],[10,17.0],[12,19.0]],
  },
]

// ---------------------------------------------------------------------------
// Stepwise formation constants for metal–ammonia complexes
// (for the Kf₁, Kf₂, … table)
// ---------------------------------------------------------------------------
export type StepwiseComplex = {
  id: string
  label: { es: string; en: string }
  /** Stepwise log Kn values: log K1, log K2, … */
  logKn: number[]
  /** Overall log β_n = Σ log Ki */
  logBeta: number[]
}

export const AMMONIA_COMPLEXES: StepwiseComplex[] = [
  {
    id: "cu-nh3",
    label: { es: "Cu²⁺ – NH₃ (tetraamminecobre)",   en: "Cu²⁺ – NH₃ (tetraamminecopper)"   },
    logKn:   [4.31, 3.67, 3.04, 2.30],
    logBeta: [4.31, 7.98, 11.02, 13.32],
  },
  {
    id: "zn-nh3",
    label: { es: "Zn²⁺ – NH₃ (tetraamminezinc)",    en: "Zn²⁺ – NH₃ (tetraamminezinc)"    },
    logKn:   [2.21, 2.29, 2.36, 2.03],
    logBeta: [2.21, 4.50, 6.86, 8.89],
  },
  {
    id: "ni-nh3",
    label: { es: "Ni²⁺ – NH₃ (hexaammineníquel)",   en: "Ni²⁺ – NH₃ (hexaamminenickel)"   },
    logKn:   [2.80, 2.24, 1.73, 1.19, 0.75, 0.03],
    logBeta: [2.80, 5.04, 6.77, 7.96, 8.71, 8.74],
  },
  {
    id: "cd-nh3",
    label: { es: "Cd²⁺ – NH₃ (tetraamminecadmio)",  en: "Cd²⁺ – NH₃ (tetraamminecadmium)" },
    logKn:   [2.55, 2.01, 1.34, 0.84],
    logBeta: [2.55, 4.56, 5.90, 6.74],
  },
  {
    id: "co-nh3",
    label: { es: "Co²⁺ – NH₃ (hexaamminecobalto)",  en: "Co²⁺ – NH₃ (hexaamminecobalt)"   },
    logKn:   [2.11, 1.63, 1.05, 0.76, 0.18, -0.62],
    logBeta: [2.11, 3.74, 4.79, 5.55, 5.73, 5.11],
  },
  {
    id: "ag-nh3",
    label: { es: "Ag⁺ – NH₃ (diammineargento)",     en: "Ag⁺ – NH₃ (diamminesilver)"      },
    logKn:   [3.32, 3.92],
    logBeta: [3.32, 7.24],
  },
]

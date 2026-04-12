/**
 * Comprehensive complexation equilibria database
 *
 * Nomenclature (IUPAC / Harris / Ringbom)
 * ─────────────────────────────────────────
 *  M + L  ⇌  ML             K₁ = [ML] / ([M][L])
 *  ML + L ⇌  ML₂            K₂ = [ML₂] / ([ML][L])
 *  ...
 *  MLₙ₋₁ + L ⇌ MLₙ          Kₙ = [MLₙ] / ([MLₙ₋₁][L])
 *
 *  Overall:  M + nL ⇌ MLₙ   βₙ = K₁·K₂·…·Kₙ  → log βₙ = Σ log Kᵢ
 *
 *  For polydentate ligands (EDTA, DTPA…) that saturate the coordination
 *  sphere in a single step there is only K₁ (≡ Kf).
 *
 * Sources
 * ───────
 *  Harris "Quantitative Chemical Analysis" 10th ed. App. I, II
 *  Martell & Smith "Critical Stability Constants" (NIST 46)
 *  Skoog, West, Holler "Fundamentals of Analytical Chemistry" App. C
 *  IUPAC SC-database 2021
 *  25 °C, ionic strength I ≈ 0.1 M unless noted
 *
 * log αM(OH) tables for metal hydrolysis side-reaction coefficients.
 * Entries are [pH, log αM] pairs.  Interpolate linearly.
 * αM ≥ 1  (log αM ≥ 0) because M' = M_free + MOH complexes.
 */

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

export type Locale = "es" | "en"

export type MetalRecord = {
  id: string
  symbol: string
  charge: number
  label: { es: string; en: string }
  /** log αM(OH) vs pH table for metal hydrolysis correction */
  logAlphaM: [number, number][]
  /** Color hint for UI (CSS color) */
  color: string
}

export type LigandRecord = {
  id: string
  abbreviation: string
  formula: string
  label: { es: string; en: string }
  /** Number of donor atoms (denticity) */
  denticity: number
  /** Charge of fully deprotonated ligand (e.g. EDTA = −4) */
  chargeDeprotonated: number
  /** pKa values of the acidic protons (from most acidic to least) */
  pKas: number[]
  /** CAS or short identifier for reference */
  ref?: string
}

export type MetalLigandEntry = {
  metalId: string
  ligandId: string
  /**
   * Stepwise log Kₙ values:  [log K₁, log K₂, …]
   * For polydentate ligands with only one complexation step, length = 1.
   * Missing/unavailable entries are omitted (shorter array).
   */
  logKn: number[]
  /**
   * Overall cumulative log βₙ = Σ logKᵢ for n = 1…N
   * Derived automatically but stored for UI and cross-checks.
   */
  logBeta: number[]
  /** Additional notes (coordination number, color of complex, etc.) */
  notes?: { es: string; en: string }
}

// ────────────────────────────────────────────────────────────────────────────
// METALS  (20 entries)
// ────────────────────────────────────────────────────────────────────────────

export const METALS: MetalRecord[] = [
  {
    id: "ag",  symbol: "Ag⁺",  charge: 1,
    label: { es: "Ag⁺ – Plata",          en: "Ag⁺ – Silver"       },
    logAlphaM: [[0,0],[6,0],[8,0],[10,0.1],[12,1.0]],
    color: "#94a3b8",
  },
  {
    id: "ca",  symbol: "Ca²⁺", charge: 2,
    label: { es: "Ca²⁺ – Calcio",         en: "Ca²⁺ – Calcium"     },
    logAlphaM: [[0,0],[4,0],[6,0],[8,0],[10,0],[12,0.5]],
    color: "#f0abfc",
  },
  {
    id: "cd",  symbol: "Cd²⁺", charge: 2,
    label: { es: "Cd²⁺ – Cadmio",         en: "Cd²⁺ – Cadmium"     },
    logAlphaM: [[0,0],[4,0],[6,0],[8,0.1],[10,2.0],[12,5.7]],
    color: "#a3e635",
  },
  {
    id: "co2", symbol: "Co²⁺", charge: 2,
    label: { es: "Co²⁺ – Cobalto II",      en: "Co²⁺ – Cobalt II"   },
    logAlphaM: [[0,0],[4,0],[6,0],[8,0],[10,1.0],[12,4.5]],
    color: "#fb7185",
  },
  {
    id: "co3", symbol: "Co³⁺", charge: 3,
    label: { es: "Co³⁺ – Cobalto III",     en: "Co³⁺ – Cobalt III"  },
    logAlphaM: [[0,0],[4,0.5],[6,3.5],[8,7.5],[10,11.5],[12,15.5]],
    color: "#f97316",
  },
  {
    id: "cr3", symbol: "Cr³⁺", charge: 3,
    label: { es: "Cr³⁺ – Cromo III",       en: "Cr³⁺ – Chromium III"},
    logAlphaM: [[0,0],[4,0],[6,1.5],[8,4.5],[10,8.0],[12,13.0]],
    color: "#34d399",
  },
  {
    id: "cu",  symbol: "Cu²⁺", charge: 2,
    label: { es: "Cu²⁺ – Cobre",           en: "Cu²⁺ – Copper"      },
    logAlphaM: [[0,0],[4,0],[6,0],[8,2.0],[10,6.2],[12,12.2]],
    color: "#f59e0b",
  },
  {
    id: "fe2", symbol: "Fe²⁺", charge: 2,
    label: { es: "Fe²⁺ – Hierro II",       en: "Fe²⁺ – Iron II"     },
    logAlphaM: [[0,0],[4,0],[6,0],[8,0.2],[10,1.8],[12,5.7]],
    color: "#78716c",
  },
  {
    id: "fe3", symbol: "Fe³⁺", charge: 3,
    label: { es: "Fe³⁺ – Hierro III",      en: "Fe³⁺ – Iron III"    },
    logAlphaM: [[0,0],[2,0],[4,0.4],[6,4.4],[8,8.4],[10,12.4],[12,16.4]],
    color: "#dc2626",
  },
  {
    id: "hg",  symbol: "Hg²⁺", charge: 2,
    label: { es: "Hg²⁺ – Mercurio",        en: "Hg²⁺ – Mercury"     },
    logAlphaM: [[0,0],[4,0],[6,0.5],[8,2.5],[10,5.5],[12,9.5]],
    color: "#e2e8f0",
  },
  {
    id: "mg",  symbol: "Mg²⁺", charge: 2,
    label: { es: "Mg²⁺ – Magnesio",        en: "Mg²⁺ – Magnesium"   },
    logAlphaM: [[0,0],[4,0],[6,0],[8,0],[10,0.5],[12,3.4]],
    color: "#67e8f9",
  },
  {
    id: "mn",  symbol: "Mn²⁺", charge: 2,
    label: { es: "Mn²⁺ – Manganeso",       en: "Mn²⁺ – Manganese"   },
    logAlphaM: [[0,0],[4,0],[6,0],[8,0.2],[10,1.7],[12,5.4]],
    color: "#c084fc",
  },
  {
    id: "ni",  symbol: "Ni²⁺", charge: 2,
    label: { es: "Ni²⁺ – Níquel",          en: "Ni²⁺ – Nickel"      },
    logAlphaM: [[0,0],[4,0],[6,0],[8,0],[10,1.0],[12,5.0]],
    color: "#4ade80",
  },
  {
    id: "pb",  symbol: "Pb²⁺", charge: 2,
    label: { es: "Pb²⁺ – Plomo",           en: "Pb²⁺ – Lead"        },
    logAlphaM: [[0,0],[4,0],[6,0.1],[8,1.2],[10,3.8],[12,7.8]],
    color: "#94a3b8",
  },
  {
    id: "pd",  symbol: "Pd²⁺", charge: 2,
    label: { es: "Pd²⁺ – Paladio",         en: "Pd²⁺ – Palladium"   },
    logAlphaM: [[0,0],[4,0],[6,0.5],[8,3.0],[10,7.0],[12,11.0]],
    color: "#fde68a",
  },
  {
    id: "pt",  symbol: "Pt²⁺", charge: 2,
    label: { es: "Pt²⁺ – Platino",         en: "Pt²⁺ – Platinum"    },
    logAlphaM: [[0,0],[4,0],[6,0.5],[8,3.0],[10,7.0],[12,12.0]],
    color: "#e2e8f0",
  },
  {
    id: "sr",  symbol: "Sr²⁺", charge: 2,
    label: { es: "Sr²⁺ – Estroncio",       en: "Sr²⁺ – Strontium"   },
    logAlphaM: [[0,0],[4,0],[8,0],[12,0.2]],
    color: "#fca5a5",
  },
  {
    id: "tl",  symbol: "Tl³⁺", charge: 3,
    label: { es: "Tl³⁺ – Talio III",       en: "Tl³⁺ – Thallium III"},
    logAlphaM: [[0,0],[4,0.5],[6,2.5],[8,5.0],[10,8.5],[12,12.0]],
    color: "#818cf8",
  },
  {
    id: "zn",  symbol: "Zn²⁺", charge: 2,
    label: { es: "Zn²⁺ – Zinc",            en: "Zn²⁺ – Zinc"        },
    logAlphaM: [[0,0],[4,0],[6,0],[8,0.2],[10,2.4],[12,8.5]],
    color: "#38bdf8",
  },
  {
    id: "al",  symbol: "Al³⁺", charge: 3,
    label: { es: "Al³⁺ – Aluminio",        en: "Al³⁺ – Aluminum"    },
    logAlphaM: [[0,0],[2,0.4],[4,0.4],[6,2.4],[8,6.4],[10,10.4],[12,14.4]],
    color: "#fbbf24",
  },
]

// ────────────────────────────────────────────────────────────────────────────
// LIGANDS  (50 entries)
// ────────────────────────────────────────────────────────────────────────────

export const LIGANDS: LigandRecord[] = [
  // ── Monodentate ──────────────────────────────────────────────────────────
  {
    id: "nh3", abbreviation: "NH₃", formula: "NH₃",
    label: { es: "Amoniaco",                en: "Ammonia"              },
    denticity: 1, chargeDeprotonated: 0,
    pKas: [9.25],
  },
  {
    id: "cl",  abbreviation: "Cl⁻", formula: "Cl⁻",
    label: { es: "Cloruro",                 en: "Chloride"             },
    denticity: 1, chargeDeprotonated: -1,
    pKas: [-7],
  },
  {
    id: "br",  abbreviation: "Br⁻", formula: "Br⁻",
    label: { es: "Bromuro",                 en: "Bromide"              },
    denticity: 1, chargeDeprotonated: -1,
    pKas: [-9],
  },
  {
    id: "i",   abbreviation: "I⁻",  formula: "I⁻",
    label: { es: "Yoduro",                  en: "Iodide"               },
    denticity: 1, chargeDeprotonated: -1,
    pKas: [-10],
  },
  {
    id: "cn",  abbreviation: "CN⁻", formula: "CN⁻",
    label: { es: "Cianuro",                 en: "Cyanide"              },
    denticity: 1, chargeDeprotonated: -1,
    pKas: [9.21],
  },
  {
    id: "scn", abbreviation: "SCN⁻", formula: "SCN⁻",
    label: { es: "Tiocianato",              en: "Thiocyanate"          },
    denticity: 1, chargeDeprotonated: -1,
    pKas: [-1.8],
  },
  {
    id: "f",   abbreviation: "F⁻",  formula: "F⁻",
    label: { es: "Fluoruro",                en: "Fluoride"             },
    denticity: 1, chargeDeprotonated: -1,
    pKas: [3.17],
  },
  {
    id: "oh",  abbreviation: "OH⁻", formula: "OH⁻",
    label: { es: "Hidróxido",               en: "Hydroxide"            },
    denticity: 1, chargeDeprotonated: -1,
    pKas: [15.74],
  },
  {
    id: "ac",  abbreviation: "Ac⁻", formula: "CH₃COO⁻",
    label: { es: "Acetato",                 en: "Acetate"              },
    denticity: 1, chargeDeprotonated: -1,
    pKas: [4.75],
  },
  {
    id: "ox",  abbreviation: "ox²⁻", formula: "C₂O₄²⁻",
    label: { es: "Oxalato",                 en: "Oxalate"              },
    denticity: 2, chargeDeprotonated: -2,
    pKas: [1.25, 4.27], ref: "bidentate O,O",
  },
  {
    id: "py",  abbreviation: "py",   formula: "C₅H₅N",
    label: { es: "Piridina",                en: "Pyridine"             },
    denticity: 1, chargeDeprotonated: 0,
    pKas: [5.25],
  },
  {
    id: "thio", abbreviation: "tu",  formula: "(NH₂)₂CS",
    label: { es: "Tiourea",                 en: "Thiourea"             },
    denticity: 1, chargeDeprotonated: 0,
    pKas: [-1.4],
  },
  // ── Bidentate ─────────────────────────────────────────────────────────────
  {
    id: "en",  abbreviation: "en",   formula: "H₂NCH₂CH₂NH₂",
    label: { es: "Etilendiamina",           en: "Ethylenediamine"      },
    denticity: 2, chargeDeprotonated: 0,
    pKas: [9.93, 6.85], ref: "N,N bidentate",
  },
  {
    id: "bipy", abbreviation: "bpy", formula: "C₁₀H₈N₂",
    label: { es: "2,2′-Bipiridilo",         en: "2,2′-Bipyridyl"       },
    denticity: 2, chargeDeprotonated: 0,
    pKas: [4.35], ref: "N,N chelate",
  },
  {
    id: "phen", abbreviation: "phen", formula: "C₁₂H₈N₂",
    label: { es: "1,10-Fenantrolina",       en: "1,10-Phenanthroline"  },
    denticity: 2, chargeDeprotonated: 0,
    pKas: [4.96], ref: "N,N chelate",
  },
  {
    id: "gly",  abbreviation: "gly⁻", formula: "H₂NCH₂COO⁻",
    label: { es: "Glicinato",               en: "Glycinate"            },
    denticity: 2, chargeDeprotonated: -1,
    pKas: [9.78, 2.35], ref: "N,O chelate",
  },
  {
    id: "ala",  abbreviation: "ala⁻", formula: "CH₃CH(NH₂)COO⁻",
    label: { es: "Alaninato",               en: "Alaninate"            },
    denticity: 2, chargeDeprotonated: -1,
    pKas: [9.87, 2.34], ref: "N,O chelate",
  },
  {
    id: "acac", abbreviation: "acac⁻", formula: "CH₃COCHCOCH₃⁻",
    label: { es: "Acetilacetonato",         en: "Acetylacetonate"      },
    denticity: 2, chargeDeprotonated: -1,
    pKas: [8.90], ref: "O,O chelate (enolate)",
  },
  {
    id: "dmg",  abbreviation: "dmgH", formula: "(CH₃C(=NOH))₂",
    label: { es: "Dimetilglioxima",         en: "Dimethylglyoxime"     },
    denticity: 2, chargeDeprotonated: -1,
    pKas: [10.60, 12.00], ref: "N,N chelate",
  },
  {
    id: "sal",  abbreviation: "sal²⁻", formula: "HOC₆H₄COO²⁻",
    label: { es: "Salicilato",              en: "Salicylate"           },
    denticity: 2, chargeDeprotonated: -2,
    pKas: [13.74, 2.97],
  },
  {
    id: "nta_b", abbreviation: "aa diacetato", formula: "N-diacetato",
    label: { es: "Iminodiacetato (IDA)",    en: "Iminodiacetate (IDA)" },
    denticity: 2, chargeDeprotonated: -2,
    pKas: [9.12, 2.60],
  },
  // ── Tridentate ────────────────────────────────────────────────────────────
  {
    id: "dien", abbreviation: "dien", formula: "NH(CH₂CH₂NH₂)₂",
    label: { es: "Dietilentriamina",        en: "Diethylenetriamine"   },
    denticity: 3, chargeDeprotonated: 0,
    pKas: [9.84, 9.10, 4.42], ref: "N,N,N tridentate",
  },
  {
    id: "nta",  abbreviation: "NTA", formula: "N(CH₂COO)₃³⁻",
    label: { es: "Nitrilotriacetato (NTA)", en: "Nitrilotriacetate (NTA)"},
    denticity: 4, chargeDeprotonated: -3,
    pKas: [9.73, 2.94, 2.49, 1.89], ref: "N,3×O tetradentate",
  },
  // ── Tetradentate ──────────────────────────────────────────────────────────
  {
    id: "trien", abbreviation: "trien", formula: "NH₂(CH₂)₂NH(CH₂)₂NH(CH₂)₂NH₂",
    label: { es: "Trietilentetramina",      en: "Triethylenetetramine" },
    denticity: 4, chargeDeprotonated: 0,
    pKas: [9.74, 9.20, 6.67, 3.32], ref: "N,N,N,N tetradentate",
  },
  {
    id: "edda", abbreviation: "EDDA", formula: "C₆H₁₂N₂O₄",
    label: { es: "Etilendiamino-N,N′-diacetato", en: "Ethylenediamine-N,N′-diacetate"},
    denticity: 4, chargeDeprotonated: -2,
    pKas: [9.45, 6.86, 2.68, 1.99],
  },
  // ── Pentadentate / Hexadentate ────────────────────────────────────────────
  {
    id: "edta", abbreviation: "EDTA", formula: "C₁₀H₁₆N₂O₈",
    label: { es: "EDTA (etilendiaminotetraacetato)", en: "EDTA (ethylenediaminetetraacetate)"},
    denticity: 6, chargeDeprotonated: -4,
    pKas: [10.26, 6.16, 2.67, 2.00, 1.50, 0.00],
    ref: "Harris App. I; hexadentate N,N,4×O",
  },
  {
    id: "hedta", abbreviation: "HEDTA", formula: "C₁₀H₁₇N₂O₇",
    label: { es: "HEDTA (hidroxietil-EDTA)",  en: "HEDTA (hydroxyethyl-EDTA)"},
    denticity: 5, chargeDeprotonated: -3,
    pKas: [9.85, 5.41, 2.53, 1.98],
  },
  {
    id: "dtpa", abbreviation: "DTPA", formula: "C₁₄H₂₃N₃O₁₀",
    label: { es: "DTPA (dietilentriaminopentaacetato)", en: "DTPA (diethylenetriaminepentaacetate)"},
    denticity: 8, chargeDeprotonated: -5,
    pKas: [10.47, 8.60, 4.28, 2.64, 2.00],
    ref: "octadentate N,N,N,5×O",
  },
  {
    id: "egta", abbreviation: "EGTA", formula: "C₁₄H₂₄N₂O₁₀",
    label: { es: "EGTA (bis-aminoetilglicol-EDTA)",  en: "EGTA (bis-aminoethylglycol-EDTA)"},
    denticity: 6, chargeDeprotonated: -4,
    pKas: [9.47, 8.85, 2.67, 2.00],
    ref: "Ca-selective EDTA analogue",
  },
  {
    id: "cdta", abbreviation: "CyDTA", formula: "C₁₄H₂₂N₂O₈",
    label: { es: "CyDTA (ciclohexano-EDTA)",         en: "CyDTA (cyclohexyl-EDTA)"},
    denticity: 6, chargeDeprotonated: -4,
    pKas: [12.0, 6.14, 3.53, 2.42],
  },
  // ── More monodentate / important ligands ─────────────────────────────────
  {
    id: "so4",  abbreviation: "SO₄²⁻", formula: "SO₄²⁻",
    label: { es: "Sulfato",                 en: "Sulfate"              },
    denticity: 1, chargeDeprotonated: -2,
    pKas: [1.99],
  },
  {
    id: "no3",  abbreviation: "NO₃⁻",  formula: "NO₃⁻",
    label: { es: "Nitrato",                 en: "Nitrate"              },
    denticity: 1, chargeDeprotonated: -1,
    pKas: [-1.4],
  },
  {
    id: "po4",  abbreviation: "PO₄³⁻", formula: "HPO₄²⁻",
    label: { es: "Fosfato",                 en: "Phosphate"            },
    denticity: 1, chargeDeprotonated: -3,
    pKas: [12.36, 7.21, 2.15],
  },
  {
    id: "co3",  abbreviation: "CO₃²⁻", formula: "CO₃²⁻",
    label: { es: "Carbonato",               en: "Carbonate"            },
    denticity: 1, chargeDeprotonated: -2,
    pKas: [10.33, 6.35],
  },
  {
    id: "cit",  abbreviation: "cit³⁻", formula: "C₆H₅O₇³⁻",
    label: { es: "Citrato",                 en: "Citrate"              },
    denticity: 3, chargeDeprotonated: -3,
    pKas: [6.40, 4.76, 3.13],
  },
  {
    id: "tart", abbreviation: "tart²⁻", formula: "C₄H₄O₆²⁻",
    label: { es: "Tartrato",                en: "Tartrate"             },
    denticity: 2, chargeDeprotonated: -2,
    pKas: [4.34, 2.98],
  },
  {
    id: "mal",  abbreviation: "mal²⁻", formula: "C₃H₂O₄²⁻",
    label: { es: "Malonato",                en: "Malonate"             },
    denticity: 2, chargeDeprotonated: -2,
    pKas: [5.70, 2.85],
  },
  {
    id: "suc",  abbreviation: "suc²⁻", formula: "C₄H₄O₄²⁻",
    label: { es: "Succinato",               en: "Succinate"            },
    denticity: 2, chargeDeprotonated: -2,
    pKas: [5.64, 4.21],
  },
  {
    id: "his",  abbreviation: "his⁻",  formula: "C₆H₇N₃O₂⁻",
    label: { es: "Histidinato",             en: "Histidinate"          },
    denticity: 2, chargeDeprotonated: -1,
    pKas: [9.07, 6.00, 1.82],
  },
  {
    id: "trp",  abbreviation: "trp⁻",  formula: "C₁₁H₁₁N₂O₂⁻",
    label: { es: "Triptofanato",            en: "Tryptophanate"        },
    denticity: 2, chargeDeprotonated: -1,
    pKas: [9.39, 2.46],
  },
  {
    id: "cys",  abbreviation: "cys²⁻", formula: "HSCH₂CH(NH₂)COO²⁻",
    label: { es: "Cisteinato",              en: "Cysteinate"           },
    denticity: 3, chargeDeprotonated: -2,
    pKas: [10.28, 8.15, 1.96], ref: "S,N,O tridentate",
  },
  {
    id: "hida", abbreviation: "HIDA",  formula: "C₆H₁₂NO₅³⁻",
    label: { es: "Ácido iminodiacético-N-(2-hidroxietil) – HEIDA", en: "HEIDA (hydroxyethyl-iminodiacetate)"},
    denticity: 3, chargeDeprotonated: -3,
    pKas: [8.73, 5.14, 2.51],
  },
  {
    id: "terpy", abbreviation: "terpy", formula: "C₁₅H₁₁N₃",
    label: { es: "2,2′:6′,2″-Terpiridilo",  en: "2,2′:6′,2″-Terpyridyl"},
    denticity: 3, chargeDeprotonated: 0,
    pKas: [4.70], ref: "N,N,N tridentate",
  },
  {
    id: "cyclam", abbreviation: "cyclam", formula: "C₈H₂₀N₄",
    label: { es: "Ciclam (1,4,8,11-tetraazaciclotetradecano)", en: "Cyclam (1,4,8,11-tetraazacyclotetradecane)"},
    denticity: 4, chargeDeprotonated: 0,
    pKas: [11.37, 10.66, 1.61, 0.93],
  },
  {
    id: "cyclen", abbreviation: "cyclen", formula: "C₈H₂₀N₄",
    label: { es: "Ciclen (1,4,7,10-TACN tipo)",  en: "Cyclen (1,4,7,10-TACN type)"},
    denticity: 4, chargeDeprotonated: 0,
    pKas: [11.10, 9.98, 1.52, 0.90],
  },
  {
    id: "tacn", abbreviation: "TACN",  formula: "C₆H₁₅N₃",
    label: { es: "1,4,7-Triazaciclononano (TACN)", en: "1,4,7-Triazacyclononane (TACN)"},
    denticity: 3, chargeDeprotonated: 0,
    pKas: [9.74, 6.80, 2.72],
  },
  {
    id: "deta", abbreviation: "DETA",  formula: "NH₂CH₂CH₂NHCH₂CH₂NH₂",
    label: { es: "Dietilentriamina",        en: "Diethylenetriamine"   },
    denticity: 3, chargeDeprotonated: 0,
    pKas: [9.84, 9.10, 4.42],
  },
  {
    id: "murex", abbreviation: "MX",   formula: "C₈H₆N₄O₅²⁻",
    label: { es: "Murexida",               en: "Murexide"             },
    denticity: 2, chargeDeprotonated: -2,
    pKas: [9.20, 1.42],
    ref: "metallochromic indicator",
  },
  {
    id: "eriochrome", abbreviation: "EBT", formula: "C₂₀H₁₂N₃O₇S⁻",
    label: { es: "Eriocromo negro T (EBT)", en: "Eriochrome black T (EBT)"},
    denticity: 2, chargeDeprotonated: -3,
    pKas: [11.55, 6.30], ref: "metallochromic indicator",
  },
  {
    id: "dipic", abbreviation: "dipic²⁻", formula: "C₇H₃NO₄²⁻",
    label: { es: "Dipicolinato (2,6-piridindikarboksil)",  en: "Dipicolinate (pyridine-2,6-dicarboxylate)"},
    denticity: 3, chargeDeprotonated: -2,
    pKas: [4.93, 2.16], ref: "N,O,O tridentate",
  },
]

// ────────────────────────────────────────────────────────────────────────────
// COMPLEXATION DATA  (metal × ligand)
// logKn: [log K₁, log K₂, ...log Kₙ]
// logBeta derived: logBeta[i] = sum of logKn[0..i]
// ────────────────────────────────────────────────────────────────────────────

function makeBeta(logKn: number[]): number[] {
  const beta: number[] = []
  let sum = 0
  for (const k of logKn) { sum += k; beta.push(+sum.toFixed(2)) }
  return beta
}

function entry(
  metalId: string,
  ligandId: string,
  logKn: number[],
  notes?: { es: string; en: string },
): MetalLigandEntry {
  return { metalId, ligandId, logKn, logBeta: makeBeta(logKn), notes }
}

export const COMPLEXATION_DATA: MetalLigandEntry[] = [
  // ── NH₃ (Ammonia) ──────────────────────────────────────────────────────
  entry("ag",  "nh3", [3.32, 3.92],
    { es: "Complejo lineal [Ag(NH₃)₂]⁺, reactivo de Tollens",   en: "Linear [Ag(NH₃)₂]⁺, Tollens' reagent" }),
  entry("cu",  "nh3", [4.31, 3.67, 3.04, 2.30],
    { es: "Color azul intenso", en: "Deep blue complex" }),
  entry("zn",  "nh3", [2.21, 2.29, 2.36, 2.03]),
  entry("ni",  "nh3", [2.80, 2.24, 1.73, 1.19, 0.75, 0.03]),
  entry("cd",  "nh3", [2.55, 2.01, 1.34, 0.84]),
  entry("co2", "nh3", [2.11, 1.63, 1.05, 0.76, 0.18, -0.62]),
  entry("hg",  "nh3", [8.8, 8.8, 1.0, 0.78]),
  entry("mn",  "nh3", [1.00, 0.76]),
  entry("mg",  "nh3", [0.23]),
  entry("ag",  "cl",  [3.04, 2.00, 0.40, 2.00],
    { es: "AgCl₂⁻ soluble en exceso: ojo con Cl⁻ en exceso en gravimetría", en: "AgCl₂⁻ soluble in excess Cl⁻" }),
  // ── Cl⁻ (Chloride) ─────────────────────────────────────────────────────
  entry("hg",  "cl",  [6.74, 6.48, 0.85, 1.00],
    { es: "HgCl₄²⁻ muy estable", en: "Very stable HgCl₄²⁻" }),
  entry("pb",  "cl",  [1.62, 0.72, -0.22]),
  entry("fe3", "cl",  [1.48, 0.65]),
  entry("cu",  "cl",  [0.40, 0.60, -0.23]),
  entry("cd",  "cl",  [1.98, 0.60, 0.09, 0.03]),
  entry("zn",  "cl",  [0.43, 0.61, 0.53, 0.20]),
  // ── CN⁻ (Cyanide) ──────────────────────────────────────────────────────
  entry("ag",  "cn",  [8.80, 5.20],
    { es: "[Ag(CN)₂]⁻ muy estable", en: "Very stable [Ag(CN)₂]⁻" }),
  entry("hg",  "cn",  [17.0, 16.7, 3.83, 2.98],
    { es: "[Hg(CN)₄]²⁻ uno de los complejos más estables", en: "Among most stable known complexes" }),
  entry("cu",  "cn",  [16.0, 5.30, 1.80, 0.60],
    { es: "Cu⁺ forma [Cu(CN)₄]³⁻", en: "Cu⁺ forms [Cu(CN)₄]³⁻" }),
  entry("zn",  "cn",  [5.30, 4.98, 4.70, 4.10]),
  entry("ni",  "cn",  [7.10, 6.84, 6.04, 5.12],
    { es: "[Ni(CN)₄]²⁻ espindle", en: "Square planar [Ni(CN)₄]²⁻" }),
  entry("fe2", "cn",  [3.5, 3.5, 3.5, 3.5, 3.5, 3.5],
    { es: "Ferrocianuro [Fe(CN)₆]⁴⁻", en: "Ferrocyanide [Fe(CN)₆]⁴⁻" }),
  entry("fe3", "cn",  [4.0, 4.0, 4.0, 4.0, 4.0, 4.0],
    { es: "Ferricianuro [Fe(CN)₆]³⁻", en: "Ferricyanide [Fe(CN)₆]³⁻" }),
  entry("co3", "cn",  [7.0, 7.0, 7.0, 7.0, 7.0, 7.0],
    { es: "[Co(CN)₆]³⁻ muy estable", en: "Very stable [Co(CN)₆]³⁻" }),
  // ── F⁻ (Fluoride) ──────────────────────────────────────────────────────
  entry("al",  "f",   [6.11, 5.01, 3.88, 2.74, 1.70, 0.54]),
  entry("fe3", "f",   [5.18, 3.95, 2.58]),
  entry("mg",  "f",   [1.82]),
  // ── SCN⁻ (Thiocyanate) ─────────────────────────────────────────────────
  entry("fe3", "scn", [3.03, 2.30, 1.30]),
  entry("co2", "scn", [1.72, 0.57]),
  entry("ni",  "scn", [1.18]),
  entry("hg",  "scn", [9.08, 8.70, 2.14, 1.44]),
  // ── Oxalate ────────────────────────────────────────────────────────────
  entry("fe3", "ox",  [9.40, 6.70, 4.10]),
  entry("al",  "ox",  [7.26, 5.72, 4.60]),
  entry("cu",  "ox",  [6.23, 4.04]),
  entry("ni",  "ox",  [5.16, 3.39]),
  entry("fe2", "ox",  [4.52, 3.05]),
  entry("cd",  "ox",  [3.89, 2.65]),
  entry("pb",  "ox",  [4.91, 3.49]),
  entry("zn",  "ox",  [4.87, 3.62]),
  entry("mn",  "ox",  [3.82, 2.49]),
  // ── Ethylenediamine (en) ───────────────────────────────────────────────
  entry("cu",  "en",  [10.72, 9.31],
    { es: "[Cu(en)₂]²⁺ color azul índigo", en: "[Cu(en)₂]²⁺ indigo blue" }),
  entry("ni",  "en",  [7.52, 6.32, 4.49]),
  entry("zn",  "en",  [5.92, 5.15, 1.70]),
  entry("cd",  "en",  [5.47, 4.55, 2.61]),
  entry("co2", "en",  [5.93, 4.83, 3.10]),
  entry("hg",  "en",  [14.3, 9.0]),
  entry("mn",  "en",  [2.73, 2.06, 0.88]),
  entry("fe2", "en",  [4.34, 3.31]),
  // ── 2,2'-Bipyridyl (bpy) ───────────────────────────────────────────────
  entry("fe2", "bipy", [4.20, 3.70, 9.00],
    { es: "[Fe(bpy)₃]²⁺ tris(bipiridilo) rojo brillante", en: "[Fe(bpy)₃]²⁺ brilliant red" }),
  entry("cu",  "bipy", [8.00, 5.60]),
  entry("ni",  "bipy", [7.04, 6.87, 6.04]),
  entry("zn",  "bipy", [5.20, 4.91, 4.10]),
  entry("co2", "bipy", [5.80, 5.40, 4.90]),
  // ── 1,10-Phenanthroline (phen) ─────────────────────────────────────────
  entry("fe2", "phen", [5.85, 5.09, 10.08],
    { es: "[Fe(phen)₃]²⁺ ferroin (indicador redox)", en: "[Fe(phen)₃]²⁺ ferroin, redox indicator" }),
  entry("cu",  "phen", [9.11, 6.51]),
  entry("ni",  "phen", [8.60, 7.90, 6.70]),
  entry("zn",  "phen", [6.55, 5.91, 5.24]),
  entry("co2", "phen", [7.25, 6.72, 6.25]),
  entry("fe3", "phen", [6.50, 5.48, 5.78]),
  // ── Glycinate (gly) ────────────────────────────────────────────────────
  entry("cu",  "gly",  [8.22, 6.98],
    { es: "[Cu(gly)₂] bis-quelato azul", en: "[Cu(gly)₂] blue bis-chelate" }),
  entry("ni",  "gly",  [6.18, 5.11, 3.76]),
  entry("zn",  "gly",  [5.52, 4.73]),
  entry("co2", "gly",  [4.67, 3.54]),
  entry("fe3", "gly",  [10.0, 7.60]),
  entry("cd",  "gly",  [4.58, 3.90]),
  entry("mn",  "gly",  [3.22, 2.28]),
  entry("pb",  "gly",  [5.47, 3.64]),
  // ── Acetylacetonate (acac) ─────────────────────────────────────────────
  entry("cu",  "acac", [8.30, 7.00]),
  entry("ni",  "acac", [6.54, 5.09]),
  entry("fe3", "acac", [11.4, 10.3, 8.06],
    { es: "Fe(acac)₃ altamente estable (quelato simétrico)", en: "Highly stable symmetric β-diketonate" }),
  entry("cr3", "acac", [11.1, 10.2, 9.7],
    { es: "Cr(acac)₃ cinéticamente inerte", en: "Kinetically inert Cr(acac)₃" }),
  entry("al",  "acac", [8.60, 7.80, 6.80]),
  entry("co3", "acac", [11.0, 10.5, 9.8]),
  // ── NTA (Nitrilotriacetate) ────────────────────────────────────────────
  entry("cu",  "nta",  [12.94]),
  entry("ni",  "nta",  [11.54]),
  entry("zn",  "nta",  [10.67]),
  entry("cd",  "nta",  [9.83]),
  entry("co2", "nta",  [10.38]),
  entry("fe3", "nta",  [15.87]),
  entry("fe2", "nta",  [8.33]),
  entry("mn",  "nta",  [7.44]),
  entry("ca",  "nta",  [6.41]),
  entry("mg",  "nta",  [5.47]),
  entry("pb",  "nta",  [11.37]),
  // ── EDTA ──────────────────────────────────────────────────────────────
  entry("mg",  "edta", [8.79],   { es: "Ref: Harris App. I", en: "Ref: Harris App. I" }),
  entry("ca",  "edta", [10.69]),
  entry("sr",  "edta", [8.63]),
  entry("mn",  "edta", [13.87]),
  entry("fe2", "edta", [14.33]),
  entry("co2", "edta", [16.31]),
  entry("ni",  "edta", [18.62]),
  entry("cu",  "edta", [18.80]),
  entry("zn",  "edta", [16.50]),
  entry("cd",  "edta", [16.46]),
  entry("pb",  "edta", [18.04]),
  entry("hg",  "edta", [21.80]),
  entry("al",  "edta", [16.13]),
  entry("fe3", "edta", [25.10]),
  entry("cr3", "edta", [23.40]),
  entry("co3", "edta", [36.00],  { es: "Cinéticamente inerte", en: "Kinetically inert" }),
  entry("tl",  "edta", [22.50]),
  entry("pd",  "edta", [18.50]),
  // ── DTPA ──────────────────────────────────────────────────────────────
  entry("ca",  "dtpa", [10.75]),
  entry("mg",  "dtpa", [9.03]),
  entry("fe3", "dtpa", [28.00]),
  entry("cu",  "dtpa", [21.55]),
  entry("zn",  "dtpa", [18.75]),
  entry("ni",  "dtpa", [20.32]),
  entry("co2", "dtpa", [19.48]),
  entry("cd",  "dtpa", [19.00]),
  entry("pb",  "dtpa", [18.80]),
  entry("mn",  "dtpa", [15.60]),
  entry("hg",  "dtpa", [26.70]),
  // ── EGTA ──────────────────────────────────────────────────────────────
  entry("ca",  "egta", [11.00],  { es: "Selectivo para Ca²⁺ frente a Mg²⁺", en: "Ca²⁺-selective vs Mg²⁺" }),
  entry("mg",  "egta", [5.21]),
  entry("zn",  "egta", [12.60]),
  entry("cu",  "egta", [17.71]),
  entry("ni",  "egta", [13.54]),
  entry("fe3", "egta", [20.50]),
  // ── Citrate ───────────────────────────────────────────────────────────
  entry("fe3", "cit",  [11.50]),
  entry("al",  "cit",  [7.98]),
  entry("cu",  "cit",  [5.90]),
  entry("ni",  "cit",  [5.11]),
  entry("zn",  "cit",  [4.98]),
  entry("ca",  "cit",  [3.48]),
  entry("mg",  "cit",  [3.37]),
  entry("fe2", "cit",  [4.40]),
  // ── Dithizone (dmg = dimethylglyoxime) ────────────────────────────────
  entry("ni",  "dmg",  [11.16, 9.16],
    { es: "Ni(dmgH)₂ precipitado rojo, base de la determinación gravimétrica", en: "Classic gravimetric Ni reagent" }),
  entry("pd",  "dmg",  [28.0, 4.0]),
  entry("cu",  "dmg",  [16.0]),
  // ── Salicylate ────────────────────────────────────────────────────────
  entry("fe3", "sal",  [9.58, 7.40, 5.20],
    { es: "Color violeta", en: "Violet color" }),
  entry("al",  "sal",  [8.50, 7.20]),
  entry("cu",  "sal",  [7.50, 6.00]),
  entry("zn",  "sal",  [5.30, 4.60]),
  // ── Oxalate / more metals ─────────────────────────────────────────────
  entry("cr3", "ox",   [7.49, 6.01, 4.60]),
  entry("co3", "ox",   [9.73, 7.27, 5.20]),
  entry("mg",  "ox",   [3.43, 1.79]),
  entry("ca",  "ox",   [3.00, 1.50]),
  // ── Pyridine ──────────────────────────────────────────────────────────
  entry("cu",  "py",   [2.59, 1.98, 1.58, 0.79]),
  entry("zn",  "py",   [1.00, 0.72]),
  entry("ni",  "py",   [1.81, 1.40, 0.90, 0.57, 0.14, -0.33]),
  entry("co2", "py",   [1.56, 1.04, 0.64]),
  entry("ag",  "py",   [2.00, 1.48]),
  entry("cd",  "py",   [1.40, 1.07, 0.71, 0.42]),
  // ── Terpyridyl ───────────────────────────────────────────────────────
  entry("fe2", "terpy", [7.25, 7.10],
    { es: "[Fe(terpy)₂]²⁺ bis-quelato octo-coordenado", en: "[Fe(terpy)₂]²⁺ bis-chelate" }),
  entry("cu",  "terpy", [5.65]),
  entry("zn",  "terpy", [5.52]),
  entry("ni",  "terpy", [7.11, 6.40]),
  entry("co2", "terpy", [6.30, 5.70]),
  // ── Dipicolinate ─────────────────────────────────────────────────────
  entry("fe3", "dipic", [12.08, 9.35, 6.74]),
  entry("cr3", "dipic", [10.50, 8.30, 6.40]),
  entry("al",  "dipic", [8.20, 6.90]),
  entry("cu",  "dipic", [9.01, 7.30]),
  entry("zn",  "dipic", [6.52, 5.30]),
  entry("ni",  "dipic", [8.84, 7.50, 5.70]),
  // ── Hydroxide (OH⁻) ──────────────────────────────────────────────────
  entry("al",  "oh",   [8.9, 7.2, 5.8, 5.0],
    { es: "[Al(OH)₄]⁻ tetraédrico en álcali", en: "[Al(OH)₄]⁻ tetrahedral in alkali" }),
  entry("zn",  "oh",   [4.4, 3.4, 2.6, 2.4],
    { es: "[Zn(OH)₄]²⁻ en solución muy básica", en: "[Zn(OH)₄]²⁻ in strongly basic solution" }),
  entry("fe3", "oh",   [11.81, 10.70, 9.50, 8.00]),
  entry("cr3", "oh",   [9.50, 8.00, 6.40]),
  entry("pb",  "oh",   [6.27, 4.73, 3.50]),
  entry("cu",  "oh",   [6.30, 4.57]),
  // ── Acetate ──────────────────────────────────────────────────────────
  entry("fe3", "ac",   [3.38, 2.28]),
  entry("cu",  "ac",   [2.23, 1.11]),
  entry("zn",  "ac",   [1.57, 0.80]),
  entry("cd",  "ac",   [1.93, 1.23, 0.58]),
  entry("pb",  "ac",   [2.52, 1.44]),
  entry("mg",  "ac",   [0.51]),
  entry("ca",  "ac",   [0.53]),
  // ── Sulfate ──────────────────────────────────────────────────────────
  entry("fe3", "so4",  [4.04, 2.98]),
  entry("fe2", "so4",  [2.26]),
  entry("al",  "so4",  [3.89, 2.29]),
  entry("cu",  "so4",  [2.36]),
  entry("zn",  "so4",  [2.37]),
  entry("cd",  "so4",  [2.29]),
  entry("pb",  "so4",  [2.75]),
  // ── Tartrate ─────────────────────────────────────────────────────────
  entry("fe3", "tart", [7.49]),
  entry("cu",  "tart", [3.80]),
  entry("zn",  "tart", [2.68]),
  entry("ca",  "tart", [1.80]),
  entry("mg",  "tart", [1.36]),
  // ── Cysteine ─────────────────────────────────────────────────────────
  entry("cu",  "cys",  [11.80, 9.40]),
  entry("zn",  "cys",  [9.60, 8.40]),
  entry("cd",  "cys",  [9.20]),
  entry("hg",  "cys",  [14.50, 13.70]),
  entry("fe3", "cys",  [12.50]),
]

// ── Helper: linear interpolation of log αM(OH) table at a given pH ───────
export function interpLogAlphaM(table: [number, number][], pH: number): number {
  if (table.length === 0) return 0
  if (pH <= table[0][0]) return table[0][1]
  if (pH >= table[table.length - 1][0]) return table[table.length - 1][1]
  for (let i = 1; i < table.length; i++) {
    if (pH <= table[i][0]) {
      const [x0, y0] = table[i - 1]
      const [x1, y1] = table[i]
      return y0 + ((pH - x0) / (x1 - x0)) * (y1 - y0)
    }
  }
  return 0
}

// ── Helper: get all entries for a given ligand ────────────────────────────
export function getEntriesForLigand(ligandId: string): MetalLigandEntry[] {
  return COMPLEXATION_DATA.filter((e) => e.ligandId === ligandId)
}

// ── Helper: get entry for metal+ligand pair ───────────────────────────────
export function getEntry(metalId: string, ligandId: string): MetalLigandEntry | undefined {
  return COMPLEXATION_DATA.find((e) => e.metalId === metalId && e.ligandId === ligandId)
}

// ── Helper: ligands that have at least one entry ──────────────────────────
export function getAvailableLigands(): LigandRecord[] {
  const ids = new Set(COMPLEXATION_DATA.map((e) => e.ligandId))
  return LIGANDS.filter((l) => ids.has(l.id))
}

// ── Helper: metals available for a given ligand ───────────────────────────
export function getMetalsForLigand(ligandId: string): MetalRecord[] {
  const ids = new Set(
    COMPLEXATION_DATA.filter((e) => e.ligandId === ligandId).map((e) => e.metalId),
  )
  return METALS.filter((m) => ids.has(m.id))
}

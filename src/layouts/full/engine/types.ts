/**
 * Universal types for the chemistry platform engine.
 * Each type declares its assumptions, sources, and validity constraints.
 */

export type Locale = "es" | "en"
export type LocalizedText = Record<Locale, string>

// ── Phase 1: Source traceability ───────────────────────────────────────────

export type DataSource = {
  reference: string
  temperature_C: number
  ionicStrength_M: number | null
  unit: ConcentrationUnit
  validityNote: LocalizedText
  revisionDate: string          // ISO 8601
}

export type ConcentrationUnit = "mol/L" | "mmol/L" | "µmol/L" | "mg/L" | "ppm" | "%m/v"

export type ModelAssumption = {
  usesActivities: boolean
  assumesIdealSolution: boolean
  ignoresIonicStrength: boolean
  validPHRange: [number, number]
  validTempRange_C: [number, number]
  notes: LocalizedText
}

// ── Phase 2: Universal descriptors ─────────────────────────────────────────

export type SpeciesDescriptor = {
  id: string
  formula: string
  charge: number
  acidBaseState: "fully_protonated" | "intermediate" | "fully_deprotonated" | "neutral"
  stoichiometry: Record<string, number>   // element → count
  names: LocalizedText
  aliases: string[]
  phase: "aqueous" | "solid" | "gas" | "liquid"
  hydration: number                      // water molecules
  renderFormula: string                  // for ChemicalFormula component
}

export type EquilibriumDescriptor = {
  id: string
  type: "acid-base" | "complexation" | "precipitation" | "redox" | "mixed"
  reactants: { speciesId: string; coefficient: number }[]
  products: { speciesId: string; coefficient: number }[]
  logK: number
  deltaH_kJ?: number
  temperatureDependence: "van_t_hoff" | "none" | "tabulated"
  modelRestrictions: LocalizedText
  competitionNotes: LocalizedText
  source: DataSource
}

export type BalanceDescriptor = {
  type: "mass" | "charge" | "analytical"
  equation: string
  variables: string[]
  constraints: string[]
}

// ── Phase 3: Solver types ──────────────────────────────────────────────────

export type SolverResult = {
  converged: boolean
  iterations: number
  residual: number
  tolerance: number
  concentrations: Record<string, number>
  pH: number
  ionicStrength: number
  warnings: LocalizedText[]
}

export type ActivityModel = "ideal" | "debye_huckel_limiting" | "debye_huckel_extended" | "davies"

// ── Phase 4: Visualization types ───────────────────────────────────────────

export type PredominanceRegion = {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  speciesId: string
  label: string
}

export type SensitivityResult = {
  parameter: string
  baseValue: number
  values: number[]
  outputs: number[]
  minBand: number[]
  maxBand: number[]
}

// ── Phase 5: Lab workflow types ────────────────────────────────────────────

export type SolutionPrep = {
  targetConc_mol_L: number
  targetVolume_mL: number
  molarMass_g_mol: number
  purity: number
  mass_g: number
  uncertainty_g: number
  steps: LocalizedText[]
}

export type TitrationPlan = {
  analyteConc: number
  titrantConc: number
  estimatedVolume_mL: number
  indicatorRange: [number, number]
  criticalPoints: { pH: number; description: LocalizedText }[]
}

export type InterferenceEntry = {
  interferent: string
  effect: LocalizedText
  severityAtPH: (pH: number) => "none" | "low" | "moderate" | "high"
  mitigationStrategy: LocalizedText
}

export type MatrixPreset = {
  id: string
  name: LocalizedText
  type: "water" | "food" | "pharmaceutical" | "mineral" | "teaching"
  typicalAnalytes: string[]
  pH_range: [number, number]
  ionicStrength: number
  notes: LocalizedText
  warnings: LocalizedText
}

export type MethodSheet = {
  title: LocalizedText
  reagents: { name: string; amount: string }[]
  conditions: LocalizedText
  keyCalculations: string[]
  risks: LocalizedText[]
  checklist: LocalizedText[]
}

// ── Phase 6: Teaching & reproducibility ────────────────────────────────────

export type ExplanationStep = {
  order: number
  title: LocalizedText
  content: LocalizedText
  formula?: string
  highlight?: string
}

export type LearningPath = {
  id: string
  domain: string
  title: LocalizedText
  objectives: LocalizedText[]
  steps: LearningStep[]
}

export type LearningStep = {
  order: number
  title: LocalizedText
  keyQuestion: LocalizedText
  commonErrors: LocalizedText[]
  miniValidation: LocalizedText
}

export type SessionSnapshot = {
  version: string
  timestamp: string
  locale: Locale
  inputs: Record<string, unknown>
  modelAssumptions: ModelAssumption
  userNotes: string
}

// ── Phase 7: Scaling types ─────────────────────────────────────────────────

export type ChemistryDomain = "acid-base" | "complexation" | "precipitation" | "redox" | "pourbaix" | "buffer" | "environmental"

export type PluginManifest = {
  id: string
  name: LocalizedText
  description: LocalizedText
  domains: ChemistryDomain[]
  version: string
  author: string
  provides: {
    species: string[]
    equilibria: string[]
  }
}

export type QualityCheck = {
  id: string
  title: LocalizedText
  description: LocalizedText
  category: string
  priority: "critical" | "high" | "medium"
}

// ── Validation reference case ──────────────────────────────────────────────

export type ReferenceCase = {
  id: string
  domain: ChemistryDomain
  title: LocalizedText
  inputs: Record<string, number | string>
  expectedOutputs: Record<string, number>
  tolerance: number
  explanation: LocalizedText
  source: string
  verified: boolean
}

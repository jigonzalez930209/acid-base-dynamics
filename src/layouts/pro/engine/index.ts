/**
 * Engine barrel — re-exports existing engine modules for pro layout.
 * No code duplication; just a convenient import path.
 */

// Solver
export { solveEquilibrium, solveAcidBase } from "@/layouts/full/engine/solver"

// Activity coefficients
export {
  calcIonicStrength,
  activityCoefficient,
  correctLogK,
  ACTIVITY_MODEL_LABELS,
} from "@/layouts/full/engine/activity"

// Temperature corrections
export {
  correctPKForTemperature,
  pKwAtTemp,
  buildPKvsTempCurve,
  DELTA_H_DEFAULTS,
} from "@/layouts/full/engine/temperature"

// Unit conversions
export {
  toMolPerL,
  fromMolPerL,
  convertUnits,
  formatConcentration,
} from "@/layouts/full/engine/units"

// Scenarios & snapshots
export {
  createSnapshot,
  serializeSnapshot,
  exportCSV,
  downloadBlob,
} from "@/layouts/full/engine/scenarios"

// Validator
export { validateReferenceCase, validateAll } from "@/layouts/full/engine/validator"

// Types
export type {
  ActivityModel,
  SpeciesDescriptor,
  EquilibriumDescriptor,
  SolverResult,
  DataSource,
  ConcentrationUnit,
  LearningPath,
} from "@/layouts/full/engine/types"

// Acid-base math
export {
  calcAlphas,
  buildSpeciationSeries,
  buildTitrationSeries,
  calcTitrationVolume,
  classifyPH,
} from "@/features/chemistry/lib/acid-math"

// Advanced math
export {
  buildBufferCapacitySeries,
  buildSensitivitySeries,
  buildPredominanceSeries,
  calcEquivalenceVolumes,
} from "@/features/advanced/advanced-math"

// Complexation math
export {
  calcAlphaLigand,
  calcLogKfPrime,
  calcLogKfDoublePrime,
  buildAlphaSeries,
  buildConditionalCurve,
} from "@/features/advanced/complexation-math"

// Data
export { ACID_DATABASE } from "@/data/acids"
export { HYDROXIDE_DATA } from "@/features/advanced/precipitation-data"
export { HALF_REACTIONS } from "@/features/advanced/redox-data"
export { LEARNING_PATHS } from "@/layouts/full/data/learning-paths"

/**
 * Types for the PhosphateLab (/phosph) layout.
 * UI types are separated from engine types.
 */

export type PhosphStep = "input" | "indicator" | "result"

export type PhosphTitrant = "HCl" | "NaOH"

export type PhosphInput = {
  pH: string          // raw string for input control
  titrant: PhosphTitrant | null  // must be explicitly chosen
  normality: string   // mol/L of the titrant
  volume1: string     // first titration (mL)
  volume2: string     // duplicate titration (mL)
  indicatorId: string | null
}

export type PhosphResult = {
  pHValue: number
  volume1: number
  volume2: number
  avgVolume: number
  indicatorId: string
  titrant: PhosphTitrant
  normality: number
  /** Auto-detected sample ID from pH + titrant — internal, not shown to student */
  detectedSampleId: "A" | "B" | "C" | "D"
}

export type PhosphState = {
  step: PhosphStep
  input: PhosphInput
  result: PhosphResult | null
}

export type PhosphAction =
  | { type: "SET_PH"; value: string }
  | { type: "SET_TITRANT"; titrant: PhosphTitrant | null }
  | { type: "SET_NORMALITY"; value: string }
  | { type: "SET_VOLUME1"; value: string }
  | { type: "SET_VOLUME2"; value: string }
  | { type: "SELECT_INDICATOR"; id: string }
  | { type: "GO_TO_INDICATOR" }
  | { type: "SUBMIT_RESULT" }
  | { type: "RESET" }

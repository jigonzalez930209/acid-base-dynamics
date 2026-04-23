import { createContext, useContext, useReducer } from "react"
import type { PropsWithChildren } from "react"
import type { PhosphState, PhosphAction, PhosphResult } from "./types"
import { detectSampleId } from "./engine/sample-detector"

// ── Initial state ──────────────────────────────────────────────────────────

const INITIAL_STATE: PhosphState = {
  step: "input",
  input: {
    pH: "",
    titrant: null,
    normality: "",
    volume1: "",
    volume2: "",
    indicatorId: null,
  },
  result: null,
}

// ── Reducer ────────────────────────────────────────────────────────────────

function reducer(state: PhosphState, action: PhosphAction): PhosphState {
  switch (action.type) {
    case "SET_PH":
      return { ...state, input: { ...state.input, pH: action.value } }

    case "SET_TITRANT":
      // Reset normality when titrant changes to force re-validation
      return { ...state, input: { ...state.input, titrant: action.titrant, normality: "" } }

    case "SET_NORMALITY":
      return { ...state, input: { ...state.input, normality: action.value } }

    case "SET_VOLUME1":
      return { ...state, input: { ...state.input, volume1: action.value } }

    case "SET_VOLUME2":
      return { ...state, input: { ...state.input, volume2: action.value } }

    case "SELECT_INDICATOR":
      return { ...state, input: { ...state.input, indicatorId: action.id } }

    case "GO_TO_INDICATOR":
      return { ...state, step: "indicator" }

    case "SUBMIT_RESULT": {
      const { pH, titrant, normality, volume1, volume2, indicatorId } = state.input
      if (!titrant || !pH || !normality || !volume1 || !volume2 || !indicatorId) return state
      const pHValue = parseFloat(pH)
      const norm = parseFloat(normality)
      const v1 = parseFloat(volume1)
      const v2 = parseFloat(volume2)
      if (isNaN(pHValue) || isNaN(norm) || isNaN(v1) || isNaN(v2)) return state
      const result: PhosphResult = {
        pHValue,
        volume1: v1,
        volume2: v2,
        avgVolume: (v1 + v2) / 2,
        indicatorId,
        titrant,
        normality: norm,
        detectedSampleId: detectSampleId(pHValue, titrant),
      }
      return { ...state, step: "result", result }
    }

    case "RESET":
      return INITIAL_STATE

    default:
      return state
  }
}

// ── Context ────────────────────────────────────────────────────────────────

type PhosphContextValue = {
  state: PhosphState
  dispatch: React.Dispatch<PhosphAction>
}

const PhosphContext = createContext<PhosphContextValue | null>(null)

export function PhosphProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  return (
    <PhosphContext.Provider value={{ state, dispatch }}>
      {children}
    </PhosphContext.Provider>
  )
}

export function usePhosph(): PhosphContextValue {
  const ctx = useContext(PhosphContext)
  if (!ctx) throw new Error("usePhosph must be used inside PhosphProvider")
  return ctx
}

import { createContext, useContext, useReducer, useMemo } from "react"
import type { PropsWithChildren } from "react"
import type { StudentRow, ParseError, ColumnMapping } from "./engine/schema"
import { classifyRows } from "./engine/classifier"
import type { ClassifiedRow } from "./engine/classifier"

// ── Types ──────────────────────────────────────────────────────────────────

export type DocStep = "upload" | "validate" | "explore" | "charts" | "export"

export type DocFilters = {
  samples: number[]        // empty = all
  commissions: string[]    // empty = all
  weeks: number[]          // empty = all
  outcome: "all" | "success" | "fail"
}

export type DocState = {
  step: DocStep
  fileName: string | null
  rawRows: StudentRow[]
  parseErrors: ParseError[]
  excludedRows: Set<number>
  mapping: ColumnMapping
  rawHeaders: string[]
  totalRawRows: number
  filters: DocFilters
  threshold: number        // % error threshold for success/fail
  reportTitle: string
}

export type DocAction =
  | { type: "LOAD_DATA"; rows: StudentRow[]; errors: ParseError[]; mapping: ColumnMapping; rawHeaders: string[]; totalRawRows: number; fileName: string }
  | { type: "SET_MAPPING"; mapping: ColumnMapping }
  | { type: "GO_TO"; step: DocStep }
  | { type: "TOGGLE_EXCLUDE"; rowIndex: number }
  | { type: "SET_FILTERS"; filters: Partial<DocFilters> }
  | { type: "SET_THRESHOLD"; threshold: number }
  | { type: "SET_REPORT_TITLE"; title: string }
  | { type: "RESET" }

// ── Initial state ──────────────────────────────────────────────────────────

const INITIAL_FILTERS: DocFilters = { samples: [], commissions: [], weeks: [], outcome: "all" }

const INITIAL_STATE: DocState = {
  step: "upload",
  fileName: null,
  rawRows: [],
  parseErrors: [],
  excludedRows: new Set(),
  mapping: {},
  rawHeaders: [],
  totalRawRows: 0,
  filters: INITIAL_FILTERS,
  threshold: 2,
  reportTitle: "Informe TP Fosfatos",
}

// ── Reducer ────────────────────────────────────────────────────────────────

function reducer(state: DocState, action: DocAction): DocState {
  switch (action.type) {
    case "LOAD_DATA":
      return {
        ...state,
        step: "validate",
        fileName: action.fileName,
        rawRows: action.rows,
        parseErrors: action.errors,
        mapping: action.mapping,
        rawHeaders: action.rawHeaders,
        totalRawRows: action.totalRawRows,
        excludedRows: new Set(),
        filters: INITIAL_FILTERS,
      }

    case "SET_MAPPING":
      return { ...state, mapping: action.mapping }

    case "GO_TO":
      return { ...state, step: action.step }

    case "TOGGLE_EXCLUDE": {
      const next = new Set(state.excludedRows)
      if (next.has(action.rowIndex)) next.delete(action.rowIndex)
      else next.add(action.rowIndex)
      return { ...state, excludedRows: next }
    }

    case "SET_FILTERS":
      return { ...state, filters: { ...state.filters, ...action.filters } }

    case "SET_THRESHOLD":
      return { ...state, threshold: action.threshold }

    case "SET_REPORT_TITLE":
      return { ...state, reportTitle: action.title }

    case "RESET":
      return INITIAL_STATE

    default:
      return state
  }
}

// ── Context ────────────────────────────────────────────────────────────────

type DocContextValue = {
  state: DocState
  dispatch: React.Dispatch<DocAction>
  /** Rows after exclusions and filters, classified */
  classifiedRows: ClassifiedRow[]
  /** Subset of classifiedRows after applying filters */
  filteredRows: ClassifiedRow[]
}

const DocContext = createContext<DocContextValue | null>(null)

export function DocProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  const classifiedRows = useMemo(
    () => classifyRows(
      state.rawRows.filter((r) => !state.excludedRows.has(r._rowIndex)),
      state.threshold,
    ),
    [state.rawRows, state.excludedRows, state.threshold],
  )

  const filteredRows = useMemo(() => {
    const { samples, commissions, weeks, outcome } = state.filters
    return classifiedRows.filter((r) => {
      if (samples.length && !samples.includes(r.sample)) return false
      if (commissions.length && !commissions.includes(r.commission)) return false
      if (weeks.length && !weeks.includes(r.week)) return false
      if (outcome === "success" && !r.successAttempt1) return false
      if (outcome === "fail" && r.successAttempt1) return false
      return true
    })
  }, [classifiedRows, state.filters])

  return (
    <DocContext.Provider value={{ state, dispatch, classifiedRows, filteredRows }}>
      {children}
    </DocContext.Provider>
  )
}

export function useDoc(): DocContextValue {
  const ctx = useContext(DocContext)
  if (!ctx) throw new Error("useDoc must be used inside DocProvider")
  return ctx
}

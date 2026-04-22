/**
 * Pro layout types — shared across all modules
 */

export type ModuleId =
  | "dashboard"
  | "acid-base"
  | "complexation"
  | "precipitation"
  | "redox"
  | "lab-tools"
  | "visualization"
  | "education"
  | "settings"

export type SubRoute = {
  id: string
  label: { es: string; en: string }
  path: string
}

export type ModuleDefinition = {
  id: ModuleId
  icon: string
  label: { es: string; en: string }
  description: { es: string; en: string }
  color: string
  subRoutes?: SubRoute[]
}

export type ChartSeries = {
  label: string
  data: Array<{ x: number; y: number }>
  color: string
  lineStyle?: "solid" | "dashed" | "dotted"
  visible?: boolean
}

export type GridColumn<T = unknown> = {
  field: string
  headerName: string
  width?: number
  sortable?: boolean
  cellRenderer?: "formula" | "number" | "badge" | "ph" | "sparkline" | "status"
  valueFormatter?: (value: T) => string
}

export type ReportBlock = {
  id: string
  type: "chart" | "table" | "note" | "equation" | "separator"
  title?: string
  content: unknown
  caption?: string
  order: number
}

export type AppSession = {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  activeModule: ModuleId
  state: Record<string, unknown>
}

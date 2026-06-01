/**
 * Schema definition for the student result dataset.
 *
 * Each row corresponds to one titration attempt by one student.
 * Columns can arrive with many header variations (Spanish/English, accents, etc.);
 * the aliases list handles that at parse time.
 */

export type StudentRow = {
  /** Raw row index in the Excel file (1-based) */
  _rowIndex: number

  /** Student identifier (name, code, etc.) */
  studentId: string

  /** Commission / lab section */
  commission: string

  /** Week number of the TP (1-based) */
  week: number

  /** Assigned sample: 1=A, 2=B, 3=C, 4=D */
  sample: 1 | 2 | 3 | 4

  /** pH read by the student */
  phRead: number

  /** Volume of NaOH in first attempt (mL) */
  volumeAttempt1: number

  /** Indicator chosen (free text) */
  indicatorChosen: string

  /** Volume of NaOH in duplicate attempt (mL, optional) */
  volumeDuplicate?: number

  /** Optional free text notes */
  notes?: string
}

// ── Column field definition ────────────────────────────────────────────────

export type ColumnField = keyof Omit<StudentRow, "_rowIndex">

export type ColumnDef = {
  field: ColumnField
  required: boolean
  type: "string" | "number" | "integer"
  /** Valid range for numeric fields */
  range?: [number, number]
  /** Accepted header names (case-insensitive) */
  aliases: string[]
  label: { es: string; en: string }
}

export const COLUMN_DEFS: ColumnDef[] = [
  {
    field: "studentId",
    required: true,
    type: "string",
    aliases: ["alumno", "estudiante", "student", "student_id", "nombre", "name", "id"],
    label: { es: "Alumno", en: "Student" },
  },
  {
    field: "commission",
    required: true,
    type: "string",
    aliases: ["comision", "comisión", "commission", "grupo", "group", "seccion", "sección", "section"],
    label: { es: "Comisión", en: "Commission" },
  },
  {
    field: "week",
    required: true,
    type: "integer",
    range: [1, 20],
    aliases: ["semana", "week", "tp", "numero_tp", "tp_number"],
    label: { es: "Semana", en: "Week" },
  },
  {
    field: "sample",
    required: true,
    type: "integer",
    range: [1, 4],
    aliases: ["muestra", "sample", "muestra_numero", "sample_number", "n_muestra"],
    label: { es: "Muestra (1-4)", en: "Sample (1-4)" },
  },
  {
    field: "phRead",
    required: true,
    type: "number",
    range: [0, 14],
    aliases: ["ph", "ph_medido", "ph_leido", "ph_read", "ph_inicial", "initial_ph"],
    label: { es: "pH medido", en: "pH read" },
  },
  {
    field: "volumeAttempt1",
    required: true,
    type: "number",
    range: [0, 200],
    aliases: ["volumen1", "volumen_1", "vol1", "v1", "volume1", "volume_1", "primer_intento", "attempt1", "first_attempt"],
    label: { es: "Volumen 1er intento (mL)", en: "Volume 1st attempt (mL)" },
  },
  {
    field: "indicatorChosen",
    required: true,
    type: "string",
    aliases: ["indicador", "indicator", "indicador_elegido", "chosen_indicator", "ind"],
    label: { es: "Indicador elegido", en: "Indicator chosen" },
  },
  {
    field: "volumeDuplicate",
    required: false,
    type: "number",
    range: [0, 200],
    aliases: ["volumen_duplicado", "vol_dup", "duplicate", "duplicado", "v2", "vol2", "volumen2", "volume2", "second_attempt"],
    label: { es: "Volumen duplicado (mL)", en: "Duplicate volume (mL)" },
  },
  {
    field: "notes",
    required: false,
    type: "string",
    aliases: ["notas", "notes", "observaciones", "observations", "comentarios", "comments"],
    label: { es: "Notas", en: "Notes" },
  },
]

// ── Parse error ────────────────────────────────────────────────────────────

export type ParseErrorLevel = "error" | "warning"

export type ParseError = {
  rowIndex: number
  field: ColumnField | "unknown"
  rawValue: string | number | null | undefined
  expected: string
  message: { es: string; en: string }
  level: ParseErrorLevel
}

export type ColumnMapping = Partial<Record<ColumnField, string>>

/**
 * Client-side Excel/CSV parser using SheetJS.
 *
 * All processing happens in the browser. No data leaves the user's machine.
 * License: SheetJS Community Edition (Apache 2.0) — compatible with GitHub Pages.
 */

import * as XLSX from "xlsx"
import { COLUMN_DEFS } from "./schema"
import type { StudentRow, ParseError, ColumnMapping, ColumnDef } from "./schema"

export type ParseResult = {
  rows: StudentRow[]
  errors: ParseError[]
  rawHeaders: string[]
  autoMapping: ColumnMapping
  totalRawRows: number
}

// ── Normalization helpers ──────────────────────────────────────────────────

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

/**
 * Auto-detect column mapping from raw headers.
 * Matches by alias (normalized, case-insensitive).
 */
export function detectColumnMapping(rawHeaders: string[]): ColumnMapping {
  const mapping: ColumnMapping = {}
  for (const def of COLUMN_DEFS) {
    for (const h of rawHeaders) {
      const norm = normalizeHeader(h)
      if (def.aliases.some((alias) => norm === alias || norm.includes(alias))) {
        mapping[def.field] = h
        break
      }
    }
  }
  return mapping
}

// ── Value coercion ────────────────────────────────────────────────────────

function coerce(raw: unknown, def: ColumnDef): string | number | undefined {
  if (raw === null || raw === undefined || raw === "") return undefined
  if (def.type === "string") return String(raw).trim()
  const n = typeof raw === "number" ? raw : parseFloat(String(raw))
  if (isNaN(n)) return undefined
  if (def.type === "integer") return Math.round(n)
  return n
}

// ── Row parser ─────────────────────────────────────────────────────────────

function parseRow(
  rawRow: Record<string, unknown>,
  rowIndex: number,
  mapping: ColumnMapping,
): { partial: Partial<StudentRow>; errors: ParseError[] } {
  const partial: Partial<StudentRow> = { _rowIndex: rowIndex }
  const errors: ParseError[] = []

  for (const def of COLUMN_DEFS) {
    const header = mapping[def.field]
    const raw = header !== undefined ? rawRow[header] : undefined
    const value = coerce(raw, def)

    if (value === undefined || value === "") {
      if (def.required) {
        errors.push({
          rowIndex,
          field: def.field,
          rawValue: raw as string,
          expected: def.label.es,
          level: "error",
          message: {
            es: `Campo requerido "${def.label.es}" vacío o inválido.`,
            en: `Required field "${def.label.en}" is empty or invalid.`,
          },
        })
      }
      continue
    }

    if (def.range && typeof value === "number") {
      const [lo, hi] = def.range
      if (value < lo || value > hi) {
        errors.push({
          rowIndex,
          field: def.field,
          rawValue: raw as number,
          expected: `${lo}–${hi}`,
          level: def.required ? "error" : "warning",
          message: {
            es: `"${def.label.es}" fuera de rango esperado (${lo}–${hi}). Valor recibido: ${value}.`,
            en: `"${def.label.en}" out of expected range (${lo}–${hi}). Received: ${value}.`,
          },
        })
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(partial as any)[def.field] = value
  }

  return { partial, errors }
}

// ── Main parser ────────────────────────────────────────────────────────────

/**
 * Parse a File (.xlsx or .csv) into structured StudentRow data.
 * Entirely synchronous once the ArrayBuffer is available.
 */
export function parseXlsx(buffer: ArrayBuffer, mapping: ColumnMapping): ParseResult {
  const wb = XLSX.read(buffer, { type: "array" })
  const sheetName = wb.SheetNames[0]
  const ws = wb.Sheets[sheetName]

  // Convert to array of objects
  const rawData: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws, { defval: "" })
  const totalRawRows = rawData.length

  // Get raw headers from first row
  const rawHeaders = rawData.length > 0 ? Object.keys(rawData[0]) : []
  const autoMapping = detectColumnMapping(rawHeaders)
  const effectiveMapping = Object.keys(mapping).length > 0 ? mapping : autoMapping

  const rows: StudentRow[] = []
  const errors: ParseError[] = []

  rawData.forEach((rawRow, idx) => {
    const rowIndex = idx + 2  // +2: 1-based + header row
    const { partial, errors: rowErrors } = parseRow(rawRow, rowIndex, effectiveMapping)
    errors.push(...rowErrors)

    // Only include rows without blocking errors
    const hasBlockingError = rowErrors.some((e) => e.level === "error")
    if (!hasBlockingError) {
      rows.push(partial as StudentRow)
    }
  })

  return { rows, errors, rawHeaders, autoMapping: effectiveMapping, totalRawRows }
}

/**
 * Read a File object as ArrayBuffer (browser-native, no extra libs).
 */
export function readFileAsBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target!.result as ArrayBuffer)
    reader.onerror = () => reject(new Error("File read error"))
    reader.readAsArrayBuffer(file)
  })
}

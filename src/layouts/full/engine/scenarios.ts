/**
 * Scenario serialization engine.
 * Save/reopen systems with presets, comparisons, experimental conditions.
 * Versioned schema for future compatibility.
 */

import type { SessionSnapshot, Locale, ModelAssumption } from "./types"

const SCHEMA_VERSION = "1.0.0"

export function createSnapshot(
  locale: Locale,
  inputs: Record<string, unknown>,
  assumptions: ModelAssumption,
  notes = "",
): SessionSnapshot {
  return {
    version: SCHEMA_VERSION,
    timestamp: new Date().toISOString(),
    locale,
    inputs,
    modelAssumptions: assumptions,
    userNotes: notes,
  }
}

export function serializeSnapshot(snapshot: SessionSnapshot): string {
  return JSON.stringify(snapshot, null, 2)
}

export function deserializeSnapshot(json: string): SessionSnapshot | null {
  try {
    const parsed = JSON.parse(json)
    if (!parsed.version || !parsed.timestamp || !parsed.inputs) return null
    return parsed as SessionSnapshot
  } catch {
    return null
  }
}

export function exportSnapshotAsBlob(snapshot: SessionSnapshot): Blob {
  return new Blob([serializeSnapshot(snapshot)], { type: "application/json" })
}

export function downloadSnapshot(snapshot: SessionSnapshot, filename?: string) {
  const blob = exportSnapshotAsBlob(snapshot)
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename ?? `session-${snapshot.timestamp.slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function exportCSV(headers: string[], rows: (string | number)[][]): Blob {
  const lines = [headers.join(","), ...rows.map((r) => r.join(","))]
  return new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** Validate imported JSON against schema */
export function validateImport(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (!data || typeof data !== "object") {
    errors.push("Invalid JSON structure")
    return { valid: false, errors }
  }
  const obj = data as Record<string, unknown>
  if (typeof obj["version"] !== "string") errors.push("Missing version field")
  if (typeof obj["timestamp"] !== "string") errors.push("Missing timestamp field")
  if (!obj["inputs"] || typeof obj["inputs"] !== "object") errors.push("Missing inputs object")
  return { valid: errors.length === 0, errors }
}

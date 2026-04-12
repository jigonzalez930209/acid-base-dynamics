import type { MetalLigandEntry, MetalRecord } from "@/features/advanced/complexation-db"

export type ComplexationSlot = {
  metal: MetalRecord
  entry: MetalLigandEntry | undefined
  color: string
}

export type ConditionalPoint = {
  pH: number
  logKfPrime: number
  logKfDoublePrime: number
}

export type ConditionalCurve = {
  pts: ConditionalPoint[]
  color: string
}

export type MetalLabel = {
  symbol: string
  color: string
}

export type AlphaSeriesPoint = {
  logL: number
  alphas: number[]
}

export const SLOT_COLORS = ["#38bdf8", "#fb7185", "#4ade80"] as const

export const W = 920
export const H = 360
export const PL = 56
export const PR = 24
export const PT = 24
export const PB = 56
export const IW = W - PL - PR
export const IH = H - PT - PB

export const mapX = (value: number, xMin: number, xMax: number) =>
  PL + ((value - xMin) / (xMax - xMin)) * IW

export const mapY = (value: number, yMin: number, yMax: number) =>
  PT + IH - ((value - yMin) / (yMax - yMin)) * IH

export function kfColor(logK: number): string {
  if (logK >= 12) return "text-emerald-600 dark:text-emerald-400"
  if (logK >= 8) return "text-amber-600 dark:text-amber-400"
  if (logK >= 4) return "text-orange-600 dark:text-orange-400"
  return "text-rose-600 dark:text-rose-400"
}

export function kfBgColor(logK: number): string {
  if (logK >= 12) return "#059669"
  if (logK >= 8) return "#d97706"
  if (logK >= 4) return "#ea580c"
  return "#dc2626"
}
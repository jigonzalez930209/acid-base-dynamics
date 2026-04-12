export type Locale = "es" | "en"

export type LocalizedText = Record<Locale, string>

export type AcidRecord = {
  id: string
  names: LocalizedText
  formula: string
  pKas: number[]
  proticType: 0 | 1 | 2 | 3
  sourcePkas?: Array<number | null>
  equilibriumSpecies?: string[]
  notes?: Partial<LocalizedText>
  tags?: string[]
}

export type SlotStyle = {
  color: string
  dash: string
  glow: string
}

export type SlotState = SlotStyle & {
  acidId: string
  pKas: number[]
  concentrationCA: number
  concentrationCB: number
}

export type ActiveSlot = SlotState & {
  acid: AcidRecord
}

export type ChartPoint = {
  x: number
  y: number
}

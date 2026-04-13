import { createContext, useContext, useState, useCallback, type PropsWithChildren } from "react"
import { useTranslation } from "react-i18next"
import type { Locale } from "@/features/chemistry/types/models"
import type { ActivityModel } from "@/layouts/full/engine/types"
import type { ModuleId } from "../types"

type ChemistryState = {
  // Global parameters
  globalPH: number
  concentration: number
  temperature: number
  ionicStrength: number
  activityModel: ActivityModel
  activeModule: ModuleId
  sidebarCollapsed: boolean
  // Locale
  locale: Locale
}

type ChemistryActions = {
  setGlobalPH: (pH: number) => void
  setConcentration: (c: number) => void
  setTemperature: (t: number) => void
  setIonicStrength: (i: number) => void
  setActivityModel: (m: ActivityModel) => void
  setActiveModule: (m: ModuleId) => void
  setSidebarCollapsed: (c: boolean) => void
}

type ChemistryContextValue = ChemistryState & ChemistryActions

const ChemistryContext = createContext<ChemistryContextValue | null>(null)

export function ChemistryProvider({ children }: PropsWithChildren) {
  const { i18n } = useTranslation()
  const locale: Locale = i18n.resolvedLanguage === "en" ? "en" : "es"

  const [globalPH, setGlobalPH] = useState(7.0)
  const [concentration, setConcentration] = useState(0.1)
  const [temperature, setTemperature] = useState(25)
  const [ionicStrength, setIonicStrength] = useState(0)
  const [activityModel, setActivityModel] = useState<ActivityModel>("ideal")
  const [activeModule, setActiveModule] = useState<ModuleId>("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const value: ChemistryContextValue = {
    globalPH,
    concentration,
    temperature,
    ionicStrength,
    activityModel,
    activeModule,
    sidebarCollapsed,
    locale,
    setGlobalPH: useCallback((pH: number) => setGlobalPH(Math.max(0, Math.min(14, pH))), []),
    setConcentration: useCallback((c: number) => setConcentration(Math.max(1e-10, c)), []),
    setTemperature: useCallback((t: number) => setTemperature(Math.max(0, Math.min(100, t))), []),
    setIonicStrength: useCallback((i: number) => setIonicStrength(Math.max(0, i)), []),
    setActivityModel,
    setActiveModule,
    setSidebarCollapsed,
  }

  return <ChemistryContext value={value}>{children}</ChemistryContext>
}

export function useChemistry() {
  const ctx = useContext(ChemistryContext)
  if (!ctx) throw new Error("useChemistry must be used within ChemistryProvider")
  return ctx
}

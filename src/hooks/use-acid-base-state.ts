import { useMemo, useState } from "react"

import { useTranslation } from "react-i18next"

import { ACID_DATABASE, SUPPORTED_ACID_COUNT, createInitialSlots, getAcidById } from "@/data/acids"
import type { Locale } from "@/features/chemistry/types/models"

export function useAcidBaseState() {
  const { i18n, t } = useTranslation()
  const locale: Locale = i18n.resolvedLanguage === "en" ? "en" : "es"
  const [globalPH, setGlobalPH] = useState(3.2)
  const [slots, setSlots] = useState(createInitialSlots())

  const resolvedSlots = useMemo(
    () => slots.map((slot) => ({ ...slot, acid: getAcidById(slot.acidId) })),
    [slots]
  )
  const activeSlots = resolvedSlots.filter((slot) => slot.acid.id !== "none")
  const equilibriumCount = activeSlots.reduce((sum, slot) => sum + slot.pKas.length, 0)

  const handleAcidChange = (slotIndex: number, acidId: string) => {
    const acid = getAcidById(acidId)
    setSlots((current) =>
      current.map((slot, index) => (index === slotIndex ? { ...slot, acidId, pKas: [...acid.pKas] } : slot))
    )
  }

  const handlePkaChange = (slotIndex: number, pKaIndex: number, nextValue: number) => {
    setSlots((current) =>
      current.map((slot, index) => {
        if (index !== slotIndex) return slot
        const nextPkas = [...slot.pKas]
        nextPkas[pKaIndex] = nextValue
        return { ...slot, pKas: nextPkas }
      })
    )
  }

  const handleConcentrationChange = (slotIndex: number, isBase: boolean, nextValue: number) => {
    setSlots((current) =>
      current.map((slot, index) => {
        if (index !== slotIndex) return slot
        return isBase
          ? { ...slot, concentrationCB: nextValue }
          : { ...slot, concentrationCA: nextValue }
      })
    )
  }

  return {
    t,
    locale,
    globalPH,
    setGlobalPH,
    resolvedSlots,
    activeSlots,
    equilibriumCount,
    acidDatabase: ACID_DATABASE,
    acidCount: SUPPORTED_ACID_COUNT,
    handleAcidChange,
    handlePkaChange,
    handleConcentrationChange,
  }
}

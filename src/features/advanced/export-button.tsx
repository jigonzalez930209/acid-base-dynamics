import { useTranslation } from "react-i18next"
import { Download } from "lucide-react"

import { buildSpeciationSeries, buildTitrationSeries } from "@/features/chemistry/lib/acid-math"
import { Button } from "@/components/ui/button"
import type { ActiveSlot, Locale } from "@/features/chemistry/types/models"

type Props = {
  activeSlots: ActiveSlot[]
  locale: Locale
}

function buildCsvContent(activeSlots: ActiveSlot[]) {
  const lines: string[] = []

  // Speciation sheet
  lines.push("## SPECIATION")
  const speciationHeaders = ["pH", ...activeSlots.flatMap((s) =>
    s.pKas.map((_, i) => `${s.acid.id}_alpha${i}`)
  )]
  lines.push(speciationHeaders.join(","))

  for (let pH = 0; pH <= 14.001; pH += 0.1) {
    const row: string[] = [pH.toFixed(2)]
    activeSlots.forEach((slot) => {
      const series = buildSpeciationSeries(slot.pKas, pH, pH, 0.1)
      series.forEach((s) => row.push((s[0]?.y ?? 0).toFixed(5)))
    })
    lines.push(row.join(","))
  }

  lines.push("")
  lines.push("## TITRATION")
  const titrationHeaders = ["V_mL_NaOH", ...activeSlots.map((s) => `${s.acid.id}_pH`)]
  lines.push(titrationHeaders.join(","))

  // Build titration data from series (x=pH, y=volume), transpose to v -> pH
  const titrationSeries = activeSlots.map((slot) => buildTitrationSeries(slot.pKas))
  const maxLen = Math.max(...titrationSeries.map((s) => s.length))
  for (let i = 0; i < maxLen; i++) {
    const row: string[] = []
    const v = titrationSeries[0]?.[i]?.y
    row.push(v !== undefined ? v.toFixed(2) : "")
    titrationSeries.forEach((s) => row.push(s[i]?.x.toFixed(2) ?? ""))
    lines.push(row.join(","))
  }

  return lines.join("\n")
}

export function ExportButton({ activeSlots }: Props) {
  const { t } = useTranslation()

  const handleExport = () => {
    const content = buildCsvContent(activeSlots)
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "acid-base-data.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 text-xs"
      onClick={handleExport}
      disabled={activeSlots.length === 0}
    >
      <Download className="size-3.5" />
      {t("advanced.export.button")}
    </Button>
  )
}

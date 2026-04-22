import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MATRIX_PRESETS, METHOD_SHEETS } from "../data/matrices"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

const TYPE_ICONS: Record<string, string> = {
  water: "💧", food: "🍎", pharmaceutical: "💊", mineral: "⛏️", teaching: "📚",
}

export function MatrixPresetsPanel({ locale }: Props) {
  const [selectedId, setSelectedId] = useState(MATRIX_PRESETS[0].id)
  const preset = MATRIX_PRESETS.find((p) => p.id === selectedId)!

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {locale === "es"
          ? "Presets de matrices reales: agua, alimentos, farmacéutica, minerales y docencia, con variables típicas y advertencias."
          : "Real matrix presets: water, food, pharmaceutical, minerals and teaching, with typical variables and warnings."}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {MATRIX_PRESETS.map((m) => (
          <Button key={m.id} size="sm" variant={m.id === selectedId ? "default" : "outline"} onClick={() => setSelectedId(m.id)} className="text-xs">
            {TYPE_ICONS[m.type] ?? "📋"} {m.name[locale]}
          </Button>
        ))}
      </div>

      <div className="rounded border border-border/40 bg-card p-3 space-y-2">
        <div className="text-xs font-medium">{preset.name[locale]}</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded bg-muted/30 p-1.5">
            <div className="text-[9px] text-muted-foreground">pH</div>
            <div className="text-xs font-mono">{preset.pH_range[0]}–{preset.pH_range[1]}</div>
          </div>
          <div className="rounded bg-muted/30 p-1.5">
            <div className="text-[9px] text-muted-foreground">I (M)</div>
            <div className="text-xs font-mono">{preset.ionicStrength}</div>
          </div>
        </div>

        <div>
          <div className="text-[9px] text-muted-foreground mb-0.5">{locale === "es" ? "Analitos típicos:" : "Typical analytes:"}</div>
          <div className="flex flex-wrap gap-1">
            {preset.typicalAnalytes.map((a) => (
              <span key={a} className="rounded bg-blue-500/10 text-blue-600 px-1.5 py-0.5 text-[9px]">{a}</span>
            ))}
          </div>
        </div>

        <div className="text-[10px] text-muted-foreground">{preset.notes[locale]}</div>

        {preset.warnings[locale] && (
          <div className="rounded bg-amber-500/10 p-1.5 text-[10px] text-amber-700 dark:text-amber-400">
            ⚠ {preset.warnings[locale]}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="text-xs font-medium">{locale === "es" ? "Fichas de método:" : "Method sheets:"}</div>
        {METHOD_SHEETS.map((ms, i) => (
          <div key={i} className="rounded border border-border/40 bg-card p-2.5 space-y-1.5">
            <div className="text-xs font-medium">{ms.title[locale]}</div>

            <div>
              <div className="text-[9px] text-muted-foreground">{locale === "es" ? "Reactivos:" : "Reagents:"}</div>
              <div className="flex flex-wrap gap-1">
                {ms.reagents.map((r) => (
                  <span key={r.name} className="text-[9px] bg-muted/30 rounded px-1 py-0.5">{r.name}: {r.amount}</span>
                ))}
              </div>
            </div>

            <div className="text-[10px] text-muted-foreground">{ms.conditions[locale]}</div>

            <div>
              <div className="text-[9px] text-muted-foreground">{locale === "es" ? "Checklist:" : "Checklist:"}</div>
              {ms.checklist.map((c, j) => (
                <div key={j} className="text-[10px] text-foreground">☐ {c[locale]}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

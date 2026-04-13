import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LEARNING_PATHS } from "../data/learning-paths"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

export function LearningPathPanel({ locale }: Props) {
  const [pathIdx, setPathIdx] = useState(0)
  const [stepIdx, setStepIdx] = useState(0)
  const path = LEARNING_PATHS[pathIdx]
  const step = path.steps[stepIdx]

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {locale === "es"
          ? "Rutas guiadas: recorridos progresivos con objetivos, preguntas clave, errores frecuentes y mini-validaciones."
          : "Guided paths: progressive journeys with objectives, key questions, common errors and mini-validations."}
      </p>

      <div className="flex gap-1.5">
        {LEARNING_PATHS.map((lp, i) => (
          <Button key={i} size="sm" variant={i === pathIdx ? "default" : "outline"} onClick={() => { setPathIdx(i); setStepIdx(0) }}>
            {lp.title[locale]}
          </Button>
        ))}
      </div>

      <div className="rounded border border-border/40 bg-card p-3 space-y-2">
        <div className="text-xs font-medium">{path.title[locale]}</div>
        <div>
          <div className="text-[9px] text-muted-foreground mb-0.5">{locale === "es" ? "Objetivos:" : "Objectives:"}</div>
          {path.objectives.map((o, i) => <div key={i} className="text-[10px] text-foreground">• {o[locale]}</div>)}
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto">
        {path.steps.map((s, i) => (
          <button
            key={i}
            onClick={() => setStepIdx(i)}
            className={`shrink-0 rounded px-2 py-1 text-[10px] font-medium ${i === stepIdx ? "bg-primary text-primary-foreground" : i < stepIdx ? "bg-emerald-500/10 text-emerald-600" : "bg-muted/40 text-muted-foreground"}`}
          >
            {i + 1}. {s.title[locale]}
          </button>
        ))}
      </div>

      <div className="rounded border border-border/40 bg-card p-3 space-y-2">
        <div className="text-xs font-medium">{step.title[locale]}</div>

        <div className="rounded bg-blue-500/10 p-2">
          <div className="text-[9px] text-muted-foreground">{locale === "es" ? "Pregunta clave:" : "Key question:"}</div>
          <div className="text-xs text-blue-700 dark:text-blue-400 font-medium">❓ {step.keyQuestion[locale]}</div>
        </div>

        <div>
          <div className="text-[9px] text-muted-foreground">{locale === "es" ? "Errores frecuentes:" : "Common errors:"}</div>
          {step.commonErrors.map((e, i) => (
            <div key={i} className="text-[10px] text-red-600 dark:text-red-400">✗ {e[locale]}</div>
          ))}
        </div>

        <div className="rounded bg-emerald-500/10 p-2">
          <div className="text-[9px] text-muted-foreground">{locale === "es" ? "Mini-validación:" : "Mini-validation:"}</div>
          <div className="text-[10px] text-emerald-700 dark:text-emerald-400">✓ {step.miniValidation[locale]}</div>
        </div>

        <div className="flex gap-2 pt-1">
          <Button size="sm" variant="outline" disabled={stepIdx === 0} onClick={() => setStepIdx((s) => s - 1)}>←</Button>
          <Button size="sm" variant="outline" disabled={stepIdx === path.steps.length - 1} onClick={() => setStepIdx((s) => s + 1)}>→</Button>
        </div>
      </div>
    </div>
  )
}

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { QUALITY_CHECKS } from "../data/domains"
import { validateAll } from "../engine/validator"
import { REFERENCE_CASES } from "../data/reference-cases"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

export function GovernancePanel({ locale }: Props) {
  const [validationRun, setValidationRun] = useState(false)

  const abCases = REFERENCE_CASES.filter((c) => c.domain === "acid-base")
  const validation = validationRun ? validateAll(abCases) : null

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {locale === "es"
          ? "Gobernanza de calidad: criterios de aceptación científica, revisión por pares, changelog técnico, benchmark y mantenimiento de datasets."
          : "Quality governance: scientific acceptance criteria, peer review, technical changelog, benchmark and dataset maintenance."}
      </p>

      <div className="rounded border border-border/40 bg-card p-3 space-y-3">
        <div className="text-xs font-medium">{locale === "es" ? "Checklist de calidad:" : "Quality checklist:"}</div>
        <div className="space-y-1.5">
          {QUALITY_CHECKS.map((qc) => (
            <div key={qc.id} className="flex items-start gap-2 rounded bg-muted/10 p-1.5">
              <span className={`text-[9px] mt-0.5 px-1 rounded font-medium ${qc.priority === "critical" ? "bg-red-500/10 text-red-600" : qc.priority === "high" ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600"}`}>
                {qc.priority}
              </span>
              <div>
                <div className="text-[10px] font-medium">{qc.title[locale]}</div>
                <div className="text-[9px] text-muted-foreground">{qc.description[locale]}</div>
                <div className="text-[9px] text-muted-foreground font-mono">{locale === "es" ? "Categoría" : "Category"}: {qc.category}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded border border-border/40 bg-card p-3 space-y-2">
        <div className="text-xs font-medium">{locale === "es" ? "Validación de regresión:" : "Regression validation:"}</div>
        <Button size="sm" onClick={() => setValidationRun(true)}>
          {locale === "es" ? "Ejecutar validación" : "Run validation"}
        </Button>
        {validation && (
          <div className="space-y-1">
            <div className={`rounded px-2 py-1 text-xs font-medium ${validation.passed ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}>
              {validation.passed
                ? `✓ ${locale === "es" ? "Todos los casos pasaron" : "All cases passed"}`
                : `✗ ${locale === "es" ? "Algunos casos fallaron" : "Some cases failed"}`}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {validation.results.length} {locale === "es" ? "casos evaluados" : "cases evaluated"}
            </div>
          </div>
        )}
      </div>

      <div className="rounded border border-border/40 bg-card p-3 space-y-2">
        <div className="text-xs font-medium">Changelog</div>
        <div className="space-y-1">
          {[
            { v: "1.0.0", date: "2025-01", desc: { es: "Línea base: ácido-base + complejación + precipitación + redox", en: "Baseline: acid-base + complexation + precipitation + redox" } },
            { v: "1.1.0", date: "2025-02", desc: { es: "Motor universal, validación cruzada, 22 casos de referencia", en: "Universal engine, cross-validation, 22 reference cases" } },
            { v: "1.2.0", date: "2025-03", desc: { es: "7 fases del roadmap implementadas en /full/", en: "7 roadmap phases implemented in /full/" } },
          ].map((entry) => (
            <div key={entry.v} className="flex gap-2 text-[10px]">
              <span className="font-mono text-primary shrink-0">{entry.v}</span>
              <span className="text-muted-foreground shrink-0">{entry.date}</span>
              <span className="text-foreground">{entry.desc[locale]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

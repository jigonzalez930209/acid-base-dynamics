import { DOMAIN_ASSUMPTIONS } from "../data/sources"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

const domains = Object.entries(DOMAIN_ASSUMPTIONS)

const DOMAIN_NAMES: Record<string, { es: string; en: string }> = {
  "acid-base": { es: "Ácido-Base", en: "Acid-Base" },
  complexation: { es: "Complejación", en: "Complexation" },
  precipitation: { es: "Precipitación", en: "Precipitation" },
  redox: { es: "Redox", en: "Redox" },
}

export function ModelAssumptions({ locale }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {locale === "es"
          ? "Cada dominio declara si usa actividades o concentraciones, si asume solución ideal, si ignora fuerza iónica y los rangos de uso."
          : "Each domain declares whether it uses activities or concentrations, assumes ideal solution, ignores ionic strength, and valid ranges."}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {domains.map(([key, assumption]) => (
          <div key={key} className="rounded-md border border-border/40 bg-card p-3 space-y-2">
            <h4 className="text-sm font-medium text-foreground">
              {DOMAIN_NAMES[key]?.[locale] ?? key}
            </h4>
            <div className="space-y-1 text-[11px]">
              <Row label={locale === "es" ? "Usa actividades" : "Uses activities"} value={assumption.usesActivities} />
              <Row label={locale === "es" ? "Solución ideal" : "Ideal solution"} value={assumption.assumesIdealSolution} />
              <Row label={locale === "es" ? "Ignora I" : "Ignores I"} value={assumption.ignoresIonicStrength} />
              <div className="flex justify-between">
                <span className="text-muted-foreground">{locale === "es" ? "Rango pH" : "pH range"}</span>
                <span className="font-mono text-foreground">{assumption.validPHRange[0]}–{assumption.validPHRange[1]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{locale === "es" ? "Rango T" : "T range"}</span>
                <span className="font-mono text-foreground">{assumption.validTempRange_C[0]}–{assumption.validTempRange_C[1]} °C</span>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">{assumption.notes[locale]}</p>
          </div>
        ))}
      </div>

      <div className="rounded border border-border/30 bg-amber-500/5 p-3 text-[10px] text-amber-700 dark:text-amber-400">
        <p className="font-medium mb-1">{locale === "es" ? "Limitaciones generales" : "General limitations"}</p>
        <ul className="list-disc pl-4 space-y-0.5">
          <li>{locale === "es" ? "Todos los cálculos asumen presión atmosférica estándar" : "All calculations assume standard atmospheric pressure"}</li>
          <li>{locale === "es" ? "No se incluyen efectos cinéticos (sólo termodinámica)" : "No kinetic effects included (thermodynamics only)"}</li>
          <li>{locale === "es" ? "Fuerza iónica corregible con modelos Debye-Hückel o Davies en Fase 3" : "Ionic strength correctable with Debye-Hückel or Davies models in Phase 3"}</li>
          <li>{locale === "es" ? "Extrapolación de temperatura con Van 't Hoff (incertidumbre declarada)" : "Temperature extrapolation with Van 't Hoff (uncertainty declared)"}</li>
        </ul>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={value ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
        {value ? "Sí / Yes" : "No"}
      </span>
    </div>
  )
}

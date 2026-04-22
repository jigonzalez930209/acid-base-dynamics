import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createSnapshot, downloadSnapshot, serializeSnapshot } from "../engine/scenarios"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

const DEFAULT_ASSUMPTIONS = {
  usesActivities: false,
  assumesIdealSolution: true,
  ignoresIonicStrength: true,
  validPHRange: [0, 14] as [number, number],
  validTempRange_C: [15, 35] as [number, number],
  notes: { es: "Modelo ideal docente", en: "Ideal teaching model" },
}

export function SessionManager({ locale }: Props) {
  const [notes, setNotes] = useState("")
  const [saved, setSaved] = useState(false)
  const [sessions, setSessions] = useState<{ ts: string; notes: string; json: string }[]>([])

  const handleSave = () => {
    const snap = createSnapshot(locale, { module: "full-layout", ph: 7.0, temp: 25 }, DEFAULT_ASSUMPTIONS, notes)
    const json = serializeSnapshot(snap)
    setSessions((prev) => [{ ts: snap.timestamp, notes, json }, ...prev])
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleExport = (json: string, ts: string) => {
    const snap = JSON.parse(json)
    downloadSnapshot(snap, `session-${ts.slice(0, 10)}.json`)
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {locale === "es"
          ? "Guardado reproducible: cada sesión almacena entradas, versión del modelo, idioma, supuestos, fecha y notas para reabrirse sin ambigüedad."
          : "Reproducible saving: each session stores inputs, model version, locale, assumptions, date and notes for unambiguous reopening."}
      </p>

      <div className="rounded border border-border/40 bg-card p-3 space-y-2">
        <label className="text-[10px] text-muted-foreground">{locale === "es" ? "Notas de la sesión:" : "Session notes:"}</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={locale === "es" ? "Describe el objetivo de esta sesión..." : "Describe the purpose of this session..."}
          className="w-full rounded border border-border/40 bg-background p-2 text-xs h-16 resize-none"
        />

        <div className="flex gap-2 items-center">
          <Button size="sm" onClick={handleSave}>{locale === "es" ? "Guardar sesión" : "Save session"}</Button>
          {saved && <span className="text-xs text-emerald-600">✓ {locale === "es" ? "Guardada" : "Saved"}</span>}
        </div>
      </div>

      <div className="rounded border border-border/40 bg-card p-3 space-y-2">
        <div className="text-xs font-medium">{locale === "es" ? "Metadatos incluidos:" : "Metadata included:"}</div>
        <div className="grid grid-cols-2 gap-1">
          {[
            { k: locale === "es" ? "Versión" : "Version", v: "1.0.0" },
            { k: locale === "es" ? "Idioma" : "Locale", v: locale },
            { k: locale === "es" ? "Fecha" : "Date", v: new Date().toISOString().slice(0, 10) },
            { k: locale === "es" ? "Modelo" : "Model", v: locale === "es" ? "Ideal" : "Ideal" },
            { k: locale === "es" ? "Actividades" : "Activities", v: "No" },
            { k: "pH range", v: "0–14" },
          ].map(({ k, v }) => (
            <div key={k} className="flex justify-between text-[10px] bg-muted/20 rounded px-1.5 py-0.5">
              <span className="text-muted-foreground">{k}</span>
              <span className="font-mono">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {sessions.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-xs font-medium">{locale === "es" ? "Sesiones guardadas:" : "Saved sessions:"}</div>
          {sessions.map((s, i) => (
            <div key={i} className="flex justify-between items-center rounded border border-border/30 bg-muted/10 px-2 py-1.5">
              <div>
                <div className="text-[10px] font-mono text-muted-foreground">{s.ts}</div>
                {s.notes && <div className="text-[10px] text-foreground">{s.notes}</div>}
              </div>
              <Button size="sm" variant="ghost" className="text-[10px] h-6" onClick={() => handleExport(s.json, s.ts)}>
                {locale === "es" ? "Exportar" : "Export"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

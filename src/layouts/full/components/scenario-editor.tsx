import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { createSnapshot, serializeSnapshot, deserializeSnapshot, downloadSnapshot, validateImport } from "../engine/scenarios"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

const PRESETS = [
  { id: "simple-acid", label: { es: "Ácido simple", en: "Simple acid" }, inputs: { acid: "HCl", concentration: 0.1, pH: 1.0 } },
  { id: "buffer", label: { es: "Buffer acético", en: "Acetate buffer" }, inputs: { acid: "CH3COOH", base: "CH3COONa", cA: 0.1, cB: 0.1, pH: 4.76 } },
  { id: "edta-complex", label: { es: "EDTA + Cu²⁺", en: "EDTA + Cu²⁺" }, inputs: { metal: "Cu2+", ligand: "EDTA", cM: 0.01, cL: 0.012, pH: 5.0 } },
]

const DEFAULT_ASSUMPTIONS = { usesActivities: false, assumesIdealSolution: true, ignoresIonicStrength: true, validPHRange: [0, 14] as [number, number], validTempRange_C: [15, 35] as [number, number], notes: { es: "Modelo ideal docente", en: "Ideal teaching model" } }

export function ScenarioEditor({ locale }: Props) {
  const [selected, setSelected] = useState(PRESETS[0])
  const [notes, setNotes] = useState("")
  const [importResult, setImportResult] = useState<string | null>(null)

  const snap = createSnapshot(locale, selected.inputs, DEFAULT_ASSUMPTIONS, notes)
  const json = serializeSnapshot(snap)

  const handleExport = () => downloadSnapshot(snap)

  const handleImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.addEventListener("change", () => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        const text = reader.result as string
        const data = deserializeSnapshot(text)
        if (data) {
          const check = validateImport(data)
          setImportResult(check.valid
            ? locale === "es" ? "✓ Importación válida" : "✓ Valid import"
            : check.errors.join(", "))
        } else {
          setImportResult(locale === "es" ? "✗ JSON inválido" : "✗ Invalid JSON")
        }
      }
      reader.readAsText(file)
    })
    input.click()
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {locale === "es"
          ? "Esquema serializable: guarda/reabre sistemas con presets, condiciones y comentarios. Versionado JSON con validación."
          : "Serializable schema: save/reopen systems with presets, conditions and comments. Versioned JSON with validation."}
      </p>

      <Tabs defaultValue="compose">
        <TabsList>
          <TabsTrigger value="compose">{locale === "es" ? "Componer" : "Compose"}</TabsTrigger>
          <TabsTrigger value="preview">JSON</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <Button key={p.id} size="sm" variant={selected.id === p.id ? "default" : "outline"} onClick={() => setSelected(p)}>
                {p.label[locale]}
              </Button>
            ))}
          </div>

          <div className="rounded border border-border/40 bg-muted/20 p-2 space-y-1">
            {Object.entries(selected.inputs).map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-mono text-foreground">{String(v)}</span>
              </div>
            ))}
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={locale === "es" ? "Notas del usuario..." : "User notes..."}
            className="w-full rounded border border-border/40 bg-background p-2 text-xs h-16 resize-none"
          />

          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleExport}>
              {locale === "es" ? "Exportar JSON" : "Export JSON"}
            </Button>
            <Button size="sm" variant="outline" onClick={handleImport}>
              {locale === "es" ? "Importar" : "Import"}
            </Button>
          </div>
          {importResult && <p className="text-xs text-muted-foreground">{importResult}</p>}
        </TabsContent>

        <TabsContent value="preview">
          <pre className="rounded border border-border/40 bg-muted/20 p-2 text-[10px] font-mono overflow-x-auto max-h-48">{json}</pre>
        </TabsContent>
      </Tabs>
    </div>
  )
}

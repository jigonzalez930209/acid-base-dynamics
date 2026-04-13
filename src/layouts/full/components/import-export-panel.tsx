import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { validateImport } from "../engine/scenarios"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

const SAMPLE_CSV = `pH,alpha0,alpha1
0,0.999983,0.000017
2,0.998300,0.001700
4,0.852700,0.147300
4.76,0.500000,0.500000
7,0.001740,0.998260
10,0.000002,0.999998
14,0.000000,1.000000`

const SAMPLE_JSON = JSON.stringify({
  version: "1.0.0",
  timestamp: new Date().toISOString(),
  locale: "es",
  inputs: { acid: "CH3COOH", concentration: 0.1, temperature: 25 },
  modelAssumptions: { usesActivities: false, assumesIdealSolution: true },
  userNotes: "Ejemplo de exportación",
}, null, 2)

export function ImportExportPanel({ locale }: Props) {
  const [importResult, setImportResult] = useState<{ valid: boolean; errors: string[] } | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleImportFile = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json,.csv"
    input.addEventListener("change", () => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        const text = reader.result as string
        if (file.name.endsWith(".json")) {
          try {
            const parsed = JSON.parse(text)
            setImportResult(validateImport(parsed))
          } catch {
            setImportResult({ valid: false, errors: ["Invalid JSON"] })
          }
        } else {
          const lines = text.trim().split("\n")
          setImportResult({ valid: lines.length > 1, errors: lines.length <= 1 ? ["CSV must have header + data rows"] : [] })
        }
      }
      reader.readAsText(file)
    })
    input.click()
  }

  const handleExportCSV = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "speciation-data.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {locale === "es"
          ? "Importación/exportación de datos: CSV, JSON y plantillas tabulares con validación antes de importar."
          : "Data import/export: CSV, JSON and tabular templates with validation before import."}
      </p>

      <Tabs defaultValue="export">
        <TabsList>
          <TabsTrigger value="export">{locale === "es" ? "Exportar" : "Export"}</TabsTrigger>
          <TabsTrigger value="import">{locale === "es" ? "Importar" : "Import"}</TabsTrigger>
          <TabsTrigger value="templates">{locale === "es" ? "Plantillas" : "Templates"}</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-2">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleExportCSV}>CSV</Button>
            <Button size="sm" variant="outline" onClick={() => handleCopy(SAMPLE_JSON, "json")}>
              JSON {copied === "json" ? "✓" : ""}
            </Button>
          </div>
          <pre className="rounded border border-border/40 bg-muted/20 p-2 text-[9px] font-mono max-h-32 overflow-auto">{SAMPLE_CSV}</pre>
        </TabsContent>

        <TabsContent value="import" className="space-y-2">
          <Button size="sm" onClick={handleImportFile}>
            {locale === "es" ? "Seleccionar archivo (.json / .csv)" : "Select file (.json / .csv)"}
          </Button>
          {importResult && (
            <div className={`rounded p-2 text-xs ${importResult.valid ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}>
              {importResult.valid ? (locale === "es" ? "✓ Archivo válido" : "✓ Valid file") : importResult.errors.join(", ")}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-2">
          <div className="text-xs text-muted-foreground">{locale === "es" ? "Plantilla JSON de sesión:" : "Session JSON template:"}</div>
          <pre className="rounded border border-border/40 bg-muted/20 p-2 text-[9px] font-mono max-h-40 overflow-auto">{SAMPLE_JSON}</pre>
          <Button size="sm" variant="outline" onClick={() => handleCopy(SAMPLE_JSON, "template")}>
            {locale === "es" ? "Copiar plantilla" : "Copy template"} {copied === "template" ? "✓" : ""}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  )
}

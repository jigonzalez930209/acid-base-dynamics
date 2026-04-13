import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

const SAMPLE_REPORT = {
  brief: {
    es: `RESUMEN — Buffer Acético\npH = 4.76 (pKa ácido acético)\nCapacidad buffer: 0.058 mol/(L·pH)\nConcentración: 0.1 M CH₃COOH / 0.1 M CH₃COONa\nTemperatura: 25°C, Modelo: Ideal\n\nConclusión: Buffer efectivo en rango pH 3.8–5.8`,
    en: `SUMMARY — Acetate Buffer\npH = 4.76 (acetic acid pKa)\nBuffer capacity: 0.058 mol/(L·pH)\nConcentration: 0.1 M CH₃COOH / 0.1 M CH₃COONa\nTemperature: 25°C, Model: Ideal\n\nConclusion: Effective buffer in pH 3.8–5.8 range`,
  },
  technical: {
    es: `INFORME TÉCNICO — Análisis de Buffer Acético\n\n1. SISTEMA\n   Ácido: CH₃COOH (Ka = 1.74×10⁻⁵, pKa = 4.76)\n   Base conjugada: CH₃COONa\n   C_a = C_b = 0.100 M, V = 250 mL\n\n2. CONDICIONES\n   T = 25.0 ± 0.5 °C\n   I ≈ 0.1 M (contribución del NaCH₃COO)\n   Modelo: concentraciones (actividades no corregidas)\n\n3. RESULTADOS\n   pH teórico = pKa + log(Cb/Ca) = 4.76 + log(1) = 4.76\n   β = 2.303·C·α₀·α₁ = 2.303 × 0.1 × 0.5 × 0.5 = 0.058\n   Rango útil: pH = pKa ± 1 = 3.76–5.76\n\n4. SUPUESTOS\n   • Solución ideal (γ = 1)\n   • Sin corrección por temperatura\n   • Volumen aditivo\n\n5. FUENTE: Harris, Quantitative Chemical Analysis, 10th Ed.`,
    en: `TECHNICAL REPORT — Acetate Buffer Analysis\n\n1. SYSTEM\n   Acid: CH₃COOH (Ka = 1.74×10⁻⁵, pKa = 4.76)\n   Conjugate base: CH₃COONa\n   C_a = C_b = 0.100 M, V = 250 mL\n\n2. CONDITIONS\n   T = 25.0 ± 0.5 °C\n   I ≈ 0.1 M (NaCH₃COO contribution)\n   Model: concentrations (activities not corrected)\n\n3. RESULTS\n   Theoretical pH = pKa + log(Cb/Ca) = 4.76 + log(1) = 4.76\n   β = 2.303·C·α₀·α₁ = 2.303 × 0.1 × 0.5 × 0.5 = 0.058\n   Useful range: pH = pKa ± 1 = 3.76–5.76\n\n4. ASSUMPTIONS\n   • Ideal solution (γ = 1)\n   • No temperature correction\n   • Additive volume\n\n5. SOURCE: Harris, Quantitative Chemical Analysis, 10th Ed.`,
  },
}

export function PedagogicalExport({ locale }: Props) {
  const [mode, setMode] = useState<"brief" | "technical">("brief")
  const [copied, setCopied] = useState(false)

  const text = SAMPLE_REPORT[mode][locale]

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `report-${mode}-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {locale === "es"
          ? "Exportes pedagógicos y técnicos: formato breve para clase y técnico para laboratorio, con coherencia números-ecuaciones-narrativa."
          : "Pedagogical and technical exports: brief format for class and technical for lab, with number-equation-narrative coherence."}
      </p>

      <Select value={mode} onValueChange={(v) => setMode(v as "brief" | "technical")}>
        <SelectTrigger className="w-48 h-8 text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="brief">{locale === "es" ? "Formato breve (clase)" : "Brief format (class)"}</SelectItem>
          <SelectItem value="technical">{locale === "es" ? "Formato técnico (lab)" : "Technical format (lab)"}</SelectItem>
        </SelectContent>
      </Select>

      <pre className="rounded border border-border/40 bg-card p-3 text-[10px] font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">{text}</pre>

      <div className="flex gap-2 items-center">
        <Button size="sm" variant="outline" onClick={handleCopy}>
          {locale === "es" ? "Copiar" : "Copy"}
        </Button>
        <Button size="sm" variant="outline" onClick={handleDownload}>
          {locale === "es" ? "Descargar .txt" : "Download .txt"}
        </Button>
        {copied && <span className="text-xs text-emerald-600">✓</span>}
      </div>
    </div>
  )
}

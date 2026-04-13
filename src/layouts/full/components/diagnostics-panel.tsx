import { useState } from "react"
import { Button } from "@/components/ui/button"
import { solveAcidBase } from "../engine/solver"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

type DiagRun = { pKa: number; conc: number; label: string }

const TESTS: DiagRun[] = [
  { pKa: 4.76, conc: 0.1, label: "CH₃COOH 0.1 M" },
  { pKa: 4.76, conc: 1e-7, label: "CH₃COOH 1e-7 M (dilute)" },
  { pKa: -7, conc: 1.0, label: "HCl 1.0 M (strong)" },
  { pKa: 9.25, conc: 0.001, label: "NH₄⁺ 0.001 M" },
  { pKa: 2.16, conc: 0.5, label: "H₃PO₄ 0.5 M" },
]

export function DiagnosticsPanel({ locale }: Props) {
  const [results, setResults] = useState<{ test: DiagRun; result: ReturnType<typeof solveAcidBase> }[] | null>(null)

  const runAll = () => {
    setResults(TESTS.map((t) => ({ test: t, result: solveAcidBase([t.pKa], t.conc, "ideal") })))
  }

  const passed = results?.filter((r) => r.result.converged).length ?? 0
  const total = TESTS.length

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {locale === "es"
          ? "Diagnóstico numérico: convergencia, iteraciones, tolerancia, sensibilidad a condiciones iniciales y mensajes de error."
          : "Numerical diagnostics: convergence, iterations, tolerance, initial condition sensitivity, and error messages."}
      </p>

      <Button size="sm" onClick={runAll}>
        {locale === "es" ? "Ejecutar diagnóstico" : "Run diagnostics"}
      </Button>

      {results && (
        <>
          <div className={`rounded px-2 py-1 text-xs font-medium ${passed === total ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
            {locale === "es"
              ? `${passed}/${total} sistemas convergieron`
              : `${passed}/${total} systems converged`}
          </div>

          <div className="space-y-2">
            {results.map(({ test, result }, i) => (
              <div key={i} className="rounded border border-border/40 bg-card p-2 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium">{test.label}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded ${result.converged ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}>
                    {result.converged ? "✓ OK" : "✗ FAIL"}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1 text-[10px]">
                  <div className="rounded bg-muted/20 p-1 text-center">
                    <div className="text-muted-foreground">pH</div>
                    <div className="font-mono">{result.pH.toFixed(3)}</div>
                  </div>
                  <div className="rounded bg-muted/20 p-1 text-center">
                    <div className="text-muted-foreground">{locale === "es" ? "Iter" : "Iter"}</div>
                    <div className="font-mono">{result.iterations}</div>
                  </div>
                  <div className="rounded bg-muted/20 p-1 text-center">
                    <div className="text-muted-foreground">{locale === "es" ? "Residuo" : "Residual"}</div>
                    <div className="font-mono">{result.residual.toExponential(1)}</div>
                  </div>
                  <div className="rounded bg-muted/20 p-1 text-center">
                    <div className="text-muted-foreground">I (M)</div>
                    <div className="font-mono">{result.ionicStrength.toExponential(1)}</div>
                  </div>
                </div>

                {result.warnings.length > 0 && (
                  <div className="text-[9px] text-amber-600 dark:text-amber-400">
                    {result.warnings.map((w, j) => <span key={j}>⚠ {w[locale]} </span>)}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="rounded bg-muted/20 p-2 text-[10px] text-muted-foreground space-y-0.5">
            <div>{locale === "es" ? "Criterios de diagnóstico:" : "Diagnostic criteria:"}</div>
            <div>• {locale === "es" ? "Tolerancia: 1e-10" : "Tolerance: 1e-10"}</div>
            <div>• {locale === "es" ? "Max iteraciones: 200" : "Max iterations: 200"}</div>
            <div>• {locale === "es" ? "Espacio log-concentración para estabilidad" : "Log-concentration space for stability"}</div>
            <div>• {locale === "es" ? "Amortiguamiento Newton: factor 0.3, clamp ±1" : "Newton damping: factor 0.3, clamp ±1"}</div>
          </div>
        </>
      )}
    </div>
  )
}

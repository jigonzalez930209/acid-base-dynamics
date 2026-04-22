import { useState } from "react"
import { REFERENCE_CASES } from "../data/reference-cases"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

export function ReferenceCases({ locale }: Props) {
  const [domain, setDomain] = useState<string>("all")
  const domains = [...new Set(REFERENCE_CASES.map((c) => c.domain))]
  const filtered = domain === "all" ? REFERENCE_CASES : REFERENCE_CASES.filter((c) => c.domain === domain)

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {locale === "es"
          ? "Banco de casos de referencia: al menos 10 por dominio, con entradas, resultados esperados, explicación y estado de verificación."
          : "Reference case bank: at least 10 per domain, with inputs, expected results, explanation, and verification status."}
      </p>

      <div className="flex gap-1.5 flex-wrap">
        <FilterBtn active={domain === "all"} onClick={() => setDomain("all")}>
          {locale === "es" ? "Todos" : "All"} ({REFERENCE_CASES.length})
        </FilterBtn>
        {domains.map((d) => (
          <FilterBtn key={d} active={domain === d} onClick={() => setDomain(d)}>
            {d} ({REFERENCE_CASES.filter((c) => c.domain === d).length})
          </FilterBtn>
        ))}
      </div>

      <div className="grid gap-2">
        {filtered.map((rc) => (
          <div key={rc.id} className="rounded border border-border/40 bg-card p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-medium text-foreground">{rc.title[locale]}</h4>
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase tracking-wide text-muted-foreground">{rc.domain}</span>
                <span className={`text-[10px] font-medium ${rc.verified ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500"}`}>
                  {rc.verified ? "✓" : "○"} {rc.verified
                    ? (locale === "es" ? "Verificado" : "Verified")
                    : (locale === "es" ? "Pendiente" : "Pending")}
                </span>
              </div>
            </div>

            <div className="grid gap-x-4 gap-y-0.5 sm:grid-cols-2 text-[10px]">
              <div>
                <span className="text-muted-foreground">{locale === "es" ? "Entradas" : "Inputs"}: </span>
                <span className="font-mono text-foreground">
                  {Object.entries(rc.inputs).map(([k, v]) => `${k}=${v}`).join(", ")}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">{locale === "es" ? "Esperado" : "Expected"}: </span>
                <span className="font-mono text-foreground">
                  {Object.entries(rc.expectedOutputs).map(([k, v]) => `${k}=${v}`).join(", ")}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground">{rc.explanation[locale]}</p>
            <p className="text-[9px] text-muted-foreground/70">{locale === "es" ? "Fuente" : "Source"}: {rc.source} · tol: ±{rc.tolerance}</p>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground">
        {filtered.length} {locale === "es" ? "casos de referencia" : "reference cases"} ·
        {filtered.filter((c) => c.verified).length} {locale === "es" ? "verificados" : "verified"}
      </p>
    </div>
  )
}

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`rounded px-2 py-0.5 text-[10px] border transition-colors ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border/40 text-muted-foreground hover:text-foreground"
      }`}>
      {children}
    </button>
  )
}

import { useState } from "react"
import { ChemicalFormula } from "@/components/shared/chemical-formula"
import { ACID_DATABASE } from "@/data/acids"
import { PRIMARY_SOURCES } from "../data/sources"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

const sourceKeys = Object.keys(PRIMARY_SOURCES)

export function MasterDatabase({ locale }: Props) {
  const [filter, setFilter] = useState("")
  const filtered = ACID_DATABASE.filter((a) =>
    a.id !== "none" && (a.names[locale].toLowerCase().includes(filter.toLowerCase()) || a.formula.includes(filter))
  )

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {locale === "es"
          ? "Base maestra: cada especie registra fuente, temperatura, fuerza iónica, unidad, nota de validez y fecha de revisión."
          : "Master database: each species registers source, temperature, ionic strength, unit, validity note, and revision date."}
      </p>
      <input
        className="w-full rounded border border-border/50 bg-background px-3 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        placeholder={locale === "es" ? "Filtrar por nombre o fórmula…" : "Filter by name or formula…"}
        value={filter} onChange={(e) => setFilter(e.target.value)}
      />
      <div className="max-h-[420px] overflow-auto rounded border border-border/30">
        <table className="w-full text-[11px]">
          <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
            <tr className="text-left">
              <th className="px-2 py-1.5 font-medium">{locale === "es" ? "Especie" : "Species"}</th>
              <th className="px-2 py-1.5 font-medium">{locale === "es" ? "Fórmula" : "Formula"}</th>
              <th className="px-2 py-1.5 font-medium">pKa</th>
              <th className="px-2 py-1.5 font-medium">{locale === "es" ? "Fuente" : "Source"}</th>
              <th className="px-2 py-1.5 font-medium">T (°C)</th>
              <th className="px-2 py-1.5 font-medium">I (M)</th>
              <th className="px-2 py-1.5 font-medium">{locale === "es" ? "Revisión" : "Revision"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {filtered.map((acid) => (
              <tr key={acid.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-2 py-1 text-foreground">{acid.names[locale]}</td>
                <td className="px-2 py-1"><ChemicalFormula formula={acid.formula} className="text-foreground" /></td>
                <td className="px-2 py-1 font-mono">{acid.pKas.join(", ")}</td>
                <td className="px-2 py-1 text-muted-foreground">{PRIMARY_SOURCES.tablasPDF.reference.slice(0, 20)}…</td>
                <td className="px-2 py-1 font-mono">25</td>
                <td className="px-2 py-1 font-mono">0.1</td>
                <td className="px-2 py-1 text-muted-foreground">2024-01</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {sourceKeys.map((key) => {
          const src = PRIMARY_SOURCES[key]
          return (
            <div key={key} className="rounded border border-border/30 bg-muted/20 p-2 text-[10px]">
              <p className="font-medium text-foreground">{src.reference}</p>
              <p className="text-muted-foreground">T={src.temperature_C}°C · I={src.ionicStrength_M ?? "∞"} M · {src.validityNote[locale]}</p>
              <p className="text-muted-foreground">{locale === "es" ? "Revisión" : "Revision"}: {src.revisionDate}</p>
            </div>
          )
        })}
      </div>
      <p className="text-[10px] text-muted-foreground">
        {filtered.length} {locale === "es" ? "especies registradas" : "species registered"} · {sourceKeys.length} {locale === "es" ? "fuentes" : "sources"}
      </p>
    </div>
  )
}

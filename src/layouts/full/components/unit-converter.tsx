import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ALL_UNITS, convertUnits, formatConcentration } from "../engine/units"
import { MOLAR_MASSES } from "../data/sources"
import type { ConcentrationUnit } from "../engine/types"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

const speciesKeys = Object.keys(MOLAR_MASSES)

export function UnitConverter({ locale }: Props) {
  const [value, setValue] = useState(0.1)
  const [fromUnit, setFromUnit] = useState<ConcentrationUnit>("mol/L")
  const [species, setSpecies] = useState("NaOH")
  const mm = MOLAR_MASSES[species]

  const conversions = ALL_UNITS.filter((u) => u !== fromUnit).map((to) => {
    const r = convertUnits(value, fromUnit, to, mm?.M)
    return { to, ...r }
  })

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {locale === "es"
          ? "Conversor de unidades con soporte para mol/L, mmol/L, µmol/L, mg/L, ppm y %m/v. Advierte cuando la conversión depende de masa molar o densidad."
          : "Unit converter supporting mol/L, mmol/L, µmol/L, mg/L, ppm and %m/v. Warns when conversion depends on molar mass or density."}
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground">{locale === "es" ? "Especie" : "Species"}</label>
          <Select value={species} onValueChange={setSpecies}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {speciesKeys.map((k) => (
                <SelectItem key={k} value={k} className="text-xs">{MOLAR_MASSES[k].formula} ({MOLAR_MASSES[k].M} g/mol)</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground">{locale === "es" ? "Valor" : "Value"}</label>
          <input
            type="number" step="any" value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="w-full rounded border border-border/50 bg-background px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground">{locale === "es" ? "Unidad origen" : "Source unit"}</label>
          <Select value={fromUnit} onValueChange={(v) => setFromUnit(v as ConcentrationUnit)}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ALL_UNITS.map((u) => (
                <SelectItem key={u} value={u} className="text-xs">{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded border border-border/30 bg-muted/20 p-3 text-xs">
        <p className="font-medium text-foreground mb-2">{locale === "es" ? "Conversiones" : "Conversions"}</p>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {conversions.map(({ to, value: v, warning }) => (
            <div key={to} className="flex items-center justify-between rounded bg-background/50 px-2 py-1">
              <span className="text-muted-foreground">{to}</span>
              <span className="font-mono text-foreground">{formatConcentration(v, to)}</span>
              {warning && <span className="ml-1 text-[9px] text-amber-500">⚠</span>}
            </div>
          ))}
        </div>
      </div>

      {mm && (
        <p className="text-[10px] text-muted-foreground">
          M({mm.formula}) = {mm.M} g/mol · {mm.name[locale]} · ρ ≈ 1.0 g/mL (
          {locale === "es" ? "solución diluida acuosa" : "dilute aqueous solution"})
        </p>
      )}
    </div>
  )
}

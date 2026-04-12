import { ChemicalFormula } from "@/components/shared/chemical-formula"
import { buildEquilibriumEquations, formatComplexSpecies } from "@/features/advanced/complexation-math"
import { kfColor, type ComplexationSlot } from "@/features/advanced/complexation-explorer-shared"
import type { LigandRecord } from "@/features/advanced/complexation-db"
import type { Locale } from "@/features/chemistry/types/models"

type Props = {
  ligand: LigandRecord
  locale: Locale
  slots: ComplexationSlot[]
}

export function ComplexationExplorerEquations({ ligand, locale, slots }: Props) {
  return (
    <div className="space-y-5">
      {slots.map(({ metal, entry, color }, index) => {
        if (!entry) {
          return (
            <div key={index} className="rounded border border-border/40 p-3 text-xs text-muted-foreground">
              <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              {metal.symbol} — sin datos para {ligand.abbreviation}
            </div>
          )
        }

        const { stepwise, overall } = buildEquilibriumEquations(metal, ligand, entry)

        return (
          <div key={metal.id} className="space-y-3 rounded-md border border-border/40 bg-card/40 p-4">
            <p className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
              {metal.label[locale]} · {ligand.label[locale]}
            </p>
            {entry.notes && <p className="text-[10px] italic text-muted-foreground">{entry.notes[locale]}</p>}

            <div className="space-y-1.5">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Constantes escalonadas</p>
              {stepwise.map(({ equation, logK, n }) => (
                <div key={n} className="flex items-center justify-between gap-2 rounded border border-border/30 bg-muted/20 px-3 py-1.5">
                  <ChemicalFormula formula={equation} className="text-[11px] text-foreground" />
                  <span className={`shrink-0 font-mono text-[11px] font-semibold ${kfColor(logK * 2)}`}>
                    K<sub>{n}</sub> = 10<sup>{logK.toFixed(2)}</sup>
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Constantes globales β</p>
              {overall.map(({ equation, logBeta, n }) => (
                <div key={n} className="flex items-center justify-between gap-2 rounded border border-border/30 bg-muted/20 px-3 py-1.5">
                  <ChemicalFormula formula={equation} className="text-[11px] text-foreground" />
                  <span className={`shrink-0 font-mono text-[11px] font-semibold ${kfColor(logBeta)}`}>
                    β<sub>{n}</sub> = 10<sup>{logBeta.toFixed(2)}</sup>
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-0.5 rounded border border-border/30 bg-muted/10 px-3 py-2 font-mono text-[10px] text-muted-foreground">
              <p className="mb-1 text-[9px] uppercase tracking-widest text-muted-foreground/70">Balance de masas</p>
              <p>C<sub>T</sub> = [{metal.symbol}] + {formatComplexSpecies(metal.symbol, ligand.abbreviation)} + … + [{metal.symbol}{ligand.abbreviation}ₙ]</p>
              <p>C<sub>L</sub> = [{ligand.abbreviation}] + {formatComplexSpecies(metal.symbol, ligand.abbreviation)} + 2{formatComplexSpecies(metal.symbol, ligand.abbreviation, 2)} + … + n[{metal.symbol}{ligand.abbreviation}ₙ]</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
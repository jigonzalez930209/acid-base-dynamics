import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CHEMISTRY_DOMAINS } from "../data/domains"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

export function DomainExplorer({ locale }: Props) {
  const [selectedId, setSelectedId] = useState(CHEMISTRY_DOMAINS[0].id)
  const domain = CHEMISTRY_DOMAINS.find((d) => d.id === selectedId)!

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {locale === "es"
          ? "Catálogo de dominios: complejometría avanzada, Pourbaix, buffers multicomponente, especiación ambiental y métodos híbridos."
          : "Domain catalog: advanced complexometry, Pourbaix, multicomponent buffers, environmental speciation and hybrid methods."}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {CHEMISTRY_DOMAINS.map((d) => (
          <Button key={d.id} size="sm" variant={d.id === selectedId ? "default" : "outline"} onClick={() => setSelectedId(d.id)} className="text-xs">
            {d.icon} {d.name[locale]}
          </Button>
        ))}
      </div>

      <div className="rounded border border-border/40 bg-card p-3 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{domain.icon}</span>
          <span className="text-sm font-medium">{domain.name[locale]}</span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded ${domain.status === "active" ? "bg-emerald-500/10 text-emerald-600" : domain.status === "experimental" ? "bg-amber-500/10 text-amber-600" : "bg-muted text-muted-foreground"}`}>
            {domain.status}
          </span>
        </div>

        <p className="text-xs text-muted-foreground">{domain.description[locale]}</p>

        <div>
          <div className="text-[9px] text-muted-foreground mb-0.5">{locale === "es" ? "Tipos de equilibrio:" : "Equilibrium types:"}</div>
          <div className="flex flex-wrap gap-1">
            {domain.equilibriumTypes.map((t) => (
              <span key={t} className="rounded bg-blue-500/10 text-blue-600 px-1.5 py-0.5 text-[9px]">{t}</span>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[9px] text-muted-foreground mb-0.5">{locale === "es" ? "Observables típicos:" : "Typical observables:"}</div>
          <div className="flex flex-wrap gap-1">
            {domain.typicalObservables.map((o) => (
              <span key={o} className="rounded bg-muted/40 px-1.5 py-0.5 text-[9px] font-mono">{o}</span>
            ))}
          </div>
        </div>

        {domain.crossDomainLinks.length > 0 && (
          <div>
            <div className="text-[9px] text-muted-foreground mb-0.5">{locale === "es" ? "Conexiones:" : "Cross-domain links:"}</div>
            <div className="flex flex-wrap gap-1">
              {domain.crossDomainLinks.map((l) => (
                <span key={l} className="rounded bg-violet-500/10 text-violet-600 px-1.5 py-0.5 text-[9px]">{l}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

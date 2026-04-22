import { SAMPLE_PLUGINS } from "../data/domains"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

export function PluginViewer({ locale }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {locale === "es"
          ? "Arquitectura de plugins: cada dominio se conecta al mismo núcleo de especies, equilibrios, observables y render sin duplicar infraestructura."
          : "Plugin architecture: each domain connects to the same core of species, equilibria, observables and render without duplicating infrastructure."}
      </p>

      <div className="rounded border border-border/40 bg-card p-3 space-y-3">
        <div className="text-xs font-medium">{locale === "es" ? "Arquitectura del núcleo:" : "Core architecture:"}</div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { layer: locale === "es" ? "Datos" : "Data", items: ["species", "equilibria", "sources"] },
            { layer: locale === "es" ? "Motor" : "Engine", items: ["solver", "activity", "temperature"] },
            { layer: "UI", items: ["render", "charts", "export"] },
          ].map((l) => (
            <div key={l.layer} className="rounded bg-muted/20 p-2">
              <div className="text-[10px] font-medium text-primary mb-1">{l.layer}</div>
              {l.items.map((item) => (
                <div key={item} className="text-[9px] text-muted-foreground font-mono">{item}</div>
              ))}
            </div>
          ))}
        </div>

        <div className="text-center text-[10px] text-muted-foreground">↕ Plugin API ↕</div>

        <div className="text-xs font-medium">{locale === "es" ? "Plugins registrados:" : "Registered plugins:"}</div>
        {SAMPLE_PLUGINS.map((p) => (
          <div key={p.id} className="rounded border border-border/30 bg-muted/10 p-2.5 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium">{p.name[locale]}</span>
              <span className="text-[9px] bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded">v{p.version}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">{p.description[locale]}</p>
            <div className="flex flex-wrap gap-1">
              <span className="text-[9px] text-muted-foreground">{locale === "es" ? "Autor:" : "Author:"}</span>
              <span className="text-[9px] font-mono">{p.author}</span>
            </div>
            <div>
              <div className="text-[9px] text-muted-foreground">{locale === "es" ? "Dominios:" : "Domains:"}</div>
              <div className="flex gap-1">
                {p.domains.map((d) => <span key={d} className="text-[9px] bg-violet-500/10 text-violet-600 rounded px-1 py-0.5">{d}</span>)}
              </div>
            </div>
            <div>
              <div className="text-[9px] text-muted-foreground">{locale === "es" ? "Provee:" : "Provides:"}</div>
              <div className="flex gap-1 flex-wrap">
                {p.provides.species.map((s) => <span key={s} className="text-[9px] bg-emerald-500/10 text-emerald-600 rounded px-1 py-0.5">{s}</span>)}
                {p.provides.equilibria.map((e) => <span key={e} className="text-[9px] bg-cyan-500/10 text-cyan-600 rounded px-1 py-0.5">{e}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded bg-muted/20 p-2 text-[10px] text-muted-foreground">
        {locale === "es"
          ? "Cada plugin declara un manifest con: id, versión, dominios, especies y equilibrios provistos. Se valida contra el núcleo antes de cargar."
          : "Each plugin declares a manifest with: id, version, domains, species and equilibria provided. Validated against core before loading."}
      </div>
    </div>
  )
}

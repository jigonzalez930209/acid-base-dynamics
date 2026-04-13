import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

type APIEndpoint = {
  method: string
  path: string
  description: { es: string; en: string }
  request?: string
  response?: string
}

const API_SPEC: APIEndpoint[] = [
  { method: "POST", path: "/api/solve", description: { es: "Resolver sistema de equilibrio", en: "Solve equilibrium system" }, request: '{ species: [...], equilibria: [...], massBalances: [...] }', response: '{ pH, converged, concentrations, ... }' },
  { method: "GET", path: "/api/species", description: { es: "Obtener catálogo de especies", en: "Get species catalog" }, response: '[{ id, formula, charge, ... }]' },
  { method: "GET", path: "/api/reference-cases", description: { es: "Obtener casos de referencia", en: "Get reference cases" }, response: '[{ id, domain, title, ... }]' },
  { method: "POST", path: "/api/validate", description: { es: "Validar caso contra referencia", en: "Validate case against reference" }, request: '{ caseId, inputs }', response: '{ passed, results: [...] }' },
  { method: "POST", path: "/api/export", description: { es: "Exportar sesión", en: "Export session" }, request: '{ format: "csv"|"json", data }', response: 'Blob' },
]

const INTEGRATIONS = [
  { name: "LIMS", icon: "🏥", status: "planned" as const, notes: { es: "Contrato REST para enviar resultados a sistemas LIMS", en: "REST contract for sending results to LIMS systems" } },
  { name: "Jupyter", icon: "📓", status: "planned" as const, notes: { es: "Exportar como notebook con cálculos reproducibles", en: "Export as notebook with reproducible calculations" } },
  { name: "LMS/Moodle", icon: "🎓", status: "planned" as const, notes: { es: "Integración con plataformas docentes vía LTI", en: "Integration with teaching platforms via LTI" } },
  { name: "CSV/Excel", icon: "📊", status: "active" as const, notes: { es: "Importar/exportar datos tabulares", en: "Import/export tabular data" } },
]

const STATUS_COLORS = { active: "bg-emerald-500/10 text-emerald-600", planned: "bg-blue-500/10 text-blue-600" }

export function IntegrationAPI({ locale }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {locale === "es"
          ? "Contratos de integración: LIMS, cuadernos digitales, repositorios docentes. Sin acoplar la UI a un proveedor concreto."
          : "Integration contracts: LIMS, digital notebooks, teaching repositories. Without coupling UI to a specific provider."}
      </p>

      <div className="rounded border border-border/40 bg-card p-3 space-y-2">
        <div className="text-xs font-medium">{locale === "es" ? "API endpoints (contrato):" : "API endpoints (contract):"}</div>
        <div className="space-y-1.5">
          {API_SPEC.map((ep, i) => (
            <div key={i} className="rounded bg-muted/20 p-2 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-mono font-bold px-1 rounded ${ep.method === "GET" ? "bg-emerald-500/10 text-emerald-600" : "bg-blue-500/10 text-blue-600"}`}>
                  {ep.method}
                </span>
                <span className="text-[10px] font-mono text-foreground">{ep.path}</span>
              </div>
              <div className="text-[10px] text-muted-foreground">{ep.description[locale]}</div>
              {ep.request && <div className="text-[9px] font-mono text-muted-foreground">→ {ep.request}</div>}
              {ep.response && <div className="text-[9px] font-mono text-muted-foreground">← {ep.response}</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded border border-border/40 bg-card p-3 space-y-2">
        <div className="text-xs font-medium">{locale === "es" ? "Integraciones:" : "Integrations:"}</div>
        <div className="grid grid-cols-2 gap-2">
          {INTEGRATIONS.map((intg) => (
            <div key={intg.name} className="rounded border border-border/30 p-2 space-y-1">
              <div className="flex items-center gap-1.5">
                <span>{intg.icon}</span>
                <span className="text-xs font-medium">{intg.name}</span>
                <span className={`text-[8px] px-1 rounded ${STATUS_COLORS[intg.status]}`}>{intg.status}</span>
              </div>
              <div className="text-[10px] text-muted-foreground">{intg.notes[locale]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { DomainExplorer } from "../components/domain-explorer"
import { ImportExportPanel } from "../components/import-export-panel"
import { PluginViewer } from "../components/plugin-viewer"
import { IntegrationAPI } from "../components/integration-api"
import { GovernancePanel } from "../components/governance-panel"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

const TASKS = [
  { id: "p7t1", title: { es: "1. Catálogo de dominios", en: "1. Domain catalog" } },
  { id: "p7t2", title: { es: "2. Importación/exportación", en: "2. Import/export" } },
  { id: "p7t3", title: { es: "3. Arquitectura de plugins", en: "3. Plugin architecture" } },
  { id: "p7t4", title: { es: "4. Integración con flujos externos", en: "4. External flow integration" } },
  { id: "p7t5", title: { es: "5. Gobernanza y calidad", en: "5. Governance and quality" } },
]

const COMPONENTS = [DomainExplorer, ImportExportPanel, PluginViewer, IntegrationAPI, GovernancePanel]

export function Phase7View({ locale }: Props) {
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-bold">
        {locale === "es" ? "Fase 7 · Escalado, interoperabilidad y ecosistema" : "Phase 7 · Scaling, interoperability and ecosystem"}
      </h2>
      <Accordion type="single" collapsible defaultValue="p7t1">
        {TASKS.map((t, i) => {
          const Comp = COMPONENTS[i]
          return (
            <AccordionItem key={t.id} value={t.id}>
              <AccordionTrigger className="text-xs">{t.title[locale]}</AccordionTrigger>
              <AccordionContent><Comp locale={locale} /></AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}

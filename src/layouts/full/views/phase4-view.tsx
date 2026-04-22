import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { PredominanceMap2D } from "../components/predominance-map-2d"
import { ScenarioComparison } from "../components/scenario-comparison"
import { SensitivityBands } from "../components/sensitivity-bands"
import { OperatingWindow } from "../components/operating-window"
import { ReportExport } from "../components/report-export"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

const TASKS = [
  { id: "p4t1", title: { es: "1. Mapas de predominio 2D", en: "1. 2D predominance maps" } },
  { id: "p4t2", title: { es: "2. Comparativa multi-escenario", en: "2. Multi-scenario comparison" } },
  { id: "p4t3", title: { es: "3. Sensibilidad e incertidumbre", en: "3. Sensitivity and uncertainty" } },
  { id: "p4t4", title: { es: "4. Ventanas operativas", en: "4. Operating windows" } },
  { id: "p4t5", title: { es: "5. Salidas para informe", en: "5. Report outputs" } },
]

const COMPONENTS = [PredominanceMap2D, ScenarioComparison, SensitivityBands, OperatingWindow, ReportExport]

export function Phase4View({ locale }: Props) {
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-bold">
        {locale === "es" ? "Fase 4 · Visualización analítica avanzada" : "Phase 4 · Advanced analytical visualization"}
      </h2>
      <Accordion type="single" collapsible defaultValue="p4t1">
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

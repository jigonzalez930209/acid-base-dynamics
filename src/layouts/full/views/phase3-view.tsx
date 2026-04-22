import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { SolverPanel } from "../components/solver-panel"
import { BalanceChecker } from "../components/balance-checker"
import { ActivityPanel } from "../components/activity-panel"
import { TempCorrectionPanel } from "../components/temp-correction-panel"
import { DiagnosticsPanel } from "../components/diagnostics-panel"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

const TASKS = [
  { id: "p3t1", title: { es: "1. Solver multicomponente", en: "1. Multicomponent solver" } },
  { id: "p3t2", title: { es: "2. Balance global carga/masa", en: "2. Global charge/mass balance" } },
  { id: "p3t3", title: { es: "3. Correcciones por actividad", en: "3. Activity corrections" } },
  { id: "p3t4", title: { es: "4. Correcciones por temperatura", en: "4. Temperature corrections" } },
  { id: "p3t5", title: { es: "5. Estabilidad y diagnóstico", en: "5. Stability and diagnostics" } },
]

const COMPONENTS = [SolverPanel, BalanceChecker, ActivityPanel, TempCorrectionPanel, DiagnosticsPanel]

export function Phase3View({ locale }: Props) {
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-bold">
        {locale === "es" ? "Fase 3 · Motor universal de equilibrio" : "Phase 3 · Universal equilibrium engine"}
      </h2>
      <Accordion type="single" collapsible defaultValue="p3t1">
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

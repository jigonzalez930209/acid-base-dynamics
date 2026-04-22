import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { SolutionPrep } from "../components/solution-prep"
import { TitrationPlanner } from "../components/titration-planner"
import { InterferencePanel } from "../components/interference-panel"
import { MatrixPresetsPanel } from "../components/matrix-presets-panel"
import { MethodCard } from "../components/method-card"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

const TASKS = [
  { id: "p5t1", title: { es: "1. Preparación de soluciones", en: "1. Solution preparation" } },
  { id: "p5t2", title: { es: "2. Planificación de titulaciones", en: "2. Titration planning" } },
  { id: "p5t3", title: { es: "3. Evaluación de interferencias", en: "3. Interference evaluation" } },
  { id: "p5t4", title: { es: "4. Presets de matrices", en: "4. Matrix presets" } },
  { id: "p5t5", title: { es: "5. Fichas operativas", en: "5. Method sheets" } },
]

const COMPONENTS = [SolutionPrep, TitrationPlanner, InterferencePanel, MatrixPresetsPanel, MethodCard]

export function Phase5View({ locale }: Props) {
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-bold">
        {locale === "es" ? "Fase 5 · Flujo de trabajo de laboratorio" : "Phase 5 · Laboratory workflow"}
      </h2>
      <Accordion type="single" collapsible defaultValue="p5t1">
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

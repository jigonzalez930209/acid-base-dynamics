import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { ExplanationViewer } from "../components/explanation-viewer"
import { LearningPathPanel } from "../components/learning-path-panel"
import { SessionManager } from "../components/session-manager"
import { PedagogicalExport } from "../components/pedagogical-export"
import { AccessibilityPanel } from "../components/accessibility-panel"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

const TASKS = [
  { id: "p6t1", title: { es: "1. Motor de explicación paso a paso", en: "1. Step-by-step explanation engine" } },
  { id: "p6t2", title: { es: "2. Rutas guiadas de aprendizaje", en: "2. Guided learning paths" } },
  { id: "p6t3", title: { es: "3. Guardado reproducible", en: "3. Reproducible saving" } },
  { id: "p6t4", title: { es: "4. Exportes pedagógicos/técnicos", en: "4. Pedagogical/technical exports" } },
  { id: "p6t5", title: { es: "5. Accesibilidad y lectura técnica", en: "5. Accessibility and technical reading" } },
]

const COMPONENTS = [ExplanationViewer, LearningPathPanel, SessionManager, PedagogicalExport, AccessibilityPanel]

export function Phase6View({ locale }: Props) {
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-bold">
        {locale === "es" ? "Fase 6 · Docencia, explicación y reproducibilidad" : "Phase 6 · Teaching, explanation and reproducibility"}
      </h2>
      <Accordion type="single" collapsible defaultValue="p6t1">
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

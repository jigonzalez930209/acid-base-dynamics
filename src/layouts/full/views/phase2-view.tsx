import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { SpeciesDescriptorEditor } from "../components/species-descriptor-editor"
import { EquilibriumDescriptorEditor } from "../components/equilibrium-descriptor-editor"
import { BalanceViewer } from "../components/balance-viewer"
import { ScenarioEditor } from "../components/scenario-editor"
import { RenderDemo } from "../components/render-demo"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

const TASKS = [
  { id: "p2t1", title: { es: "1. Descriptor de especies", en: "1. Species descriptor" } },
  { id: "p2t2", title: { es: "2. Descriptor de equilibrios", en: "2. Equilibrium descriptor" } },
  { id: "p2t3", title: { es: "3. Descriptores de balances", en: "3. Balance descriptors" } },
  { id: "p2t4", title: { es: "4. Esquema serializable (DSL)", en: "4. Serializable schema (DSL)" } },
  { id: "p2t5", title: { es: "5. Render químico unificado", en: "5. Unified chemical render" } },
]

const COMPONENTS = [SpeciesDescriptorEditor, EquilibriumDescriptorEditor, BalanceViewer, ScenarioEditor, RenderDemo]

export function Phase2View({ locale }: Props) {
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-bold">
        {locale === "es" ? "Fase 2 · Lenguaje químico unificado" : "Phase 2 · Unified chemical language"}
      </h2>
      <Accordion type="single" collapsible defaultValue="p2t1">
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

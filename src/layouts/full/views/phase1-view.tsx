import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { MasterDatabase } from "../components/master-database"
import { ValidationMatrix } from "../components/validation-matrix"
import { UnitConverter } from "../components/unit-converter"
import { ModelAssumptions } from "../components/model-assumptions"
import { ReferenceCases } from "../components/reference-cases"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

const TASKS = [
  { id: "p1t1", title: { es: "1. Base maestra de datos químicos", en: "1. Master chemical database" } },
  { id: "p1t2", title: { es: "2. Matriz de validación cruzada", en: "2. Cross-validation matrix" } },
  { id: "p1t3", title: { es: "3. Unidades y conversiones", en: "3. Units and conversions" } },
  { id: "p1t4", title: { es: "4. Supuestos del modelo", en: "4. Model assumptions" } },
  { id: "p1t5", title: { es: "5. Banco de casos de referencia", en: "5. Reference case bank" } },
]

const COMPONENTS = [MasterDatabase, ValidationMatrix, UnitConverter, ModelAssumptions, ReferenceCases]

export function Phase1View({ locale }: Props) {
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-bold">
        {locale === "es" ? "Fase 1 · Blindaje científico y trazabilidad" : "Phase 1 · Scientific shielding and traceability"}
      </h2>
      <Accordion type="single" collapsible defaultValue="p1t1">
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

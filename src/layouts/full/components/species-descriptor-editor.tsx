import { useState } from "react"
import { ChemicalFormula } from "@/components/shared/chemical-formula"
import type { Locale } from "@/features/chemistry/types/models"
import type { SpeciesDescriptor } from "../engine/types"

type Props = { locale: Locale }

const DEMO_SPECIES: SpeciesDescriptor[] = [
  { id: "h3po4", formula: "H₃PO₄", charge: 0, acidBaseState: "fully_protonated", stoichiometry: { H: 3, P: 1, O: 4 },
    names: { es: "Ácido fosfórico", en: "Phosphoric acid" }, aliases: ["orthophosphoric"], phase: "aqueous", hydration: 0, renderFormula: "H3PO4" },
  { id: "h2po4", formula: "H₂PO₄⁻", charge: -1, acidBaseState: "intermediate", stoichiometry: { H: 2, P: 1, O: 4 },
    names: { es: "Dihidrogenofosfato", en: "Dihydrogen phosphate" }, aliases: ["H2PO4-"], phase: "aqueous", hydration: 0, renderFormula: "H2PO4-" },
  { id: "hpo4", formula: "HPO₄²⁻", charge: -2, acidBaseState: "intermediate", stoichiometry: { H: 1, P: 1, O: 4 },
    names: { es: "Hidrogenofosfato", en: "Hydrogen phosphate" }, aliases: ["HPO42-"], phase: "aqueous", hydration: 0, renderFormula: "HPO4^2-" },
  { id: "po4", formula: "PO₄³⁻", charge: -3, acidBaseState: "fully_deprotonated", stoichiometry: { P: 1, O: 4 },
    names: { es: "Fosfato", en: "Phosphate" }, aliases: ["PO43-"], phase: "aqueous", hydration: 0, renderFormula: "PO4^3-" },
  { id: "cu-edta", formula: "[CuY]²⁻", charge: -2, acidBaseState: "neutral", stoichiometry: { Cu: 1, C: 10, H: 12, N: 2, O: 8 },
    names: { es: "Complejo Cu-EDTA", en: "Cu-EDTA complex" }, aliases: ["CuY2-"], phase: "aqueous", hydration: 0, renderFormula: "[CuY]^{2-}" },
  { id: "fe-oh3-s", formula: "Fe(OH)₃", charge: 0, acidBaseState: "neutral", stoichiometry: { Fe: 1, O: 3, H: 3 },
    names: { es: "Hidróxido férrico (sólido)", en: "Ferric hydroxide (solid)" }, aliases: ["rust"], phase: "solid", hydration: 0, renderFormula: "Fe(OH)3" },
]

const STATE_LABELS: Record<string, { es: string; en: string }> = {
  fully_protonated: { es: "Totalmente protonado", en: "Fully protonated" },
  intermediate: { es: "Intermedio", en: "Intermediate" },
  fully_deprotonated: { es: "Totalmente desprotonado", en: "Fully deprotonated" },
  neutral: { es: "Neutro / complejo", en: "Neutral / complex" },
}

const PHASE_LABELS: Record<string, { es: string; en: string }> = {
  aqueous: { es: "Acuoso (aq)", en: "Aqueous (aq)" },
  solid: { es: "Sólido (s)", en: "Solid (s)" },
  gas: { es: "Gas (g)", en: "Gas (g)" },
  liquid: { es: "Líquido (l)", en: "Liquid (l)" },
}

export function SpeciesDescriptorEditor({ locale }: Props) {
  const [selected, setSelected] = useState(0)
  const sp = DEMO_SPECIES[selected]

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {locale === "es"
          ? "Descriptor universal de especies: fórmula, carga, estado ácido-base, estequiometría, nombre localizado, alias, fase, hidratación y render."
          : "Universal species descriptor: formula, charge, acid-base state, stoichiometry, localized name, alias, phase, hydration, and rendering."}
      </p>

      <div className="flex gap-1.5 flex-wrap">
        {DEMO_SPECIES.map((sp, i) => (
          <button key={sp.id} onClick={() => setSelected(i)}
            className={`rounded px-2 py-0.5 text-[10px] border transition-colors ${i === selected ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:text-foreground"}`}>
            <ChemicalFormula formula={sp.renderFormula} className="text-inherit" />
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="ID" value={sp.id} />
        <Field label={locale === "es" ? "Fórmula" : "Formula"}>
          <ChemicalFormula formula={sp.renderFormula} className="text-foreground" />
        </Field>
        <Field label={locale === "es" ? "Carga" : "Charge"} value={sp.charge === 0 ? "0" : `${sp.charge > 0 ? "+" : ""}${sp.charge}`} />
        <Field label={locale === "es" ? "Estado ácido-base" : "Acid-base state"} value={STATE_LABELS[sp.acidBaseState]?.[locale] ?? sp.acidBaseState} />
        <Field label={locale === "es" ? "Estequiometría" : "Stoichiometry"} value={Object.entries(sp.stoichiometry).map(([el, n]) => `${el}${n > 1 ? n : ""}`).join("")} />
        <Field label={locale === "es" ? "Nombre" : "Name"} value={sp.names[locale]} />
        <Field label="Aliases" value={sp.aliases.join(", ")} />
        <Field label={locale === "es" ? "Fase" : "Phase"} value={PHASE_LABELS[sp.phase]?.[locale] ?? sp.phase} />
      </div>
    </div>
  )
}

function Field({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="rounded bg-muted/30 px-2.5 py-1.5">
      <p className="text-[9px] text-muted-foreground">{label}</p>
      {children ?? <p className="text-xs font-mono text-foreground">{value}</p>}
    </div>
  )
}

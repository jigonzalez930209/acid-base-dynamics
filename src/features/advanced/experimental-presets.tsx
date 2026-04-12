import { useTranslation } from "react-i18next"
import { Beaker } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale; onApply: (acidId: string, pH: number) => void }

const PRESETS = [
  {
    id: "acetato", acidId: "acetico", pH: 4.75,
    name: { es: "Buffer acetato", en: "Acetate buffer" },
    desc: {
      es: "pH 4.75 · Máxima β del par CH₃COOH/CH₃COO⁻. Uso: electroforesis, calibración de electrodos.",
      en: "pH 4.75 · Maximum β of CH₃COOH/CH₃COO⁻ pair. Use: electrophoresis, electrode calibration.",
    },
  },
  {
    id: "fosfato", acidId: "fosforico", pH: 7.2,
    name: { es: "Fosfato fisiológico (PBS)", en: "Physiological phosphate (PBS)" },
    desc: {
      es: "pH 7.2 · Par H₂PO₄⁻/HPO₄²⁻. Tampón intracelular estándar y base del PBS biológico.",
      en: "pH 7.2 · H₂PO₄⁻/HPO₄²⁻ pair. Standard intracellular buffer and biological PBS base.",
    },
  },
  {
    id: "carbonato", acidId: "carbonico", pH: 7.4,
    name: { es: "Sistema carbónico sanguíneo", en: "Blood carbonate system" },
    desc: {
      es: "pH 7.4 · CO₂/HCO₃⁻ vía Henderson-Hasselbalch. Regulación del pH arterial.",
      en: "pH 7.4 · CO₂/HCO₃⁻ via Henderson-Hasselbalch. Arterial blood pH regulation.",
    },
  },
  {
    id: "citrico", acidId: "citrico", pH: 4.5,
    name: { es: "Buffer cítrico", en: "Citric buffer" },
    desc: {
      es: "pH 4.5 · Tricarboxílico. Alta capacidad tampón. Uso alimentario y farmacéutico.",
      en: "pH 4.5 · Tricarboxylic. High buffer capacity. Food and pharmaceutical use.",
    },
  },
]

export function ExperimentalPresets({ locale, onApply }: Props) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground">{t("advanced.presets.title")}</h3>
      <p className="text-xs text-muted-foreground">{t("advanced.presets.description")}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {PRESETS.map((p) => (
          <div key={p.id} className="flex flex-col gap-3 rounded-md border border-border/50 bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Beaker className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{p.name[locale]}</span>
              </div>
              <span className="shrink-0 font-mono text-xs text-muted-foreground">pH {p.pH}</span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{p.desc[locale]}</p>
            <Button variant="outline" size="sm" className="mt-auto self-start gap-1.5 text-xs"
              onClick={() => onApply(p.acidId, p.pH)}>
              {t("advanced.presets.apply")}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

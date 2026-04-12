import { useState, useCallback } from "react"
import { useTranslation } from "react-i18next"

import { Separator } from "@/components/ui/separator"
import { useAdvanced } from "@/features/advanced/advanced-context"
import { AccordionSection } from "@/features/advanced/accordion-section"
import { SpeciesDescriptorCard } from "@/features/advanced/species-descriptor-card"
import { PredominanceChart } from "@/features/advanced/predominance-chart"
import { BufferCapacityChart } from "@/features/advanced/buffer-capacity-chart"
import { SensitivityPanel } from "@/features/advanced/sensitivity-panel"
import { StepResolverPanel } from "@/features/advanced/step-resolver-panel"
import { ExportButton } from "@/features/advanced/export-button"
import { TemperatureOverlay } from "@/features/advanced/temperature-overlay"
import { MultiScenarioChart } from "@/features/advanced/multi-scenario-chart"
import { ExperimentalPresets } from "@/features/advanced/experimental-presets"
import { RedoxPanel } from "@/features/advanced/redox-panel"
import { PrecipitationPanel } from "@/features/advanced/precipitation-panel"
import { ComplexationPanel } from "@/features/advanced/complexation-panel"
import type { ActiveSlot, Locale } from "@/features/chemistry/types/models"

type Props = {
  activeSlots: ActiveSlot[]
  globalPH: number
  locale: Locale
  onApplyPreset: (acidId: string, pH: number) => void
}

const ALL_IDS = [
  "presets", "species", "predominance", "temperature",
  "buffer", "multiscenario", "sensitivity", "resolver",
  "redox", "precipitation", "complexation", "export",
]

export function AdvancedPanel({ activeSlots, globalPH, locale, onApplyPreset }: Props) {
  const { advanced } = useAdvanced()
  const { t } = useTranslation()
  const [open, setOpen] = useState<Set<string>>(new Set(["presets"]))

  const toggle = useCallback((id: string) => {
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }, [])

  const openAll  = () => setOpen(new Set(ALL_IDS))
  const closeAll = () => setOpen(new Set())

  if (!advanced) return null
  const has = activeSlots.length > 0

  const S = (id: string, title: string, badge?: string) => ({ id, title, badge, open: open.has(id), onToggle: toggle })

  return (
    <section className="mt-10 space-y-3">
      <div className="flex items-center gap-3">
        <Separator className="flex-1 opacity-30" />
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {t("advanced.panel.title")}
        </span>
        <Separator className="flex-1 opacity-30" />
      </div>

      <div className="flex justify-end gap-2 pb-1">
        <button onClick={openAll}
          className="rounded border border-border/40 px-2.5 py-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
          {t("advanced.panel.openAll")}
        </button>
        <button onClick={closeAll}
          className="rounded border border-border/40 px-2.5 py-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors">
          {t("advanced.panel.closeAll")}
        </button>
      </div>

      <div className="space-y-2">
        {/* Phase 4 — Presets (always available) */}
        <AccordionSection {...S("presets", t("advanced.presets.title"), "Fase 4")}>
          <ExperimentalPresets locale={locale} onApply={onApplyPreset} />
        </AccordionSection>

        {/* Phase 2 — Species descriptors */}
        {has && (
          <AccordionSection {...S("species", t("advanced.species.sectionTitle"), "Fase 2")}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeSlots.map((s) => <SpeciesDescriptorCard key={s.acid.id} slot={s} locale={locale} />)}
            </div>
          </AccordionSection>
        )}

        {/* Phase 3 — Predominance */}
        {has && (
          <AccordionSection {...S("predominance", t("advanced.predominance.title"), "Fase 3")}>
            <PredominanceChart activeSlots={activeSlots} locale={locale} />
          </AccordionSection>
        )}

        {/* Phase 3 — Temperature */}
        {has && (
          <AccordionSection {...S("temperature", t("advanced.temperature.title"), "Fase 3")}>
            <TemperatureOverlay activeSlots={activeSlots} locale={locale} />
          </AccordionSection>
        )}

        {/* Phase 1/3 — Buffer capacity */}
        {has && (
          <AccordionSection {...S("buffer", t("advanced.bufferCapacity.title"), "Fase 3")}>
            <BufferCapacityChart activeSlots={activeSlots} globalPH={globalPH} />
          </AccordionSection>
        )}

        {/* Phase 3 — Multi-scenario */}
        {has && (
          <AccordionSection {...S("multiscenario", t("advanced.multiScenario.title"), "Fase 3")}>
            <MultiScenarioChart activeSlots={activeSlots} locale={locale} />
          </AccordionSection>
        )}

        {/* Phase 3 — Sensitivity */}
        {has && (
          <AccordionSection {...S("sensitivity", t("advanced.sensitivity.title"), "Fase 3")}>
            <SensitivityPanel activeSlots={activeSlots} globalPH={globalPH} locale={locale} />
          </AccordionSection>
        )}

        {/* Phase 4 — Step resolver */}
        {has && (
          <AccordionSection {...S("resolver", t("advanced.resolver.title"), "Fase 4")}>
            <StepResolverPanel activeSlots={activeSlots} globalPH={globalPH} locale={locale} />
          </AccordionSection>
        )}

        {/* Phase 5 — Redox */}
        <AccordionSection {...S("redox", t("advanced.redox.title"), "Fase 5")}>
          <RedoxPanel locale={locale} />
        </AccordionSection>

        {/* Phase 5 — Precipitation */}
        <AccordionSection {...S("precipitation", t("advanced.precipitation.title"), "Fase 5")}>
          <PrecipitationPanel locale={locale} />
        </AccordionSection>

        {/* Phase 5 — Complexation */}
        <AccordionSection {...S("complexation", t("advanced.complexation.title"), "Fase 5")}>
          <ComplexationPanel locale={locale} />
        </AccordionSection>

        {/* Phase 5 — Export */}
        {has && (
          <AccordionSection {...S("export", t("advanced.export.title"), "Fase 5")}>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{t("advanced.export.description")}</p>
              <ExportButton activeSlots={activeSlots} locale={locale} />
            </div>
          </AccordionSection>
        )}
      </div>
    </section>
  )
}


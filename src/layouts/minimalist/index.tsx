import { useRef } from "react"
import { useTranslation } from "react-i18next"

import { Separator } from "@/components/ui/separator"
import { LanguageSwitcher } from "@/features/i18n/language-switcher"
import { ThemeToggle } from "@/features/theme/theme-toggle"
import { AdvancedToggle } from "@/features/advanced/advanced-toggle"
import { classifyPH } from "@/features/chemistry/lib/acid-math"
import { useAcidBaseState } from "@/hooks/use-acid-base-state"
import { CornerDecoration } from "./corner-decoration"
import { PHSection } from "./ph-section"
import { AcidSlotsSection } from "./acid-slots-section"
import { ChartsSection } from "./charts-section"
import type { ChartsSectionHandle } from "./charts-section"
import { TabsSection } from "./tabs-section"
import { AdvancedPanel } from "@/features/advanced/advanced-panel"

export default function MinimalistLayout() {
  const { t } = useTranslation()
  const {
    locale, globalPH, setGlobalPH,
    resolvedSlots, activeSlots, equilibriumCount,
    acidDatabase, acidCount, handleAcidChange, handlePkaChange, handleConcentrationChange,
  } = useAcidBaseState()

  const chartsSectionRef = useRef<ChartsSectionHandle>(null)

  return (
    <div className="relative min-h-svh overflow-x-hidden">
      <div className="fixed inset-0 -z-10 bg-gray-200 dark:bg-gray-800" />
      <CornerDecoration position="top-left" />
      <CornerDecoration position="bottom-right" />

      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-4">
          <span className="text-sm font-medium tracking-wide text-foreground/80">acid · base</span>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <AdvancedToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-22 pb-10">
        <section className="mb-14">
          <h1 className="text-4xl font-light tracking-tight text-foreground md:text-5xl">
            {t("header.title")}
          </h1>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground leading-relaxed">
            {t("header.description")}
          </p>
          <div className="mt-4 flex gap-5 text-xs text-muted-foreground">
            <span>{acidCount} {t("header.stats.acids")}</span>
            <span>{activeSlots.length} {t("header.stats.slots")}</span>
          </div>
        </section>

        <PHSection
          globalPH={globalPH}
          profile={classifyPH(globalPH)}
          activeSlots={activeSlots}
          equilibriumCount={equilibriumCount}
          onPHChange={setGlobalPH}
        />

        <Separator className="mb-10 opacity-30" />

        <AcidSlotsSection
          resolvedSlots={resolvedSlots}
          acidDatabase={acidDatabase}
          locale={locale}
          onAcidChange={handleAcidChange}
          onPKaChange={handlePkaChange}
          onPKaChangeLive={(si, pi, v) => chartsSectionRef.current?.schedulePKaRaf(si, pi, v)}
        />

        <Separator className="mb-10 opacity-30" />

        <ChartsSection ref={chartsSectionRef} activeSlots={activeSlots} globalPH={globalPH} locale={locale} onConcentrationChange={handleConcentrationChange} />

        <Separator className="mb-10 opacity-30" />

        <TabsSection activeSlots={activeSlots} globalPH={globalPH} locale={locale} />

        <AdvancedPanel
          activeSlots={activeSlots}
          globalPH={globalPH}
          locale={locale}
          onApplyPreset={(acidId, pH) => { handleAcidChange(0, acidId); setGlobalPH(pH) }}
        />
      </main>
    </div>
  )
}

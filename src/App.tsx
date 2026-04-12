import { useTranslation } from "react-i18next"

import { LegendStrip } from "@/components/app/legend-strip"
import { PageHeader } from "@/components/app/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ACID_DATABASE } from "@/data/acids"
import { AcidSlotCard } from "@/features/chemistry/components/acid-slot-card"
import { EquilibriumPanel } from "@/features/chemistry/components/equilibrium-panel"
import { MathModelPanel } from "@/features/chemistry/components/math-model-panel"
import { PhControlCard } from "@/features/chemistry/components/ph-control-card"
import { SpeciationChart } from "@/features/chemistry/components/speciation-chart"
import { TitrationChart } from "@/features/chemistry/components/titration-chart"
import { useAcidBaseState } from "@/hooks/use-acid-base-state"
import { LayoutNav } from "@/layouts/layout-nav"

export default function App() {
  const { t } = useTranslation()
  const {
    locale, globalPH, setGlobalPH,
    resolvedSlots, activeSlots, equilibriumCount,
    acidCount, handleAcidChange, handlePkaChange, handleConcentrationChange,
  } = useAcidBaseState()

  return (
    <div className="relative min-h-svh overflow-hidden px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-8">
        <div className="flex items-start justify-between gap-4">
          <PageHeader acidCount={acidCount} activeCount={activeSlots.length} />
          <div className="shrink-0 pt-1">
            <LayoutNav />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <PhControlCard globalPH={globalPH} activeCount={activeSlots.length} equilibriumCount={equilibriumCount} onPHChange={setGlobalPH} />
            {resolvedSlots.map((slot, index) => (
              <AcidSlotCard
                key={`slot-${index}`}
                slotIndex={index}
                slot={slot}
                acid={slot.acid}
                acids={ACID_DATABASE}
                locale={locale}
                onAcidChange={handleAcidChange}
                onPkaChange={handlePkaChange}
              />
            ))}
          </aside>

          <section className="space-y-5">
            <LegendStrip activeSlots={activeSlots} locale={locale} />
            <SpeciationChart activeSlots={activeSlots} globalPH={globalPH} />
            <TitrationChart activeSlots={activeSlots} globalPH={globalPH} onConcentrationChange={handleConcentrationChange} />

            <Tabs defaultValue="equilibria" className="gap-0">
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                <TabsTrigger
                  value="equilibria"
                  className="rounded-none border-b-2 border-transparent px-4 pb-2 pt-0 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  {t("tabs.equilibria")}
                </TabsTrigger>
                <TabsTrigger
                  value="model"
                  className="rounded-none border-b-2 border-transparent px-4 pb-2 pt-0 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  {t("tabs.model")}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="equilibria" className="mt-4">
                <EquilibriumPanel activeSlots={activeSlots} locale={locale} />
              </TabsContent>
              <TabsContent value="model" className="mt-4">
                <MathModelPanel activeSlots={activeSlots} globalPH={globalPH} locale={locale} />
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </div>
    </div>
  )
}

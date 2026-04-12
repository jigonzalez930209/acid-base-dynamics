import { useTranslation } from "react-i18next"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RoadmapAdvanced } from "@/features/chemistry/components/roadmap-advanced"
import type { ActiveSlot, Locale } from "@/features/chemistry/types/models"
import { EquilibriaTab } from "./equilibria-tab"
import { ModelTab } from "./model-tab"

type TabsSectionProps = {
  activeSlots: ActiveSlot[]
  globalPH: number
  locale: Locale
}

const TRIGGER_CLASS =
  "rounded-none border-b border-transparent px-0 pb-2 pt-0 text-xs uppercase tracking-[0.15em] data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"

export function TabsSection({ activeSlots, globalPH, locale }: TabsSectionProps) {
  const { t } = useTranslation()

  return (
    <section className="mb-16">
      <Tabs defaultValue="equilibria">
        <TabsList className="w-full justify-start rounded-none border-b border-border/30 bg-transparent p-0 gap-6">
          <TabsTrigger value="equilibria" className={TRIGGER_CLASS}>{t("tabs.equilibria")}</TabsTrigger>
          <TabsTrigger value="model" className={TRIGGER_CLASS}>{t("tabs.model")}</TabsTrigger>
          <TabsTrigger value="roadmap" className={TRIGGER_CLASS}>{t("tabs.roadmap")}</TabsTrigger>
        </TabsList>

        <TabsContent value="equilibria" className="mt-6">
          <EquilibriaTab activeSlots={activeSlots} locale={locale} />
        </TabsContent>

        <TabsContent value="model" className="mt-6">
          <ModelTab activeSlots={activeSlots} globalPH={globalPH} locale={locale} />
        </TabsContent>

        <TabsContent value="roadmap" className="mt-6">
          <RoadmapAdvanced />
        </TabsContent>
      </Tabs>
    </section>
  )
}

import { useTranslation } from "react-i18next"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

type RoadmapPhase = {
  title: string
  summary: string
}

export function RoadmapPanel() {
  const { t } = useTranslation()
  const phases = t("roadmap.phases", { returnObjects: true }) as RoadmapPhase[]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("roadmap.title")}</CardTitle>
        <CardDescription>{t("roadmap.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-3">
          {/* Timeline layout */}
          <div className="relative pl-8">
            {/* Vertical connector line */}
            <div className="absolute left-3.5 top-3 bottom-3 w-px bg-border" />

            <div className="space-y-0">
              {phases.map((phase, index) => (
                <div key={phase.title} className="relative pb-8 last:pb-0">
                  {/* Number indicator */}
                  <div className="absolute -left-8 flex size-7 items-center justify-center rounded-full border-2 border-primary bg-background text-[11px] font-bold text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  {/* Content */}
                  <div className="space-y-1 pt-0.5">
                    <div className="text-sm font-semibold text-foreground">{phase.title}</div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{phase.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

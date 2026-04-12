import { useTranslation } from "react-i18next"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ROADMAP_ADVANCED_DATA } from "./roadmap-advanced-data"

export function RoadmapAdvanced() {
  const { i18n } = useTranslation()

  const locale = i18n.resolvedLanguage === "en" ? "en" : "es"
  const phases = ROADMAP_ADVANCED_DATA[locale]

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-8">
        {phases.map((phase, i) => (
          <div key={phase.phase}>
            {i > 0 && <Separator className="mb-8 opacity-20" />}
            <div className="flex gap-4">
              <span className="shrink-0 text-[10px] font-mono text-muted-foreground pt-1 leading-none">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground mb-3">{phase.phase}</p>
                <ul className="space-y-2.5">
                  {phase.tasks.map((task) => (
                    <li key={task} className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
                      <span className="mt-[5px] size-1 shrink-0 rounded-full bg-muted-foreground/50" aria-hidden="true" />
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}


import { useState, useMemo } from "react"
import { useTranslation } from "react-i18next"

import { SvgChart, buildLinePath } from "@/components/app/svg-chart"
import { buildTitrationSeriesAt } from "@/features/advanced/advanced-math"
import type { ActiveSlot, Locale } from "@/features/chemistry/types/models"

type Props = { activeSlots: ActiveSlot[]; locale: Locale }

const SCENARIOS = [
  { label: "0.01 M", value: 0.01, dash: "4 3" },
  { label: "0.05 M", value: 0.05, dash: "2 2" },
  { label: "0.10 M", value: 0.10, dash: undefined },
  { label: "0.50 M", value: 0.50, dash: "6 2" },
]
const SC_COLORS = ["#60a5fa", "#34d399", "#f59e0b", "#f87171"]

export function MultiScenarioChart({ activeSlots, locale }: Props) {
  const { t } = useTranslation()
  const [idx, setIdx] = useState(0)
  const slot = activeSlots[Math.min(idx, activeSlots.length - 1)]

  const series = useMemo(
    () => slot ? SCENARIOS.map(({ value }) => buildTitrationSeriesAt(slot.pKas, value)) : [],
    [slot]
  )

  if (!activeSlots.length) return null

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-medium text-foreground">{t("advanced.multiScenario.title")}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{t("advanced.multiScenario.description")}</p>
        </div>
        {activeSlots.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {activeSlots.map((s, i) => (
              <button key={s.acid.id} onClick={() => setIdx(i)}
                className={`flex items-center gap-1 rounded px-2 py-0.5 text-xs transition-colors ${
                  idx === i ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}>
                <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                {s.acid.names[locale]}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        {SCENARIOS.map(({ label, dash }, i) => (
          <div key={label} className="flex items-center gap-1.5">
            <svg width="16" height="6" aria-hidden="true">
              <line x1="0" y1="3" x2="16" y2="3" stroke={SC_COLORS[i]} strokeWidth="2" strokeDasharray={dash} />
            </svg>
            <span style={{ color: SC_COLORS[i] }}>{label}</span>
            {i === 2 && <span className="text-muted-foreground">(ref)</span>}
          </div>
        ))}
      </div>

      <div className="text-foreground">
        <SvgChart xLabel={t("charts.xVolume")} yLabel={t("charts.yPh")}
          xMin={0} xMax={350} yMin={0} yMax={14}
          xTicks={[0, 50, 100, 150, 200, 250, 300, 350]}
          yTicks={[0, 2, 4, 6, 8, 10, 12, 14]}>
          {({ mapX, mapY }) => (
            <>
              {series.map((pts, i) => (
                <path key={i} d={buildLinePath(pts, mapX, mapY)}
                  fill="none" stroke={SC_COLORS[i]}
                  strokeWidth={SCENARIOS[i].value === 0.1 ? 2.5 : 1.5}
                  strokeDasharray={SCENARIOS[i].dash} />
              ))}
            </>
          )}
        </SvgChart>
      </div>
    </div>
  )
}

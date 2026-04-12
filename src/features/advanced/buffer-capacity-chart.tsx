import { useState, useMemo } from "react"
import { useTranslation } from "react-i18next"

import { SvgChart, buildLinePath } from "@/components/app/svg-chart"
import { buildBufferCapacitySeries } from "@/features/advanced/advanced-math"
import type { ActiveSlot } from "@/features/chemistry/types/models"

const STAGGER_PH = 0.9  // min pH gap before bumping to a new row

type Props = { activeSlots: ActiveSlot[]; globalPH: number }

const ZOOM_MAX = 0.3

export function BufferCapacityChart({ activeSlots, globalPH }: Props) {
  const { t } = useTranslation()
  const [zoomed, setZoomed] = useState(false)

  const series = useMemo(
    () => activeSlots.map((slot) => ({ ...slot, points: buildBufferCapacitySeries(slot.pKas) })),
    [activeSlots]
  )

  const pkaMarkers = useMemo(() => {
    const flat = activeSlots
      .flatMap((slot) =>
        slot.pKas.map((pKa, i) => ({
          id: `${slot.acid.id}-pka${i}`,
          pKa,
          color: slot.color,
          label: `pKa${i + 1}=${pKa.toFixed(1)}`,
        }))
      )
      .sort((a, b) => a.pKa - b.pKa)

    const levelMaxPKa: number[] = []
    return flat.map((m) => {
      let level = 0
      while (levelMaxPKa[level] !== undefined && m.pKa - levelMaxPKa[level] < STAGGER_PH)
        level++
      levelMaxPKa[level] = m.pKa
      return { ...m, level }
    })
  }, [activeSlots])

  const fullMax = useMemo(() => {
    let max = 0.05
    series.forEach(({ points }) => { points.forEach(({ y }) => { if (y > max) max = y }) })
    return Math.min(max * 1.1, 2)
  }, [series])

  const yMax   = zoomed ? ZOOM_MAX : fullMax
  const yStep  = yMax <= 0.3 ? 0.05 : yMax <= 0.5 ? 0.1 : yMax <= 1 ? 0.2 : 0.5
  const yTicks = Array.from({ length: Math.ceil(yMax / yStep) + 1 }, (_, i) =>
    Number((i * yStep).toFixed(2))
  ).filter((v) => v <= yMax + 1e-9)

  if (!activeSlots.length) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-foreground">{t("advanced.bufferCapacity.title")}</h3>
        <button onClick={() => setZoomed((z) => !z)}
          className="rounded border border-border/50 px-2 py-0.5 text-[10px] text-muted-foreground transition-colors hover:border-primary hover:text-primary">
          {zoomed ? t("advanced.bufferCapacity.zoomOut") : t("advanced.bufferCapacity.zoomIn")}
        </button>
      </div>
      <p className="text-xs text-muted-foreground">{t("advanced.bufferCapacity.description")}</p>
      <div className="text-foreground">
        <SvgChart xLabel={t("charts.xPh")} yLabel="β (mol/L)"
          xMin={0} xMax={14} yMin={0} yMax={yMax}
          xTicks={[0, 2, 4, 6, 8, 10, 12, 14]} yTicks={yTicks}>
          {({ mapX, mapY, top, height }) => (
            <>
              {series.map(({ acid, color, dash, points }) => (
                <path key={acid.id}
                  d={buildLinePath(points.filter((p) => p.y <= yMax), mapX, mapY)}
                  fill="none" stroke={color} strokeWidth={2} strokeDasharray={dash} />
              ))}

              {/* pKa markers — staggered to avoid overlap */}
              {pkaMarkers.map(({ id, pKa, color, label, level }) => (
                <g key={id}>
                  <line x1={mapX(pKa)} y1={top} x2={mapX(pKa)} y2={top + height}
                    stroke={color} strokeOpacity={0.5} strokeWidth={1} strokeDasharray="3 3" />
                  <text x={mapX(pKa) + 3} y={top + 11 + level * 11} fontSize={8}
                    fill={color} fillOpacity={0.9} style={{ userSelect: "none" }}>
                    {label}
                  </text>
                </g>
              ))}

              {/* current pH line */}
              <line x1={mapX(globalPH)} y1={top} x2={mapX(globalPH)} y2={top + height}
                stroke="currentColor" strokeOpacity={0.4} strokeWidth={1} strokeDasharray="4 3" />
            </>
          )}
        </SvgChart>
      </div>
    </div>
  )
}

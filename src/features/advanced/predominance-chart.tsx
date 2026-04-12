import { useMemo, useId } from "react"
import { useTranslation } from "react-i18next"

import { buildPredominanceSeries } from "@/features/advanced/advanced-math"
import { buildSymbolicSpecies } from "@/features/chemistry/lib/formulas"
import type { ActiveSlot, Locale } from "@/features/chemistry/types/models"

type Props = { activeSlots: ActiveSlot[]; locale: Locale }
type Band = { x1: number; x2: number; speciesIdx: number; label: string }

const W = 840
const PL = 94          // left padding for acid name
const IW = W - PL - 8
const BAND_H = 36
const ROW_GAP = 4
const AXIS_H = 22
const PH_TICKS = [0, 2, 4, 6, 8, 10, 12, 14]
const HUE_DEG = [0, 60, 120, 180]   // per species index: 4 maximally distinct hues

const SUB: Record<string, string> = { '2': '₂', '3': '₃', '4': '₄', '5': '₅' }
const SUP: Record<string, string> = { '2': '²', '3': '³', '4': '⁴', '5': '⁵', '-': '⁻', '+': '⁺' }

const toUnicode = (s: string) =>
  s
    .replace(/\^(\d+)([+-])/g, (_, n, sign) => (SUP[n] ?? n) + (SUP[sign] ?? sign))
    .replace(/([+-])$/, (m) => SUP[m] ?? m)
    .replace(/([A-Za-z])(\d)/g, (_, l, d) => l + (SUB[d] ?? d))

const mapX = (pH: number) => PL + (pH / 14) * IW

function getBands(pKas: number[], species: string[]): Band[] {
  const pts = buildPredominanceSeries(pKas)
  if (!pts.length) return []
  const bands: Band[] = []
  let start = pts[0].pH
  let cur = pts[0].dominant
  for (let i = 1; i <= pts.length; i++) {
    if (i === pts.length || pts[i].dominant !== cur) {
      bands.push({ x1: mapX(start), x2: mapX(pts[i - 1].pH), speciesIdx: cur, label: toUnicode(species[cur] ?? '') })
      if (i < pts.length) { start = pts[i].pH; cur = pts[i].dominant }
    }
  }
  return bands
}

export function PredominanceChart({ activeSlots, locale }: Props) {
  const { t } = useTranslation()
  const uid = useId().replace(/:/g, '')

  const rows = useMemo(
    () => activeSlots.map((slot) => ({
      slot,
      bands: getBands(slot.pKas, buildSymbolicSpecies(slot.acid.proticType)),
    })),
    [activeSlots]
  )

  if (!activeSlots.length) return null

  const totalH = rows.length * (BAND_H + ROW_GAP) + AXIS_H

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-foreground">{t("advanced.predominance.title")}</h3>
      <p className="text-xs text-muted-foreground">{t("advanced.predominance.description")}</p>
      <svg viewBox={`0 0 ${W} ${totalH}`} className="h-auto w-full bg-card shadow-sm rounded-sm">
        <defs>
          {HUE_DEG.map((deg, i) => (
            <filter key={i} id={`${uid}-h${i}`}>
              <feColorMatrix type="hueRotate" values={String(deg)} />
            </filter>
          ))}
        </defs>

        {rows.map(({ slot, bands }, ri) => {
          const y = ri * (BAND_H + ROW_GAP)
          return (
            <g key={slot.acid.id}>
              {bands.map((b, bi) => {
                const cx = (b.x1 + b.x2) / 2
                const bw = b.x2 - b.x1
                return (
                  <g key={bi}>
                    <rect
                      x={b.x1} y={y} width={bw} height={BAND_H}
                      fill={slot.color}
                      filter={`url(#${uid}-h${b.speciesIdx % HUE_DEG.length})`}
                    />
                    {bw > 32 && (
                      <text
                        x={cx} y={y + BAND_H / 2 + 4}
                        textAnchor="middle" fontSize={12} fontWeight="700"
                        fill="rgba(255,255,255,0.95)"
                        stroke="rgba(0,0,0,0.6)" strokeWidth={3}
                        style={{ paintOrder: "stroke" }}
                      >
                        {b.label}
                      </text>
                    )}
                  </g>
                )
              })}
              <text
                x={PL - 5} y={y + BAND_H / 2 + 4}
                textAnchor="end" fontSize={9} fill="currentColor" className="fill-muted-foreground"
              >
                {slot.acid.names[locale].slice(0, 16)}
              </text>
            </g>
          )
        })}

        {PH_TICKS.map((pH) => (
          <g key={pH}>
            <line x1={mapX(pH)} y1={0} x2={mapX(pH)} y2={totalH - AXIS_H}
              stroke="currentColor" strokeOpacity={0.12} strokeWidth={1} />
            <text x={mapX(pH)} y={totalH - 4} textAnchor="middle" fontSize={9}
              fill="currentColor" className="fill-muted-foreground">
              {pH}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

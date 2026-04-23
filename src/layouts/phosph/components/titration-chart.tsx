/**
 * Standalone SVG titration chart — no dependency on SvgChart wrapper.
 * Fully dark-mode aware: uses CSS custom properties + fixed high-contrast colours.
 * Supports both NaOH (acid→base) and HCl (base→acid) titrations.
 */

import { useMemo, useId } from "react"
import { buildTitrationCurve, chartXMax } from "../engine/titration-curve"
import { findEquivalencePoints } from "../engine/equivalence-finder"
import { SAMPLES } from "../engine/phosphate-system"
import { INDICATORS } from "../engine/indicators"
import type { PhosphResult } from "../types"

type Props = {
  result: PhosphResult
  locale: "es" | "en"
}

const LABELS = {
  es: { xLabel: "Volumen titulante (mL)", yLabel: "pH", v1: "V₁", v2: "V₂", avg: "V̄", indicator: "Zona viraje" },
  en: { xLabel: "Titrant volume (mL)", yLabel: "pH", v1: "V₁", v2: "V₂", avg: "V̄", indicator: "Ind. range" },
}

const W = 680, H = 320
const PAD = { top: 28, right: 24, bottom: 50, left: 50 }
const Y_MIN = 0, Y_MAX = 14

export function TitrationChart({ result, locale }: Props) {
  const L = LABELS[locale]
  const clipId = useId().replace(/:/g, "c")

  const indicator = INDICATORS.find((i) => i.id === result.indicatorId)
  const sample = SAMPLES.find((s) => s.id === result.detectedSampleId) ?? SAMPLES[0]

  const curve = useMemo(
    () => buildTitrationCurve(sample, result.titrant, result.normality),
    [sample, result.titrant, result.normality],
  )
  const eqs = useMemo(() => findEquivalencePoints(curve), [curve])

  const xMax = useMemo(
    () => Math.max(chartXMax(curve), result.volume1 * 1.3, result.volume2 * 1.3, 15),
    [curve, result.volume1, result.volume2],
  )

  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom

  const mapX = (v: number) => PAD.left + (v / xMax) * innerW
  const mapY = (pH: number) => PAD.top + innerH - ((pH - Y_MIN) / (Y_MAX - Y_MIN)) * innerH

  const xTicks = useMemo(() => {
    const step = xMax <= 30 ? 5 : xMax <= 60 ? 10 : 20
    return Array.from({ length: Math.floor(xMax / step) + 1 }, (_, i) => i * step)
  }, [xMax])
  const yTicks = [0, 2, 4, 6, 8, 10, 12, 14]

  const curvePath = useMemo(() => {
    const pts = curve.filter((p) => p.volume >= 0 && p.volume <= xMax)
    if (!pts.length) return ""
    return "M " + pts.map((p) => `${mapX(p.volume).toFixed(1)},${mapY(p.pH).toFixed(1)}`).join(" L ")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curve, xMax, innerW, innerH])

  // Titrant direction label (HCl = pH↓, NaOH = pH↑)
  const dirLabel = result.titrant === "HCl"
    ? (locale === "es" ? `HCl ${result.normality.toFixed(4)} mol/L` : `HCl ${result.normality.toFixed(4)} mol/L`)
    : (locale === "es" ? `NaOH ${result.normality.toFixed(4)} mol/L` : `NaOH ${result.normality.toFixed(4)} mol/L`)

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto rounded-xl border border-border bg-card"
      aria-label={locale === "es" ? "Curva de titulación de fosfato" : "Phosphate titration curve"}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={PAD.left} y={PAD.top} width={innerW} height={innerH} />
        </clipPath>
      </defs>

      {/* Grid lines */}
      {yTicks.map((t) => (
        <line key={`y${t}`} x1={PAD.left} y1={mapY(t)} x2={W - PAD.right} y2={mapY(t)}
          stroke="currentColor" opacity={0.07} strokeDasharray="4 6" />
      ))}
      {xTicks.map((t) => (
        <line key={`x${t}`} x1={mapX(t)} y1={PAD.top} x2={mapX(t)} y2={PAD.top + innerH}
          stroke="currentColor" opacity={0.07} strokeDasharray="4 6" />
      ))}

      {/* Axes */}
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + innerH}
        stroke="currentColor" opacity={0.35} strokeWidth={1.5} />
      <line x1={PAD.left} y1={PAD.top + innerH} x2={W - PAD.right} y2={PAD.top + innerH}
        stroke="currentColor" opacity={0.35} strokeWidth={1.5} />

      {/* Y tick labels */}
      {yTicks.map((t) => (
        <text key={`yl${t}`} x={PAD.left - 8} y={mapY(t) + 4}
          textAnchor="end" fill="currentColor" opacity={0.45} fontSize={10}>{t}</text>
      ))}
      {/* X tick labels */}
      {xTicks.map((t) => (
        <text key={`xl${t}`} x={mapX(t)} y={PAD.top + innerH + 18}
          textAnchor="middle" fill="currentColor" opacity={0.45} fontSize={10}>{t}</text>
      ))}

      {/* Axis labels */}
      <text x={PAD.left + innerW / 2} y={H - 6} textAnchor="middle"
        fill="currentColor" opacity={0.6} fontSize={11} fontWeight="600">{L.xLabel}</text>
      <text x={14} y={PAD.top + innerH / 2}
        transform={`rotate(-90 14 ${PAD.top + innerH / 2})`}
        textAnchor="middle" fill="currentColor" opacity={0.6} fontSize={11} fontWeight="600">{L.yLabel}</text>

      {/* Titrant label top-right */}
      <text x={W - PAD.right - 4} y={PAD.top - 8}
        textAnchor="end" fill="currentColor" opacity={0.45} fontSize={9} fontStyle="italic">{dirLabel}</text>

      {/* Clipped content */}
      <g clipPath={`url(#${clipId})`}>
        {/* Indicator band */}
        {indicator && (
          <rect
            x={PAD.left} y={mapY(indicator.pHHigh)}
            width={innerW} height={mapY(indicator.pHLow) - mapY(indicator.pHHigh)}
            fill={indicator.cssBase} opacity={0.18}
          />
        )}
        {indicator && (
          <text x={W - PAD.right - 4} y={mapY((indicator.pHLow + indicator.pHHigh) / 2) + 4}
            textAnchor="end" fill={indicator.cssBase} opacity={0.75} fontSize={9} fontWeight="600">
            {L.indicator}
          </text>
        )}

        {/* Equivalence point vertical lines */}
        {eqs.map((eq) => (
          <g key={eq.label}>
            <line x1={mapX(eq.volume)} y1={PAD.top} x2={mapX(eq.volume)} y2={PAD.top + innerH}
              stroke="currentColor" opacity={0.25} strokeDasharray="5 4" strokeWidth={1.5} />
            <text x={mapX(eq.volume) + 4} y={PAD.top + 14}
              fill="currentColor" opacity={0.5} fontSize={9}>{eq.label}={eq.volume.toFixed(1)}</text>
          </g>
        ))}

        {/* Titration curve — bright cyan, visible in both light and dark */}
        <path
          d={curvePath}
          fill="none"
          stroke="#22d3ee"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* V1 point */}
        <circle cx={mapX(result.volume1)} cy={mapY(result.pHValue)} r={6}
          fill="none" stroke="#f472b6" strokeWidth={2} opacity={0.75} />
        <text x={mapX(result.volume1)} y={mapY(result.pHValue) - 10}
          textAnchor="middle" fill="#f472b6" opacity={0.75} fontSize={9}>{L.v1}</text>

        {/* V2 point */}
        <circle cx={mapX(result.volume2)} cy={mapY(result.pHValue)} r={6}
          fill="none" stroke="#f472b6" strokeWidth={2} opacity={0.75} />
        <text x={mapX(result.volume2)} y={mapY(result.pHValue) - 10}
          textAnchor="middle" fill="#f472b6" opacity={0.75} fontSize={9}>{L.v2}</text>

        {/* Average point — main filled dot */}
        <circle cx={mapX(result.avgVolume)} cy={mapY(result.pHValue)} r={8}
          fill="#f43f5e" stroke="white" strokeWidth={2} />
        <text x={mapX(result.avgVolume) + 12} y={mapY(result.pHValue) + 4}
          fill="#f43f5e" fontSize={10} fontWeight="700">{L.avg}</text>
      </g>
    </svg>
  )
}



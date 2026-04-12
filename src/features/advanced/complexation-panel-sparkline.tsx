import { useTranslation } from "react-i18next"

import { calcAlphaY4 } from "@/features/advanced/complexation-data"

type Props = {
  currentPH: number
}

export function ComplexationPanelSparkline({ currentPH }: Props) {
  const { t } = useTranslation()
  const width = 360
  const height = 60
  const padLeft = 8
  const padRight = 8
  const padTop = 6
  const padBottom = 14
  const innerWidth = width - padLeft - padRight
  const innerHeight = height - padTop - padBottom

  const toX = (pH: number) => padLeft + (pH / 14) * innerWidth
  const toY = (alpha: number) => padTop + innerHeight - alpha * innerHeight
  const points = Array.from({ length: 281 }, (_, index) => {
    const pH = (index / 280) * 14
    return [pH, calcAlphaY4(pH)] as const
  })
  const path = points.map(([pH, alpha], index) => `${index === 0 ? "M" : "L"}${toX(pH).toFixed(1)},${toY(alpha).toFixed(1)}`).join(" ")
  const cx = toX(currentPH)
  const cy = toY(calcAlphaY4(currentPH))

  return (
    <div className="space-y-1">
      <p className="text-[10px] text-muted-foreground">{t("advanced.complexation.sparklineLabel")}</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-md rounded border border-border/30 bg-muted/10" aria-hidden="true">
        <line x1={padLeft} y1={padTop} x2={padLeft} y2={padTop + innerHeight} stroke="currentColor" strokeOpacity={0.2} strokeWidth={1} />
        <line x1={padLeft} y1={padTop + innerHeight} x2={padLeft + innerWidth} y2={padTop + innerHeight} stroke="currentColor" strokeOpacity={0.2} strokeWidth={1} />
        {[0, 2, 4, 6, 8, 10, 12, 14].map((pH) => (
          <text key={pH} x={toX(pH)} y={height - 2} textAnchor="middle" fontSize={7} fill="currentColor" opacity={0.4}>
            {pH}
          </text>
        ))}
        <path d={path} fill="none" stroke="#38bdf8" strokeWidth={1.5} />
        <line x1={cx} y1={padTop} x2={cx} y2={padTop + innerHeight} stroke="#f59e0b" strokeWidth={1} strokeDasharray="2,2" />
        <circle cx={cx} cy={cy} r={3} fill="#f59e0b" />
      </svg>
    </div>
  )
}
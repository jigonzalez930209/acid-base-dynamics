import { useTranslation } from "react-i18next"

type EquivalencePoint = {
  pKa: number
  volume: number
  color: string
  name: string
}

type Props = {
  equivalencePoints: EquivalencePoint[]
  hoveredIdx: number | null
  onHoverChange: (index: number | null) => void
}

export function TitrationEquivalenceTable({ equivalencePoints, hoveredIdx, onHoverChange }: Props) {
  const { t } = useTranslation()

  if (equivalencePoints.length === 0) return null

  return (
    <div className="mt-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t("charts.equivalencePoints")}
      </p>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">{t("charts.eqAcid")}</th>
              <th className="px-3 py-2 text-center font-medium text-muted-foreground">{t("charts.eqPka")}</th>
              <th className="px-3 py-2 text-center font-medium text-muted-foreground">{t("charts.eqVolume")}</th>
            </tr>
          </thead>
          <tbody>
            {equivalencePoints.map((point, index) => (
              <tr
                key={`row-${index}`}
                className="border-b last:border-0 transition-colors"
                style={{ backgroundColor: hoveredIdx === index ? `${point.color}18` : undefined }}
                onMouseEnter={() => onHoverChange(index)}
                onMouseLeave={() => onHoverChange(null)}
              >
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: point.color }} />
                    {point.name}
                  </div>
                </td>
                <td className="px-3 py-2 text-center font-mono tabular-nums">{point.pKa.toFixed(2)}</td>
                <td className="px-3 py-2 text-center font-mono tabular-nums">{point.volume.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
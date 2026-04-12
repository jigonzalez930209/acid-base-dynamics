import type { MetalRecord } from "@/features/advanced/complexation-db"
import { kfBgColor, kfColor } from "@/features/advanced/complexation-explorer-shared"

type OverviewRow = {
  metal: MetalRecord
  logKf: number
  logKfP: number
  logKfPP: number
  minPH: number | null
  aL: number
  color: string
}

type Props = {
  overviewRows: OverviewRow[]
  pH: number
}

export function ComplexationExplorerOverview({ overviewRows, pH }: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-1 rounded-md border border-border/40 bg-muted/20 px-4 py-3 text-[11px] text-muted-foreground">
        <p><span className="font-mono text-foreground">log Kf</span> = log β<sub>N</sub> (constante global termodinámica)</p>
        <p><span className="font-mono text-foreground">log Kf′</span> = log Kf + log α<sub>L</sub>(pH) — corrige protonación del ligando</p>
        <p><span className="font-mono text-foreground">log Kf″</span> = log Kf′ − log α<sub>M(OH)</sub>(pH) — además corrige hidrólisis del metal</p>
        <p><span className="font-mono text-foreground">α<sub>L</sub></span> = fracción del ligando en su forma totalmente desprotonada a pH dado</p>
      </div>

      <div className="overflow-x-auto rounded-md border border-border/40">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-border/40 bg-muted/30 text-muted-foreground">
              <th className="px-3 py-2 text-left">Metal</th>
              <th className="px-3 py-2 text-right font-mono">log Kf</th>
              <th className="px-3 py-2 text-right font-mono">log Kf′</th>
              <th className="px-3 py-2 text-right font-mono">log Kf″</th>
              <th className="px-3 py-2 text-right">pH mín.</th>
              <th className="px-3 py-2 text-right">α<sub>L</sub>(pH)</th>
            </tr>
          </thead>
          <tbody>
            {overviewRows.map((row) => (
              <tr key={row.metal.id} className="border-b border-border/20">
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: row.color }} />
                    <span className="font-mono text-foreground">{row.metal.symbol}</span>
                  </span>
                </td>
                <td className="px-3 py-2 text-right font-mono text-foreground">{row.logKf.toFixed(2)}</td>
                <td className={`px-3 py-2 text-right font-mono ${kfColor(row.logKfP)}`}>{row.logKfP.toFixed(2)}</td>
                <td className={`px-3 py-2 text-right font-mono font-semibold ${kfColor(row.logKfPP)}`}>{row.logKfPP.toFixed(2)}</td>
                <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                  {row.minPH !== null ? `${row.minPH}` : "—"}
                </td>
                <td className="px-3 py-2 text-right font-mono text-muted-foreground">{row.aL.toExponential(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2 pt-1">
        <p className="text-[11px] font-medium text-muted-foreground">log Kf″ a pH {pH.toFixed(1)}</p>
        {overviewRows.map((row) => {
          const percent = Math.max(0, Math.min((row.logKfPP / 30) * 100, 100))
          return (
            <div key={row.metal.id} className="flex items-center gap-2">
              <span className="w-16 text-right font-mono text-[11px] text-foreground">{row.metal.symbol}</span>
              <div className="relative h-4 flex-1 overflow-hidden rounded bg-muted">
                <div
                  className="absolute h-full rounded transition-all duration-300"
                  style={{ width: `${percent}%`, backgroundColor: kfBgColor(row.logKfPP) }}
                />
              </div>
              <span className={`w-12 text-right font-mono text-[11px] font-semibold ${kfColor(row.logKfPP)}`}>
                {row.logKfPP.toFixed(1)}
              </span>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
        <span className="text-emerald-600 dark:text-emerald-400">■ ≥ 12 (muy estable)</span>
        <span className="text-amber-600 dark:text-amber-400">■ ≥ 8 (titulable)</span>
        <span className="text-orange-600 dark:text-orange-400">■ ≥ 4 (débil)</span>
        <span className="text-rose-600 dark:text-rose-400">■ &lt; 4 (inestable)</span>
      </div>
    </div>
  )
}
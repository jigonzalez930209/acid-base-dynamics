import { useState } from "react"
import { useTranslation } from "react-i18next"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { HALF_REACTIONS } from "@/features/advanced/redox-data"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

const F = 96485  // C/mol

export function RedoxPanel({ locale }: Props) {
  const { t } = useTranslation()
  const [cathodeId, setCathodeId] = useState("fe3-fe2")
  const [anodeId, setAnodeId]     = useState("zn2-zn")
  const [logQ, setLogQ]           = useState(0)

  const cathode = HALF_REACTIONS.find((r) => r.id === cathodeId) ?? HALF_REACTIONS[0]
  const anode   = HALF_REACTIONS.find((r) => r.id === anodeId)   ?? HALF_REACTIONS[HALF_REACTIONS.length - 1]
  const n       = Math.min(cathode.n, anode.n)
  const E0_cell = cathode.E0 - anode.E0
  const E_cell  = E0_cell - (0.05916 / n) * logQ
  const deltaG  = (-n * F * E_cell) / 1000  // kJ/mol
  const ok      = E_cell > 0

  const fmt = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(4)} V`

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-medium text-foreground">{t("advanced.redox.title")}</h3>
      <p className="text-xs text-muted-foreground">{t("advanced.redox.description")}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">{t("advanced.redox.cathode")}</p>
          <Select value={cathodeId} onValueChange={setCathodeId}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {HALF_REACTIONS.map((r) => (
                <SelectItem key={r.id} value={r.id} className="text-xs">
                  {r.label[locale]}  ({r.E0 >= 0 ? "+" : ""}{r.E0.toFixed(3)} V)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">{t("advanced.redox.anode")}</p>
          <Select value={anodeId} onValueChange={setAnodeId}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {HALF_REACTIONS.map((r) => (
                <SelectItem key={r.id} value={r.id} className="text-xs">
                  {r.label[locale]}  ({r.E0 >= 0 ? "+" : ""}{r.E0.toFixed(3)} V)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{t("advanced.redox.logQ")}</span>
          <span className="font-mono text-foreground">log Q = {logQ >= 0 ? "+" : ""}{logQ}</span>
        </div>
        <Slider min={-8} max={8} step={0.5} value={[logQ]}
          onValueChange={([v]: number[]) => setLogQ(v)} />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Q→0  (productos escasos)</span><span>Q→∞  (reactivos escasos)</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 rounded-md border border-border/50 bg-muted/30 p-4">
        {[
          { label: t("advanced.redox.result.E0cell"), value: fmt(E0_cell) },
          { label: t("advanced.redox.result.Ecell"),  value: fmt(E_cell)  },
          { label: "ΔG (kJ/mol)", value: `${deltaG >= 0 ? "+" : ""}${deltaG.toFixed(1)}` },
        ].map(({ label, value }) => (
          <div key={label} className="space-y-0.5 text-center">
            <p className="text-[10px] text-muted-foreground">{label}</p>
            <p className={`font-mono text-sm font-medium ${label.includes("E") ? (ok ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400") : ""}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <p className={`text-xs font-medium ${ok ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
        {ok ? "✓ Espontánea  (E > 0, ΔG < 0)" : "✗ No espontánea  (E < 0, ΔG > 0)"}
      </p>
    </div>
  )
}

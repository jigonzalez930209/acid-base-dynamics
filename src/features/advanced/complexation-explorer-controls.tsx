import { useTranslation } from "react-i18next"

import { ChemicalFormula } from "@/components/shared/chemical-formula"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { METALS, type LigandRecord } from "@/features/advanced/complexation-db"
import { SLOT_COLORS } from "@/features/advanced/complexation-explorer-shared"
import type { Locale } from "@/features/chemistry/types/models"

type Props = {
  locale: Locale
  allLigands: LigandRecord[]
  ligand: LigandRecord
  ligandId: string
  nSlots: number
  pH: number
  slotIds: string[]
  onLigandChange: (id: string) => void
  onNSlotsChange: (value: number) => void
  onPHChange: (value: number) => void
  onSlotChange: (index: number, id: string) => void
  hasEntry: (metalId: string) => boolean
}

function DenticityBadge({ denticity }: { denticity: number }) {
  const labels = ["", "mono", "bi", "tri", "tetra", "penta", "hexa", "hepta", "octa"]
  return (
    <span className="rounded-full bg-muted px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
      {labels[denticity] ?? `${denticity}dentate`}
    </span>
  )
}

export function ComplexationExplorerControls({
  locale,
  allLigands,
  ligand,
  ligandId,
  nSlots,
  pH,
  slotIds,
  onLigandChange,
  onNSlotsChange,
  onPHChange,
  onSlotChange,
  hasEntry,
}: Props) {
  const { t } = useTranslation()

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-medium text-foreground">{t("advanced.complexExplorer.title")}</h3>
        <p className="mt-0.5 max-w-4xl text-xs leading-relaxed text-muted-foreground">
          {t("advanced.complexExplorer.description")}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(220px,1fr)] lg:items-start">
        <div className="min-w-0 space-y-1">
          <p className="text-[11px] text-muted-foreground">{t("advanced.complexExplorer.ligand")}</p>
          <Select value={ligandId} onValueChange={onLigandChange}>
            <SelectTrigger className="h-9 w-full text-xs">
              <SelectValue aria-label={ligand.label[locale]}>
                <span className="flex min-w-0 items-center gap-1.5">
                  <ChemicalFormula formula={ligand.formula} className="shrink-0 text-xs text-foreground" />
                  <span className="truncate text-muted-foreground">{ligand.label[locale]}</span>
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {allLigands.map((item) => (
                <SelectItem
                  key={item.id}
                  value={item.id}
                  className="text-xs"
                  textValue={`${item.formula} ${item.label[locale]}`}
                >
                  <ChemicalFormula formula={item.formula} className="mr-1 shrink-0 text-xs text-foreground" />
                  <span className="truncate text-muted-foreground">· {item.label[locale]}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-1.5 gap-y-2 pt-0.5">
            <DenticityBadge denticity={ligand.denticity} />
            <span className="rounded-full bg-muted px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
              charge {ligand.chargeDeprotonated}
            </span>
            {ligand.pKas.slice(0, 3).map((value, index) => (
              <span
                key={index}
                className="rounded-full bg-muted px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground"
              >
                pKa{index + 1} = {value}
              </span>
            ))}
          </div>
        </div>

        <div className="min-w-0 space-y-1">
          <p className="text-[11px] text-muted-foreground">{t("advanced.complexExplorer.numMetals")}</p>
          <div className="flex gap-1.5 pt-1 lg:justify-start">
            {[1, 2, 3].map((value) => (
              <button
                key={value}
                onClick={() => onNSlotsChange(value)}
                className={`h-7 w-10 rounded border text-xs font-mono transition-colors ${nSlots === value ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:text-foreground"}`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={`grid gap-4 ${nSlots === 1 ? "sm:grid-cols-1" : nSlots === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
        {Array.from({ length: nSlots }).map((_, index) => {
          const slotId = slotIds[index]
          const metal = METALS.find((item) => item.id === slotId)
          const available = hasEntry(slotId)

          return (
            <div key={index} className="min-w-0 space-y-1">
              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: SLOT_COLORS[index] }} />
                {t("advanced.complexExplorer.metal")} {index + 1}
              </p>
              <Select value={slotId} onValueChange={(value) => onSlotChange(index, value)}>
                <SelectTrigger className="h-9 w-full text-xs" style={{ borderColor: `${SLOT_COLORS[index]}60` }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METALS.map((item) => {
                    const enabled = hasEntry(item.id)
                    return (
                      <SelectItem key={item.id} value={item.id} className="text-xs" disabled={!enabled}>
                        <span className="mr-1 font-mono">{item.symbol}</span>
                        <span className="text-muted-foreground">{item.label[locale].split(" – ")[1]}</span>
                        {!enabled && <span className="ml-1 text-[9px] text-muted-foreground/50">(sin datos)</span>}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              {metal && !available && (
                <p className="text-[10px] text-rose-500">{t("advanced.complexExplorer.noData")}</p>
              )}
            </div>
          )
        })}
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>{t("advanced.complexExplorer.pHWork")}</span>
          <span className="font-mono text-foreground">pH = {pH.toFixed(1)}</span>
        </div>
        <Slider min={0} max={14} step={0.1} value={[pH]} onValueChange={([value]: number[]) => onPHChange(value)} />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>0</span>
          <span>7</span>
          <span>14</span>
        </div>
      </div>
    </div>
  )
}
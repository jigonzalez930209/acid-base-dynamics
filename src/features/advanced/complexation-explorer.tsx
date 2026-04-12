import { useId, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LIGANDS, METALS, getAvailableLigands, getEntry, getMetalsForLigand } from "@/features/advanced/complexation-db"
import { AlphaChart } from "@/features/advanced/complexation-explorer-alpha-chart"
import { ConditionalChart } from "@/features/advanced/complexation-explorer-conditional-chart"
import { ComplexationExplorerControls } from "@/features/advanced/complexation-explorer-controls"
import { ComplexationExplorerEquations } from "@/features/advanced/complexation-explorer-equations"
import { ComplexationExplorerOverview } from "@/features/advanced/complexation-explorer-overview"
import { PredominanceRow } from "@/features/advanced/complexation-explorer-predominance-row"
import { SLOT_COLORS, type ComplexationSlot } from "@/features/advanced/complexation-explorer-shared"
import {
  buildAlphaSeries,
  buildConditionalCurve,
  buildPredominanceSegments,
  calcAlphaLigand,
  calcLogKfDoublePrime,
  calcLogKfPrime,
  calcMinTitrationPH,
} from "@/features/advanced/complexation-math"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

export function ComplexationExplorer({ locale }: Props) {
  const { t } = useTranslation()
  const uid = useId().replace(/:/g, "")

  const allLigands = useMemo(() => getAvailableLigands(), [])

  const [ligandId, setLigandId] = useState("edta")
  const [pH, setPH] = useState(10)
  const [slot0, setSlot0] = useState("cu")
  const [slot1, setSlot1] = useState("zn")
  const [slot2, setSlot2] = useState("ca")
  const [nSlots, setNSlots] = useState(2)
  const [tab, setTab] = useState("overview")

  const ligand = LIGANDS.find((l) => l.id === ligandId) ?? LIGANDS[0]
  const slotIds = [slot0, slot1, slot2].slice(0, nSlots)

  const slots: ComplexationSlot[] = slotIds.map((id, index) => {
    const metal = METALS.find((m) => m.id === id) ?? METALS[0]
    const entry = getEntry(id, ligandId)
    return { metal, entry, color: SLOT_COLORS[index] }
  })

  const overviewRows = useMemo(() => {
    return slots.flatMap(({ metal, entry, color }) => {
      if (!entry) return []
      const logKf = entry.logBeta[entry.logBeta.length - 1]
      const logKfP = calcLogKfPrime(metal, ligand, logKf, pH)
      const logKfPP = calcLogKfDoublePrime(metal, ligand, logKf, pH)
      const minPH = calcMinTitrationPH(metal, ligand, logKf, 6)
      const aL = calcAlphaLigand(ligand, pH)
      return [{ metal, logKf, logKfP, logKfPP, minPH, aL, color }]
    })
  }, [slots, ligand, pH])

  const conditionalCurves = useMemo(() => {
    return slots.flatMap(({ metal, entry, color }) => {
      if (!entry) return []
      const logKf = entry.logBeta[entry.logBeta.length - 1]
      return [{ pts: buildConditionalCurve(metal, ligand, logKf), color }]
    })
  }, [slots, ligand])

  const alphaCurves = useMemo(() => {
    return slots.flatMap(({ metal, entry, color }) => {
      if (!entry) return []
      return [{ series: buildAlphaSeries(entry.logBeta), entry, metal, color }]
    })
  }, [slots])

  const predominanceRows = useMemo(() => {
    return slots.flatMap(({ metal, entry, color }) => {
      if (!entry) return []
      return [{ color, metal, segments: buildPredominanceSegments(entry.logBeta, metal.symbol, ligand.abbreviation) }]
    })
  }, [slots, ligand])

  const handleLigandChange = (id: string) => {
    setLigandId(id)
    const avail = getMetalsForLigand(id)
    if (avail[0]) setSlot0(avail[0].id)
    if (avail[1]) setSlot1(avail[1].id)
    if (avail[2]) setSlot2(avail[2].id)
  }

  const handleSlotChange = (index: number, id: string) => {
    ;[setSlot0, setSlot1, setSlot2][index](id)
  }

  const tabTriggers = [
    ["overview", t("advanced.complexExplorer.tabOverview")],
    ["equations", t("advanced.complexExplorer.tabEq")],
    ["conditional", "Kf′ / Kf″ vs pH"],
    ["alpha", "α vs log[L]"],
    ["predominance", t("advanced.complexExplorer.tabPredom")],
  ] as const

  return (
    <div className="space-y-5">
      <ComplexationExplorerControls
        locale={locale}
        allLigands={allLigands}
        ligand={ligand}
        ligandId={ligandId}
        nSlots={nSlots}
        pH={pH}
        slotIds={slotIds}
        onLigandChange={handleLigandChange}
        onNSlotsChange={setNSlots}
        onPHChange={setPH}
        onSlotChange={handleSlotChange}
        hasEntry={(metalId) => !!getEntry(metalId, ligandId)}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-auto flex-wrap justify-start gap-1 p-1">
          {tabTriggers.map(([value, label]) => (
            <TabsTrigger key={value} value={value} className="px-3 text-[11px]">{label}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <ComplexationExplorerOverview overviewRows={overviewRows} pH={pH} />
        </TabsContent>

        <TabsContent value="equations" className="mt-4 space-y-5">
          <ComplexationExplorerEquations ligand={ligand} locale={locale} slots={slots} />
        </TabsContent>

        <TabsContent value="conditional" className="mt-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            log Kf′ y log Kf″ en función del pH para cada sistema metal–{ligand.abbreviation}.
            La línea vertical marca el pH de trabajo seleccionado.
          </p>
          <ConditionalChart
            uid={uid}
            curves={conditionalCurves}
            currentPH={pH}
            metalLabels={overviewRows.map((row) => ({ symbol: row.metal.symbol, color: row.color }))}
          />
        </TabsContent>

        <TabsContent value="alpha" className="mt-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            Fracción molar de cada especie MLₙ en función de log[L′] (ligando libre aparente).
          </p>
          {alphaCurves.map(({ series, entry, metal, color }, index) => (
            <AlphaChart
              key={metal.id}
              uid={`${uid}-a${index}`}
              series={series}
              nSpecies={entry.logKn.length + 1}
              metalSymbol={metal.symbol}
              ligandAbbrev={ligand.abbreviation}
              baseColor={color}
            />
          ))}
        </TabsContent>

        <TabsContent value="predominance" className="mt-4 space-y-4">
          <p className="text-xs text-muted-foreground">
            Zona de log[L′] en la que predomina cada especie (mayor fracción molar). Análogo al mapa de predominio ácido-base.
          </p>
          {predominanceRows.map(({ segments, metal, color }) => (
            <PredominanceRow key={metal.id} segments={segments} metalSymbol={metal.symbol} baseColor={color} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
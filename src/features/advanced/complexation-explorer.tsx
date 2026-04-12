import { useState, useMemo, useId } from "react"
import { useTranslation } from "react-i18next"

import { ChemicalFormula } from "@/components/shared/chemical-formula"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  METALS, LIGANDS,
  getAvailableLigands, getMetalsForLigand, getEntry,
} from "@/features/advanced/complexation-db"
import {
  calcLogKfPrime, calcLogKfDoublePrime, calcMinTitrationPH,
  calcAlphaLigand, buildConditionalCurve, buildAlphaSeries,
  buildEquilibriumEquations, buildPredominanceSegments, formatComplexSpecies,
} from "@/features/advanced/complexation-math"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

// ── Slot colours (same feel as acid-base slots) ──────────────────────────────
const SLOT_COLORS = ["#38bdf8", "#fb7185", "#4ade80"] as const

// ── SVG chart geometry ────────────────────────────────────────────────────────
const W = 780
const H = 260
const PL = 52, PR = 16, PT = 20, PB = 40
const IW = W - PL - PR
const IH = H - PT - PB
const mapX = (v: number, xMin: number, xMax: number) => PL + ((v - xMin) / (xMax - xMin)) * IW
const mapY = (v: number, yMin: number, yMax: number) => PT + IH - ((v - yMin) / (yMax - yMin)) * IH

function kfColor(logK: number): string {
  if (logK >= 12) return "text-emerald-600 dark:text-emerald-400"
  if (logK >= 8)  return "text-amber-600 dark:text-amber-400"
  if (logK >= 4)  return "text-orange-600 dark:text-orange-400"
  return "text-rose-600 dark:text-rose-400"
}

function kfBgColor(logK: number): string {
  if (logK >= 12) return "#059669"
  if (logK >= 8)  return "#d97706"
  if (logK >= 4)  return "#ea580c"
  return "#dc2626"
}

// ── Mini badge ────────────────────────────────────────────────────────────────
function DenticityBadge({ d }: { d: number }) {
  const labels = ["", "mono", "bi", "tri", "tetra", "penta", "hexa", "hepta", "octa"]
  return (
    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground font-mono">
      {labels[d] ?? `${d}dentate`}
    </span>
  )
}

// ────────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ────────────────────────────────────────────────────────────────────────────────
export function ComplexationExplorer({ locale }: Props) {
  const { t } = useTranslation()
  const uid = useId().replace(/:/g, "")

  const allLigands = useMemo(() => getAvailableLigands(), [])

  const [ligandId,  setLigandId]  = useState("edta")
  const [pH,        setPH]        = useState(10)
  const [slot0,     setSlot0]     = useState("cu")
  const [slot1,     setSlot1]     = useState("zn")
  const [slot2,     setSlot2]     = useState("ca")
  const [nSlots,    setNSlots]    = useState(2)
  const [tab,       setTab]       = useState("overview")

  const ligand    = LIGANDS.find((l) => l.id === ligandId) ?? LIGANDS[0]

  const slotIds  = [slot0, slot1, slot2].slice(0, nSlots)
  const slots    = slotIds.map((id, i) => {
    const metal = METALS.find((m) => m.id === id) ?? METALS[0]
    const e     = getEntry(id, ligandId)
    return { metal, entry: e, color: SLOT_COLORS[i] }
  })

  // Overview table rows
  const overviewRows = useMemo(() => {
    return slots.map(({ metal, entry, color }) => {
      if (!entry) return null
      const logKf = entry.logBeta[entry.logBeta.length - 1]  // log β_N = overall
      const logKfP  = calcLogKfPrime(metal, ligand, logKf, pH)
      const logKfPP = calcLogKfDoublePrime(metal, ligand, logKf, pH)
      const minPH   = calcMinTitrationPH(metal, ligand, logKf, 6)
      const aL      = calcAlphaLigand(ligand, pH)
      return { metal, entry, logKf, logKfP, logKfPP, minPH, aL, color }
    })
  }, [slots, ligand, pH])

  // Conditional curves  (Kf' and Kf'' vs pH)
  const conditionalCurves = useMemo(() => {
    return slots.map(({ metal, entry, color }) => {
      if (!entry) return null
      const logKf  = entry.logBeta[entry.logBeta.length - 1]
      return { pts: buildConditionalCurve(metal, ligand, logKf), color }
    })
  }, [slots, ligand])

  // Species distribution curves (α vs log[L])
  const alphaCurves = useMemo(() => {
    return slots.map(({ metal, entry, color }) => {
      if (!entry) return null
      return { series: buildAlphaSeries(entry.logBeta), entry, metal, color }
    })
  }, [slots])

  // When ligand changes, reset metals to first N available
  const handleLigandChange = (id: string) => {
    setLigandId(id)
    const avail = getMetalsForLigand(id)
    if (avail[0]) setSlot0(avail[0].id)
    if (avail[1]) setSlot1(avail[1].id)
    if (avail[2]) setSlot2(avail[2].id)
  }

  const setSlot = [setSlot0, setSlot1, setSlot2]

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-medium text-foreground">
          {t("advanced.complexExplorer.title")}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t("advanced.complexExplorer.description")}
        </p>
      </div>

      {/* ── Controls ─────────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Ligand selector */}
        <div className="space-y-1 lg:col-span-1">
          <p className="text-[11px] text-muted-foreground">{t("advanced.complexExplorer.ligand")}</p>
          <Select value={ligandId} onValueChange={handleLigandChange}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-72">
              {allLigands.map((l) => (
                <SelectItem key={l.id} value={l.id} className="text-xs" textValue={`${l.formula} ${l.label[locale]}`}>
                  <ChemicalFormula formula={l.formula} className="mr-1 text-xs text-foreground" />
                  <span className="text-muted-foreground">· {l.label[locale]}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Ligand details badge row */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            <DenticityBadge d={ligand.denticity} />
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground font-mono">
              charge {ligand.chargeDeprotonated}
            </span>
            {ligand.pKas.slice(0, 3).map((pk, i) => (
              <span key={i} className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground">
                pKa{i + 1} = {pk}
              </span>
            ))}
          </div>
        </div>

        {/* Number of slots */}
        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground">{t("advanced.complexExplorer.numMetals")}</p>
          <div className="flex gap-1.5 pt-1">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                onClick={() => setNSlots(n)}
                className={`h-7 w-10 rounded border text-xs font-mono transition-colors ${nSlots === n ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:text-foreground"}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metal selectors (one per active slot) */}
      <div className={`grid gap-3 ${nSlots === 1 ? "sm:grid-cols-1" : nSlots === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
        {Array.from({ length: nSlots }).map((_, i) => {
          const slotId = [slot0, slot1, slot2][i]
          const metal  = METALS.find((m) => m.id === slotId)
          const hasEntry = !!getEntry(slotId, ligandId)
          return (
            <div key={i} className="space-y-1">
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: SLOT_COLORS[i] }} />
                {t("advanced.complexExplorer.metal")} {i + 1}
              </p>
              <Select value={slotId} onValueChange={setSlot[i]}>
                <SelectTrigger className="h-8 text-xs" style={{ borderColor: SLOT_COLORS[i] + "60" }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METALS.map((m) => {
                    const ok = !!getEntry(m.id, ligandId)
                    return (
                      <SelectItem key={m.id} value={m.id} className="text-xs" disabled={!ok}>
                        <span className="font-mono mr-1">{m.symbol}</span>
                        <span className="text-muted-foreground">{m.label[locale].split(" – ")[1]}</span>
                        {!ok && <span className="ml-1 text-[9px] text-muted-foreground/50">(sin datos)</span>}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              {metal && !hasEntry && (
                <p className="text-[10px] text-rose-500">{t("advanced.complexExplorer.noData")}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* pH slider */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>{t("advanced.complexExplorer.pHWork")}</span>
          <span className="font-mono text-foreground">pH = {pH.toFixed(1)}</span>
        </div>
        <Slider min={0} max={14} step={0.1} value={[pH]} onValueChange={([v]: number[]) => setPH(v)} />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>0</span><span>7</span><span>14</span>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-7">
          <TabsTrigger value="overview"    className="px-3 text-[11px]">{t("advanced.complexExplorer.tabOverview")}</TabsTrigger>
          <TabsTrigger value="equations"   className="px-3 text-[11px]">{t("advanced.complexExplorer.tabEq")}</TabsTrigger>
          <TabsTrigger value="conditional" className="px-3 text-[11px]">Kf′ / Kf″ vs pH</TabsTrigger>
          <TabsTrigger value="alpha"       className="px-3 text-[11px]">α vs log[L]</TabsTrigger>
          <TabsTrigger value="predominance" className="px-3 text-[11px]">{t("advanced.complexExplorer.tabPredom")}</TabsTrigger>
        </TabsList>

        {/* ── OVERVIEW table ─────────────────────────────────────────── */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          {/* Formula legend */}
          <div className="rounded-md border border-border/40 bg-muted/20 px-4 py-3 text-[11px] text-muted-foreground space-y-1">
            <p><span className="font-mono text-foreground">log Kf</span>  = log β<sub>N</sub>  (constante global termodinámica)</p>
            <p><span className="font-mono text-foreground">log Kf′</span> = log Kf + log α<sub>L</sub>(pH)  — corrige protonación del ligando</p>
            <p><span className="font-mono text-foreground">log Kf″</span> = log Kf′ − log α<sub>M(OH)</sub>(pH)  — además corrige hidrólisis del metal</p>
            <p><span className="font-mono text-foreground">α<sub>L</sub></span> = fracción del ligando en su forma totalmente desprotonada a pH dado</p>
          </div>

          {/* Table */}
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
                {overviewRows.map((row) => {
                  if (!row) return null
                  return (
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
                      <td className="px-3 py-2 text-right text-muted-foreground font-mono">
                        {row.minPH !== null ? `${row.minPH}` : "—"}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                        {row.aL.toExponential(2)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Kf'' bar chart (visual comparison) */}
          <div className="space-y-2 pt-1">
            <p className="text-[11px] text-muted-foreground font-medium">log Kf″ a pH {pH.toFixed(1)}</p>
            {overviewRows.map((row) => {
              if (!row) return null
              const pct = Math.max(0, Math.min((row.logKfPP / 30) * 100, 100))
              return (
                <div key={row.metal.id} className="flex items-center gap-2">
                  <span className="w-16 text-right font-mono text-[11px] text-foreground">{row.metal.symbol}</span>
                  <div className="flex-1 relative h-4 overflow-hidden rounded bg-muted">
                    <div
                      className="absolute h-full rounded transition-all duration-300"
                      style={{ width: `${pct}%`, backgroundColor: kfBgColor(row.logKfPP) }}
                    />
                  </div>
                  <span className={`w-12 text-right font-mono text-[11px] font-semibold ${kfColor(row.logKfPP)}`}>
                    {row.logKfPP.toFixed(1)}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Stability legend */}
          <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
            <span className="text-emerald-600 dark:text-emerald-400">■ ≥ 12 (muy estable)</span>
            <span className="text-amber-600 dark:text-amber-400">■ ≥ 8 (titulable)</span>
            <span className="text-orange-600 dark:text-orange-400">■ ≥ 4 (débil)</span>
            <span className="text-rose-600 dark:text-rose-400">■ &lt; 4 (inestable)</span>
          </div>
        </TabsContent>

        {/* ── EQUILIBRIUM EQUATIONS ──────────────────────────────────── */}
        <TabsContent value="equations" className="mt-4 space-y-5">
          {slots.map(({ metal, entry, color }, si) => {
            if (!entry) return (
              <div key={si} className="rounded border border-border/40 p-3 text-xs text-muted-foreground">
                <span className="inline-block h-2 w-2 rounded-full mr-1.5" style={{ backgroundColor: color }} />
                {metal.symbol} — sin datos para {ligand.abbreviation}
              </div>
            )
            const { stepwise, overall } = buildEquilibriumEquations(metal, ligand, entry)
            return (
              <div key={si} className="rounded-md border border-border/40 bg-card/40 p-4 space-y-3">
                <p className="text-xs font-semibold text-foreground flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                  {metal.label[locale]}  ·  {ligand.label[locale]}
                </p>
                {entry.notes && (
                  <p className="text-[10px] text-muted-foreground italic">{entry.notes[locale]}</p>
                )}

                {/* Stepwise */}
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Constantes escalonadas</p>
                  {stepwise.map(({ equation, logK, n }) => (
                    <div key={n} className="flex items-center justify-between gap-2 rounded border border-border/30 bg-muted/20 px-3 py-1.5">
                      <ChemicalFormula formula={equation} className="text-[11px] text-foreground" />
                      <span className={`font-mono text-[11px] font-semibold ${kfColor(logK * 2)} shrink-0`}>
                        K<sub>{n}</sub> = 10<sup>{logK.toFixed(2)}</sup>
                      </span>
                    </div>
                  ))}
                </div>

                {/* Overall betas */}
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Constantes globales β</p>
                  {overall.map(({ equation, logBeta, n }) => (
                    <div key={n} className="flex items-center justify-between gap-2 rounded border border-border/30 bg-muted/20 px-3 py-1.5">
                      <ChemicalFormula formula={equation} className="text-[11px] text-foreground" />
                      <span className={`font-mono text-[11px] font-semibold ${kfColor(logBeta)} shrink-0`}>
                        β<sub>{n}</sub> = 10<sup>{logBeta.toFixed(2)}</sup>
                      </span>
                    </div>
                  ))}
                </div>

                {/* Mass balance */}
                <div className="rounded border border-border/30 bg-muted/10 px-3 py-2 space-y-0.5 text-[10px] text-muted-foreground font-mono">
                  <p className="text-muted-foreground/70 uppercase text-[9px] tracking-widest mb-1">Balance de masas</p>
                  <p>C<sub>T</sub> = [{metal.symbol}] + {formatComplexSpecies(metal.symbol, ligand.abbreviation)} + … + [{metal.symbol}{ligand.abbreviation}ₙ]</p>
                  <p>C<sub>L</sub> = [{ligand.abbreviation}] + {formatComplexSpecies(metal.symbol, ligand.abbreviation)} + 2{formatComplexSpecies(metal.symbol, ligand.abbreviation, 2)} + … + n[{metal.symbol}{ligand.abbreviation}ₙ]</p>
                </div>
              </div>
            )
          })}
        </TabsContent>

        {/* ── CONDITIONAL CURVES ─────────────────────────────────────── */}
        <TabsContent value="conditional" className="mt-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            log Kf′ y log Kf″ en función del pH para cada sistema metal–{ligand.abbreviation}.
            La línea vertical marca el pH de trabajo seleccionado.
          </p>
          <ConditionalChart
            uid={uid}
            curves={conditionalCurves.filter(Boolean) as { pts: ReturnType<typeof buildConditionalCurve>; color: string }[]}
            currentPH={pH}
            metalLabels={slots.filter((_, i) => overviewRows[i]).map((s) => ({ symbol: s.metal.symbol, color: s.color }))}
          />
        </TabsContent>

        {/* ── ALPHA CURVES ───────────────────────────────────────────── */}
        <TabsContent value="alpha" className="mt-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            Fracción molar de cada especie MLₙ en función de log[L′] (ligando libre aparente).
          </p>
          {alphaCurves.map((ac, i) => {
            if (!ac) return null
            const { series, entry, metal, color } = ac
            const nSpecies = entry.logKn.length + 1  // M, ML, ML2, ...
            return (
              <AlphaChart
                key={metal.id}
                uid={`${uid}-a${i}`}
                series={series}
                nSpecies={nSpecies}
                metalSymbol={metal.symbol}
                ligandAbbrev={ligand.abbreviation}
                baseColor={color}
              />
            )
          })}
        </TabsContent>

        {/* ── PREDOMINANCE ───────────────────────────────────────────── */}
        <TabsContent value="predominance" className="mt-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            Zona de log[L′] en la que predomina cada especie (mayor fracción molar). Análogo al mapa de predominio ácido-base.
          </p>
          {slots.map(({ metal, entry, color }, i) => {
            if (!entry) return null
            const segs = buildPredominanceSegments(entry.logBeta, metal.symbol, ligand.abbreviation)
            return (
              <PredominanceRow
                key={metal.id}
                uid={`${uid}-p${i}`}
                segments={segs}
                metalSymbol={metal.symbol}
                baseColor={color}
              />
            )
          })}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ────────────────────────────────────────────────────────────────────────────────

// ── Conditional curve chart ───────────────────────────────────────────────────
type CondCurve = { pts: ReturnType<typeof buildConditionalCurve>; color: string }
type MetalLabel = { symbol: string; color: string }

function ConditionalChart({
  uid, curves, currentPH, metalLabels,
}: {
  uid: string
  curves: CondCurve[]
  currentPH: number
  metalLabels: MetalLabel[]
}) {
  const yMin = -5
  const yMax = 30
  const xMin = 0
  const xMax = 14

  const mX = (v: number) => mapX(v, xMin, xMax)
  const mY = (v: number) => mapY(Math.max(yMin, Math.min(yMax, v)), yMin, yMax)

  // Grid lines
  const xTicks = [0, 2, 4, 6, 8, 10, 12, 14]
  const yTicks = [0, 5, 10, 15, 20, 25, 30]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded border border-border/30 bg-card/40">
      <defs>
        <clipPath id={`${uid}-cc`}>
          <rect x={PL} y={PT} width={IW} height={IH} />
        </clipPath>
      </defs>

      {/* Grid */}
      {yTicks.map((y) => (
        <g key={y}>
          <line x1={PL} y1={mY(y)} x2={PL + IW} y2={mY(y)} stroke="currentColor" strokeOpacity={0.08} strokeWidth={1} />
          <text x={PL - 4} y={mY(y) + 3} textAnchor="end" fontSize={9} fill="currentColor" opacity={0.4}>{y}</text>
        </g>
      ))}
      {xTicks.map((x) => (
        <g key={x}>
          <line x1={mX(x)} y1={PT} x2={mX(x)} y2={PT + IH} stroke="currentColor" strokeOpacity={0.08} strokeWidth={1} />
          <text x={mX(x)} y={PT + IH + 12} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.4}>{x}</text>
        </g>
      ))}

      {/* Threshold line at y=8 */}
      <line x1={PL} y1={mY(8)} x2={PL + IW} y2={mY(8)} stroke="#d97706" strokeWidth={1} strokeDasharray="4,3" opacity={0.5} />
      <text x={PL + IW + 2} y={mY(8) + 3} fontSize={8} fill="#d97706" opacity={0.6}>8</text>

      {/* Current pH */}
      <line x1={mX(currentPH)} y1={PT} x2={mX(currentPH)} y2={PT + IH} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3,3" />

      {/* Curves */}
      <g clipPath={`url(#${uid}-cc)`}>
        {curves.map(({ pts, color }, ci) => {
          const dPrime = pts.map((p, i) => `${i === 0 ? "M" : "L"}${mX(p.pH).toFixed(1)},${mY(p.logKfPrime).toFixed(1)}`).join(" ")
          const dPP    = pts.map((p, i) => `${i === 0 ? "M" : "L"}${mX(p.pH).toFixed(1)},${mY(p.logKfDoublePrime).toFixed(1)}`).join(" ")
          return (
            <g key={ci}>
              <path d={dPrime} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="4,2" strokeOpacity={0.7} />
              <path d={dPP}    fill="none" stroke={color} strokeWidth={2}   strokeOpacity={1} />
            </g>
          )
        })}
      </g>

      {/* Axis labels */}
      <text x={PL + IW / 2} y={H - 4} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.5}>pH</text>
      <text x={10} y={PT + IH / 2} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.5}
        transform={`rotate(-90, 10, ${PT + IH / 2})`}>
        log K
      </text>

      {/* Legend */}
      {metalLabels.map(({ symbol, color }, i) => (
        <g key={i} transform={`translate(${PL + 8 + i * 90}, ${PT + 8})`}>
          <line x1={0} y1={5} x2={16} y2={5} stroke={color} strokeWidth={2} />
          <text x={20} y={9} fontSize={9} fill={color}>{symbol} Kf″</text>
          <line x1={0} y1={18} x2={16} y2={18} stroke={color} strokeWidth={1.5} strokeDasharray="4,2" />
          <text x={20} y={22} fontSize={9} fill={color} opacity={0.6}>{symbol} Kf′</text>
        </g>
      ))}
    </svg>
  )
}

// ── Alpha fraction chart ──────────────────────────────────────────────────────
function AlphaChart({
  uid, series, nSpecies, metalSymbol, ligandAbbrev, baseColor,
}: {
  uid: string
  series: { logL: number; alphas: number[] }[]
  nSpecies: number
  metalSymbol: string
  ligandAbbrev: string
  baseColor: string
}) {
  const xMin = -8
  const xMax = 0
  const yMin = 0
  const yMax = 1

  const mX = (v: number) => mapX(v, xMin, xMax)
  const mY = (v: number) => mapY(v, yMin, yMax)

  // Generate N distinguishable colours from baseColor by rotating hue
  const speciesColors = Array.from({ length: nSpecies }, (_, i) => {
    const hue = (30 + i * (330 / nSpecies)) % 360
    return `hsl(${hue}, 70%, 55%)`
  })

  const paths = Array.from({ length: nSpecies }, (_, si) => {
    return series.map((pt, pi) => {
      const x = mX(pt.logL).toFixed(1)
      const y = mY(pt.alphas[si] ?? 0).toFixed(1)
      return `${pi === 0 ? "M" : "L"}${x},${y}`
    }).join(" ")
  })

  const xTicks = [-8, -6, -4, -2, 0]

  const speciesLabel = (i: number) =>
    i === 0 ? metalSymbol : formatComplexSpecies(metalSymbol, ligandAbbrev, i)

  return (
    <div className="space-y-1">
      <p className="text-[11px] text-muted-foreground">
        <span className="inline-block h-2 w-2 rounded-full mr-1" style={{ backgroundColor: baseColor }} />
        {metalSymbol} – {ligandAbbrev}
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded border border-border/30 bg-card/40">
        <defs>
          <clipPath id={`${uid}-ac`}>
            <rect x={PL} y={PT} width={IW} height={IH} />
          </clipPath>
        </defs>

        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((y) => (
          <g key={y}>
            <line x1={PL} y1={mY(y)} x2={PL + IW} y2={mY(y)} stroke="currentColor" strokeOpacity={0.07} strokeWidth={1} />
            <text x={PL - 4} y={mY(y) + 3} textAnchor="end" fontSize={9} fill="currentColor" opacity={0.35}>{y.toFixed(2)}</text>
          </g>
        ))}
        {xTicks.map((x) => (
          <g key={x}>
            <line x1={mX(x)} y1={PT} x2={mX(x)} y2={PT + IH} stroke="currentColor" strokeOpacity={0.07} strokeWidth={1} />
            <text x={mX(x)} y={PT + IH + 12} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.35}>{x}</text>
          </g>
        ))}

        {/* α curves */}
        <g clipPath={`url(#${uid}-ac)`}>
          {paths.map((d, si) => (
            <path key={si} d={d} fill="none" stroke={speciesColors[si]} strokeWidth={2} />
          ))}
        </g>

        {/* Axis labels */}
        <text x={PL + IW / 2} y={H - 4} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.4}>
          log[L′]
        </text>
        <text x={10} y={PT + IH / 2} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.4}
          transform={`rotate(-90, 10, ${PT + IH / 2})`}>
          α
        </text>

        {/* Species legend */}
        {Array.from({ length: nSpecies }, (_, si) => (
          <g key={si} transform={`translate(${PL + 8 + si * 80}, ${PT + 8})`}>
            <line x1={0} y1={5} x2={16} y2={5} stroke={speciesColors[si]} strokeWidth={2} />
            <text x={20} y={9} fontSize={9} fill={speciesColors[si]}>{speciesLabel(si)}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

// ── Predominance row ──────────────────────────────────────────────────────────
function PredominanceRow({
  segments, metalSymbol, baseColor,
}: {
  uid: string
  segments: ReturnType<typeof buildPredominanceSegments>
  metalSymbol: string
  baseColor: string
}) {
  const xMin = -8
  const xMax = 0
  const BAND_H = 32
  const PL_ROW = 70
  const IW_ROW = W - PL_ROW - 10
  const AXIS_H = 18

  const toX = (v: number) => PL_ROW + ((v - xMin) / (xMax - xMin)) * IW_ROW

  const PALETTE = [
    "#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#a855f7", "#ec4899",
  ]

  const ticks = [-8, -6, -4, -2, 0]

  return (
    <div>
      <p className="text-[11px] text-muted-foreground mb-1">
        <span className="inline-block h-2 w-2 rounded-full mr-1" style={{ backgroundColor: baseColor }} />
        {metalSymbol}
      </p>
      <svg viewBox={`0 0 ${W} ${BAND_H + AXIS_H}`} className="w-full rounded border border-border/30 bg-card/40">
        {segments.map((seg, i) => {
          const x1 = toX(seg.x1)
          const x2 = toX(seg.x2)
          const w  = Math.max(x2 - x1, 1)
          const fill = PALETTE[seg.speciesIndex % PALETTE.length]
          return (
            <g key={i}>
              <rect x={x1} y={0} width={w} height={BAND_H} fill={fill} fillOpacity={0.45} />
              {w > 30 && (
                <text x={(x1 + x2) / 2} y={BAND_H / 2 + 4} textAnchor="middle" fontSize={9} fill={fill} fontWeight={500}>
                  {seg.label}
                </text>
              )}
            </g>
          )
        })}
        {/* Axis */}
        {ticks.map((x) => (
          <g key={x}>
            <line x1={toX(x)} y1={BAND_H} x2={toX(x)} y2={BAND_H + 4} stroke="currentColor" strokeOpacity={0.3} />
            <text x={toX(x)} y={BAND_H + AXIS_H - 2} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.4}>{x}</text>
          </g>
        ))}
        <text x={PL_ROW + IW_ROW / 2} y={BAND_H + AXIS_H + 1} textAnchor="middle" fontSize={8} fill="currentColor" opacity={0.3}>
          log[L′]
        </text>
      </svg>
    </div>
  )
}

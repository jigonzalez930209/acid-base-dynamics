import { useMemo } from "react"

import { Activity, Atom, Beaker, Hexagon, Zap } from "lucide-react"

import { ChemicalFormula } from "@/components/shared/chemical-formula"
import { MathExpression } from "@/components/shared/math-expression"
import { SvgChart, buildLinePath } from "@/components/app/svg-chart"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAcidBaseState } from "@/hooks/use-acid-base-state"
import { LanguageSwitcher } from "@/features/i18n/language-switcher"
import { ThemeToggle } from "@/features/theme/theme-toggle"
import { classifyPH } from "@/features/chemistry/lib/acid-math"
import { buildSpeciationSeries, calcAlphas } from "@/features/chemistry/lib/acid-math"
import { buildTitrationSeries } from "@/features/chemistry/lib/acid-math"
import { getEquilibriumSteps } from "@/features/chemistry/lib/equilibria"
import { buildAlphaModel } from "@/features/chemistry/lib/formulas"
import { LayoutNav } from "@/layouts/layout-nav"

export default function FuturisticLayout() {
  const {
    t, locale, globalPH, setGlobalPH,
    resolvedSlots, activeSlots, equilibriumCount,
    acidDatabase, acidCount, handleAcidChange, handlePkaChange,
  } = useAcidBaseState()

  const profile = classifyPH(globalPH)

  const speciationData = useMemo(
    () => activeSlots.map((slot) => ({ ...slot, series: buildSpeciationSeries(slot.pKas) })),
    [activeSlots]
  )

  const titrationData = useMemo(
    () => activeSlots.map((slot) => ({ ...slot, series: buildTitrationSeries(slot.pKas) })),
    [activeSlots]
  )

  const maxOrder = useMemo(
    () => Math.max(1, ...activeSlots.map((slot) => slot.acid.proticType)),
    [activeSlots]
  )
  const model = buildAlphaModel(maxOrder)

  return (
    <div className="futuristic-layout min-h-svh">
      {/* Scanline overlay */}
      <div className="pointer-events-none fixed inset-0 z-[100] opacity-[0.03]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, currentColor 2px, currentColor 3px)" }} />

      {/* Header bar — HUD style */}
      <header className="sticky top-0 z-50 border-b border-primary/30 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Hexagon className="size-5 text-primary animate-spin" style={{ animationDuration: "8s" }} />
            <span className="text-sm font-bold uppercase tracking-[0.3em] text-primary">
              ACID · BASE
            </span>
            <span className="hidden sm:inline text-[10px] text-primary/50 font-mono uppercase tracking-widest">
              dynamics
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LayoutNav />
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
        {/* Animated glow line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* Hero */}
        <section className="relative mb-10 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 md:p-8">
          <div className="absolute -right-20 -top-20 size-60 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 size-48 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Atom className="size-4 text-primary" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-primary font-mono">
                {t("header.eyebrow")}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {t("header.title")}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground leading-relaxed">
              {t("header.description")}
            </p>
            <div className="mt-4 flex gap-4">
              {[
                { icon: Beaker, value: acidCount, label: t("header.stats.acids") },
                { icon: Activity, value: activeSlots.length, label: t("header.stats.slots") },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5">
                  <Icon className="size-3.5 text-primary" />
                  <span className="text-sm font-bold tabular-nums text-primary">{value}</span>
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="space-y-4">
            {/* pH HUD card */}
            <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/5 to-background p-5">
              <div className="absolute right-3 top-3">
                <Zap className="size-4 text-primary/30" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-mono mb-1">
                {t("controls.systemPH")}
              </p>
              <div className="text-6xl font-black tabular-nums text-foreground leading-none mb-1"
                style={{ textShadow: `0 0 40px color-mix(in oklab, var(--primary) 30%, transparent)` }}>
                {globalPH.toFixed(2)}
              </div>
              <p className="text-xs text-primary/70 font-mono uppercase mb-4">
                {t(`controls.profile.${profile}`)}
              </p>

              <Slider
                value={[globalPH]}
                min={0} max={14} step={0.05}
                onValueChange={(v) => setGlobalPH(v[0] ?? globalPH)}
              />

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { label: t("controls.activeSystems"), value: activeSlots.length },
                  { label: t("controls.equilibriumSteps"), value: equilibriumCount },
                  { label: t("controls.profileLabel"), value: String(profile) },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg border border-primary/10 bg-primary/5 p-2 text-center">
                    <div className="text-sm font-bold tabular-nums text-foreground">{value}</div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-wide">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Acid slots */}
            {resolvedSlots.map((slot, idx) => (
              <div key={`slot-${idx}`}
                className="relative overflow-hidden rounded-2xl border bg-card p-4"
                style={{ borderColor: slot.acid.id !== "none" ? `color-mix(in oklab, ${slot.color} 40%, transparent)` : undefined }}>
                {/* Glow accent */}
                {slot.acid.id !== "none" && (
                  <div className="absolute -right-8 -top-8 size-24 rounded-full blur-2xl"
                    style={{ backgroundColor: slot.glow }} />
                )}

                <div className="relative space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-mono">
                        <Beaker className="size-3" style={{ color: slot.acid.id !== "none" ? slot.color : undefined }} />
                        {t("controls.slot", { index: idx + 1 })}
                      </div>
                      <div className="text-base font-bold text-foreground truncate mt-0.5">
                        {slot.acid.names[locale]}
                      </div>
                      {slot.acid.id !== "none" && (
                        <ChemicalFormula formula={slot.acid.formula} className="text-xs text-muted-foreground" />
                      )}
                    </div>
                    {slot.acid.proticType > 0 && (
                      <span className="shrink-0 rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-mono text-primary">
                        {slot.acid.proticType} pKa
                      </span>
                    )}
                  </div>

                  <Select value={slot.acidId} onValueChange={(v) => handleAcidChange(idx, v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("controls.chooseAcid")} />
                    </SelectTrigger>
                    <SelectContent>
                      {acidDatabase.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>{opt.names[locale]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {slot.acid.id !== "none" && (
                    <>
                      <Separator className="opacity-30" />
                      <div className="space-y-3">
                        {slot.pKas.map((pKa, pIdx) => (
                          <div key={`${idx}-${pIdx}`} className="space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-muted-foreground font-mono">{t("controls.pka", { index: pIdx + 1 })}</span>
                              <span className="font-mono font-bold text-primary">{pKa.toFixed(2)}</span>
                            </div>
                            <Slider
                              value={[pKa]}
                              min={-1} max={14} step={0.01}
                              onValueChange={(v) => handlePkaChange(idx, pIdx, v[0] ?? pKa)}
                            />
                          </div>
                        ))}
                      </div>
                      {slot.acid.notes?.[locale] && (
                        <p className="border-l-2 border-primary/30 pl-3 text-[11px] italic text-muted-foreground">
                          {slot.acid.notes[locale]}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </aside>

          {/* Main content */}
          <section className="space-y-5 min-w-0">
            {/* Legend */}
            {activeSlots.length > 0 && (
              <div className="flex flex-wrap items-center gap-4 rounded-xl border border-primary/10 bg-primary/5 px-4 py-2.5">
                <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-mono">
                  {t("legend.title")}
                </span>
                {activeSlots.map((slot) => (
                  <div key={slot.acid.id} className="flex items-center gap-2">
                    <svg width="20" height="8" aria-hidden="true">
                      <line x1="0" y1="4" x2="20" y2="4" stroke={slot.color} strokeWidth="2.5" strokeDasharray={slot.dash} />
                    </svg>
                    <span className="text-sm text-foreground">{slot.acid.names[locale]}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Speciation chart */}
            <div className="overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-card to-primary/[0.02]">
              <div className="flex items-center gap-2 border-b border-primary/10 px-4 py-3 md:px-5">
                <Activity className="size-4 text-primary" />
                <h2 className="text-lg font-bold text-foreground">{t("charts.speciationTitle")}</h2>
              </div>
              <div className="p-3 md:p-4 text-foreground">
                <SvgChart
                  xLabel={t("charts.xPh")} yLabel={t("charts.yAlpha")}
                  xMin={0} xMax={14} yMin={0} yMax={1}
                  xTicks={[0, 2, 4, 6, 8, 10, 12, 14]}
                  yTicks={[0, 0.25, 0.5, 0.75, 1]}
                >
                  {({ top, height, mapX, mapY }) => (
                    <>
                      {speciationData.flatMap((slot) =>
                        slot.series.map((series, i) => (
                          <path key={`${slot.acid.id}-${i}`} d={buildLinePath(series, mapX, mapY)}
                            fill="none" stroke={slot.color} strokeWidth="2.5" strokeDasharray={slot.dash} opacity="0.9"
                            style={{ filter: `drop-shadow(0 0 4px ${slot.color}40)` }} />
                        ))
                      )}
                      <line x1={mapX(globalPH)} y1={top} x2={mapX(globalPH)} y2={top + height}
                        stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" opacity="0.4" />
                    </>
                  )}
                </SvgChart>
              </div>
            </div>

            {/* Titration chart */}
            <div className="overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-card to-accent/[0.02]">
              <div className="flex items-center gap-2 border-b border-primary/10 px-4 py-3 md:px-5">
                <Beaker className="size-4 text-primary" />
                <h2 className="text-lg font-bold text-foreground">{t("charts.titrationTitle")}</h2>
              </div>
              <div className="p-3 md:p-4 text-foreground">
                <SvgChart
                  xLabel={t("charts.xVolume")} yLabel={t("charts.yPh")}
                  xMin={0} xMax={350} yMin={0} yMax={14}
                  xTicks={[0, 50, 100, 150, 200, 250, 300, 350]}
                  yTicks={[0, 2, 4, 6, 8, 10, 12, 14]}
                >
                  {({ left, width, mapX, mapY }) => (
                    <>
                      {titrationData.map((slot) => (
                        <g key={slot.acid.id}>
                          <path d={buildLinePath(slot.series, mapX, mapY)} fill="none"
                            stroke={slot.color} strokeWidth="3" strokeDasharray={slot.dash}
                            style={{ filter: `drop-shadow(0 0 3px ${slot.color}40)` }} />
                          {slot.pKas.map((pKa, i) => (
                            <line key={`${slot.acid.id}-${i}`}
                              x1={left} y1={mapY(pKa)} x2={left + width} y2={mapY(pKa)}
                              stroke={slot.color} strokeDasharray="3 5" strokeWidth="1" opacity="0.25" />
                          ))}
                        </g>
                      ))}
                      <line x1={left} y1={mapY(globalPH)} x2={left + width} y2={mapY(globalPH)}
                        stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" opacity="0.4" />
                    </>
                  )}
                </SvgChart>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="equilibria">
              <TabsList className="w-full justify-start rounded-none border-b border-primary/20 bg-transparent p-0 gap-0">
                {(["equilibria", "model", "roadmap"] as const).map((tab) => (
                  <TabsTrigger key={tab} value={tab}
                    className="rounded-none border-b-2 border-transparent px-4 pb-2 pt-0 text-xs font-mono uppercase tracking-wider
                      data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:shadow-none">
                    {t(`tabs.${tab}`)}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Equilibria */}
              <TabsContent value="equilibria" className="mt-5">
                <ScrollArea className="h-[500px] pr-3">
                  <div className="space-y-8">
                    {activeSlots.length > 0 ? activeSlots.map((slot) => {
                      const steps = getEquilibriumSteps(slot.acid)
                      const isSymbolic = steps.some((s) => s.mode === "symbolic")
                      return (
                        <div key={slot.acid.id} className="rounded-xl border border-primary/10 bg-card/50 p-4">
                          <div className="mb-3 flex items-baseline justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-1 rounded-full" style={{ backgroundColor: slot.color, boxShadow: `0 0 8px ${slot.color}60` }} />
                              <span className="font-bold text-foreground">{slot.acid.names[locale]}</span>
                              <ChemicalFormula formula={slot.acid.formula} className="text-sm text-muted-foreground" />
                            </div>
                            <span className="text-[10px] uppercase tracking-wider text-primary font-mono">
                              {isSymbolic ? t("equilibria.symbolic") : t("equilibria.structural")}
                            </span>
                          </div>
                          {steps.map((step, i) => (
                            <div key={`${slot.acid.id}-${step.index}`}>
                              {i > 0 && <Separator className="my-3 opacity-20" />}
                              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                                <span className="font-mono font-medium text-primary/80">Ka{step.index}</span>
                                <span className="font-mono">pKa = {step.pKa.toFixed(2)}</span>
                              </div>
                              <MathExpression block math={step.equation} className="text-foreground" />
                            </div>
                          ))}
                          {slot.acid.notes?.[locale] && (
                            <p className="mt-3 border-l-2 border-primary/30 pl-3 text-xs italic text-muted-foreground">
                              {slot.acid.notes[locale]}
                            </p>
                          )}
                        </div>
                      )
                    }) : (
                      <div className="py-12 text-center text-sm text-muted-foreground">{t("misc.unsupported")}</div>
                    )}
                    <p className="border-l-2 border-primary/20 pl-3 text-xs italic text-muted-foreground">
                      {t("equilibria.symbolicHint")}
                    </p>
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Model */}
              <TabsContent value="model" className="mt-5">
                <div className="grid gap-8 xl:grid-cols-[1fr_260px]">
                  <div className="space-y-5 min-w-0">
                    <div className="rounded-xl border border-primary/10 bg-card/50 p-4">
                      <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-primary font-mono">{t("model.denominator")}</p>
                      <MathExpression block math={model.denominator} className="text-foreground" />
                    </div>
                    <div className="space-y-2 rounded-xl border border-primary/10 bg-card/50 p-4">
                      {model.alphaExpressions.map((expr) => (
                        <MathExpression key={expr} block math={expr} className="text-foreground" />
                      ))}
                    </div>
                    {[
                      { key: "model.avgCharge", math: model.averageCharge },
                      { key: "model.titration", math: model.titration },
                      { key: "model.concentrations", math: model.concentrations },
                    ].map(({ key, math }) => (
                      <div key={key} className="rounded-xl border border-primary/10 bg-card/50 p-4">
                        <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-primary font-mono">{t(key)}</p>
                        <MathExpression block math={math} className="text-foreground" />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-mono">{t("model.currentFractions")}</p>
                    {activeSlots.length > 0 ? activeSlots.map((slot, si) => {
                      const fractions = calcAlphas(globalPH, slot.pKas)
                      return (
                        <div key={slot.acid.id} className="rounded-xl border border-primary/10 bg-card/50 p-3">
                          {si > 0 && <Separator className="mb-3 opacity-20" />}
                          <div className="mb-2 flex items-center gap-2">
                            <div className="size-2 rounded-full" style={{ backgroundColor: slot.color, boxShadow: `0 0 6px ${slot.color}` }} />
                            <span className="text-sm font-medium text-foreground">{slot.acid.names[locale]}</span>
                            <span className="text-[10px] text-primary font-mono">pH {globalPH.toFixed(2)}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            {fractions.map((f, i) => (
                              <div key={`${slot.acid.id}-${i}`}
                                className="flex items-baseline justify-between rounded-md bg-primary/5 px-2 py-1">
                                <span className="text-[10px] text-muted-foreground font-mono">α{i}</span>
                                <span className="font-mono text-xs font-bold text-foreground">{f.toFixed(3)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    }) : (
                      <p className="text-sm text-muted-foreground">{t("misc.unsupported")}</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Roadmap */}
              <TabsContent value="roadmap" className="mt-5">
                <RoadmapFuturistic t={t} />
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </main>
    </div>
  )
}

function RoadmapFuturistic({ t }: { t: (key: string, opts?: Record<string, unknown>) => string }) {
  const phases = t("roadmap.phases", { returnObjects: true }) as unknown as Array<{ title: string; summary: string }>
  return (
    <ScrollArea className="h-[500px] pr-3">
      <div className="relative pl-10">
        <div className="absolute left-4 top-3 bottom-3 w-px bg-gradient-to-b from-primary via-primary/50 to-transparent" />
        <div className="space-y-0">
          {phases.map((phase, i) => (
            <div key={phase.title} className="relative pb-8 last:pb-0">
              <div className="absolute -left-10 flex size-8 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-[10px] font-mono font-bold text-primary"
                style={{ boxShadow: `0 0 12px color-mix(in oklab, var(--primary) 20%, transparent)` }}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="space-y-1 pt-1">
                <div className="text-sm font-bold text-foreground">{phase.title}</div>
                <p className="text-sm leading-relaxed text-muted-foreground">{phase.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}

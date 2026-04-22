/**
 * Dashboard — Overview module with module cards and global controls.
 */
import { useTranslation } from "react-i18next"
import { useChemistry } from "../../context/chemistry-context"
import { MODULE_DEFINITIONS } from "../../config/modules"
import { Slider } from "@/components/ui/slider"
import {
  LayoutDashboard, FlaskConical, Atom, CloudRain, Zap,
  Beaker, BarChart3, GraduationCap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ModuleId } from "../../types"
import type { Locale } from "@/features/chemistry/types/models"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, FlaskConical, Atom, CloudRain, Zap,
  Beaker, BarChart3, GraduationCap,
}

export function DashboardModule() {
  const { i18n } = useTranslation()
  const locale: Locale = i18n.resolvedLanguage === "en" ? "en" : "es"
  const {
    globalPH, setGlobalPH,
    concentration, setConcentration,
    temperature, setTemperature,
    setActiveModule,
  } = useChemistry()

  const modules = MODULE_DEFINITIONS.filter((m) => m.id !== "dashboard")

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Global Controls */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <label className="text-xs font-medium text-muted-foreground">pH</label>
          <div className="flex items-center gap-3 mt-2">
            <Slider
              value={[globalPH]}
              onValueChange={([v]) => setGlobalPH(v)}
              min={0} max={14} step={0.1}
              className="flex-1"
            />
            <span className="text-sm font-mono w-10 text-right">{globalPH.toFixed(1)}</span>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <label className="text-xs font-medium text-muted-foreground">
            {locale === "es" ? "Concentración (M)" : "Concentration (M)"}
          </label>
          <div className="flex items-center gap-3 mt-2">
            <Slider
              value={[Math.log10(concentration)]}
              onValueChange={([v]) => setConcentration(Math.pow(10, v))}
              min={-6} max={0} step={0.1}
              className="flex-1"
            />
            <span className="text-sm font-mono w-16 text-right">{concentration.toExponential(1)}</span>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <label className="text-xs font-medium text-muted-foreground">
            {locale === "es" ? "Temperatura (°C)" : "Temperature (°C)"}
          </label>
          <div className="flex items-center gap-3 mt-2">
            <Slider
              value={[temperature]}
              onValueChange={([v]) => setTemperature(v)}
              min={0} max={100} step={1}
              className="flex-1"
            />
            <span className="text-sm font-mono w-10 text-right">{temperature}°</span>
          </div>
        </div>
      </section>

      {/* Module Cards */}
      <section>
        <h2 className="text-lg font-semibold mb-4">
          {locale === "es" ? "Módulos" : "Modules"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {modules.map((mod) => {
            const Icon = ICON_MAP[mod.icon] ?? LayoutDashboard
            return (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod.id as ModuleId)}
                className={cn(
                  "flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-5",
                  "transition-all hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5",
                  "text-left group"
                )}
              >
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10"
                >
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">{mod.label[locale]}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{mod.description[locale]}</p>
                </div>
                {mod.subRoutes && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {mod.subRoutes.map((sr) => (
                      <span key={sr.id} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {sr.label[locale]}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}

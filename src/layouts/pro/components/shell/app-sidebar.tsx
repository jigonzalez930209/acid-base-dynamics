import { useTranslation } from "react-i18next"
import { useChemistry } from "../../context/chemistry-context"
import {
  LayoutDashboard, FlaskConical, Atom, CloudRain, Zap,
  Beaker, BarChart3, GraduationCap, PanelLeftClose, PanelLeftOpen,
} from "lucide-react"
import { MODULE_DEFINITIONS } from "../../config/modules"
import { cn } from "@/lib/utils"
import type { ModuleId } from "../../types"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, FlaskConical, Atom, CloudRain, Zap,
  Beaker, BarChart3, GraduationCap,
}

export function AppSidebar() {
  const { i18n } = useTranslation()
  const locale = i18n.resolvedLanguage === "en" ? "en" : "es"
  const { activeModule, setActiveModule, sidebarCollapsed, setSidebarCollapsed } = useChemistry()

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-200",
        sidebarCollapsed ? "w-16" : "w-56"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-sidebar-border">
        {!sidebarCollapsed && (
          <span className="text-sm font-semibold tracking-tight truncate">ChemDynamics</span>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5" role="navigation" aria-label="Main navigation">
        {MODULE_DEFINITIONS.map((mod) => {
          const Icon = ICON_MAP[mod.icon] ?? LayoutDashboard
          const isActive = activeModule === mod.id
          return (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id as ModuleId)}
              data-testid={`nav-${mod.id}`}
              className={cn(
                "flex items-center w-full rounded-lg text-left transition-colors text-sm",
                sidebarCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              title={sidebarCollapsed ? mod.label[locale] : undefined}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              {!sidebarCollapsed && <span className="truncate">{mod.label[locale]}</span>}
            </button>
          )
        })}
      </nav>

      {/* Version */}
      <div className="px-3 py-3 border-t border-sidebar-border">
        {!sidebarCollapsed && (
          <span className="text-[10px] text-sidebar-foreground/40">v2.0.0 · Pro</span>
        )}
      </div>
    </aside>
  )
}

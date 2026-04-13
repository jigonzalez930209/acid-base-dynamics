/**
 * Pro Layout — Main entry point.
 * Wraps ChemistryProvider + AppShell + module router.
 */
import { ChemistryProvider, useChemistry } from "./context/chemistry-context"
import { AppShell } from "./components/shell/app-shell"
import { DashboardModule } from "./modules/dashboard/dashboard-module"
import { AcidBaseModule } from "./modules/acid-base/acid-base-module"
import { ComplexationModule } from "./modules/complexation/complexation-module"
import { PrecipitationModule } from "./modules/precipitation/precipitation-module"
import { RedoxModule } from "./modules/redox/redox-module"
import { LabToolsModule } from "./modules/lab-tools/lab-tools-module"
import { VisualizationModule } from "./modules/visualization/visualization-module"
import { EducationModule } from "./modules/education/education-module"
import type { ModuleId } from "./types"

function ModuleRouter() {
  const { activeModule } = useChemistry()

  const MODULE_MAP: Record<ModuleId, React.ComponentType> = {
    "dashboard": DashboardModule,
    "acid-base": AcidBaseModule,
    "complexation": ComplexationModule,
    "precipitation": PrecipitationModule,
    "redox": RedoxModule,
    "lab-tools": LabToolsModule,
    "visualization": VisualizationModule,
    "education": EducationModule,
    "settings": SettingsPlaceholder,
  }

  const Module = MODULE_MAP[activeModule] ?? DashboardModule
  return <Module />
}

function SettingsPlaceholder() {
  return (
    <div className="p-6 text-center text-muted-foreground">
      <p className="text-sm">Settings — coming soon</p>
    </div>
  )
}

export function ProLayout() {
  return (
    <ChemistryProvider>
      <AppShell>
        <ModuleRouter />
      </AppShell>
    </ChemistryProvider>
  )
}

export default ProLayout

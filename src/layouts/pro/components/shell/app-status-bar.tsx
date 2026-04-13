import { useTranslation } from "react-i18next"
import { useChemistry } from "../../context/chemistry-context"
import { ACTIVITY_MODEL_LABELS } from "@/layouts/full/engine/activity"

export function AppStatusBar() {
  const { i18n } = useTranslation()
  const locale = i18n.resolvedLanguage === "en" ? "en" : "es"
  const { globalPH, concentration, temperature, ionicStrength, activityModel } = useChemistry()

  return (
    <footer className="flex items-center h-7 px-4 border-t border-border bg-muted/50 text-[11px] text-muted-foreground gap-4 shrink-0">
      <span>pH {globalPH.toFixed(2)}</span>
      <span className="text-border">|</span>
      <span>C = {concentration} M</span>
      <span className="text-border">|</span>
      <span>T = {temperature}°C</span>
      {ionicStrength > 0 && (
        <>
          <span className="text-border">|</span>
          <span>I = {ionicStrength} M</span>
        </>
      )}
      <span className="text-border">|</span>
      <span>{ACTIVITY_MODEL_LABELS[activityModel]?.[locale] ?? "Ideal"}</span>
      <span className="ml-auto opacity-60">Acid-Base Dynamics Pro</span>
    </footer>
  )
}

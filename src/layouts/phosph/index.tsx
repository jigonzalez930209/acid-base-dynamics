import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { PhosphProvider, usePhosph } from "./phosph-context"
import { InputView } from "./views/input-view"
import { IndicatorView } from "./views/indicator-view"
import { ResultView } from "./views/result-view"
import { ThemeToggle } from "@/features/theme/theme-toggle"
import { LanguageSwitcher } from "@/features/i18n/language-switcher"
import type { Locale } from "@/features/chemistry/types/models"

// ── Step indicator ─────────────────────────────────────────────────────────

const STEPS = {
  es: ["Datos", "Indicador", "Resultado"],
  en: ["Data", "Indicator", "Result"],
}

const STEP_INDEX = { input: 0, indicator: 1, result: 2 }

function StepBar({ locale }: { locale: "es" | "en" }) {
  const { state } = usePhosph()
  const steps = STEPS[locale]
  const current = STEP_INDEX[state.step]

  return (
    <nav aria-label={locale === "es" ? "Pasos del TP" : "TP steps"} className="flex items-center gap-1">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-1">
          <div
            className={[
              "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-colors",
              i < current
                ? "bg-primary text-primary-foreground"
                : i === current
                  ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : "bg-muted text-muted-foreground",
            ].join(" ")}
            aria-current={i === current ? "step" : undefined}
          >
            {i < current ? "✓" : i + 1}
          </div>
          <span className={`text-xs ${i === current ? "text-foreground font-medium" : "text-muted-foreground"}`}>
            {label}
          </span>
          {i < steps.length - 1 && (
            <div className={`mx-1 h-px w-6 ${i < current ? "bg-primary" : "bg-border"}`} />
          )}
        </div>
      ))}
    </nav>
  )
}

// ── Inner layout (needs context) ───────────────────────────────────────────

function PhosphInner({ locale }: { locale: "es" | "en" }) {
  const { state } = usePhosph()

  return (
    <div className="flex flex-col min-h-svh bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/90 backdrop-blur-sm">
        {/* Row 1: back · title · controls */}
        <div className="mx-auto flex h-11 max-w-lg items-center justify-between gap-2 px-4">
          <Link to="/" className="shrink-0 text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← acid·base
          </Link>
          <span className="truncate text-sm font-semibold text-foreground">
            {locale === "es" ? "Fosfatos · TP" : "Phosphate Lab"}
          </span>
          <div className="flex shrink-0 items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
        {/* Row 2: step bar */}
        <div className="mx-auto flex max-w-lg justify-center px-4 pb-2">
          <StepBar locale={locale} />
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-8">
        {state.step === "input" && <InputView locale={locale} />}
        {state.step === "indicator" && <IndicatorView locale={locale} />}
        {state.step === "result" && state.result && <ResultView locale={locale} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-3 text-center">
        <p className="text-[10px] text-muted-foreground">
          {locale === "es"
            ? "Cálculos 100% locales · Sin base de datos · pKa 2.15 / 7.20 / 12.35 (25 °C)"
            : "100% local calculations · No database · pKa 2.15 / 7.20 / 12.35 (25 °C)"}
        </p>
      </footer>
    </div>
  )
}

// ── Public layout component ────────────────────────────────────────────────

export default function PhosphLayout() {
  const { i18n } = useTranslation()
  const locale = (i18n.language === "es" ? "es" : "en") as Locale

  return (
    <PhosphProvider>
      <PhosphInner locale={locale} />
    </PhosphProvider>
  )
}

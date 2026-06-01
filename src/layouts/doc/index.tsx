import { Link } from "react-router-dom"
import { DocProvider, useDoc } from "./doc-context"
import { UploadView } from "./views/upload-view"
import { ValidateView } from "./views/validate-view"
import { ExploreView } from "./views/explore-view"
import { ChartsView } from "./views/charts-view"
import { ExportView } from "./views/export-view"
import { ThemeToggle } from "@/features/theme/theme-toggle"
import { LanguageSwitcher } from "@/features/i18n/language-switcher"
import { useTranslation } from "react-i18next"
import type { Locale } from "@/features/chemistry/types/models"

// ── Step bar ──────────────────────────────────────────────────────────────

type DocStep = "upload" | "validate" | "explore" | "charts" | "export"

const STEPS: Record<"es" | "en", string[]> = {
  es: ["Cargar", "Validar", "Explorar", "Figuras", "Exportar"],
  en: ["Upload", "Validate", "Explore", "Charts", "Export"],
}

const STEP_ORDER: DocStep[] = ["upload", "validate", "explore", "charts", "export"]

function StepBar({ locale }: { locale: "es" | "en" }) {
  const { state } = useDoc()
  const steps = STEPS[locale]
  const currentIdx = STEP_ORDER.indexOf(state.step)

  return (
    <nav aria-label={locale === "es" ? "Pasos del análisis" : "Analysis steps"} className="flex items-center gap-1">
      {steps.map((label, i) => {
        const done = i < currentIdx
        const active = i === currentIdx
        return (
          <div key={label} className="flex items-center gap-1">
            <div
              className={[
                "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all",
                done ? "bg-primary text-primary-foreground" : active ? "ring-2 ring-primary bg-background text-primary" : "bg-muted text-muted-foreground",
              ].join(" ")}
            >
              {done ? "✓" : i + 1}
            </div>
            <span className={`hidden sm:inline text-xs font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}>
              {label}
            </span>
            {i < steps.length - 1 && (
              <div className={`h-px w-3 sm:w-5 ${i < currentIdx ? "bg-primary" : "bg-muted"}`} />
            )}
          </div>
        )
      })}
    </nav>
  )
}

// ── Inner layout (needs context) ──────────────────────────────────────────

function DocInner() {
  const { i18n } = useTranslation()
  const locale: "es" | "en" = (i18n.language === "es" ? "es" : "en") as Locale
  const { state } = useDoc()

  const TITLE: Record<"es" | "en", string> = {
    es: "DocDashboard · TP Fosfatos",
    en: "DocDashboard · Phosphate Lab",
  }

  return (
    <div className="min-h-screen bg-background text-foreground print:bg-white print:text-black">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={locale === "es" ? "Volver al inicio" : "Back to home"}
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <span className="text-sm font-semibold text-foreground truncate">{TITLE[locale]}</span>
          </div>

          <StepBar locale={locale} />

          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-4 py-8 print:p-0">
        {state.step === "upload" && <UploadView locale={locale} />}
        {state.step === "validate" && <ValidateView locale={locale} />}
        {state.step === "explore" && <ExploreView locale={locale} />}
        {state.step === "charts" && <ChartsView locale={locale} />}
        {state.step === "export" && <ExportView locale={locale} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-4 print:hidden">
        <p className="text-center text-xs text-muted-foreground">
          {locale === "es"
            ? "Todos los datos se procesan localmente en tu navegador — sin servidores, sin cookies, sin telemetría."
            : "All data is processed locally in your browser — no servers, no cookies, no telemetry."}
        </p>
      </footer>
    </div>
  )
}

// ── Public export ──────────────────────────────────────────────────────────

export default function DocLayout() {
  return (
    <DocProvider>
      <DocInner />
    </DocProvider>
  )
}

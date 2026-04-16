import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { PhaseNav } from "./phase-nav"
import { Phase1View } from "./views/phase1-view"
import { Phase2View } from "./views/phase2-view"
import { Phase3View } from "./views/phase3-view"
import { Phase4View } from "./views/phase4-view"
import { Phase5View } from "./views/phase5-view"
import { Phase6View } from "./views/phase6-view"
import { Phase7View } from "./views/phase7-view"
import { ThemeToggle } from "@/features/theme/theme-toggle"
import { LanguageSwitcher } from "@/features/i18n/language-switcher"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Locale } from "@/features/chemistry/types/models"

const PHASE_VIEWS = [Phase1View, Phase2View, Phase3View, Phase4View, Phase5View, Phase6View, Phase7View]

export default function FullLayout() {
  const { i18n } = useTranslation()
  const locale = (i18n.language === "es" ? "es" : "en") as Locale
  const [activePhase, setActivePhase] = useState(1)

  const PhaseComponent = PHASE_VIEWS[activePhase - 1]

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-4 py-2 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold tracking-tight">
            {locale === "es" ? "Plataforma Completa" : "Full Platform"}
          </h1>
          <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
            7 {locale === "es" ? "fases" : "phases"} · 35 {locale === "es" ? "tareas" : "tasks"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← {locale === "es" ? "Minimalista" : "Minimalist"}
          </Link>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-52 shrink-0 border-r border-border bg-muted/5 hidden lg:block">
          <ScrollArea className="h-full p-2">
            <PhaseNav locale={locale} activePhase={activePhase} onPhaseChange={setActivePhase} />
          </ScrollArea>
        </aside>

        {/* Mobile nav */}
        <div className="lg:hidden border-b border-border overflow-x-auto shrink-0 absolute top-[49px] left-0 right-0 z-10 bg-background">
          <PhaseNav locale={locale} activePhase={activePhase} onPhaseChange={setActivePhase} />
        </div>

        {/* Main */}
        <main className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="max-w-4xl mx-auto p-4 lg:p-6 lg:mt-0 mt-10">
              <PhaseComponent locale={locale} />
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  )
}

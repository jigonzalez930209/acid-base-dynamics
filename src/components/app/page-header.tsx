import { Activity, Database, Languages, Orbit } from "lucide-react"
import { useTranslation } from "react-i18next"

import { LanguageSwitcher } from "@/features/i18n/language-switcher"
import { ThemeToggle } from "@/features/theme/theme-toggle"
import { ChemicalFormula } from "@/components/shared/chemical-formula"

type PageHeaderProps = {
  acidCount: number
  activeCount: number
}

export function PageHeader({ acidCount, activeCount }: PageHeaderProps) {
  const { t } = useTranslation()

  return (
    <header className="border-b pb-5">
      {/* Top bar: eyebrow + controls */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Orbit className="size-3.5 text-primary" />
          <span className="uppercase tracking-wider">{t("header.eyebrow")}</span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>

      {/* Title + description */}
      <div className="mb-4 space-y-1">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{t("header.title")}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">{t("header.description")}</p>
      </div>

      {/* Stats row + formula preview inline */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <div className="flex items-center gap-1.5">
          <Database className="size-3.5 text-muted-foreground" />
          <span className="font-semibold tabular-nums text-foreground">{acidCount}</span>
          <span className="text-muted-foreground">{t("header.stats.acids")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Languages className="size-3.5 text-muted-foreground" />
          <span className="font-semibold tabular-nums text-foreground">2</span>
          <span className="text-muted-foreground">{t("header.stats.languages")}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Activity className="size-3.5 text-muted-foreground" />
          <span className="font-semibold tabular-nums text-foreground">{activeCount}</span>
          <span className="text-muted-foreground">{t("header.stats.slots")}</span>
        </div>
        <span className="text-muted-foreground/30 select-none">|</span>
        <div className="flex items-center gap-3">
          <ChemicalFormula formula="H3PO4" />
          <ChemicalFormula formula="H2CO3" />
          <ChemicalFormula formula="NH4+" />
        </div>
      </div>
    </header>
  )
}

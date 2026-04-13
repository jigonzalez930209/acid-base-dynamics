import { useTranslation } from "react-i18next"
import { Moon, Sun, Globe } from "lucide-react"
import { useTheme } from "next-themes"
import { useChemistry } from "../../context/chemistry-context"
import { MODULE_DEFINITIONS } from "../../config/modules"

export function AppHeader() {
  const { i18n, t } = useTranslation()
  const locale = i18n.resolvedLanguage === "en" ? "en" : "es"
  const { theme, setTheme } = useTheme()
  const { activeModule } = useChemistry()

  const currentModule = MODULE_DEFINITIONS.find((m) => m.id === activeModule)

  const toggleLang = () => {
    const next = locale === "es" ? "en" : "es"
    void i18n.changeLanguage(next)
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <header className="flex items-center justify-between h-12 px-4 border-b border-border bg-background/80 backdrop-blur-sm">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold text-foreground">
          {currentModule?.label[locale] ?? "Dashboard"}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleLang}
          className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label={t("common.changeLanguage", "Change language")}
          title={locale === "es" ? "Switch to English" : "Cambiar a español"}
        >
          <Globe className="h-4 w-4" />
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label={t("common.changeTheme", "Change theme")}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  )
}

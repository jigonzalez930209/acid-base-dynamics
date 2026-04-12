import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"

const LANGUAGES = [
  { code: "es", label: "ES" },
  { code: "en", label: "EN" },
] as const

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const language = i18n.resolvedLanguage === "en" ? "en" : "es"

  return (
    <div className="flex rounded border bg-muted/40 p-0 text-nowrap">
      {LANGUAGES.map((option) => (
        <button
          key={option.code}
          onClick={() => i18n.changeLanguage(option.code)}
          className={cn(
            "rounded px-2.5 py-1 text-xs font-medium transition-colors",
            language === option.code
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

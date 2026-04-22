/**
 * Education Module — Learning paths, exercises, sessions.
 */
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { LEARNING_PATHS } from "@/layouts/full/data/learning-paths"
import { ChemGrid } from "../../components/grids/chem-grid"
import { cn } from "@/lib/utils"
import type { GridColumn } from "../../types"
import type { Locale } from "@/features/chemistry/types/models"
import { BookOpen, CheckCircle, Circle, ChevronRight } from "lucide-react"

type SubView = "paths" | "exercises" | "sessions"

export function EducationModule() {
  const { i18n } = useTranslation()
  const locale: Locale = i18n.resolvedLanguage === "en" ? "en" : "es"
  const [subView, setSubView] = useState<SubView>("paths")

  const tabs: { id: SubView; label: string }[] = [
    { id: "paths", label: locale === "es" ? "Rutas de aprendizaje" : "Learning Paths" },
    { id: "exercises", label: locale === "es" ? "Ejercicios" : "Exercises" },
    { id: "sessions", label: locale === "es" ? "Sesiones" : "Sessions" },
  ]

  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      <div className="flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubView(tab.id)}
            className={cn(
              "px-3 py-1.5 text-xs rounded-md transition-colors",
              subView === tab.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {subView === "paths" && <PathsView locale={locale} />}
      {subView === "exercises" && <ExercisesView locale={locale} />}
      {subView === "sessions" && <SessionsView locale={locale} />}
    </div>
  )
}

function PathsView({ locale }: { locale: Locale }) {
  const [expandedPath, setExpandedPath] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      {LEARNING_PATHS.map((path) => (
        <div key={path.id} className="rounded-xl border border-border bg-card overflow-hidden">
          <button
            onClick={() => setExpandedPath(expandedPath === path.id ? null : path.id)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-medium text-sm">{path.title[locale]}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {path.steps.length} {locale === "es" ? "pasos" : "steps"} · {path.domain}
                </p>
              </div>
            </div>
            <ChevronRight className={cn("h-4 w-4 transition-transform", expandedPath === path.id && "rotate-90")} />
          </button>

          {expandedPath === path.id && (
            <div className="px-5 pb-4 space-y-3">
              {/* Objectives */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-1">
                  {locale === "es" ? "Objetivos" : "Objectives"}
                </h4>
                <ul className="space-y-1">
                  {path.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <Circle className="h-3 w-3 mt-0.5 text-muted-foreground shrink-0" />
                      {obj[locale]}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Steps */}
              <div className="space-y-3">
                {path.steps.map((step) => (
                  <div key={step.order} className="rounded-lg border border-border/50 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                        {step.order}
                      </span>
                      <h5 className="text-xs font-medium">{step.title[locale]}</h5>
                    </div>
                    <p className="text-xs text-muted-foreground italic ml-7">
                      {step.keyQuestion[locale]}
                    </p>
                    {step.commonErrors.length > 0 && (
                      <div className="mt-2 ml-7">
                        <span className="text-[10px] text-destructive font-medium">
                          {locale === "es" ? "Errores comunes:" : "Common errors:"}
                        </span>
                        <ul className="mt-0.5 space-y-0.5">
                          {step.commonErrors.map((err, i) => (
                            <li key={i} className="text-[11px] text-muted-foreground">• {err[locale]}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="mt-2 ml-7 text-[11px] text-primary bg-primary/5 rounded px-2 py-1">
                      ✓ {step.miniValidation[locale]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function ExercisesView({ locale }: { locale: Locale }) {
  const exercises = [
    {
      id: "ex-1",
      title: { es: "Calcular pH de ácido acético 0.1 M", en: "Calculate pH of 0.1 M acetic acid" },
      difficulty: { es: "Básico", en: "Basic" },
      domain: "acid-base",
    },
    {
      id: "ex-2",
      title: { es: "Especiación del ácido fosfórico", en: "Phosphoric acid speciation" },
      difficulty: { es: "Intermedio", en: "Intermediate" },
      domain: "acid-base",
    },
    {
      id: "ex-3",
      title: { es: "Constante condicional EDTA-Ca²⁺ a pH 10", en: "Conditional constant EDTA-Ca²⁺ at pH 10" },
      difficulty: { es: "Intermedio", en: "Intermediate" },
      domain: "complexation",
    },
    {
      id: "ex-4",
      title: { es: "Diagrama de Pourbaix del hierro", en: "Iron Pourbaix diagram" },
      difficulty: { es: "Avanzado", en: "Advanced" },
      domain: "redox",
    },
    {
      id: "ex-5",
      title: { es: "Precipitación selectiva de Fe³⁺ y Cu²⁺", en: "Selective precipitation of Fe³⁺ and Cu²⁺" },
      difficulty: { es: "Avanzado", en: "Advanced" },
      domain: "precipitation",
    },
  ]

  const columns: GridColumn[] = [
    { field: "title", headerName: locale === "es" ? "Ejercicio" : "Exercise" },
    { field: "difficulty", headerName: locale === "es" ? "Dificultad" : "Difficulty", cellRenderer: "badge" },
    { field: "domain", headerName: locale === "es" ? "Dominio" : "Domain" },
    { field: "status", headerName: locale === "es" ? "Estado" : "Status", cellRenderer: "status" },
  ]

  const data = exercises.map((ex) => ({
    title: ex.title[locale],
    difficulty: ex.difficulty[locale],
    domain: ex.domain,
    status: locale === "es" ? "Pendiente" : "Pending",
  }))

  return (
    <ChemGrid
      title={locale === "es" ? "Ejercicios disponibles" : "Available exercises"}
      columns={columns}
      data={data}
      searchable
    />
  )
}

function SessionsView({ locale }: { locale: Locale }) {
  return (
    <div className="rounded-xl border border-border bg-card p-8 text-center">
      <CheckCircle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
      <h3 className="text-sm font-medium">
        {locale === "es" ? "Sesiones de estudio" : "Study Sessions"}
      </h3>
      <p className="text-xs text-muted-foreground mt-1">
        {locale === "es"
          ? "Las sesiones se guardan automáticamente mientras trabajas en los módulos."
          : "Sessions are saved automatically as you work across modules."
        }
      </p>
    </div>
  )
}

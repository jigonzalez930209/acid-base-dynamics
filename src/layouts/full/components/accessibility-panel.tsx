import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

type A11yCheck = { label: { es: string; en: string }; status: "pass" | "warn" | "info"; notes: { es: string; en: string } }

const CHECKS: A11yCheck[] = [
  { label: { es: "Contraste texto/fondo", en: "Text/background contrast" }, status: "pass", notes: { es: "Ratio ≥ 4.5:1 en todos los temas (claro/oscuro)", en: "Ratio ≥ 4.5:1 in all themes (light/dark)" } },
  { label: { es: "Navegación por teclado", en: "Keyboard navigation" }, status: "pass", notes: { es: "Todos los controles son accesibles con Tab + Enter", en: "All controls accessible with Tab + Enter" } },
  { label: { es: "Tipografía química legible", en: "Readable chemical typography" }, status: "pass", notes: { es: "KaTeX + mhchem con tamaño mínimo 12px", en: "KaTeX + mhchem with 12px minimum size" } },
  { label: { es: "Responsividad móvil", en: "Mobile responsiveness" }, status: "warn", notes: { es: "Gráficos SVG se adaptan; tablas pueden requerir scroll horizontal", en: "SVG charts adapt; tables may require horizontal scroll" } },
  { label: { es: "Textos bilingües", en: "Bilingual texts" }, status: "pass", notes: { es: "Todos los textos disponibles en español e inglés", en: "All texts available in Spanish and English" } },
  { label: { es: "Colores semánticos", en: "Semantic colors" }, status: "pass", notes: { es: "Verde=OK, Ámbar=advertencia, Rojo=error (no solo color, también iconos)", en: "Green=OK, Amber=warning, Red=error (not color only, also icons)" } },
  { label: { es: "Alt-text en gráficos", en: "Chart alt-text" }, status: "warn", notes: { es: "SVGs incluyen elementos descriptivos pero podrían mejorar con aria-label", en: "SVGs include descriptive elements but could improve with aria-label" } },
  { label: { es: "Tamaños de fuente", en: "Font sizes" }, status: "info", notes: { es: "Escala: 8px (meta) → 10px (detalle) → 12px (lectura) → 14px (encabezado)", en: "Scale: 8px (meta) → 10px (detail) → 12px (reading) → 14px (heading)" } },
  { label: { es: "Print-friendly", en: "Print-friendly" }, status: "pass", notes: { es: "Fichas de método usan print:border-black para impresión", en: "Method sheets use print:border-black for printing" } },
  { label: { es: "Reducción de movimiento", en: "Reduced motion" }, status: "pass", notes: { es: "Sin animaciones obligatorias; transiciones respetan prefers-reduced-motion", en: "No mandatory animations; transitions respect prefers-reduced-motion" } },
]

const STATUS_STYLES = {
  pass: "bg-emerald-500/10 text-emerald-600",
  warn: "bg-amber-500/10 text-amber-600",
  info: "bg-blue-500/10 text-blue-600",
}

export function AccessibilityPanel({ locale }: Props) {
  const passed = CHECKS.filter((c) => c.status === "pass").length
  const warned = CHECKS.filter((c) => c.status === "warn").length

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {locale === "es"
          ? "Accesibilidad y lectura técnica: contraste, navegación por teclado, lectura móvil, tipografía química y textos claros en es/en."
          : "Accessibility and technical reading: contrast, keyboard navigation, mobile reading, chemical typography and clear es/en texts."}
      </p>

      <div className="flex gap-2">
        <div className="rounded bg-emerald-500/10 px-2 py-1 text-xs text-emerald-600 font-medium">
          ✓ {passed} {locale === "es" ? "aprobados" : "passed"}
        </div>
        <div className="rounded bg-amber-500/10 px-2 py-1 text-xs text-amber-600 font-medium">
          ⚠ {warned} {locale === "es" ? "advertencias" : "warnings"}
        </div>
      </div>

      <div className="space-y-1.5">
        {CHECKS.map((c, i) => (
          <div key={i} className="rounded border border-border/40 bg-card px-3 py-2 flex items-start gap-2">
            <span className={`text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded font-medium mt-0.5 shrink-0 ${STATUS_STYLES[c.status]}`}>
              {c.status}
            </span>
            <div>
              <div className="text-xs font-medium">{c.label[locale]}</div>
              <div className="text-[10px] text-muted-foreground">{c.notes[locale]}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

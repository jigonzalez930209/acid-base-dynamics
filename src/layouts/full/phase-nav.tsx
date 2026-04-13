import { Button } from "@/components/ui/button"
import type { Locale } from "@/features/chemistry/types/models"

type Props = {
  locale: Locale
  activePhase: number
  onPhaseChange: (phase: number) => void
}

const PHASES = [
  { num: 1, icon: "🛡️", title: { es: "Blindaje científico", en: "Scientific shielding" } },
  { num: 2, icon: "🧬", title: { es: "Lenguaje químico", en: "Chemical language" } },
  { num: 3, icon: "⚙️", title: { es: "Motor universal", en: "Universal engine" } },
  { num: 4, icon: "📊", title: { es: "Visualización", en: "Visualization" } },
  { num: 5, icon: "🧪", title: { es: "Flujo laboratorio", en: "Lab workflow" } },
  { num: 6, icon: "📚", title: { es: "Docencia", en: "Teaching" } },
  { num: 7, icon: "🌐", title: { es: "Ecosistema", en: "Ecosystem" } },
]

export function PhaseNav({ locale, activePhase, onPhaseChange }: Props) {
  return (
    <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible p-1">
      {PHASES.map((p) => (
        <Button
          key={p.num}
          variant={p.num === activePhase ? "default" : "ghost"}
          size="sm"
          onClick={() => onPhaseChange(p.num)}
          className="justify-start text-xs shrink-0 w-full"
        >
          <span className="mr-1.5">{p.icon}</span>
          <span className="hidden sm:inline">{p.num}.</span>
          <span className="ml-0.5 truncate">{p.title[locale]}</span>
        </Button>
      ))}
    </nav>
  )
}

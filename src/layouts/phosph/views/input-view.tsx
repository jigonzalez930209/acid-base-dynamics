import { usePhosph } from "../phosph-context"
import { PHInput } from "../components/ph-input"
import { TitrantSelector } from "../components/titrant-selector"
import { NormalityInput } from "../components/normality-input"
import { VolumeInput } from "../components/volume-input"

type Props = { locale: "es" | "en" }

const LABELS = {
  es: {
    title: "Paso 1 · Tus datos experimentales",
    system: "Sistema analítico",
    systemDesc: "H₃PO₄ 0.100 mol/L · Va = 20 mL  ·  pKa 2.15 / 7.20 / 12.35",
    titrantSection: "Titulante y concentración",
    pHSection: "Lectura en el punto de equivalencia",
    volumeSection: "Volumen de titulante (duplicado)",
    volumeHint: "Realizá dos titulaciones independientes.",
    next: "Elegir indicador →",
    fillAll: "Completá todos los campos para continuar",
  },
  en: {
    title: "Step 1 · Your experimental data",
    system: "Analytical system",
    systemDesc: "H₃PO₄ 0.100 mol/L · Va = 20 mL  ·  pKa 2.15 / 7.20 / 12.35",
    titrantSection: "Titrant & concentration",
    pHSection: "pH reading at the equivalence point",
    volumeSection: "Titrant volume (duplicate)",
    volumeHint: "Perform two independent titrations.",
    next: "Choose indicator →",
    fillAll: "Fill all fields to continue",
  },
}

function isValidPH(v: string) {
  if (!v) return false
  const n = parseFloat(v)
  return !isNaN(n) && n >= 0 && n <= 14
}

function isValidVolume(v: string) {
  if (!v) return false
  const n = parseFloat(v)
  return !isNaN(n) && n > 0 && n <= 200
}

function isValidNormality(v: string) {
  if (!v) return false
  const n = parseFloat(v)
  return !isNaN(n) && n > 0 && n <= 2
}

export function InputView({ locale }: Props) {
  const { state, dispatch } = usePhosph()
  const L = LABELS[locale]
  const { pH, titrant, normality, volume1, volume2 } = state.input

  const canContinue =
    titrant !== null &&
    isValidNormality(normality) &&
    isValidPH(pH) &&
    isValidVolume(volume1) &&
    isValidVolume(volume2)

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-base font-semibold text-foreground">{L.title}</h2>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">{L.system}</span>
          <span className="text-[10px] font-mono text-muted-foreground">{L.systemDesc}</span>
        </div>
      </div>

      {/* Titrant + normality */}
      <section className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{L.titrantSection}</h3>
        <TitrantSelector locale={locale} />
        <NormalityInput locale={locale} />
      </section>

      {/* pH reading */}
      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{L.pHSection}</h3>
        <PHInput locale={locale} />
      </section>

      {/* Duplicate volumes */}
      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{L.volumeSection}</h3>
        <p className="text-xs text-muted-foreground/70">{L.volumeHint}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <VolumeInput locale={locale} field="volume1" />
          <VolumeInput locale={locale} field="volume2" />
        </div>
      </section>

      <button
        type="button"
        disabled={!canContinue}
        onClick={() => dispatch({ type: "GO_TO_INDICATOR" })}
        aria-disabled={!canContinue}
        className={[
          "w-full rounded-lg px-4 py-3 text-sm font-semibold transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          canContinue
            ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            : "bg-muted text-muted-foreground cursor-not-allowed",
        ].join(" ")}
      >
        {canContinue ? L.next : L.fillAll}
      </button>
    </div>
  )
}



import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MathExpression } from "@/components/shared/math-expression"
import type { Locale } from "@/features/chemistry/types/models"

type Props = { locale: Locale }

type ExplStep = { title: { es: string; en: string }; content: { es: string; en: string }; formula?: string; highlight?: string }

const EXPLANATIONS: { topic: { es: string; en: string }; steps: ExplStep[] }[] = [
  {
    topic: { es: "¿Por qué domina CH₃COO⁻ a pH>pKa?", en: "Why does CH₃COO⁻ dominate at pH>pKa?" },
    steps: [
      { title: { es: "Equilibrio ácido-base", en: "Acid-base equilibrium" }, content: { es: "El ácido acético dona H⁺ al agua según Ka.", en: "Acetic acid donates H⁺ to water according to Ka." }, formula: String.raw`\text{CH}_3\text{COOH} \rightleftharpoons \text{CH}_3\text{COO}^- + \text{H}^+` },
      { title: { es: "Relación Henderson-Hasselbalch", en: "Henderson-Hasselbalch relation" }, content: { es: "Cuando pH = pKa, [HA] = [A⁻]. Si pH > pKa ⇒ [A⁻] > [HA].", en: "When pH = pKa, [HA] = [A⁻]. If pH > pKa ⇒ [A⁻] > [HA]." }, formula: String.raw`\text{pH} = \text{p}K_a + \log\frac{[\text{A}^-]}{[\text{HA}]}` },
      { title: { es: "Fracción molar", en: "Mole fraction" }, content: { es: "α₁ = Ka/(H⁺+Ka). A pH > pKa, Ka domina el denominador.", en: "α₁ = Ka/(H⁺+Ka). At pH > pKa, Ka dominates the denominator." }, formula: String.raw`\alpha_1 = \frac{K_a}{[\text{H}^+] + K_a}`, highlight: "α₁ → 1" },
      { title: { es: "Conclusión", en: "Conclusion" }, content: { es: "A pH alto se retira H⁺ del equilibrio, desplazando la reacción hacia CH₃COO⁻ (Le Chatelier).", en: "At high pH, H⁺ is removed from equilibrium, shifting the reaction towards CH₃COO⁻ (Le Chatelier)." } },
    ],
  },
  {
    topic: { es: "¿Por qué un buffer resiste cambios de pH?", en: "Why does a buffer resist pH changes?" },
    steps: [
      { title: { es: "Componentes del buffer", en: "Buffer components" }, content: { es: "Un buffer contiene un ácido débil y su base conjugada en concentraciones comparables.", en: "A buffer contains a weak acid and its conjugate base in comparable concentrations." } },
      { title: { es: "Adición de ácido", en: "Acid addition" }, content: { es: "Si se añade H⁺, A⁻ lo captura formando HA. El pH cambia poco.", en: "If H⁺ is added, A⁻ captures it forming HA. pH changes little." }, formula: String.raw`\text{A}^- + \text{H}^+ \to \text{HA}` },
      { title: { es: "Adición de base", en: "Base addition" }, content: { es: "Si se añade OH⁻, HA lo neutraliza liberando A⁻. El pH cambia poco.", en: "If OH⁻ is added, HA neutralizes it releasing A⁻. pH changes little." }, formula: String.raw`\text{HA} + \text{OH}^- \to \text{A}^- + \text{H}_2\text{O}` },
      { title: { es: "Capacidad máxima", en: "Maximum capacity" }, content: { es: "La capacidad buffer β es máxima cuando pH = pKa (donde [HA] ≈ [A⁻]).", en: "Buffer capacity β is maximum when pH = pKa (where [HA] ≈ [A⁻])." }, formula: String.raw`\beta = 2.303 C_T \alpha_0 \alpha_1`, highlight: "β_max en pH = pKa" },
    ],
  },
]

export function ExplanationViewer({ locale }: Props) {
  const [topicIdx, setTopicIdx] = useState(0)
  const [stepIdx, setStepIdx] = useState(0)
  const topic = EXPLANATIONS[topicIdx]
  const step = topic.steps[stepIdx]

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {locale === "es"
          ? "Motor de explicación paso a paso: justifica por qué domina una especie, por qué cambia una curva y por qué una condición mejora o empeora el método."
          : "Step-by-step explanation engine: explains why a species dominates, why a curve changes, and why a condition improves or worsens the method."}
      </p>

      <div className="flex gap-1.5 flex-wrap">
        {EXPLANATIONS.map((e, i) => (
          <Button key={i} size="sm" variant={i === topicIdx ? "default" : "outline"} onClick={() => { setTopicIdx(i); setStepIdx(0) }}>
            {e.topic[locale]}
          </Button>
        ))}
      </div>

      <div className="rounded border border-border/40 bg-card p-3 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[9px] bg-primary/10 text-primary rounded px-1.5 py-0.5 font-medium">
            {stepIdx + 1}/{topic.steps.length}
          </span>
          <span className="text-xs font-medium">{step.title[locale]}</span>
        </div>

        <p className="text-xs text-foreground">{step.content[locale]}</p>

        {step.formula && <MathExpression math={step.formula} block />}

        {step.highlight && (
          <div className="rounded bg-emerald-500/10 px-2 py-1 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
            → {step.highlight}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button size="sm" variant="outline" disabled={stepIdx === 0} onClick={() => setStepIdx((s) => s - 1)}>
            ← {locale === "es" ? "Anterior" : "Previous"}
          </Button>
          <Button size="sm" variant="outline" disabled={stepIdx === topic.steps.length - 1} onClick={() => setStepIdx((s) => s + 1)}>
            {locale === "es" ? "Siguiente" : "Next"} →
          </Button>
        </div>
      </div>

      <div className="flex gap-1">
        {topic.steps.map((_, i) => (
          <button key={i} onClick={() => setStepIdx(i)} className={`w-2 h-2 rounded-full ${i === stepIdx ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>
    </div>
  )
}

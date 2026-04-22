/**
 * Guided learning paths per chemistry domain.
 * Each path has objectives, key questions, common errors, and mini-validations.
 */

import type { LearningPath } from "../engine/types"

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: "lp-acidbase",
    domain: "acid-base",
    title: { es: "Equilibrio ácido-base desde cero", en: "Acid-base equilibrium from scratch" },
    objectives: [
      { es: "Comprender el concepto de pH y su escala logarítmica", en: "Understand pH concept and its logarithmic scale" },
      { es: "Relacionar pKa con la fuerza del ácido", en: "Relate pKa to acid strength" },
      { es: "Interpretar diagramas de especiación", en: "Interpret speciation diagrams" },
      { es: "Predecir el comportamiento del buffer", en: "Predict buffer behavior" },
    ],
    steps: [
      {
        order: 1,
        title: { es: "¿Qué es el pH?", en: "What is pH?" },
        keyQuestion: { es: "¿Por qué usamos una escala logarítmica para medir la acidez?", en: "Why do we use a logarithmic scale to measure acidity?" },
        commonErrors: [
          { es: "Pensar que pH 3 es 'un poco más ácido' que pH 4 (es 10× más ácido)", en: "Thinking pH 3 is 'slightly more acidic' than pH 4 (it's 10× more acidic)" },
          { es: "Creer que pH negativo es imposible (HCl concentrado puede tener pH < 0)", en: "Believing negative pH is impossible (concentrated HCl can have pH < 0)" },
        ],
        miniValidation: { es: "Calcula [H⁺] a pH 3.5 y verifica: 10⁻³·⁵ = 3.16×10⁻⁴ M", en: "Calculate [H⁺] at pH 3.5 and verify: 10⁻³·⁵ = 3.16×10⁻⁴ M" },
      },
      {
        order: 2,
        title: { es: "pKa y fuerza del ácido", en: "pKa and acid strength" },
        keyQuestion: { es: "¿Qué significa que un ácido tenga pKa = 4.75?", en: "What does it mean for an acid to have pKa = 4.75?" },
        commonErrors: [
          { es: "Confundir concentración con fuerza del ácido", en: "Confusing concentration with acid strength" },
          { es: "Olvidar que pKa bajo = ácido fuerte, pKa alto = ácido débil", en: "Forgetting that low pKa = strong acid, high pKa = weak acid" },
        ],
        miniValidation: { es: "Ordena HF (3.16), CH₃COOH (4.75), HCN (9.2) de más a menos fuerte", en: "Order HF (3.16), CH₃COOH (4.75), HCN (9.2) from strongest to weakest" },
      },
      {
        order: 3,
        title: { es: "Fracciones molares α", en: "Mole fractions α" },
        keyQuestion: { es: "¿Cómo se distribuyen las especies de un ácido a un pH dado?", en: "How are species of an acid distributed at a given pH?" },
        commonErrors: [
          { es: "Asumir que sólo existen dos especies (hay n+1 para un ácido con n protones)", en: "Assuming only two species exist (there are n+1 for an acid with n protons)" },
          { es: "No reconocer que Σαᵢ = 1 siempre", en: "Not recognizing that Σαᵢ = 1 always" },
        ],
        miniValidation: { es: "A pH = pKa₁ del fosfórico, ¿cuáles son α₀ y α₁?", en: "At pH = pKa₁ of phosphoric, what are α₀ and α₁?" },
      },
      {
        order: 4,
        title: { es: "Capacidad tampón", en: "Buffer capacity" },
        keyQuestion: { es: "¿Por qué un buffer resiste cambios de pH y cuándo deja de hacerlo?", en: "Why does a buffer resist pH changes and when does it stop?" },
        commonErrors: [
          { es: "Creer que un buffer mantiene pH exacto (sólo minimiza cambios)", en: "Believing a buffer holds exact pH (it only minimizes changes)" },
          { es: "No saber que β máxima ocurre cuando pH = pKa", en: "Not knowing that maximum β occurs when pH = pKa" },
        ],
        miniValidation: { es: "¿A qué pH tiene máxima capacidad un buffer acético?", en: "At what pH does acetic buffer have maximum capacity?" },
      },
    ],
  },
  {
    id: "lp-complexation",
    domain: "complexation",
    title: { es: "Complejometría y EDTA", en: "Complexometry and EDTA" },
    objectives: [
      { es: "Entender la formación de complejos M + nL ⇌ MLₙ", en: "Understand complex formation M + nL ⇌ MLₙ" },
      { es: "Diferenciar Kf, Kf' y Kf''", en: "Differentiate Kf, Kf' and Kf''" },
      { es: "Seleccionar pH óptimo para una valoración", en: "Select optimal pH for a titration" },
    ],
    steps: [
      {
        order: 1,
        title: { es: "¿Qué es un quelato?", en: "What is a chelate?" },
        keyQuestion: { es: "¿Por qué EDTA es hexadentado y por qué eso lo hace tan eficaz?", en: "Why is EDTA hexadentate and why does that make it so effective?" },
        commonErrors: [
          { es: "Confundir denticidad con carga del ligando", en: "Confusing denticity with ligand charge" },
        ],
        miniValidation: { es: "¿Cuántos enlaces coordinados forma EDTA con un metal?", en: "How many coordinate bonds does EDTA form with a metal?" },
      },
      {
        order: 2,
        title: { es: "Constante condicional Kf'", en: "Conditional constant Kf'" },
        keyQuestion: { es: "¿Por qué Kf depende del pH cuando EDTA tiene protones ácidos?", en: "Why does Kf depend on pH when EDTA has acidic protons?" },
        commonErrors: [
          { es: "Usar Kf termodinámico directamente sin corregir por pH", en: "Using thermodynamic Kf directly without pH correction" },
        ],
        miniValidation: { es: "Calcula αY⁴⁻ a pH 5 y compara con pH 10", en: "Calculate αY⁴⁻ at pH 5 and compare with pH 10" },
      },
      {
        order: 3,
        title: { es: "Selección de pH de trabajo", en: "Selection of working pH" },
        keyQuestion: { es: "¿Cómo determinas el pH mínimo para valorar Cu²⁺ con EDTA?", en: "How do you determine the minimum pH to titrate Cu²⁺ with EDTA?" },
        commonErrors: [
          { es: "Elegir pH muy alto sin considerar precipitación del hidróxido", en: "Choosing very high pH without considering hydroxide precipitation" },
        ],
        miniValidation: { es: "¿A qué pH log Kf'' ≥ 8 para Ca²⁺ con EDTA?", en: "At what pH is log Kf'' ≥ 8 for Ca²⁺ with EDTA?" },
      },
    ],
  },
  {
    id: "lp-redox",
    domain: "redox",
    title: { es: "Electroquímica y potenciales redox", en: "Electrochemistry and redox potentials" },
    objectives: [
      { es: "Interpretar potenciales estándar de reducción", en: "Interpret standard reduction potentials" },
      { es: "Aplicar la ecuación de Nernst", en: "Apply the Nernst equation" },
      { es: "Predecir espontaneidad de una celda", en: "Predict cell spontaneity" },
    ],
    steps: [
      {
        order: 1,
        title: { es: "Potenciales estándar", en: "Standard potentials" },
        keyQuestion: { es: "¿Qué significa E° = +0.771V para Fe³⁺/Fe²⁺?", en: "What does E° = +0.771V mean for Fe³⁺/Fe²⁺?" },
        commonErrors: [
          { es: "Multiplicar E° por n al calcular Ecelda (E° es intensivo, no extensivo)", en: "Multiplying E° by n when calculating Ecell (E° is intensive, not extensive)" },
        ],
        miniValidation: { es: "E°celda = E°cátodo − E°ánodo para Fe³⁺/Fe²⁺ || Zn²⁺/Zn", en: "E°cell = E°cathode − E°anode for Fe³⁺/Fe²⁺ || Zn²⁺/Zn" },
      },
      {
        order: 2,
        title: { es: "Ecuación de Nernst", en: "Nernst equation" },
        keyQuestion: { es: "¿Cómo cambia E cuando Q ≠ 1?", en: "How does E change when Q ≠ 1?" },
        commonErrors: [
          { es: "Usar ln en lugar de log (o viceversa) sin ajustar el factor", en: "Using ln instead of log (or vice versa) without adjusting the factor" },
        ],
        miniValidation: { es: "Si Q = 10² y n = 2, ¿cuánto baja E respecto a E°?", en: "If Q = 10² and n = 2, how much does E drop from E°?" },
      },
    ],
  },
]

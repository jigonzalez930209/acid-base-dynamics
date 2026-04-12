export const ROADMAP_ADVANCED_DATA = {
  es: [
    {
      phase: "Fase 1 · Núcleo científico",
      tasks: [
        "Consolidar la base completa de ácidos con validaciones automáticas contra el PDF y revisión manual de OCR dudoso.",
        "Separar claramente datos tabulados, supuestos del modelo y casos especiales como ácidos fuertes o formulaciones parciales.",
        "Añadir tests unitarios al motor de alfas, carga promedio y titulación.",
        "Definir esquema de datos versionado para especies, pKa, fórmulas y notas del modelo.",
      ],
    },
    {
      phase: "Fase 2 · Lenguaje químico",
      tasks: [
        "Diseñar un DSL para especies, equilibrios y balances.",
        "Soportar ecuaciones estructurales, simbólicas y mixtas con render consistente.",
        "Modelar series ácido-base, pares conjugados y sistemas parciales.",
        "Preparar serialización para presets, ejercicios y escenarios comparables.",
      ],
    },
    {
      phase: "Fase 3 · Visualización profunda",
      tasks: [
        "Mapas de predominio y regiones de estabilidad.",
        "Curvas de sensibilidad por pKa, concentración, volumen inicial y fuerza del titulante.",
        "Superposición de múltiples escenarios con filtros avanzados.",
        "Paneles de storytelling visual para laboratorio, docencia y análisis exploratorio.",
      ],
    },
    {
      phase: "Fase 4 · Plataforma guiada",
      tasks: [
        "Modo docente con resolución paso a paso.",
        "Explicaciones automáticas del comportamiento químico según el sistema elegido.",
        "Guardado de sesiones, presets reproducibles y exportes técnicos.",
        "Vistas de accesibilidad y lectura móvil optimizada para clases y prácticas.",
      ],
    },
    {
      phase: "Fase 5 · Expansión infinita",
      tasks: [
        "Integrar buffers complejos, mezclas multicomponente y fuerza iónica.",
        "Extender a precipitación, complejometría, redox y agentes quelantes.",
        "Incorporar simulación por temperatura y condiciones experimentales.",
        "Exportación de reportes científicos, datasets y material docente.",
      ],
    },
  ],
  en: [
    {
      phase: "Phase 1 · Scientific core",
      tasks: [
        "Consolidate the complete acid database with automatic validations against the PDF and manual review of doubtful OCR.",
        "Clearly separate tabulated data, model assumptions, and special cases such as strong acids or partial formulations.",
        "Add unit tests for the alpha engine, average charge, and titration.",
        "Define a versioned data schema for species, pKa, formulas, and model notes.",
      ],
    },
    {
      phase: "Phase 2 · Chemical language",
      tasks: [
        "Design a DSL for species, equilibria, and balances.",
        "Support structural, symbolic, and mixed equations with consistent rendering.",
        "Model acid-base series, conjugate pairs, and partial systems.",
        "Prepare serialization for presets, exercises, and comparable scenarios.",
      ],
    },
    {
      phase: "Phase 3 · Deep visualization",
      tasks: [
        "Predominance maps and stability regions.",
        "Sensitivity curves by pKa, concentration, initial volume, and titrant strength.",
        "Multi-scenario overlay with advanced filters.",
        "Visual storytelling panels for lab, teaching, and exploratory analysis.",
      ],
    },
    {
      phase: "Phase 4 · Guided platform",
      tasks: [
        "Teaching mode with step-by-step resolution.",
        "Automatic explanations of chemical behavior based on the chosen system.",
        "Session saving, reproducible presets, and technical exports.",
        "Accessibility views and mobile reading optimized for classes and labs.",
      ],
    },
    {
      phase: "Phase 5 · Infinite expansion",
      tasks: [
        "Integrate complex buffers, multi-component mixtures, and ionic strength.",
        "Extend to precipitation, complexometry, redox, and chelating agents.",
        "Incorporate temperature and experimental condition simulation.",
        "Export scientific reports, datasets, and teaching materials.",
      ],
    },
  ],
} as const

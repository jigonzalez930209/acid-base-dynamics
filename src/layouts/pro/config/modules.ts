import type { ModuleDefinition } from "../types"

export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  {
    id: "dashboard",
    icon: "LayoutDashboard",
    label: { es: "Dashboard", en: "Dashboard" },
    description: { es: "Resumen y accesos rápidos", en: "Overview and quick access" },
    color: "var(--chart-1)",
  },
  {
    id: "acid-base",
    icon: "FlaskConical",
    label: { es: "Ácido-Base", en: "Acid-Base" },
    description: { es: "Especiación, titulación, buffer, predominancia", en: "Speciation, titration, buffer, predominance" },
    color: "var(--chart-1)",
    subRoutes: [
      { id: "speciation", label: { es: "Especiación", en: "Speciation" }, path: "speciation" },
      { id: "titration", label: { es: "Titulación", en: "Titration" }, path: "titration" },
      { id: "buffer", label: { es: "Buffer", en: "Buffer" }, path: "buffer" },
      { id: "predominance", label: { es: "Predominancia", en: "Predominance" }, path: "predominance" },
      { id: "sensitivity", label: { es: "Sensibilidad", en: "Sensitivity" }, path: "sensitivity" },
    ],
  },
  {
    id: "complexation",
    icon: "Atom",
    label: { es: "Complejación", en: "Complexation" },
    description: { es: "EDTA, fracciones α, constantes condicionales", en: "EDTA, α fractions, conditional constants" },
    color: "var(--chart-2)",
    subRoutes: [
      { id: "alpha", label: { es: "Fracciones α", en: "α Fractions" }, path: "alpha" },
      { id: "conditional", label: { es: "K condicional", en: "Conditional K" }, path: "conditional" },
      { id: "explorer", label: { es: "Explorador EDTA", en: "EDTA Explorer" }, path: "explorer" },
    ],
  },
  {
    id: "precipitation",
    icon: "CloudRain",
    label: { es: "Precipitación", en: "Precipitation" },
    description: { es: "Solubilidad, Ksp, precipitación selectiva", en: "Solubility, Ksp, selective precipitation" },
    color: "var(--chart-3)",
    subRoutes: [
      { id: "solubility", label: { es: "Solubilidad vs pH", en: "Solubility vs pH" }, path: "solubility" },
      { id: "selective", label: { es: "Precipitación selectiva", en: "Selective precipitation" }, path: "selective" },
    ],
  },
  {
    id: "redox",
    icon: "Zap",
    label: { es: "Redox", en: "Redox" },
    description: { es: "Nernst, Pourbaix, celdas galvánicas", en: "Nernst, Pourbaix, galvanic cells" },
    color: "var(--chart-4)",
    subRoutes: [
      { id: "nernst", label: { es: "Ecuación de Nernst", en: "Nernst Equation" }, path: "nernst" },
      { id: "pourbaix", label: { es: "Diagramas Pourbaix", en: "Pourbaix Diagrams" }, path: "pourbaix" },
      { id: "galvanic", label: { es: "Celda galvánica", en: "Galvanic Cell" }, path: "galvanic" },
    ],
  },
  {
    id: "lab-tools",
    icon: "Beaker",
    label: { es: "Laboratorio", en: "Lab Tools" },
    description: { es: "Preparación, diluciones, planificación", en: "Preparation, dilutions, planning" },
    color: "var(--chart-5)",
    subRoutes: [
      { id: "solutions", label: { es: "Preparar soluciones", en: "Prepare Solutions" }, path: "solutions" },
      { id: "dilutions", label: { es: "Diluciones", en: "Dilutions" }, path: "dilutions" },
      { id: "titration-plan", label: { es: "Planificar titulación", en: "Plan Titration" }, path: "titration-plan" },
    ],
  },
  {
    id: "visualization",
    icon: "BarChart3",
    label: { es: "Visualización", en: "Visualization" },
    description: { es: "Comparación, mapas 2D, reportes", en: "Comparison, 2D maps, reports" },
    color: "var(--chart-3)",
    subRoutes: [
      { id: "compare", label: { es: "Comparar escenarios", en: "Compare Scenarios" }, path: "compare" },
      { id: "maps", label: { es: "Mapas 2D", en: "2D Maps" }, path: "maps" },
      { id: "reports", label: { es: "Reportes", en: "Reports" }, path: "reports" },
    ],
  },
  {
    id: "education",
    icon: "GraduationCap",
    label: { es: "Educación", en: "Education" },
    description: { es: "Aprendizaje guiado, ejercicios, sesiones", en: "Guided learning, exercises, sessions" },
    color: "var(--chart-2)",
    subRoutes: [
      { id: "paths", label: { es: "Rutas de aprendizaje", en: "Learning Paths" }, path: "paths" },
      { id: "exercises", label: { es: "Ejercicios", en: "Exercises" }, path: "exercises" },
      { id: "sessions", label: { es: "Sesiones", en: "Sessions" }, path: "sessions" },
    ],
  },
]

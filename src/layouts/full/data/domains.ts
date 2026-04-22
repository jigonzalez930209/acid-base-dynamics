/**
 * Extended chemistry domains for Phase 7.
 * Pourbaix, multicomponent buffers, environmental speciation, etc.
 */

import type { LocalizedText, ChemistryDomain, PluginManifest, QualityCheck } from "../engine/types"

export type DomainInfo = {
  id: ChemistryDomain
  name: LocalizedText
  description: LocalizedText
  icon: string
  status: "active" | "planned" | "experimental"
  equilibriumTypes: string[]
  typicalObservables: string[]
  crossDomainLinks: string[]
}

export const CHEMISTRY_DOMAINS: DomainInfo[] = [
  {
    id: "acid-base", icon: "⚗️", name: { es: "Ácido-base", en: "Acid-base" },
    description: { es: "Equilibrios de protonación, especiación, titulación y capacidad tampón", en: "Protonation equilibria, speciation, titration and buffer capacity" },
    status: "active", equilibriumTypes: ["Ka", "Kb", "Kw"],
    typicalObservables: ["pH", "α", "β", "V_eq"],
    crossDomainLinks: ["buffer", "complexation"],
  },
  {
    id: "complexation", icon: "🔗", name: { es: "Complejación", en: "Complexation" },
    description: { es: "Formación de complejos M+nL, constantes condicionales, EDTA", en: "Complex formation M+nL, conditional constants, EDTA" },
    status: "active", equilibriumTypes: ["Kf", "logβ", "Kf'"],
    typicalObservables: ["αY4", "Kf'", "pM", "log[L]"],
    crossDomainLinks: ["acid-base", "precipitation"],
  },
  {
    id: "precipitation", icon: "🧊", name: { es: "Precipitación", en: "Precipitation" },
    description: { es: "Solubilidad de hidróxidos, Ksp, predicción de precipitación vs pH", en: "Hydroxide solubility, Ksp, precipitation prediction vs pH" },
    status: "active", equilibriumTypes: ["Ksp"],
    typicalObservables: ["pH_ppt", "s", "[M]_free"],
    crossDomainLinks: ["acid-base", "complexation"],
  },
  {
    id: "redox", icon: "⚡", name: { es: "Redox", en: "Redox" },
    description: { es: "Potenciales estándar, Nernst, espontaneidad, ΔG", en: "Standard potentials, Nernst, spontaneity, ΔG" },
    status: "active", equilibriumTypes: ["E°", "Ecell"],
    typicalObservables: ["E", "ΔG", "Keq"],
    crossDomainLinks: ["pourbaix"],
  },
  {
    id: "pourbaix", icon: "📐", name: { es: "Diagramas de Pourbaix", en: "Pourbaix diagrams" },
    description: { es: "Diagramas E-pH con dominios de estabilidad", en: "E-pH diagrams with stability domains" },
    status: "planned", equilibriumTypes: ["E°", "Ksp", "Ka"],
    typicalObservables: ["E", "pH", "region"],
    crossDomainLinks: ["redox", "acid-base", "precipitation"],
  },
  {
    id: "buffer", icon: "🧴", name: { es: "Buffers multicomponente", en: "Multicomponent buffers" },
    description: { es: "Diseño de buffers, verificación de capacidad y rango", en: "Buffer design, capacity and range verification" },
    status: "planned", equilibriumTypes: ["Ka", "Kb"],
    typicalObservables: ["pH", "β", "range"],
    crossDomainLinks: ["acid-base"],
  },
  {
    id: "environmental", icon: "🌿", name: { es: "Especiación ambiental", en: "Environmental speciation" },
    description: { es: "Distribución de metales pesados en aguas naturales", en: "Heavy metal distribution in natural waters" },
    status: "planned", equilibriumTypes: ["Kf", "Ksp", "Ka"],
    typicalObservables: ["[M]_free", "[M]_total", "toxicity"],
    crossDomainLinks: ["complexation", "precipitation", "acid-base"],
  },
]

export const SAMPLE_PLUGINS: PluginManifest[] = [
  {
    id: "pourbaix-fe",
    name: { es: "Diagrama de Pourbaix – Hierro", en: "Pourbaix Diagram – Iron" },
    description: { es: "Especies y equilibrios del hierro para diagramas E-pH", en: "Iron species and equilibria for E-pH diagrams" },
    domains: ["pourbaix", "redox"],
    version: "0.1.0",
    author: "acid-base-dynamics",
    provides: {
      species: ["fe-metal", "fe2-aq", "fe3-aq", "fe-oh3-s"],
      equilibria: ["fe2-fe3-redox", "fe-oh3-ksp"],
    },
  },
]

export const QUALITY_CHECKS: QualityCheck[] = [
  { id: "qc-sources", title: { es: "Fuentes bibliográficas", en: "Bibliographic sources" }, description: { es: "Cada constante tiene fuente bibliográfica – 5 fuentes registradas", en: "Every constant has bibliographic source – 5 sources registered" }, category: "data", priority: "critical" },
  { id: "qc-conditions", title: { es: "Condiciones declaradas", en: "Declared conditions" }, description: { es: "T=25°C, I=0.1M para datos Harris/NIST", en: "T=25°C, I=0.1M for Harris/NIST data" }, category: "data", priority: "critical" },
  { id: "qc-regression", title: { es: "Tests de regresión", en: "Regression tests" }, description: { es: "12 casos ácido-base + 10 complejación verificados", en: "12 acid-base + 10 complexation cases verified" }, category: "validation", priority: "critical" },
  { id: "qc-units", title: { es: "Unidades normalizadas", en: "Normalized units" }, description: { es: "6 unidades con conversiones coherentes", en: "6 units with coherent conversions" }, category: "validation", priority: "high" },
  { id: "qc-assumptions", title: { es: "Supuestos explícitos", en: "Explicit assumptions" }, description: { es: "4 dominios con supuestos documentados", en: "4 domains with documented assumptions" }, category: "documentation", priority: "high" },
  { id: "qc-render", title: { es: "Render químico unificado", en: "Unified chemical rendering" }, description: { es: "ChemicalFormula + KaTeX/mhchem en toda la app", en: "ChemicalFormula + KaTeX/mhchem throughout the app" }, category: "ux", priority: "medium" },
  { id: "qc-tsx", title: { es: "TSX ≤ 200 líneas", en: "TSX ≤ 200 lines" }, description: { es: "Todos los componentes modulares", en: "All components modular" }, category: "code-quality", priority: "medium" },
  { id: "qc-i18n", title: { es: "i18n completo es/en", en: "Complete i18n es/en" }, description: { es: "Textos localizados inline y en messages.ts", en: "Localized texts inline and in messages.ts" }, category: "ux", priority: "high" },
]

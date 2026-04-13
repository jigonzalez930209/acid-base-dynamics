# Tarea 07 — Módulo de Complejación y EDTA

> **Dependencias**: [Tarea 02](./02-sistema-graficos-scichart.md), [Tarea 03](./03-sistema-grids-scigrid.md), [Tarea 04](./04-motor-equilibrio-universal.md)  
> **Produce**: Módulo completo de complejación: EDTA, alpha fractions, constantes condicionales, predominancia  
> **Consumida por**: [Tarea 10](./10-herramientas-laboratorio.md), [Tarea 11](./11-visualizacion-reportes.md), [Tarea 12](./12-plataforma-educativa.md)  
> **Estado**: ⬚ No iniciada

---

## Tabla de contenidos

- [7.1 Base de datos de complejos](#71-base-de-datos-de-complejos)
- [7.2 Gráficos de fracciones alpha](#72-gráficos-de-fracciones-alpha)
- [7.3 Constantes condicionales](#73-constantes-condicionales)
- [7.4 Explorador EDTA interactivo](#74-explorador-edta-interactivo)
- [7.5 Diagramas de predominancia de complejos](#75-diagramas-de-predominancia-de-complejos)
- [7.6 Comparativa multi-metal](#76-comparativa-multi-metal)
- [Estructura del módulo](#estructura-del-módulo)
- [Criterios de aceptación](#criterios-de-aceptación)

---

## Estructura del módulo

```
src/modules/complexation/
├── index.tsx                          ← Router con sub-rutas
├── components/
│   ├── alpha-chart-view.tsx           ← Fracciones α EDTA (§7.2)
│   ├── conditional-k-view.tsx         ← Constantes condicionales (§7.3)
│   ├── edta-explorer-view.tsx         ← Explorador EDTA (§7.4)
│   ├── predominance-view.tsx          ← Diagramas de predominancia (§7.5)
│   ├── multi-metal-view.tsx           ← Comparativa (§7.6)
│   ├── metal-selector.tsx             ← Selector de metal
│   └── complex-info-card.tsx          ← Card de información del complejo
├── hooks/
│   ├── use-alpha-edta.ts
│   └── use-conditional-k.ts
├── lib/
│   └── series-builders.ts
└── types.ts
```

### Sub-rutas

```
/complexation                → Vista por defecto (explorador EDTA)
/complexation/alpha          → Alpha fractions
/complexation/conditional    → Constantes condicionales
/complexation/edta           → Explorador EDTA interactivo
/complexation/predominance   → Diagrama de predominancia
/complexation/compare        → Comparativa multi-metal
```

---

## 7.1 Base de datos de complejos

**Objetivo**: Consolidar datos de complejación con trazabilidad.

### 7.1.1 Estructura de datos

```ts
// src/data/complexes.ts

export interface ComplexEntry {
  id: string;
  metal: string;               // "Fe3+", "Cu2+", "Ca2+"
  metalFormula: string;        // Para render KaTeX: "Fe^{3+}"
  ligand: string;              // "EDTA", "NH3", "CN-"
  logKf: number;               // log de constante de formación
  logBeta?: number[];          // Constantes sucesivas [β₁, β₂, ...]
  deltaH?: number;             // kJ/mol (para corrección de T)
  source: string;              // "Harris 9th ed."
  temperature: number;         // °C del dato tabulado
  ionicStrength: number;       // M del dato tabulado
  notes?: string;
}
```

### 7.1.2 Grid de complejos con `@sci-grid`

→ Usar `ChemGrid` de [Tarea 03](./03-sistema-grids-scigrid.md) con:

| Columna | Renderer | Sortable | Filterable |
|---------|----------|----------|-----------|
| Metal | `formula` | ✅ | ✅ |
| Ligando | `formula` | ✅ | ✅ |
| log Kf | `number` | ✅ | — |
| ΔH (kJ/mol) | `number` | ✅ | — |
| Fuente | `text` | — | ✅ |

### 7.1.3 Entregables

- [ ] `src/data/complexes.ts` con ≥ 15 entradas
- [ ] Grid navegable y buscable
- [ ] Todas las entradas con fuente bibliográfica

---

## 7.2 Gráficos de fracciones alpha

**Objetivo**: Visualizar α_EDTA vs pH — la fracción de EDTA que está en forma Y⁴⁻.

### 7.2.1 Alpha EDTA

EDTA (H₆Y²⁺ a Y⁴⁻) tiene 6 protones disociables:

| Especie | Forma | pKa |
|---------|-------|-----|
| H₆Y²⁺ | Protonada completa | pKa₁ = 0.0 |
| H₅Y⁺ | | pKa₂ = 1.5 |
| H₄Y | | pKa₃ = 2.0 |
| H₃Y⁻ | | pKa₄ = 2.66 |
| H₂Y²⁻ | | pKa₅ = 6.16 |
| HY³⁻ | | pKa₆ = 10.24 |
| Y⁴⁻ | Completamente desprotonada | — |

### 7.2.2 Gráfico con `ChemChart`

```
α
1.0 ┬
    │ Y⁴⁻ aparece a pH > 10
    │                                   ╱──────
0.5 ┤        H₂Y²⁻              ╱────╱
    │  H₄Y  ╱────╲   HY³⁻  ╱──╱
    │ ╱╲  ╱╱      ╲──╱╲  ╱╱
0.0 ┴╱──╲╱────╲───────╲╱──────────────  pH
    0  2  4  6  8  10  12  14
```

7 series (H₆Y²⁺ a Y⁴⁻), coloreadas automáticamente por `scichart-engine`.

### 7.2.3 Entregables

- [ ] Gráfico α_EDTA vs pH con 7 series
- [ ] Grid de valores en pH actual
- [ ] Resaltado de α_Y4- (la fracción efectiva)
- [ ] Anotación de pKa como líneas verticales

---

## 7.3 Constantes condicionales

**Objetivo**: Calcular y visualizar K'_f = α_Y4- × K_f para cada metal en función del pH.

### 7.3.1 Ecuación

$$K'_f = \alpha_{Y^{4-}} \cdot K_f$$

$$\log K'_f(pH) = \log \alpha_{Y^{4-}}(pH) + \log K_f$$

### 7.3.2 Gráfico log K'f vs pH

```
log K'f
25 ┬
   │                     Fe³⁺ (25.1)
20 ┤              ╱────────────────
   │        ╱────╱   Cu²⁺ (18.8)
15 ┤  ╱────╱────────────────
   │╱╱        Zn²⁺ (16.5)
10 ┤────────────────
   │     Ca²⁺ (10.7)
 5 ┤──────────────
   │     Mg²⁺ (8.7)
 0 ┴────┼────┼────┼────┼────  pH
   0    4    8   12   14
```

### 7.3.3 Línea de titulación efectiva

Agregar anotación horizontal en log K'f = 8 (mínimo para titulación cuantitativa):

- **Por encima**: titulación viable ✅
- **Por debajo**: titulación no viable ❌

### 7.3.4 Entregables

- [ ] Gráfico log K'f vs pH para múltiples metales
- [ ] Línea de viabilidad configurable
- [ ] Grid con pH mínimo de titulación por metal
- [ ] Toggle de metales a mostrar

---

## 7.4 Explorador EDTA interactivo

**Objetivo**: Interfaz todo-en-uno para explorar un sistema metal-EDTA.

### 7.4.1 Layout

```
┌──────────────────────────────────────────────────────────┐
│  ┌─── Metal ──────┐  ┌─── Condiciones ───────────────┐   │
│  │ [Fe³⁺ ▼]       │  │ pH: [──●──────] 4.0           │   │
│  │ [Cₘ] = 0.01 M  │  │ T: 25°C  I: 0.1M              │   │
│  └────────────────┘  └───────────────────────────────┘   │
│                                                          │
│  ┌─── Resumen ──────────────────────────────────────┐    │
│  │  log Kf = 25.1  │  α(Y⁴⁻) = 3.6×10⁻⁹             │    │
│  │  log K'f = 15.5 │  Titulación: ✅ Viable         │    │
│  │  [FeY⁻] = 9.98×10⁻³ M  │  % complejado: 99.8%    │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ┌─── Gráfico α vs pH ──────┐ ┌─── log K'f vs pH ───┐    │
│  │  (ChemChart)             │ │  (ChemChart)        │    │
│  │  7 especies EDTA         │ │  Con línea Kf=8     │    │
│  │  + crosshair al pH actual│ │  + pH actual        │    │
│  └──────────────────────────┘ └─────────────────────┘    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 7.4.2 Cálculos en tiempo real

| Observable | Cálculo | Engine |
|-----------|---------|--------|
| α(Y⁴⁻) | `calcAlphaEDTA(pH)` | `engine/complexation/alpha-edta.ts` |
| K'f | α(Y⁴⁻) × Kf | Derivado |
| [MY] | Resolver ecuación cuadrática | `engine/complexation/conditional-k.ts` |
| % complejado | [MY] / Cm × 100 | Derivado |

### 7.4.3 Entregables

- [ ] Explorador con selector de metal y pH slider
- [ ] Resumen numérico en tiempo real
- [ ] Dos gráficos sincronizados
- [ ] Indicador de viabilidad de titulación

---

## 7.5 Diagramas de predominancia de complejos

**Objetivo**: Mapa 2D de qué forma del complejo predomina según pH y concentración.

### 7.5.1 Heatmap con `ChemHeatmap`

→ Usar `ChemHeatmap` de [Tarea 02 §2.2.3](./02-sistema-graficos-scichart.md#223-chemheatmap--mapa-de-calor-2d).

Ejes: pH (x) vs pM (y, -log[M])
Colores: especie predominante (M libre, MY, M(OH)n, etc.)

### 7.5.2 Entregables

- [ ] Heatmap de predominancia metal-EDTA
- [ ] Etiquetas de especies en cada región
- [ ] Líneas de transición
- [ ] Resolución configurable (50×50 a 200×200)

---

## 7.6 Comparativa multi-metal

**Objetivo**: Comparar la complejación de varios metales simultáneamente.

### 7.6.1 Grid comparativo

→ Usar `ChemGrid` de [Tarea 03](./03-sistema-grids-scigrid.md):

| Metal | log Kf | pH mín. | α(Y⁴⁻) a pH 5 | K'f a pH 5 | Viable |
|-------|--------|--------|----------------|-----------|--------|
| Fe³⁺ | 25.1 | 1.0 | 3.6×10⁻⁹ | 10¹⁶·¹ | ✅ |
| Cu²⁺ | 18.8 | 3.5 | 3.6×10⁻⁹ | 10⁹·⁸ | ✅ |
| Ca²⁺ | 10.7 | 8.0 | 3.6×10⁻⁹ | 10¹·⁷ | ❌ |

### 7.6.2 Gráfico overlay

Todas las curvas log K'f en un solo `ChemChart`, con leyenda interactiva.

### 7.6.3 Entregables

- [ ] Grid comparativo de ≥ 5 metales
- [ ] Gráfico overlay con toggle de metales
- [ ] Ranking automático por viabilidad a un pH dado
- [ ] Exportación de tabla comparativa

---

## Criterios de aceptación

| # | Criterio | Verificación |
|---|----------|-------------|
| 1 | Alpha EDTA produce 7 curvas correctas (coincide con Harris tabla 12-1) | Numérico |
| 2 | K'f(pH=5, Fe³⁺) ≈ 10¹⁶ ± 10% | Numérico |
| 3 | Explorador EDTA actualiza en < 50ms al mover pH slider | Performance |
| 4 | Heatmap 100×100 renderiza sin lag | Performance |
| 5 | Grid comparativo muestra datos de ≥ 5 metales | Funcional |
| 6 | Todos los gráficos usan `ChemChart`/`ChemHeatmap` | Code review |
| 7 | Todos los grids usan `ChemGrid` | Code review |
| 8 | Dark mode funcional | Visual |
| 9 | Datos con fuente bibliográfica | Data review |
| 10 | Responsive en tablet y mobile | Visual |

---

## Referencias cruzadas

- → Gráficos: [Tarea 02](./02-sistema-graficos-scichart.md)
- → Grids: [Tarea 03](./03-sistema-grids-scigrid.md)
- → Engine de complejación: [Tarea 04 §4.7](./04-motor-equilibrio-universal.md#47-api-del-engine) (`calcAlphaEDTA`, `calcConditionalK`)
- → Datos existentes: `src/features/advanced/complexation-data.ts`, `complexation-db.ts`
- → Interferencias metal-EDTA: [Tarea 10 §10.4](./10-herramientas-laboratorio.md#104-evaluador-de-interferencias)
- → Reportes de complejación: [Tarea 11](./11-visualizacion-reportes.md)
- → Explicaciones de complejación: [Tarea 12](./12-plataforma-educativa.md)
- → Tests: [Tarea 14 §14.2](./14-testing-aseguramiento-calidad.md#142-tests-de-módulos)

# Tarea 04 — Motor de Equilibrio Químico Universal

> **Dependencias**: [Tarea 01](./01-arquitectura-plataforma.md) (estructura de proyecto, stores)  
> **Produce**: Engine unificado con solver, actividad, temperatura, validación  
> **Consumida por**: Tareas 06–10 (todos los módulos de cálculo)  
> **Estado**: ⬚ No iniciada

---

## Tabla de contenidos

- [4.1 Consolidación del engine](#41-consolidación-del-engine)
- [4.2 Solver de equilibrio multicomponente](#42-solver-de-equilibrio-multicomponente)
- [4.3 Modelos de actividad y fuerza iónica](#43-modelos-de-actividad-y-fuerza-iónica)
- [4.4 Correcciones por temperatura](#44-correcciones-por-temperatura)
- [4.5 Balance de carga y masa](#45-balance-de-carga-y-masa)
- [4.6 Diagnóstico y estabilidad numérica](#46-diagnóstico-y-estabilidad-numérica)
- [4.7 API del engine](#47-api-del-engine)
- [Diagrama del motor](#diagrama-del-motor)
- [Criterios de aceptación](#criterios-de-aceptación)

---

## 4.1 Consolidación del engine

**Objetivo**: Unificar la lógica de cálculo dispersa en `src/features/chemistry/lib/`, `src/layouts/full/engine/` y componentes individuales en un solo directorio `src/engine/`.

### 4.1.1 Inventario del código matemático actual

| Archivo actual | Funciones clave | Destino en v2 |
|---------------|----------------|---------------|
| `features/chemistry/lib/acid-math.ts` | `calcAlphas`, `calcTitrationVolume`, `buildSpeciationSeries`, `classifyPH` | `engine/core/alpha.ts`, `engine/core/titration.ts` |
| `features/chemistry/lib/formulas.ts` | `toChemicalLatex`, `buildSymbolicSpecies`, `buildAlphaModel` | `components/chemistry/` (no es engine) |
| `features/chemistry/lib/equilibria.ts` | `getEquilibriumSteps` | `engine/core/equilibria.ts` |
| `features/advanced/advanced-math.ts` | Buffer capacity, sensitivity, predominance | `engine/core/buffer.ts`, `engine/core/sensitivity.ts` |
| `features/advanced/complexation-math.ts` | Alpha-EDTA, conditional constants | `engine/complexation/alpha-edta.ts` |
| `layouts/full/engine/solver.ts` | Newton-Raphson pH solver | `engine/core/solver.ts` |
| `layouts/full/engine/activity.ts` | Debye-Hückel, Davies | `engine/activity/models.ts` |
| `layouts/full/engine/temperature.ts` | van't Hoff correction | `engine/temperature/vant-hoff.ts` |
| `layouts/full/engine/units.ts` | Unit conversion | `engine/units/converter.ts` |
| `layouts/full/engine/validator.ts` | Cross-validation | `engine/validation/validator.ts` |
| `layouts/full/engine/scenarios.ts` | Scenario serialization | `engine/scenarios/serializer.ts` |
| `layouts/full/engine/types.ts` | 25+ tipos | `engine/types.ts` |

### 4.1.2 Estructura del engine unificado

```
src/engine/
├── index.ts                    ← API pública del engine
├── types.ts                    ← Tipos globales del engine
│
├── core/                       ← Cálculos fundamentales
│   ├── alpha.ts                ← Fracciones α (Henderson-Hasselbalch)
│   ├── titration.ts            ← Curvas de titulación
│   ├── buffer.ts               ← Capacidad buffer β
│   ├── sensitivity.ts          ← Derivadas dα/dpH
│   ├── equilibria.ts           ← Pasos de equilibrio
│   ├── predominance.ts         ← Zonas de predominancia
│   └── solver.ts               ← Newton-Raphson solver
│
├── activity/                   ← Correcciones por actividad
│   ├── models.ts               ← Ideal, Debye-Hückel, Davies
│   ├── ionic-strength.ts       ← Cálculo de I
│   └── types.ts
│
├── temperature/                ← Correcciones térmicas
│   ├── vant-hoff.ts            ← Ecuación de van't Hoff
│   ├── pkw.ts                  ← pKw(T)
│   └── types.ts
│
├── complexation/               ← Cálculos de complejación
│   ├── alpha-edta.ts           ← Fracciones α de EDTA
│   ├── conditional-k.ts        ← Constantes condicionales
│   └── types.ts
│
├── precipitation/              ← Cálculos de precipitación
│   ├── solubility.ts           ← Solubilidad vs pH
│   ├── selective.ts            ← Precipitación selectiva
│   └── types.ts
│
├── redox/                      ← Cálculos redox
│   ├── nernst.ts               ← Ecuación de Nernst
│   ├── cell.ts                 ← Potenciales de celda
│   └── types.ts
│
├── units/                      ← Conversión de unidades
│   └── converter.ts
│
├── validation/                 ← Validación y casos de referencia
│   ├── validator.ts
│   └── reference-cases.ts
│
└── scenarios/                  ← Serialización de escenarios
    └── serializer.ts
```

### 4.1.3 Regla de dependencias

```
src/engine/  → Solo importa de sí mismo y tipos globales
             → NO importa de React, componentes, ni UI
             → Exporta funciones puras y tipos

src/modules/ → Importa de src/engine/ vía @/engine
src/components/charts/ → NO importa de src/engine/
```

### 4.1.4 Entregables

- [ ] Todos los archivos matemáticos movidos a `src/engine/`
- [ ] Imports actualizados en toda la app
- [ ] `src/engine/index.ts` exporta API pública limpia
- [ ] Cero lógica matemática en componentes TSX
- [ ] Build limpio

---

## 4.2 Solver de equilibrio multicomponente

**Objetivo**: Mejorar el solver Newton-Raphson para manejar sistemas acoplados.

### 4.2.1 Solver actual

El solver en `layouts/full/engine/solver.ts` resuelve pH para un sistema ácido-base simple:

```
f(pH) = balance_de_protones = 0
Newton-Raphson: pH_{n+1} = pH_n - f(pH_n) / f'(pH_n)
```

### 4.2.2 Solver extendido

```
┌─────────── SOLVER UNIVERSAL ───────────┐
│                                        │
│  Entrada:                              │
│  ├─ Ácidos: [{pKas, concentration}]    │
│  ├─ Bases: [{pKb, concentration}]      │
│  ├─ Complejos: [{logBeta, metals}]     │
│  ├─ Sales: [{Ksp, ions}]               │
│  ├─ T, I, modelo de actividad          │
│  └─ pH inicial (guess)                 │
│                                        │
│  Proceso:                              │
│  1. Construir vector de ecuaciones     │
│  2. Balance de protones                │
│  3. Balance de masa por componente     │
│  4. Balance de carga                   │
│  5. Newton-Raphson multivariable       │
│  6. Iterar hasta convergencia          │
│                                        │
│  Salida:                               │
│  ├─ pH final                           │
│  ├─ Concentraciones de todas las spp   │
│  ├─ Residuo del balance                │
│  ├─ Iteraciones consumidas             │
│  ├─ Estado de convergencia             │
│  └─ Diagnósticos                       │
│                                        │
└────────────────────────────────────────┘
```

### 4.2.3 Tipos del solver

```ts
// src/engine/types.ts

export interface SolverInput {
  acids: { pKas: number[]; concentration: number; label?: string }[];
  bases?: { pKb: number; concentration: number; label?: string }[];
  temperature?: number;              // °C, default 25
  ionicStrength?: number;            // mol/L
  activityModel?: 'ideal' | 'debye-huckel-limiting' | 'debye-huckel-extended' | 'davies';
  initialPH?: number;                // guess, default 7
  maxIterations?: number;            // default 200
  tolerance?: number;                // default 1e-10
}

export interface SolverResult {
  pH: number;
  converged: boolean;
  iterations: number;
  residual: number;
  species: SpeciesResult[];          // Cada especie con concentración y α
  balances: {
    charge: number;                  // Residuo de balance de carga
    mass: Record<string, number>;    // Residuo por componente
  };
  diagnostics: SolverDiagnostics;
}

export interface SolverDiagnostics {
  conditionNumber: number;           // Indicador de sistema mal condicionado
  sensitivityToPH: number;           // dBalance/dpH en el punto solución
  convergenceHistory: number[];      // Residuo por iteración
  warnings: string[];                // Advertencias del solver
}
```

### 4.2.4 Algoritmo paso a paso

```
1. Inicializar pH = initialPH (o 7 por defecto)
2. loop i = 1..maxIterations:
   a. Calcular [H⁺] = 10^(-pH)
   b. Calcular [OH⁻] = Kw(T) / [H⁺]
   c. Para cada ácido: calcular α₀, α₁, ..., αₙ
   d. Si activityModel ≠ 'ideal': corregir con γ
   e. Calcular f(pH) = Σ cargas = 0 (balance de carga)
   f. Calcular f'(pH) numéricamente: (f(pH+δ) - f(pH-δ)) / 2δ
   g. Actualizar: pH_new = pH - f(pH) / f'(pH)
   h. Si |pH_new - pH| < tolerance: CONVERGIÓ
   i. pH = pH_new
3. Si no convergió: reportar warnings
4. Calcular concentraciones finales de todas las especies
5. Calcular balances de carga y masa
6. Retornar SolverResult
```

### 4.2.5 Entregables

- [ ] Solver refactorizado con interfaz tipada
- [ ] Soporte para múltiples ácidos simultáneos
- [ ] Correcciones de actividad integradas
- [ ] Correcciones de temperatura integradas
- [ ] Diagnósticos completos en cada solve
- [ ] Tests contra 22 casos de referencia existentes

---

## 4.3 Modelos de actividad y fuerza iónica

**Objetivo**: Organizar los modelos de actividad para que el usuario pueda elegir y entender cuándo usar cada uno.

### 4.3.1 Modelos disponibles

| Modelo | Ecuación | Rango de I | Uso |
|--------|----------|-----------|-----|
| Ideal | γ = 1 | I → 0 | Soluciones muy diluidas |
| Debye-Hückel limitante | log γ± = −A·z²·√I | I < 0.01M | Introducción docente |
| Debye-Hückel extendida | log γ± = −A·z²·√I / (1 + Ba·√I) | I < 0.1M | Laboratorio docente |
| Davies | log γ± = −A·z²·[√I/(1+√I) − 0.3I] | I < 0.5M | Uso general |

Donde: A = 0.5085 (25°C en agua), B = 0.3281 × 10⁸

### 4.3.2 Dependencia de A y B con temperatura

```ts
// src/engine/activity/models.ts

/** Parámetro A de Debye-Hückel en función de T (°C) */
export function debyeHuckelA(tempC: number): number {
  const T = tempC + 273.15;
  // Aproximación: A ∝ (εT)^(-3/2)
  const eps = waterDielectric(T);
  return 1.824e6 * Math.pow(eps * T, -1.5);
}
```

### 4.3.3 Selección automática de modelo

```
┌─── Selector de modelo de actividad ─────────┐
│                                             │
│  I = 0.05 M (calculada automáticamente)     │
│                                             │
│  ○ Ideal (γ = 1)         ⚠️ No recomendado  │
│  ○ Debye-Hückel limit.   ⚠️ I > 0.01        │
│  ● Davies               ✅ Recomendado      │ ← Auto-seleccionado
│  ○ D-H extendida        ✅ Aplicable        │
│                                             │
│  Efecto sobre pH: ΔpH = -0.12               │
│                                             │
└─────────────────────────────────────────────┘
```

### 4.3.4 Entregables

- [ ] 4 modelos implementados con interfaces consistentes
- [ ] Cálculo automático de I a partir de la composición
- [ ] Recomendación automática de modelo según I
- [ ] Indicador de ΔpH por efecto de actividad
- [ ] Tests unitarios por modelo

---

## 4.4 Correcciones por temperatura

**Objetivo**: Permitir cálculos a cualquier temperatura con estimación de incertidumbre.

### 4.4.1 Ecuación de van't Hoff implementada

$$\text{pK}_a(T) = \text{pK}_a(T_{ref}) + \frac{\Delta H^\circ}{2.303R} \left(\frac{1}{T} - \frac{1}{T_{ref}}\right)$$

### 4.4.2 pKw dependiente de temperatura

| T (°C) | pKw | Fuente |
|--------|-----|--------|
| 0 | 14.944 | NIST |
| 10 | 14.535 | NIST |
| 25 | 13.995 | NIST |
| 37 | 13.595 | NIST |
| 50 | 13.262 | NIST |
| 100 | 12.255 | NIST |

### 4.4.3 Indicadores de incertidumbre

```
┌─── Corrección de temperatura ──────────────┐
│                                            │
│  T actual: 37°C                            │
│  T referencia: 25°C                        │
│                                            │
│  pKa₁ (H₃PO₄):                             │
│    Tabulado (25°C): 2.14                   │
│    Estimado (37°C): 2.08  ± 0.05 ⚠️        │
│    Fuente ΔH: Harris 9th ed. Table C-1     │
│                                            │
│  ⚠️ Dato ESTIMADO por van't Hoff           │
│     Incertidumbre aumenta con ΔT > 20°C    │
│                                            │
└────────────────────────────────────────────┘
```

### 4.4.4 Entregables

- [ ] van't Hoff implementado para todos los ácidos con ΔH disponible
- [ ] pKw(T) interpolado
- [ ] Marcado visual de dato tabulado vs estimado
- [ ] Banda de incertidumbre calculada
- [ ] Warning cuando ΔT > 20°C

---

## 4.5 Balance de carga y masa

**Objetivo**: Verificar consistencia química de cada solución calculada.

### 4.5.1 Balance de carga

$$\sum z_i \cdot C_i = 0$$

```
[H⁺] + z_cat = [OH⁻] + Σ z_i·α_i·C_A + z_an
```

### 4.5.2 Balance de masa

Por cada componente analítico:

$$C_A = \sum [\text{todas las formas del componente}]$$

### 4.5.3 Reporte de balances

```
┌─── Balance del sistema ─────────────────────┐
│                                             │
│  Balance de carga:                          │
│  Σ cargas = +1.2 × 10⁻¹² ✅ (< 10⁻¹⁰)       │
│                                             │
│  Balance de masa:                           │
│  C(PO₄) total: 0.10000 M ✅                 │
│  Σ formas:     0.10000 M ✅                 │
│  Residuo:      2.1 × 10⁻¹⁵ ✅               │
│                                             │
│  Estado: CONSISTENTE                        │
│                                             │
└─────────────────────────────────────────────┘
```

### 4.5.4 Entregables

- [ ] Balance de carga calculado para cada solve
- [ ] Balance de masa por componente
- [ ] Tolerancia configurable (default 10⁻¹⁰)
- [ ] UI de reporte en panel de diagnósticos

---

## 4.6 Diagnóstico y estabilidad numérica

**Objetivo**: Que el usuario (y el desarrollador) sepa cuándo confiar en un resultado.

### 4.6.1 Métricas de diagnóstico

| Métrica | Significado | Verde | Amarillo | Rojo |
|---------|------------|-------|----------|------|
| Residuo | |f(pH)| final | < 10⁻¹⁰ | < 10⁻⁶ | ≥ 10⁻⁶ |
| Iteraciones | Veces N-R iteró | ≤ 20 | ≤ 100 | > 100 |
| Convergencia | pH se estabilizó | Sí | Oscila | No |
| Balance de carga | Σ cargas | < 10⁻¹⁰ | < 10⁻⁶ | ≥ 10⁻⁶ |
| Condicionamiento | Sensibilidad a perturbaciones | < 100 | < 1000 | ≥ 1000 |

### 4.6.2 Panel de diagnósticos

```
┌─── Diagnósticos del solver ──────────────────┐
│                                              │
│  ✅ Convergencia alcanzada en 12 iteraciones │
│  ✅ Residuo: 3.2 × 10⁻¹⁴                     │
│  ✅ Balance de carga: 1.1 × 10⁻¹²            │
│  ⚠️ Número de condición: 450 (moderado)      │
│                                              │
│  Historial de convergencia:                  │
│  Iter │ Residuo    │ pH                      │
│  ─────┼────────────┼──────                   │
│    1  │ 2.3×10⁻¹  │ 7.000                    │
│    5  │ 4.1×10⁻⁵  │ 4.753                    │
│   10  │ 8.7×10⁻¹² │ 4.750                    │
│   12  │ 3.2×10⁻¹⁴ │ 4.750 ✅                 │
│                                              │
└──────────────────────────────────────────────┘
```

→ Ver también: [Tarea 02 §2.2](./02-sistema-graficos-scichart.md#22-componentes-wrapper-estándar) para graficar el historial de convergencia con `ChemChart`.

### 4.6.3 Entregables

- [ ] Métricas de diagnóstico calculadas en cada solve
- [ ] Código de colores (verde/amarillo/rojo) por métrica
- [ ] Historial de convergencia almacenado
- [ ] Warnings claros cuando el sistema es problemático

---

## 4.7 API del engine

**Objetivo**: Definir la interfaz pública limpia que consumen todos los módulos.

### 4.7.1 API pública

```ts
// src/engine/index.ts

// Core
export { calcAlphas, calcAlpha } from './core/alpha';
export { calcTitrationCurve, calcEquivalencePoints } from './core/titration';
export { calcBufferCapacity } from './core/buffer';
export { calcSensitivity } from './core/sensitivity';
export { solvePH } from './core/solver';
export { getPredominanceZones } from './core/predominance';

// Activity
export { calcActivityCoefficient, calcIonicStrength } from './activity/models';

// Temperature
export { correctPKa, getPKw } from './temperature/vant-hoff';

// Complexation
export { calcAlphaEDTA, calcConditionalK } from './complexation/alpha-edta';

// Precipitation
export { calcSolubility, calcSelectivePrecipitation } from './precipitation/solubility';

// Redox
export { calcNernstPotential, calcCellPotential } from './redox/nernst';

// Units
export { convertConcentration } from './units/converter';

// Validation
export { validateAgainstReference } from './validation/validator';

// Types
export type { SolverInput, SolverResult, SolverDiagnostics } from './types';
export type { ActivityModel, SpeciesResult, EquilibriumStep } from './types';
```

### 4.7.2 Ejemplo de consumo desde un módulo

```tsx
// src/modules/acid-base/hooks/use-speciation.ts
import { calcAlphas, calcBufferCapacity, solvePH } from '@/engine';
import type { SolverInput } from '@/engine';

export function useSpeciation(acid: AcidRecord, pH: number) {
  return useMemo(() => {
    const alphas = calcAlphas(pH, acid.pKas);
    const buffer = calcBufferCapacity(pH, acid.pKas, acid.concentration);
    return { alphas, buffer };
  }, [acid, pH]);
}
```

### 4.7.3 Entregables

- [ ] `src/engine/index.ts` con todas las exportaciones
- [ ] Ninguna función interna del engine expuesta
- [ ] Documentación TSDoc en cada función pública
- [ ] Versionado del engine (semver interno)

---

## Diagrama del motor

```
┌──────────────────────── ENGINE ────────────────────────────┐
│                                                            │
│  ENTRADAS                    CORE                          │
│  ────────                    ────                          │
│  Ácidos (pKa, C)  ──────→ ┌─────────┐                      │
│  Bases (pKb, C)   ──────→ │ SOLVER  │──→ pH                │
│  Complejos (logβ) ──────→ │ Newton  │──→ [spp]             │
│  Sales (Ksp)      ──────→ │ Raphson │──→ convergencia      │
│  T, I             ──────→ └────┬────┘                      │
│                                │                           │
│  CORRECCIONES                  │                           │
│  ─────────────                 ▼                           │
│  ┌────────────┐          ┌────────────┐                    │
│  │ Actividad  │──────→   │  Balances  │                    │
│  │ γ = f(I,z) │          │  Carga     │──→ residuo         │
│  └────────────┘          │  Masa      │──→ consistencia    │
│  ┌────────────┐          └────────────┘                    │
│  │ Temperatura│                │                           │
│  │ pKa(T)     │──────→        ▼                            │
│  └────────────┘         ┌─────────────┐                    │
│                         │Diagnósticos │                    │
│                         │ iter, res,  │                    │
│  VALIDACIÓN             │ condición   │                    │
│  ──────────             └──────┬──────┘                    │
│  22 casos ref.                 │                           │
│  Tolerancias ──────→    SolverResult                       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Criterios de aceptación

| # | Criterio | Verificación |
|---|----------|-------------|
| 1 | El engine no importa React ni componentes UI | `grep -r "from.*react" src/engine/` → 0 results |
| 2 | Los 22 casos de referencia pasan con tolerancia ≤ 0.01 pH | Test automatizado |
| 3 | Solver converge para todos los ácidos de la DB (80+) | Test batch |
| 4 | Solver reporta no-convergencia (no crash) en sistemas patológicos | Test de edge cases |
| 5 | Modelos de actividad producen γ coherentes con tablas de Harris | Comparación manual |
| 6 | van't Hoff produce pKa(37°C) coherentes con NIST | Comparación manual |
| 7 | Balance de carga < 10⁻¹⁰ para todos los casos de referencia | Test automatizado |
| 8 | API pública es la única vía de acceso al engine | ESLint rule |
| 9 | Todos los tipos exportados tienen TSDoc | Revisión manual |
| 10 | `pnpm build` exitoso sin warnings del engine | CI |

---

## Referencias cruzadas

- → Engine consumido por ácido-base: [Tarea 06](./06-modulo-acido-base.md)
- → Engine consumido por complejación: [Tarea 07](./07-modulo-complejacion.md)
- → Engine consumido por precipitación: [Tarea 08](./08-modulo-precipitacion.md)
- → Engine consumido por redox: [Tarea 09](./09-modulo-redox.md)
- → Engine consumido por lab tools: [Tarea 10](./10-herramientas-laboratorio.md)
- → Diagnósticos mostrados con `ChemChart`: [Tarea 02](./02-sistema-graficos-scichart.md)
- → Resultados mostrados en `ChemGrid`: [Tarea 03](./03-sistema-grids-scigrid.md)
- → Tests del engine: [Tarea 14 §14.1](./14-testing-aseguramiento-calidad.md#141-tests-unitarios-del-engine)

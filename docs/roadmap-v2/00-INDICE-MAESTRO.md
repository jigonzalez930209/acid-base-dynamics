# ROADMAP v2 — Plataforma Científica de Equilibrio Químico

> **Versión**: 2.0.0  
> **Fecha de inicio**: Abril 2026  
> **Estado del ROADMAP v1**: ✅ Completado al 100% — Las 7 fases implementadas  
> **Librerías de visualización**: `scichart-engine` (gráficos WebGL) · `@sci-grid/core` + `@sci-grid/react` (grids científicos)

---

## Visión

Transformar la aplicación actual — una plataforma educativa dual (minimalist + full) con 130+ archivos, 35+ paneles y 80+ ácidos — en una **plataforma científica unificada para consumidores finales** que integre análisis, visualización, planificación de laboratorio y enseñanza en una interfaz donde **menos es más**.

El usuario final no es un programador. Es un estudiante de química, un técnico de laboratorio, un profesor o un investigador que necesita respuestas confiables, rápidas y exportables sin leer documentación técnica.

---

## Principios de diseño

| Principio | Implicación práctica |
|-----------|---------------------|
| **Menos es más** | Cada pantalla muestra solo lo necesario; la complejidad se revela progresivamente |
| **Un clic, un resultado** | Las acciones más comunes deben completarse en ≤ 3 interacciones |
| **Científicamente auditable** | Todo cálculo expone supuestos, fuentes y límites de validez |
| **Visualmente profesional** | Gráficos WebGL de alto rendimiento con `scichart-engine`, datos tabulares con `@sci-grid` |
| **Offline-first** | PWA instalable con funcionalidad completa sin conexión |
| **Internacionalizada** | ES/EN completo, extensible a PT/FR |

---

## Mapa de tareas

```
┌─────────────────────────────────────────────────────────────────┐
│                    PLATAFORMA CIENTÍFICA v2                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                       │
│  │ TAREA 01 │→ │ TAREA 02 │→ │ TAREA 03 │  FUNDACIÓN            │
│  │ Arquitec │  │ SciChart │  │ SciGrid  │                       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                       │
│       │             │             │                             │
│       └─────────────┴─────────────┘                             │
│                     │                                           │
│       ┌─────────────┼─────────────┐                             │
│       │             │             │                             │
│  ┌────▼─────┐  ┌────▼─────┐  ┌────▼─────┐                       │
│  │ TAREA 04 │  │ TAREA 05 │  │ TAREA 06 │  NÚCLEO               │
│  │ Motor EQ │  │ Dashboard│  │ Ácido-   │                       │
│  │ Universal│  │ + NavBar │  │ Base     │                       │
│  └────┬─────┘  └──────────┘  └────┬─────┘                       │
│       │                           │                             │
│  ┌────▼─────┐  ┌──────────┐  ┌────▼─────┐                       │
│  │ TAREA 07 │  │ TAREA 08 │  │ TAREA 09 │  MÓDULOS              │
│  │ Complej. │  │ Precip.  │  │ Redox    │                       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                       │
│       │             │             │                             │
│       └─────────────┴─────────────┘                             │
│                     │                                           │
│  ┌──────────┐  ┌────▼─────┐  ┌──────────┐                       │
│  │ TAREA 10 │  │ TAREA 11 │  │ TAREA 12 │  HERRAMIENTAS         │
│  │ Laborat. │  │ Viz+Rep  │  │ Educativ │                       │
│  └──────────┘  └──────────┘  └──────────┘                       │
│                                                                 │
│  ┌──────────┐  ┌──────────┐                                     │
│  │ TAREA 13 │  │ TAREA 14 │                 CALIDAD             │
│  │ i18n+A11y│  │ Testing  │                                     │
│  │ +PWA     │  │ + E2E    │                                     │
│  └──────────┘  └──────────┘                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Índice de tareas

| # | Archivo | Título | Dep. | Estado |
|---|---------|--------|------|--------|
| 01 | [01-arquitectura-plataforma.md](./01-arquitectura-plataforma.md) | Arquitectura de Plataforma y Sistema de Diseño | — | ⬚ |
| 02 | [02-sistema-graficos-scichart.md](./02-sistema-graficos-scichart.md) | Sistema de Gráficos Científicos (`scichart-engine`) | 01 | ⬚ |
| 03 | [03-sistema-grids-scigrid.md](./03-sistema-grids-scigrid.md) | Sistema de Grids de Datos (`@sci-grid`) | 01 | ⬚ |
| 04 | [04-motor-equilibrio-universal.md](./04-motor-equilibrio-universal.md) | Motor de Equilibrio Químico Universal | 01 | ⬚ |
| 05 | [05-dashboard-y-navegacion.md](./05-dashboard-y-navegacion.md) | Dashboard Inteligente y Navegación | 01, 02, 03 | ⬚ |
| 06 | [06-modulo-acido-base.md](./06-modulo-acido-base.md) | Módulo de Análisis Ácido-Base | 02, 03, 04 | ⬚ |
| 07 | [07-modulo-complejacion.md](./07-modulo-complejacion.md) | Módulo de Complejación y EDTA | 02, 03, 04 | ⬚ |
| 08 | [08-modulo-precipitacion.md](./08-modulo-precipitacion.md) | Módulo de Precipitación y Solubilidad | 02, 03, 04 | ⬚ |
| 09 | [09-modulo-redox.md](./09-modulo-redox.md) | Módulo de Redox y Electroquímica | 02, 03, 04 | ⬚ |
| 10 | [10-herramientas-laboratorio.md](./10-herramientas-laboratorio.md) | Herramientas de Laboratorio y Flujo de Trabajo | 04, 05, 06 | ⬚ |
| 11 | [11-visualizacion-reportes.md](./11-visualizacion-reportes.md) | Visualización Avanzada y Sistema de Reportes | 02, 03, 06–09 | ⬚ |
| 12 | [12-plataforma-educativa.md](./12-plataforma-educativa.md) | Plataforma Educativa y Explicaciones | 05, 06–09, 11 | ⬚ |
| 13 | [13-i18n-accesibilidad-pwa.md](./13-i18n-accesibilidad-pwa.md) | Internacionalización, Accesibilidad y PWA | 01–12 | ⬚ |
| 14 | [14-testing-aseguramiento-calidad.md](./14-testing-aseguramiento-calidad.md) | Testing y Aseguramiento de Calidad | 01–13 | ⬚ |

> **Leyenda**: ⬚ No iniciada · ◧ En progreso · ✅ Completada

---

## Auditoría del ROADMAP v1

Antes de avanzar, confirmamos que **todas las fases del roadmap original están completadas**:

| Fase v1 | Título | Componentes implementados | Estado |
|---------|--------|---------------------------|--------|
| Fase 1 | Blindaje científico y trazabilidad | `master-database` (16 spp), `validation-matrix` (22 casos), `unit-converter` (6 uds), `model-assumptions` (4 dominios), `reference-cases` (22) | ✅ |
| Fase 2 | Lenguaje químico unificado | `species-descriptor-editor`, `equilibrium-descriptor-editor`, `balance-viewer`, `scenario-editor`, `render-demo` | ✅ |
| Fase 3 | Motor universal de equilibrio | `solver-panel` (Newton-Raphson), `balance-checker`, `activity-panel` (4 modelos), `temp-correction-panel` (van't Hoff), `diagnostics-panel` | ✅ |
| Fase 4 | Visualización analítica avanzada | `predominance-map-2d`, `scenario-comparison` (4 esc.), `sensitivity-bands`, `operating-window` (7 zonas), `report-export` | ✅ |
| Fase 5 | Flujo de trabajo de laboratorio | `solution-prep`, `titration-planner`, `interference-panel`, `matrix-presets-panel`, `method-card` | ✅ |
| Fase 6 | Docencia y reproducibilidad | `explanation-viewer`, `learning-path-panel`, `session-manager`, `pedagogical-export`, `accessibility-panel` | ✅ |
| Fase 7 | Escalado e interoperabilidad | `domain-explorer`, `import-export-panel`, `plugin-viewer`, `integration-api`, `governance-panel` | ✅ |

**Total archivos auditados**: 130+ · **Componentes reales (no stubs)**: 35/35 · **Engine con algoritmos reales**: 7/7 · **TODOs pendientes**: 0

---

## Stack tecnológico v2

| Capa | Tecnología | Versión | Propósito |
|------|-----------|---------|-----------|
| Framework | React | 19.x | UI declarativa |
| Lenguaje | TypeScript | 6.x | Seguridad de tipos |
| Build | Vite | 8.x | Bundling + HMR |
| Estilos | Tailwind CSS | 4.x | Utility-first CSS |
| Componentes UI | shadcn/ui + Radix | — | Primitivas accesibles |
| Gráficos | **`scichart-engine`** | 1.11.x | WebGL charts de alto rendimiento |
| Grids | **`@sci-grid/core`** + **`@sci-grid/react`** | 1.4.x | Tablas científicas interactivas |
| Fórmulas | KaTeX + mhchem | 0.16.x | Render químico |
| i18n | i18next | — | Internacionalización |
| Tema | next-themes | — | Dark/light mode |
| Testing | Vitest + Playwright | — | Unit + E2E |
| PWA | Vite PWA plugin | — | Offline + instalable |

---

## Convenciones del roadmap

1. **Cada tarea** vive en su propio archivo `.md` dentro de `docs/roadmap-v2/`
2. **Cada subtarea** se numera `X.Y` donde X = tarea, Y = subtarea
3. **Cada acápite** se numera `X.Y.Z` y es la unidad mínima de trabajo
4. **Diagramas** usan bloques de código ASCII o Mermaid
5. **Tablas** resumen entregables, dependencias y criterios de aceptación
6. **Referencias cruzadas** usan `→ Ver [Tarea XX §Y.Z](./XX-nombre.md#yz-seccion)`
7. **Código de ejemplo** usa bloques TypeScript/TSX con imports reales del proyecto
8. **Estado** de cada acápite se marca con ⬚ / ◧ / ✅

---

## Estructura de archivos objetivo

```
src/
├── app/
│   ├── providers.tsx          ← Providers unificados
│   ├── router.tsx             ← Rutas de la plataforma
│   └── store/                 ← Estado global (Zustand o Context)
├── components/
│   ├── ui/                    ← shadcn primitivas
│   ├── charts/                ← Wrappers de scichart-engine
│   ├── grids/                 ← Wrappers de @sci-grid
│   ├── chemistry/             ← Render químico (fórmulas, ecuaciones)
│   └── layout/                ← Shell, sidebar, header, navigation
├── modules/
│   ├── acid-base/             ← Módulo ácido-base completo
│   ├── complexation/          ← Módulo de complejación
│   ├── precipitation/         ← Módulo de precipitación
│   ├── redox/                 ← Módulo de redox
│   ├── lab-tools/             ← Herramientas de laboratorio
│   ├── education/             ← Plataforma educativa
│   └── reports/               ← Generador de reportes
├── engine/
│   ├── core/                  ← Solver, balances, tipos
│   ├── activity/              ← Modelos de actividad
│   ├── temperature/           ← Correcciones térmicas
│   └── validation/            ← Validación y casos de referencia
├── data/
│   ├── acids.ts               ← Base de datos de ácidos
│   ├── complexes.ts           ← Constantes de complejación
│   ├── solubility.ts          ← Productos de solubilidad
│   ├── redox.ts               ← Potenciales estándar
│   └── sources.ts             ← Fuentes bibliográficas
├── i18n/                      ← Sistema de internacionalización
├── hooks/                     ← Hooks globales reutilizables
├── lib/                       ← Utilidades generales
└── types/                     ← Tipos globales compartidos
```

---

## Próximo paso

Comenzar por **[Tarea 01 — Arquitectura de Plataforma](./01-arquitectura-plataforma.md)**, que establece los cimientos sobre los que se construye todo lo demás.

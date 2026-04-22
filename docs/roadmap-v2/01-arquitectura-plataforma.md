# Tarea 01 — Arquitectura de Plataforma y Sistema de Diseño

> **Dependencias**: Ninguna (tarea fundacional)  
> **Produce**: Shell de aplicación, sistema de diseño, routing, estado global  
> **Consumida por**: Todas las tareas posteriores  
> **Estado**: ⬚ No iniciada

---

## Tabla de contenidos

- [1.1 Unificación de layouts](#11-unificación-de-layouts)
- [1.2 Sistema de navegación](#12-sistema-de-navegación)
- [1.3 Sistema de diseño y tokens](#13-sistema-de-diseño-y-tokens)
- [1.4 Gestión de estado global](#14-gestión-de-estado-global)
- [1.5 Reestructuración del proyecto](#15-reestructuración-del-proyecto)
- [1.6 Instalación de dependencias clave](#16-instalación-de-dependencias-clave)
- [Diagrama de arquitectura](#diagrama-de-arquitectura)
- [Criterios de aceptación](#criterios-de-aceptación)

---

## 1.1 Unificación de layouts

**Objetivo**: Eliminar la dualidad minimalist/full y crear un shell único adaptable.

### 1.1.1 Análisis del estado actual

La aplicación tiene dos puntos de entrada:

| Ruta actual | Layout | Archivos | Complejidad |
|-------------|--------|----------|-------------|
| `/` | `MinimalistLayout` (8 archivos) | pH slider, 3 acid slots, 2 charts, tabs | Baja |
| `/full` | `FullLayout` (45+ archivos) | 7 fases, 35 paneles, 7 engine | Alta |

**Problema**: El usuario tiene que elegir entre una vista demasiado simple y una demasiado compleja. No hay término medio ni transición progresiva.

### 1.1.2 Diseño del shell unificado

```
┌─────────────────────────────────────────────────────────┐
│  ┌─────┐  Acid-Base Dynamics          🔍  🌐  🌙  👤    │ ← Header fijo
│  │ ≡   │  Dashboard > Ácido-Base                        │
├──┴─────┴────────────────────────────────────────────────┤
│ ┌────────┐ ┌──────────────────────────────────────────┐ │
│ │        │ │                                          │ │
│ │  📊    │ │          ÁREA DE CONTENIDO               │ │
│ │  🧪    │ │                                          │ │
│ │  ⚗️    │ │     Módulo activo renderizado aquí       │ │
│ │  ⚡     │ │                                          │ │
│ │  🔬    │ │     Gráficos scichart-engine             │ │
│ │  📚    │ │     Grids @sci-grid                      │ │
│ │  📋    │ │     Controles interactivos               │ │
│ │        │ │                                          │ │
│ │  ···   │ │                                          │ │
│ └────────┘ └──────────────────────────────────────────┘ │
│  Sidebar    Content Area (scroll independiente)         │
│  colapsable                                             │
├─────────────────────────────────────────────────────────┤
│  Status bar: pH 4.75 · H₃PO₄ · 25°C · I=0.1M            │ ← Footer contextual
└─────────────────────────────────────────────────────────┘
```

### 1.1.3 Componentes del shell

| Componente | Archivo destino | Responsabilidad |
|------------|----------------|-----------------|
| `AppShell` | `src/components/layout/app-shell.tsx` | Contenedor raíz: sidebar + content + status bar |
| `AppHeader` | `src/components/layout/app-header.tsx` | Logo, breadcrumbs, búsqueda global, switches de tema/idioma |
| `AppSidebar` | `src/components/layout/app-sidebar.tsx` | Navegación por módulos, colapsable, iconos + texto |
| `AppStatusBar` | `src/components/layout/app-status-bar.tsx` | pH actual, ácido activo, T, I, modelo de actividad |
| `ContentArea` | `src/components/layout/content-area.tsx` | Scroll independiente, breadcrumbs, título del módulo |

### 1.1.4 Plan de migración

| Paso | Acción | Archivos afectados |
|------|--------|-------------------|
| 1 | Crear `AppShell` con sidebar colapsable | Nuevo: `app-shell.tsx` |
| 2 | Migrar `PageHeader` → `AppHeader` | Adaptar: `page-header.tsx` |
| 3 | Crear routing por módulos | Nuevo: `src/app/router.tsx` |
| 4 | Mover contenido de `MinimalistLayout` → módulo ácido-base | Refactor |
| 5 | Mover contenido de `FullLayout` → módulos correspondientes | Refactor |
| 6 | Eliminar `src/layouts/minimalist/` y `src/layouts/full/` | Borrado controlado |
| 7 | Actualizar `main.tsx` para usar shell unificado | Editar |

### 1.1.5 Entregables

- [ ] `AppShell` funcional con sidebar y content area
- [ ] Sidebar colapsable (icono-only en mobile, expandida en desktop)
- [ ] Transición suave entre estados (animación CSS)
- [ ] Status bar contextual
- [ ] Ninguna referencia a layouts antiguos

---

## 1.2 Sistema de navegación

**Objetivo**: Diseñar una navegación intuitiva que permita acceso rápido a cualquier funcionalidad sin abrumar al usuario.

### 1.2.1 Estructura de rutas

```
/                           → Dashboard (resumen + accesos rápidos)
/acid-base                  → Módulo ácido-base
/acid-base/speciation       → Sub-vista: especiación
/acid-base/titration        → Sub-vista: titulación
/acid-base/buffer           → Sub-vista: capacidad buffer
/complexation               → Módulo de complejación
/complexation/edta          → Sub-vista: explorador EDTA
/precipitation              → Módulo de precipitación
/redox                      → Módulo de redox
/lab-tools                  → Herramientas de laboratorio
/lab-tools/solutions        → Sub-vista: preparación de soluciones
/lab-tools/titration-plan   → Sub-vista: planificación de titulaciones
/reports                    → Generador de reportes
/education                  → Plataforma educativa
/education/paths            → Rutas de aprendizaje
/settings                   → Configuración (idioma, tema, unidades)
```

### 1.2.2 Sidebar: secciones y jerarquía

```
┌──────────────────────┐
│  ◉ Dashboard         │  ← Siempre visible
│                      │
│  ANÁLISIS            │  ← Sección
│  ├─ 🧪 Ácido-Base    │
│  ├─ ⚗️ Complejación  │
│  ├─ 💎 Precipitación │
│  └─ ⚡ Redox          │
│                      │
│  HERRAMIENTAS        │
│  ├─ 🔬 Laboratorio   │
│  ├─ 📊 Reportes      │
│  └─ 📐 Convertidor   │
│                      │
│  APRENDIZAJE         │
│  ├─ 📚 Rutas guiadas │
│  └─ 💡 Explicaciones │
│                      │
│  ─────────────────── │
│  ⚙️ Configuración    │
└──────────────────────┘
```

### 1.2.3 Búsqueda global (Command Palette)

| Característica | Detalle |
|---------------|---------|
| Atajo | `Ctrl+K` / `Cmd+K` |
| Funciones | Buscar ácidos, módulos, acciones, configuraciones |
| Resultados | Agrupados por categoría con iconos |
| Acciones rápidas | "Calcular pH de HCl 0.1M", "Abrir EDTA explorer" |
| Historial | Últimas 10 búsquedas |

### 1.2.4 Breadcrumbs contextuales

```
Dashboard > Ácido-Base > Especiación > H₃PO₄
```

Cada segmento es clickeable. El último muestra el ácido/sistema activo.

### 1.2.5 Entregables

- [ ] Router con todas las rutas definidas
- [ ] Sidebar con secciones colapsables
- [ ] Command palette funcional (`Ctrl+K`)
- [ ] Breadcrumbs en cada vista
- [ ] Navegación por teclado completa (Tab, Enter, Escape)

---

## 1.3 Sistema de diseño y tokens

**Objetivo**: Establecer tokens de diseño, paleta de colores, tipografía y spacing consistentes en toda la plataforma.

### 1.3.1 Tokens de color

La app ya usa OKLCH en `index.css`. Se extiende con semántica para módulos:

| Token | Light | Dark | Uso |
|-------|-------|------|-----|
| `--color-primary` | oklch(0.55 0.2 250) | oklch(0.7 0.2 250) | Acciones principales |
| `--color-acid-base` | oklch(0.55 0.15 170) | oklch(0.7 0.15 170) | Módulo ácido-base |
| `--color-complexation` | oklch(0.55 0.15 30) | oklch(0.7 0.15 30) | Módulo complejación |
| `--color-precipitation` | oklch(0.55 0.15 280) | oklch(0.7 0.15 280) | Módulo precipitación |
| `--color-redox` | oklch(0.55 0.15 60) | oklch(0.7 0.15 60) | Módulo redox |
| `--color-lab` | oklch(0.55 0.1 200) | oklch(0.7 0.1 200) | Herramientas lab |
| `--color-chart-bg` | oklch(0.98 0 0) | oklch(0.15 0 0) | Fondo de gráficos |
| `--color-grid-header` | oklch(0.95 0 0) | oklch(0.2 0 0) | Cabecera de grids |

### 1.3.2 Tipografía

| Rol | Familia | Pesos | Uso |
|-----|---------|-------|-----|
| Display | Fraunces | 500, 700 | Títulos de módulo, dashboard |
| Body | Sora Variable | 400, 500, 600 | Texto general, labels, descripciones |
| Mono | JetBrains Mono | 400, 500 | Valores numéricos, fórmulas, código |
| Chemistry | KaTeX + mhchem | — | Fórmulas y ecuaciones químicas |

### 1.3.3 Spacing y layout

```
Spacing scale (rem):  0.25  0.5  0.75  1  1.5  2  3  4  6  8
                      xs    sm   —     md lg   xl 2xl 3xl 4xl 5xl

Breakpoints:
  sm:  640px   (móvil landscape)
  md:  768px   (tablet)
  lg:  1024px  (desktop pequeño)
  xl:  1280px  (desktop)
  2xl: 1536px  (desktop grande)

Content max-width: 1400px
Sidebar width: 240px (expandida) / 64px (colapsada)
Chart min-height: 300px
Grid min-height: 200px
```

### 1.3.4 Componentes base auditados

Los 11 componentes shadcn/ui existentes se mantienen. Se añaden:

| Componente nuevo | Propósito |
|-----------------|-----------|
| `CommandPalette` | Búsqueda global |
| `DataPanel` | Contenedor estándar para secciones de módulo |
| `EmptyState` | Estado vacío con CTA |
| `LoadingState` | Skeleton loaders para charts y grids |
| `ErrorBoundary` | Captura de errores con recovery |

### 1.3.5 Entregables

- [ ] Tokens CSS extendidos en `index.css`
- [ ] Componentes nuevos creados
- [ ] Guía visual (Storybook o página interna `/design`)
- [ ] Dark mode verificado en todos los tokens
- [ ] Contraste WCAG AA verificado

---

## 1.4 Gestión de estado global

**Objetivo**: Definir cómo fluyen los datos entre módulos sin acoplar componentes.

### 1.4.1 Análisis del estado actual

| Estado actual | Ubicación | Problema |
|--------------|-----------|----------|
| `globalPH` | `use-acid-base-state.ts` | Solo vive en un hook, no accesible globalmente |
| `slots` (3 ácidos) | `use-acid-base-state.ts` | Acoplado al layout minimalist |
| `isAdvancedOpen` | `advanced-context.tsx` | Context separado, no extensible |
| Datos de complejación | Locales en cada panel | No compartidos entre módulos |
| Sesiones | `session-manager.tsx` | Solo guarda JSON, no restaura estado real |

### 1.4.2 Arquitectura de estado propuesta

```
┌─────────────────────────────────────────────────┐
│              ESTADO GLOBAL (Context)            │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐  ┌─────────────────────────┐  │
│  │ AppStore     │  │ ChemistryStore          │  │
│  │──────────────│  │─────────────────────────│  │
│  │ theme        │  │ selectedAcids[]         │  │
│  │ locale       │  │ globalPH                │  │
│  │ sidebarOpen  │  │ temperature             │  │
│  │ activeModule │  │ ionicStrength           │  │
│  │ recentItems  │  │ activityModel           │  │
│  └──────────────┘  │ concentrations          │  │
│                    │ solverResults           │  │
│                    └─────────────────────────┘  │
│                                                 │
│  ┌──────────────┐  ┌─────────────────────────┐  │
│  │ SessionStore │  │ UIStore                 │  │
│  │──────────────│  │─────────────────────────│  │
│  │ savedSessions│  │ commandPaletteOpen      │  │
│  │ currentName  │  │ activePanels            │  │
│  │ isDirty      │  │ chartSettings           │  │
│  │ lastSaved    │  │ gridSettings            │  │
│  └──────────────┘  └─────────────────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 1.4.3 Implementación con React Context + useReducer

Se usará React Context con `useReducer` para estado predecible, agrupando por dominio:

| Store | Archivo | Responsabilidad |
|-------|---------|-----------------|
| `AppContext` | `src/app/store/app-store.tsx` | Tema, idioma, sidebar, módulo activo |
| `ChemistryContext` | `src/app/store/chemistry-store.tsx` | Ácidos, pH, T, I, modelo, resultados |
| `SessionContext` | `src/app/store/session-store.tsx` | Guardado, carga, historial |
| `UIContext` | `src/app/store/ui-store.tsx` | Command palette, paneles, preferencias de UI |

### 1.4.4 Patrón de acceso

```tsx
// Hook por dominio — el componente solo consume lo que necesita
const { globalPH, setGlobalPH, activeAcids } = useChemistry();
const { theme, locale } = useApp();
const { saveSession, loadSession } = useSession();
```

### 1.4.5 Entregables

- [ ] 4 stores implementados con tipos TypeScript
- [ ] Hooks de acceso por dominio
- [ ] Migración de `use-acid-base-state` → `ChemistryContext`
- [ ] Migración de `advanced-context` → `UIContext`
- [ ] Persistencia en `localStorage` para preferencias

---

## 1.5 Reestructuración del proyecto

**Objetivo**: Reorganizar `/src` para escalar a 14+ módulos sin fricción.

### 1.5.1 Estructura actual vs. propuesta

| Actual | Propuesta | Razón |
|--------|-----------|-------|
| `src/layouts/minimalist/` | Eliminado → fusionado en módulos | Un solo shell |
| `src/layouts/full/` | Eliminado → fusionado en módulos | Un solo shell |
| `src/features/advanced/` | → `src/modules/*/` | Cada feature es un módulo |
| `src/features/chemistry/` | → `src/engine/` + `src/modules/acid-base/` | Separar math de UI |
| `src/features/i18n/` | → `src/i18n/` | Top-level |
| `src/features/theme/` | → `src/app/theme/` | Dentro de app |
| `src/components/app/` | → `src/components/layout/` | Renombrar |
| `src/components/shared/` | → `src/components/chemistry/` | Más descriptivo |
| — | `src/components/charts/` | Nuevo: wrappers scichart-engine |
| — | `src/components/grids/` | Nuevo: wrappers @sci-grid |
| — | `src/modules/` | Nuevo: módulos de dominio |

### 1.5.2 Convención de archivos por módulo

Cada módulo sigue esta estructura interna:

```
src/modules/acid-base/
├── index.tsx              ← Entry point / router del módulo
├── components/            ← Componentes visuales del módulo
│   ├── speciation-view.tsx
│   ├── titration-view.tsx
│   └── buffer-view.tsx
├── hooks/                 ← Hooks específicos del módulo
│   └── use-speciation.ts
├── lib/                   ← Lógica/matemática del módulo
│   └── speciation-calc.ts
└── types.ts               ← Tipos del módulo
```

### 1.5.3 Regla de imports

```
✅ src/modules/acid-base/ → importa de src/engine/, src/components/, src/hooks/
✅ src/modules/acid-base/ → importa de src/data/
❌ src/modules/acid-base/ → NO importa de src/modules/complexation/
✅ src/modules/reports/   → importa de cualquier módulo (es transversal)
```

Los módulos no se importan entre sí. Lo que se comparte va en `src/engine/`, `src/data/` o `src/components/`.

### 1.5.4 Entregables

- [ ] Nueva estructura de directorios creada
- [ ] Archivos movidos con imports actualizados
- [ ] Aliases de path actualizados en `tsconfig.json`
- [ ] Build limpio sin errores
- [ ] ESLint sin warnings

---

## 1.6 Instalación de dependencias clave

**Objetivo**: Instalar y verificar las librerías fundacionales del v2.

### 1.6.1 Dependencias a instalar

```bash
# Gráficos científicos WebGL
pnpm add scichart-engine

# Grid científico
pnpm add @sci-grid/core @sci-grid/react

# PWA (para Tarea 13, pero se configura base aquí)
pnpm add -D vite-plugin-pwa

# Testing (para Tarea 14, pero se configura base aquí)
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
pnpm add -D playwright @playwright/test
```

### 1.6.2 Verificación post-instalación

| Check | Comando | Esperado |
|-------|---------|----------|
| Build limpio | `pnpm build` | Exit 0, sin warnings |
| Dev server | `pnpm dev` | Vite HMR funcionando |
| Import scichart-engine | `import { SciChart } from 'scichart-engine/react'` | Sin errores TS |
| Import @sci-grid | `import { ... } from '@sci-grid/react'` | Sin errores TS |
| Tests base | `pnpm test` (vitest) | Suite vacía pasa |

### 1.6.3 Configuración de Vitest

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

### 1.6.4 Entregables

- [ ] Todas las dependencias instaladas
- [ ] `pnpm build` exitoso
- [ ] `pnpm dev` funcional
- [ ] Imports de scichart-engine y @sci-grid verificados
- [ ] Vitest configurado con test trivial pasando
- [ ] Playwright configurado con test trivial pasando

---

## Diagrama de arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIO FINAL                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────── AppShell ──────────────────────────┐ │
│  │                                                            │ │
│  │  ┌─────────┐  ┌────────────────────────────────────────┐   │ │
│  │  │         │  │                                        │   │ │
│  │  │ Sidebar │  │  ┌──── Router ────────────────────┐    │   │ │
│  │  │         │  │  │                                │    │   │ │
│  │  │ Nav     │  │  │  /            → Dashboard      │    │   │ │
│  │  │ items   │  │  │  /acid-base   → AcidBaseModule │    │   │ │
│  │  │         │  │  │  /complex.    → ComplexModule  │    │   │ │
│  │  │ Search  │  │  │  /precip.     → PrecipModule   │    │   │ │
│  │  │         │  │  │  /redox       → RedoxModule    │    │   │ │
│  │  │ Config  │  │  │  /lab-tools   → LabModule      │    │   │ │
│  │  │         │  │  │  /reports     → ReportsModule  │    │   │ │
│  │  │         │  │  │  /education   → EduModule      │    │   │ │
│  │  │         │  │  │                                │    │   │ │
│  │  └─────────┘  │  └────────────────────────────────┘    │   │ │
│  │               │                                        │   │ │
│  │               └────────────────────────────────────────┘   │ │
│  │                                                            │ │
│  │  ┌──────────────── Status Bar ─────────────────────────┐   │ │
│  │  │ pH 4.75 │ H₃PO₄ 0.1M │ 25°C │ Davies │ ES │ ☾       │   │ │
│  │  └─────────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                         CAPAS INTERNAS                          │
│                                                                 │
│  ┌─── Stores ───┐  ┌─── Engine ───┐  ┌─── Data ────────────┐    │
│  │ AppStore     │  │ Solver       │  │ acids.ts (80+)      │    │
│  │ ChemStore    │  │ Activity     │  │ complexes.ts        │    │
│  │ SessionStore │  │ Temperature  │  │ solubility.ts       │    │
│  │ UIStore      │  │ Validator    │  │ redox.ts            │    │
│  └──────────────┘  └──────────────┘  └─────────────────────┘    │
│                                                                 │
│  ┌─── Visualización ────────────────────────────────────────┐   │
│  │ scichart-engine (WebGL)  │  @sci-grid/react (tablas)     │   │
│  │ Line, Scatter, Band,     │  Sorting, filtering, search,  │   │
│  │ Area, Candlestick, Heat  │  cell renderers, export       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Criterios de aceptación

| # | Criterio | Verificación |
|---|----------|-------------|
| 1 | El shell unificado renderiza correctamente en desktop y mobile | Visual |
| 2 | La sidebar se colapsa en pantallas < 768px | Responsive test |
| 3 | Todas las rutas definidas devuelven un componente (aunque sea placeholder) | Navegación manual |
| 4 | El estado global persiste entre navegaciones de módulo | Test funcional |
| 5 | `pnpm build` produce bundle sin errores ni warnings | CI |
| 6 | Los tokens de color funcionan en light y dark mode | Visual |
| 7 | `scichart-engine` y `@sci-grid` importan sin errores | TypeScript |
| 8 | Vitest corre al menos 1 test trivial | `pnpm test` |
| 9 | No quedan referencias a `MinimalistLayout` ni `FullLayout` | grep |
| 10 | Contraste WCAG AA en todos los tokens de color | axe/lighthouse |

---

## Referencias cruzadas

- → Consume tokens de color: [Tarea 02 §2.3](./02-sistema-graficos-scichart.md#23-integración-de-temas)
- → Consume tokens de color: [Tarea 03 §3.3](./03-sistema-grids-scigrid.md#33-estilos-y-temas)
- → `ChemistryStore` usado en: [Tarea 04](./04-motor-equilibrio-universal.md), [Tarea 06](./06-modulo-acido-base.md)
- → `AppShell` consumido por: [Tarea 05 §5.1](./05-dashboard-y-navegacion.md#51-diseño-del-dashboard)
- → Estructura de módulos usada en: Tareas 06–12
- → Vitest configurado aquí, expandido en: [Tarea 14](./14-testing-aseguramiento-calidad.md)

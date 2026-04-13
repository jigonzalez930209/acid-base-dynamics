# Tarea 03 — Sistema de Grids de Datos (`@sci-grid`)

> **Dependencias**: [Tarea 01](./01-arquitectura-plataforma.md) (shell, tokens, dependencias instaladas)  
> **Produce**: Capa de abstracción de grids, componentes wrapper, cell renderers químicos  
> **Consumida por**: Tareas 06–12 (todos los módulos con datos tabulares)  
> **Librería**: `@sci-grid/core` v1.4.x + `@sci-grid/react` — Grid científico, TypeScript nativo  
> **Estado**: ⬚ No iniciada

---

## Tabla de contenidos

- [3.1 Capa de abstracción de grids](#31-capa-de-abstracción-de-grids)
- [3.2 Componentes wrapper estándar](#32-componentes-wrapper-estándar)
- [3.3 Cell renderers químicos](#33-cell-renderers-químicos)
- [3.4 Patrones de interacción](#34-patrones-de-interacción)
- [3.5 Exportación de datos tabulares](#35-exportación-de-datos-tabulares)
- [3.6 Migración de tablas HTML existentes](#36-migración-de-tablas-html-existentes)
- [Criterios de aceptación](#criterios-de-aceptación)

---

## 3.1 Capa de abstracción de grids

**Objetivo**: Crear una capa intermedia entre `@sci-grid` y los módulos, similar a lo hecho con gráficos en [Tarea 02](./02-sistema-graficos-scichart.md).

### 3.1.1 Principio de diseño

```
Módulo (acid-base, complexation, etc.)
       │
       ▼
┌──────────────────────────┐
│  src/components/grids/   │  ← Capa de abstracción
│  ChemGrid                │     Wrapper principal
│  ChemCompactGrid         │     Versión compacta
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  @sci-grid/react         │  ← Librería externa
│  @sci-grid/core          │     Engine del grid
└──────────────────────────┘
```

### 3.1.2 Tipos base del sistema de grids

```ts
// src/components/grids/types.ts

/** Definición de una columna */
export interface ChemColumn<T = any> {
  id: string;
  header: string;                         // Texto del header (i18n)
  accessor: keyof T | ((row: T) => any);  // Acceso al dato
  width?: number | 'auto';
  minWidth?: number;
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  pinned?: 'left' | 'right';
  cellRenderer?: 'text' | 'number' | 'formula' | 'badge' | 'status' | 'actions' | 'pka-list';
  cellRendererParams?: Record<string, any>;
  formatValue?: (value: any, row: T) => string;
  align?: 'left' | 'center' | 'right';
}

/** Configuración del grid */
export interface ChemGridConfig<T = any> {
  columns: ChemColumn<T>[];
  data: T[];
  rowKey: keyof T | ((row: T) => string);
  searchable?: boolean;                   // Barra de búsqueda global
  searchPlaceholder?: string;
  paginated?: boolean;
  pageSize?: number;
  exportable?: boolean;
  selectable?: boolean;                   // Selección de filas
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  height?: number | string;
  compact?: boolean;                      // Filas más compactas
  striped?: boolean;
  stickyHeader?: boolean;
}
```

### 3.1.3 Estructura de archivos

```
src/components/grids/
├── index.ts                   ← Re-exportaciones públicas
├── types.ts                   ← Tipos compartidos
├── chem-grid.tsx              ← Grid principal
├── chem-compact-grid.tsx      ← Grid compacto (dashboards, sidebars)
├── cell-renderers/            ← Renderers especializados
│   ├── formula-cell.tsx       ← Renderiza fórmulas químicas (KaTeX)
│   ├── badge-cell.tsx         ← Badges de estado/categoría
│   ├── status-cell.tsx        ← ✅/⚠️/❌ indicadores
│   ├── number-cell.tsx        ← Números con formato científico
│   ├── pka-list-cell.tsx      ← Lista de pKa con subíndices
│   └── actions-cell.tsx       ← Botones de acción por fila
├── grid-toolbar.tsx           ← Search bar + export + filtros
└── use-grid-theme.ts          ← Sincronización de tema
```

### 3.1.4 Entregables

- [ ] `types.ts` con definiciones completas
- [ ] `index.ts` con re-exportaciones
- [ ] Estructura de archivos creada
- [ ] Ningún módulo importa directamente de `@sci-grid/core` o `@sci-grid/react`

---

## 3.2 Componentes wrapper estándar

**Objetivo**: Crear los wrappers que cubren las necesidades tabulares de la app.

### 3.2.1 `ChemGrid` — Grid principal

```tsx
// Ejemplo: base de datos de ácidos
import { ChemGrid } from '@/components/grids';
import { ACID_DATABASE } from '@/data/acids';

function AcidDatabaseGrid() {
  const columns: ChemColumn<AcidRecord>[] = [
    { id: 'name', header: 'Nombre', accessor: 'name', sortable: true, filterable: true },
    { id: 'formula', header: 'Fórmula', accessor: 'formula', cellRenderer: 'formula' },
    { id: 'type', header: 'Tipo', accessor: 'type', cellRenderer: 'badge',
      cellRendererParams: { 
        colorMap: { monoprotic: 'blue', diprotic: 'orange', triprotic: 'purple' } 
      }
    },
    { id: 'pkas', header: 'pKₐ', accessor: 'pKas', cellRenderer: 'pka-list' },
    { id: 'source', header: 'Fuente', accessor: 'source', width: 120 },
  ];

  return (
    <ChemGrid
      columns={columns}
      data={ACID_DATABASE}
      rowKey="id"
      searchable
      searchPlaceholder="Buscar ácido por nombre o fórmula..."
      paginated
      pageSize={20}
      exportable
      striped
      stickyHeader
    />
  );
}
```

### 3.2.2 `ChemCompactGrid` — Grid compacto

Para dashboards, sidebars y paneles donde el espacio es limitado:

```tsx
<ChemCompactGrid
  columns={[
    { id: 'species', header: 'Especie', accessor: 'name', cellRenderer: 'formula' },
    { id: 'alpha', header: 'α', accessor: 'alpha', cellRenderer: 'number',
      cellRendererParams: { decimals: 4 } },
    { id: 'conc', header: '[C]', accessor: 'concentration', cellRenderer: 'number',
      cellRendererParams: { decimals: 6, scientific: true } },
  ]}
  data={speciesAtCurrentPH}
  rowKey="id"
  height={200}
/>
```

### 3.2.3 Entregables

- [ ] `ChemGrid` funcional con sorting, filtering, pagination
- [ ] `ChemCompactGrid` funcional en espacios reducidos
- [ ] Props tipados con genéricos TypeScript
- [ ] Responsive: scroll horizontal en mobile

---

## 3.3 Cell renderers químicos

**Objetivo**: Renderers especializados que muestran datos químicos de forma legible y profesional.

### 3.3.1 Catálogo de renderers

| Renderer | Input | Output visual | Uso |
|----------|-------|--------------|-----|
| `formula` | `"H3PO4"` | H₃PO₄ (KaTeX) | Fórmulas en tablas de ácidos |
| `badge` | `"monoprotic"` | `Monoprótico` (pill) | Categorización |
| `status` | `"pass" \| "warn" \| "fail"` | ✅ / ⚠️ / ❌ | Validación |
| `number` | `0.000142` | `1.42 × 10⁻⁴` | Concentraciones, constantes |
| `pka-list` | `[2.14, 7.19, 12.34]` | pKₐ₁=2.14, pKₐ₂=7.19, pKₐ₃=12.34 | Ácidos polipróticos |
| `actions` | — | `[Ver] [Editar] [···]` | Acciones por fila |

### 3.3.2 `formula-cell.tsx` — Render de fórmulas

```tsx
// Usa el mismo pipeline de KaTeX + mhchem que el resto de la app
import { ChemicalFormula } from '@/components/chemistry';

export function FormulaCell({ value }: { value: string }) {
  return <ChemicalFormula formula={value} inline />;
}
```

### 3.3.3 `number-cell.tsx` — Números científicos

```tsx
export function NumberCell({ value, decimals = 4, scientific = false }: NumberCellProps) {
  if (scientific && Math.abs(value) < 0.01) {
    return <span className="font-mono text-sm">{value.toExponential(decimals)}</span>;
  }
  return <span className="font-mono text-sm">{value.toFixed(decimals)}</span>;
}
```

### 3.3.4 `pka-list-cell.tsx` — Lista de pKa

```
Celda renderizada:
┌──────────────────────────┐
│ pKₐ₁=2.14  pKₐ₂=7.19   │
│ pKₐ₃=12.34              │
└──────────────────────────┘
```

### 3.3.5 `badge-cell.tsx` — Badges categóricos

```
┌─────────────┐  ┌──────────────┐  ┌───────────────┐
│ Monoprótico │  │  Diprótico   │  │  Triprótico   │
│    (azul)   │  │  (naranja)   │  │   (púrpura)   │
└─────────────┘  └──────────────┘  └───────────────┘
```

### 3.3.6 Entregables

- [ ] 6 cell renderers implementados
- [ ] Renderers registrados en el grid por nombre (`cellRenderer: 'formula'`)
- [ ] Consistencia visual con el sistema de diseño
- [ ] Dark mode en todos los renderers

---

## 3.4 Patrones de interacción

**Objetivo**: Definir interacciones estándar para todos los grids.

### 3.4.1 Búsqueda global

```
┌──────────────────────────────────────────────┐
│  🔍 Buscar ácido por nombre o fórmula...     │
├──────────────────────────────────────────────┤
│  Nombre       │ Fórmula │ Tipo      │ pKₐ    │
│───────────────┼─────────┼───────────┼────────│
│  Fosfórico    │ H₃PO₄   │ Triprótico│ 2.14…  │
│  Fosforoso    │ H₃PO₃   │ Diprótico │ 1.30…  │
│───────────────┼─────────┼───────────┼────────│
│  2 resultados de 80                          │
└──────────────────────────────────────────────┘
```

- Búsqueda en tiempo real (debounced 200ms)
- Busca en todas las columnas filtrables
- Resalta coincidencias en las celdas

### 3.4.2 Ordenamiento

| Interacción | Resultado |
|-------------|-----------|
| Click en header | Ordena ascendente → descendente → sin orden |
| Shift + click | Ordenamiento multi-columna |
| Indicador visual | ▲ / ▼ en la columna activa |

### 3.4.3 Filtros por columna

```
┌─── Filtrar: Tipo ────────┐
│  ☑ Monoprótico  (32)     │
│  ☑ Diprótico    (28)     │
│  ☑ Triprótico   (12)     │
│  ☐ Aminoácido   (8)      │
│                          │
│  [Aplicar] [Limpiar]     │
└──────────────────────────┘
```

### 3.4.4 Selección de filas

```
│  ☑  │ Fosfórico    │ H₃PO₄  │ Triprótico  │  ← Seleccionada
│  ☐  │ Acético      │ CH₃COOH│ Monoprótico │
│  ☑  │ Carbónico    │ H₂CO₃  │ Diprótico   │  ← Seleccionada
│─────┼──────────────┼────────┼─────────────│
│  2 seleccionados                          │
│  [Comparar] [Exportar selección] [Limpiar]│
```

### 3.4.5 Paginación

```
┌─────────────────────────────────────────────┐
│  Mostrando 1-20 de 80 ácidos                │
│  ◀ 1  2  3  4 ▶    20 / 50 / 100 por pág.   │
└─────────────────────────────────────────────┘
```

### 3.4.6 Entregables

- [ ] Búsqueda global con highlight
- [ ] Sorting multi-columna
- [ ] Filtros por columna (checkbox)
- [ ] Selección de filas con acciones bulk
- [ ] Paginación configurable

---

## 3.5 Exportación de datos tabulares

**Objetivo**: Exportar datos del grid para procesamiento externo.

### 3.5.1 Formatos de exportación

| Formato | Para | Contenido |
|---------|------|-----------|
| CSV | Excel, Google Sheets | Todas las filas visibles |
| JSON | Programadores, APIs | Datos + metadatos |
| Clipboard | Pegado rápido | Tab-separated (pega en Excel) |

### 3.5.2 Opciones de exportación

```
┌──── Exportar datos ──────────────────┐
│                                       │
│  Datos:                               │
│  ○ Todas las filas (80)               │
│  ○ Filas filtradas (23)               │
│  ○ Filas seleccionadas (2)            │
│                                       │
│  Formato:                             │
│  ○ CSV   ○ JSON   ○ Portapapeles      │
│                                       │
│  Columnas:                            │
│  ☑ Nombre  ☑ Fórmula  ☑ Tipo          │
│  ☑ pKa     ☐ Fuente   ☐ ID            │
│                                       │
│  [Exportar ⬇️]  [Cancelar]            │
└───────────────────────────────────────┘
```

### 3.5.3 Entregables

- [ ] Exportación CSV con BOM para Excel
- [ ] Exportación JSON con metadatos
- [ ] Copia al portapapeles tab-separated
- [ ] Selector de columnas a incluir
- [ ] Selector de filas (todas/filtradas/seleccionadas)

---

## 3.6 Migración de tablas HTML existentes

**Objetivo**: Reemplazar todas las tablas HTML manuales por grids `@sci-grid`.

### 3.6.1 Inventario de tablas a migrar

| # | Tabla | Archivo origen | Datos | Filas aprox. |
|---|-------|---------------|-------|-------------|
| 1 | Base de datos de especies | `master-database.tsx` | 16+ especies con masa molar, fuente | 16+ |
| 2 | Matriz de validación | `validation-matrix.tsx` | 22 casos con error %, pass/fail | 22 |
| 3 | Casos de referencia | `reference-cases.tsx` | 22 casos con inputs/outputs | 22 |
| 4 | Supuestos del modelo | `model-assumptions.tsx` | 4 dominios × 4 supuestos | 16 |
| 5 | Tabla de interferencias | `interference-panel.tsx` | 6 combos analito/interferente | 6 |
| 6 | Presets de matrices | `matrix-presets-panel.tsx` | 5 matrices + variables | 5 |
| 7 | Tabla de unidades | `unit-converter.tsx` | 6 unidades con factores | 6 |
| 8 | API endpoints | `integration-api.tsx` | 5 endpoints + 4 integraciones | 9 |
| 9 | Governance checklist | `governance-panel.tsx` | 8+ checks de calidad | 8 |
| 10 | Comparison table | `scenario-comparison.tsx` | 4 escenarios | 4 |
| 11 | Complexation data | `complexation-data.ts` → paneles | Metales + ligandos | 10+ |
| 12 | Precipitation data | `precipitation-data.ts` → paneles | Ksp de sales | 10+ |
| 13 | Redox data | `redox-data.ts` → paneles | E° de pares | 10+ |
| 14 | Molar masses | `sources.ts` → master-database | 16 masas molares | 16 |

### 3.6.2 Clasificación por tipo de grid

| Tipo | Tablas | Wrapper |
|------|--------|---------|
| **Browsing** (buscar, filtrar, paginar) | 1, 2, 3, 11, 12, 13 | `ChemGrid` |
| **Compact** (resumen en panel) | 4, 5, 6, 7, 8, 9, 10 | `ChemCompactGrid` |
| **Referencia** (datos de consulta) | 14 | `ChemCompactGrid` |

### 3.6.3 Ejemplo de migración: `master-database.tsx`

**Antes (HTML manual)**:
```tsx
// Tabla con <table>, <thead>, <tr>, <td> manuales
// Búsqueda con useState + filter
// Sin sorting, sin export, sin paginación
```

**Después (@sci-grid)**:
```tsx
import { ChemGrid } from '@/components/grids';

const columns = [
  { id: 'species', header: 'Especie', accessor: 'species', cellRenderer: 'formula', sortable: true },
  { id: 'molarMass', header: 'M (g/mol)', accessor: 'molarMass', cellRenderer: 'number',
    cellRendererParams: { decimals: 2 }, sortable: true, align: 'right' },
  { id: 'source', header: 'Fuente', accessor: 'source', filterable: true },
  { id: 'temp', header: 'T (°C)', accessor: 'temperature', cellRenderer: 'number' },
  { id: 'validity', header: 'Validez', accessor: 'validity', cellRenderer: 'status' },
];

<ChemGrid columns={columns} data={SPECIES_DATABASE} rowKey="id"
  searchable paginated pageSize={15} exportable striped stickyHeader />
```

**Ganancia**: Sorting, filtering, pagination, export, búsqueda con highlight — todo gratis.

### 3.6.4 Entregables

- [ ] 14 tablas migradas a `ChemGrid` / `ChemCompactGrid`
- [ ] Cero `<table>` manuales para datos (tablas de layout se mantienen)
- [ ] Paridad funcional verificada
- [ ] Search, sort, filter funcionando en todas
- [ ] Export funcionando en grids principales

---

## Criterios de aceptación

| # | Criterio | Verificación |
|---|----------|-------------|
| 1 | `ChemGrid` renderiza 100+ filas sin lag visible | Performance test |
| 2 | Búsqueda filtra en < 100ms en 80 filas | Manual |
| 3 | Sorting multi-columna funciona correctamente | Manual |
| 4 | Cell renderer `formula` muestra H₃PO₄ con subíndices | Visual |
| 5 | Cell renderer `number` muestra notación científica cuando aplica | Visual |
| 6 | Exportación CSV abre correctamente en Excel | Manual |
| 7 | Grid es responsive (scroll horizontal en mobile) | Responsive test |
| 8 | Dark mode funciona en grid, headers y cell renderers | Visual |
| 9 | Ningún módulo importa directamente de `@sci-grid/*` | `grep` |
| 10 | 14 tablas HTML migradas y verificadas | Checklist |

---

## Referencias cruzadas

- → Tokens de color de: [Tarea 01 §1.3](./01-arquitectura-plataforma.md#13-sistema-de-diseño-y-tokens)
- → Base de datos de ácidos: [Tarea 06 §6.1](./06-modulo-acido-base.md#61-especiación-interactiva)
- → Tabla de complejación: [Tarea 07 §7.1](./07-modulo-complejacion.md#71-base-de-datos-de-complejos)
- → Tabla de Ksp: [Tarea 08 §8.1](./08-modulo-precipitacion.md#81-base-de-datos-de-solubilidad)
- → Tabla de E°: [Tarea 09 §9.1](./09-modulo-redox.md#91-base-de-datos-de-potenciales)
- → Validación de tablas: [Tarea 14 §14.3](./14-testing-aseguramiento-calidad.md#143-tests-de-componentes)
- → Exportación tabular usada en: [Tarea 11](./11-visualizacion-reportes.md)

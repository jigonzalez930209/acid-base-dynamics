# Tarea 11 — Visualización Avanzada y Sistema de Reportes

> **Dependencias**: [Tarea 02](./02-sistema-graficos-scichart.md), [Tarea 03](./03-sistema-grids-scigrid.md), [Tarea 06–09](./06-modulo-acido-base.md)  
> **Produce**: Sistema de visualización comparativa, mapas 2D y exportaciones profesionales  
> **Consumida por**: [Tarea 12](./12-plataforma-educativa.md), [Tarea 14](./14-testing-aseguramiento-calidad.md)  
> **Estado**: ⬚ No iniciada

---

## Tabla de contenidos

- [11.1 Comparador multi-escenario](#111-comparador-multi-escenario)
- [11.2 Mapas de predominancia 2D](#112-mapas-de-predominancia-2d)
- [11.3 Ventanas operativas](#113-ventanas-operativas)
- [11.4 Constructor de reportes](#114-constructor-de-reportes)
- [11.5 Sistema de exportación](#115-sistema-de-exportación)
- [Estructura del módulo](#estructura-del-módulo)
- [Criterios de aceptación](#criterios-de-aceptación)

---

## Estructura del módulo

```
src/modules/visualization/
├── index.tsx
├── components/
│   ├── multi-scenario-view.tsx         ← Comparador (§11.1)
│   ├── predominance-map-view.tsx       ← Mapa 2D (§11.2)
│   ├── operating-window-view.tsx       ← Ventanas operativas (§11.3)
│   ├── report-builder-view.tsx         ← Constructor de reportes (§11.4)
│   └── export-dialog.tsx              ← Diálogo de exportación (§11.5)
├── hooks/
│   ├── use-multi-scenario.ts
│   ├── use-report-builder.ts
│   └── use-export.ts
├── lib/
│   ├── report-layout.ts
│   ├── export-pdf.ts
│   ├── export-csv.ts
│   └── snapshot.ts
└── types.ts
```

### Sub-rutas

```
/visualization                     → Vista resumen
/visualization/compare             → Comparador multi-escenario
/visualization/maps                → Mapas de predominancia 2D
/visualization/operating-windows   → Ventanas operativas
/visualization/reports             → Constructor de reportes
```

---

## 11.1 Comparador multi-escenario

**Objetivo**: Superponer múltiples curvas de diferentes condiciones en un solo gráfico para comparar.

### 11.1.1 Casos de uso

| Comparación | Variable | Fija | Ejemplo |
|-------------|----------|------|---------|
| Efecto de concentración | C_a | Ácido, T | H₃PO₄ a 0.01, 0.1, 1.0 M |
| Efecto de temperatura | T | Ácido, C_a | HAc 0.1M a 15, 25, 37°C |
| Diferentes ácidos | Ácido | C_a, T | HAc vs HF vs HCN a 0.1M |
| Fuerza iónica | I | Ácido, C_a | HCl 0.1M con I = 0, 0.1, 0.5 |
| Titulante | Base | Analito | H₃PO₄ con NaOH vs KOH vs NH₃ |

### 11.1.2 Layout del comparador

```
┌─── Comparar escenarios ──────────────────────────────────────┐
│                                                              │
│  ┌─ Escenarios ─┐  ┌─ Gráfico superpuesto ────────────────┐  │
│  │               │  │                                     │  │
│  │ ● H₃PO₄ 0.01 │  │    pH                                │  │
│  │ ● H₃PO₄ 0.1  │  │    14 ┤                              │  │
│  │ ● H₃PO₄ 1.0  │  │       │     ───── 0.01M              │  │
│  │               │  │       │   ─── 0.1M                  │  │
│  │ [+ Añadir]    │  │       │  ── 1.0M                    │  │
│  │               │  │     7 ┤ ─────────────               │  │
│  │ ──────────    │  │       │                             │  │
│  │ Eje Y:       │  │       │                              │  │
│  │ ○ α (frac.)  │  │     0 ┤                              │  │
│  │ ● pH         │  │       └───┬───┬───┬───┬───┬──→ V/mL  │  │
│  │ ○ β (buffer) │  │          0  10  20  30  40           │  │
│  │               │  │                                     │  │
│  └───────────────┘  └─────────────────────────────────────┘  │
│                                                              │
│  ┌─ Tabla de puntos clave ────────────────────────────────┐  │
│  │ Escenario │ pH₀  │ Veq₁  │ pH_eq₁ │ Veq₂  │ pH_eq₂     │  │
│  │ 0.01 M    │ 3.08 │ 25.0  │ 4.68   │ 50.0  │ 9.76       │  │
│  │ 0.1 M     │ 1.63 │ 25.0  │ 4.68   │ 50.0  │ 9.76       │  │
│  │ 1.0 M     │ 1.08 │ 25.0  │ 4.68   │ 50.0  │ 9.76       │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  [📸 Captura]  [📊 Exportar datos]  [📄 Añadir a reporte]    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 11.1.3 Implementación con scichart-engine

```typescript
// Múltiples series en un solo ChemChart
interface ScenarioSeries {
  id: string;
  label: string;
  data: Array<{ x: number; y: number }>;
  color: string;        // Asignado automáticamente del palette
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  visible: boolean;
}

// Cada escenario se genera pasando params al engine
function generateScenario(params: ScenarioParams): ScenarioSeries {
  const curve = engine.buildTitrationCurve(params);
  return {
    id: crypto.randomUUID(),
    label: `${params.acid.name} ${params.concentration}M`,
    data: curve.points,
    color: palette.next(),
    visible: true,
  };
}
```

→ Usa `ChemMultiChart` de [Tarea 02 §2.3](./02-sistema-graficos-scichart.md#23-chemchart-multiseries).

### 11.1.4 Entregables

- [ ] Agregar/eliminar escenarios dinámicamente (máx 8)
- [ ] Palette de colores con buen contraste
- [ ] Toggle de visibilidad por escenario
- [ ] Tabla comparativa de puntos clave con `ChemCompactGrid`
- [ ] Cambio de eje Y (pH, α, β)
- [ ] Captura del gráfico combinado

---

## 11.2 Mapas de predominancia 2D

**Objetivo**: Visualizar qué especie predomina en función de dos variables (pH vs pC, pH vs I, etc.).

### 11.2.1 Tipos de mapas

| Mapa | Eje X | Eje Y | Celda | Módulo |
|------|-------|-------|-------|--------|
| Especiación α | pH (0-14) | log C (-6 a 0) | α de especie dominante | Ácido-base |
| EDTA αY⁴⁻ | pH (0-14) | log [Metal] | αY⁴⁻ efectivo | Complejación |
| Solubilidad | pH (0-14) | log [Ligando] | log S | Precipitación |
| Pourbaix | pH (0-14) | E (V) | Especie estable | Redox |

### 11.2.2 Implementación con ChemHeatmap

```
┌─── Mapa de predominancia 2D ──────────────────────────┐
│                                                       │
│  Ácido: [H₃PO₄ ▼]    Resolución: [50×50 ▼]            │
│                                                       │
│  log C │                                              │
│    0   │ █████████ ██████████ ███████████ █████████   │
│  -1    │ ████H₃A██ ███H₂A⁻██ ███HA²⁻████ ██A³⁻███     │
│  -2    │ █████████ ██████████ ███████████ █████████   │
│  -3    │ █████████ ██████████ ███████████ █████████   │
│  -4    │ █████████ ██████████ ███████████ █████████   │
│  -5    │ █████████ ██████████ ███████████ █████████   │
│  -6    │ █████████ ██████████ ███████████ █████████   │
│        └────┬────┬────┬────┬────┬────┬────┬─→ pH      │
│             0    2    4    6    8   10   12   14      │
│                                                       │
│  Leyenda: ■ H₃A  ■ H₂A⁻  ■ HA²⁻  ■ A³⁻                │
│                                                       │
│  Resolución: 50×50 = 2500 puntos calculados           │
│  Tiempo: 0.12s                                        │
│                                                       │
└───────────────────────────────────────────────────────┘
```

→ Usa `ChemHeatmap` de [Tarea 02 §2.4](./02-sistema-graficos-scichart.md#24-chemheatmap-2d).

### 11.2.3 Algoritmo de generación

```typescript
interface HeatmapConfig {
  xAxis: { param: 'pH' | 'logC' | 'E'; min: number; max: number; steps: number };
  yAxis: { param: 'pH' | 'logC' | 'E' | 'logI'; min: number; max: number; steps: number };
  acid: AcidEntry;
  valueFunction: (x: number, y: number, acid: AcidEntry) => number;
}

function generateHeatmapData(config: HeatmapConfig): number[][] {
  const { xAxis, yAxis, valueFunction, acid } = config;
  const matrix: number[][] = [];

  for (let j = 0; j < yAxis.steps; j++) {
    const row: number[] = [];
    const y = yAxis.min + (yAxis.max - yAxis.min) * j / (yAxis.steps - 1);
    for (let i = 0; i < xAxis.steps; i++) {
      const x = xAxis.min + (xAxis.max - xAxis.min) * i / (xAxis.steps - 1);
      row.push(valueFunction(x, y, acid));
    }
    matrix.push(row);
  }
  return matrix;
}
```

### 11.2.4 Entregables

- [ ] Heatmap de especiación pH vs log C
- [ ] Heatmap configurable (seleccionar ejes)
- [ ] Resolución ajustable (25×25 a 200×200)
- [ ] Cursor con coordenadas (crosshair)
- [ ] Escala de color configurable
- [ ] Exportar como imagen PNG

---

## 11.3 Ventanas operativas

**Objetivo**: Identificar rangos de pH / concentración donde una separación o análisis funciona.

### 11.3.1 Concepto

```
  pH   │
  14   │
       │            ┌──────────┐
  10   │            │ VENTANA  │ ← Zona donde se puede
       │            │ OPERATIVA│   separar Ca²⁺ de Mg²⁺
   8   │            │          │   por precipitación selectiva
       │            └──────────┘
   6   │
       │
   4   │
       └──┬────┬────┬────┬────┬──→ log [OH⁻]
         -6   -4   -2    0    2
```

### 11.3.2 Implementación

La ventana operativa es una región rectangular o poligonal en un mapa 2D donde se cumplen simultáneamente N condiciones:

```typescript
interface OperatingCondition {
  description: string;               // "Ca²⁺ precipita como CaCO₃"
  check: (pH: number, logC: number) => boolean;
}

interface OperatingWindow {
  conditions: OperatingCondition[];
  // Un punto está en la ventana si TODAS las condiciones son true
  isInWindow: (pH: number, logC: number) => boolean;
}
```

→ Superponer como overlay en `ChemHeatmap`.

### 11.3.3 Entregables

- [ ] Definición de condiciones por módulo
- [ ] Overlay visual de ventana operativa
- [ ] Descripción textual de la ventana (rango pH, rango C)
- [ ] ≥ 3 ventanas preconfiguradas de ejemplo

---

## 11.4 Constructor de reportes

**Objetivo**: Componer un documento que recopile gráficos, tablas y notas de una sesión.

### 11.4.1 Layout del builder

```
┌─── Constructor de reporte ─────────────────────────────────┐
│                                                            │
│  Título: [Análisis de H₃PO₄ - Laboratorio 5         ]      │
│  Autor:  [Estudiante A                                ]    │
│  Fecha:  [2025-01-15]                                      │
│                                                            │
│  ┌─ Bloques del reporte ─────────────────────────────────┐ │
│  │                                                       │ │
│  │  1. 📊 Curva de especiación (captura de §6.1)         │ │
│  │     [↕ drag] [✏️ nota] [🗑️ eliminar]                  │ │
│  │                                                       │ │
│  │  2. 📊 Curva de titulación (captura de §6.2)          │ │
│  │     [↕ drag] [✏️ nota] [🗑️ eliminar]                  │ │
│  │                                                       │ │
│  │  3. 📋 Tabla de puntos de equivalencia                │ │
│  │     [↕ drag] [✏️ nota] [🗑️ eliminar]                  │ │
│  │                                                       │ │
│  │  4. 📝 Nota: "El 3er pKa no es titulable..."          │ │
│  │     [↕ drag] [✏️ editar] [🗑️ eliminar]                │ │
│  │                                                       │ │
│  │  [+ Gráfico] [+ Tabla] [+ Nota] [+ Ecuación]          │ │
│  │                                                       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                            │
│  [👁️ Vista previa]  [📄 Exportar PDF]  [💾 Guardar]        │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 11.4.2 Tipos de bloques

| Bloque | Contenido | Fuente |
|--------|-----------|--------|
| Gráfico | Snapshot PNG de un ChemChart | Captura en §11.5 |
| Tabla | Datos tabulares formateados | ChemGrid export |
| Nota | Texto libre con markdown básico | Editor inline |
| Ecuación | KaTeX renderizado | Editor de ecuación |
| Ficha | Ficha de método embebida | §10.5 |
| Separador | Línea horizontal | — |

### 11.4.3 Modelo de datos

```typescript
interface ReportBlock {
  id: string;
  type: 'chart' | 'table' | 'note' | 'equation' | 'method-card' | 'separator';
  title?: string;
  content: ChartSnapshot | TableData | string;
  caption?: string;
  order: number;
}

interface Report {
  id: string;
  title: string;
  author: string;
  date: string;
  blocks: ReportBlock[];
  createdAt: number;
  updatedAt: number;
}
```

→ Persistido en localStorage / IndexedDB.

### 11.4.4 Entregables

- [ ] Builder con drag-and-drop de bloques
- [ ] 6 tipos de bloques soportados
- [ ] Vista previa en tiempo real
- [ ] Guardado de reportes
- [ ] Reordenamiento de bloques

---

## 11.5 Sistema de exportación

**Objetivo**: Exportar contenido en múltiples formatos profesionales.

### 11.5.1 Formatos soportados

| Formato | Contenido | Uso |
|---------|-----------|-----|
| PNG | Gráfico individual | Presentaciones |
| SVG | Gráfico vectorial | Publicaciones |
| CSV | Datos tabulares | Excel, R, Python |
| JSON | Datos estructurados | Programático |
| PDF | Reporte completo | Impresión, entrega |
| Clipboard | Datos tabulares | Pegado rápido |

### 11.5.2 Captura de gráficos

```typescript
// scichart-engine tiene export nativo a imagen
async function captureChart(
  surface: SciChartSurface,
  format: 'png' | 'svg',
): Promise<Blob> {
  if (format === 'png') {
    return surface.exportToBlob({ type: 'image/png', dpi: 300 });
  }
  // SVG: usar canvas-to-svg si nativo no disponible
  return surface.exportToBlob({ type: 'image/svg+xml' });
}
```

### 11.5.3 Exportación de datos

```typescript
// Exportar datos del grid
function exportGridToCSV(data: GridRow[], columns: ColumnDef[]): string {
  const header = columns.map(c => c.headerName).join(',');
  const rows = data.map(row =>
    columns.map(c => {
      const val = row[c.field];
      // Escapar comillas y comas
      return typeof val === 'string' && (val.includes(',') || val.includes('"'))
        ? `"${val.replace(/"/g, '""')}"`
        : val;
    }).join(',')
  );
  return [header, ...rows].join('\n');
}
```

### 11.5.4 Generación de PDF

```
┌─── Exportar reporte ─────────────────────────────────┐
│                                                      │
│  Formato: ● PDF  ○ HTML  ○ Markdown                  │
│                                                      │
│  Opciones:                                           │
│  ☑ Incluir encabezado con fecha y autor              │
│  ☑ Incluir numeración de gráficos                    │
│  ☑ Resolución alta (300 DPI)                         │
│  ☐ Incluir datos crudos como apéndice                │
│                                                      │
│  Tamaño: ○ Carta  ● A4  ○ Legal                      │
│  Orientación: ● Vertical  ○ Horizontal               │
│                                                      │
│  Vista previa:                                       │
│  ┌───────────────────────────────────┐               │
│  │  Análisis de H₃PO₄                │               │
│  │  ─────────────────                │               │
│  │  Autor: Estudiante A              │               │
│  │  Fecha: 2025-01-15                │               │
│  │                                   │               │
│  │  Fig 1. Curva de especiación      │               │
│  │  [gráfico]                        │               │
│  │                                   │               │
│  └───────────────────────────────────┘               │
│                                                      │
│  [Cancelar]                     [📄 Generar PDF]     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

→ Usar `@react-pdf/renderer` o `html2canvas` + `jspdf` para generación de PDF.

### 11.5.5 Entregables

- [ ] Exportar gráfico como PNG/SVG a 300 DPI
- [ ] Exportar grid como CSV/JSON/Clipboard
- [ ] Generar PDF de reporte completo
- [ ] Diálogo unificado de exportación
- [ ] Opciones de tamaño/orientación/resolución

---

## Criterios de aceptación

| # | Criterio | Verificación |
|---|----------|-------------|
| 1 | Comparador muestra ≤ 8 curvas simultáneas sin degradar rendimiento | Visual + FPS |
| 2 | Heatmap 100×100 se genera en < 2s | Performance |
| 3 | Ventana operativa overlay renderiza correctamente | Visual |
| 4 | Reporte con 5 bloques se exporta como PDF sin errores | Funcional |
| 5 | CSV exportado abre correctamente en Excel | Funcional |
| 6 | PNG a 300 DPI tiene calidad publicable | Visual |
| 7 | Datos en clipboard se pegan correctamente en Excel | Funcional |
| 8 | Reporte guardado se restaura íntegramente | Funcional |

---

## Referencias cruzadas

- → Gráficos: [Tarea 02](./02-sistema-graficos-scichart.md) (ChemChart, ChemMultiChart, ChemHeatmap)
- → Grids: [Tarea 03](./03-sistema-grids-scigrid.md) (ChemGrid, ChemCompactGrid)
- → Datos de todos los módulos: [Tareas 06–09](./06-modulo-acido-base.md)
- → Fichas de método: [Tarea 10 §10.5](./10-herramientas-laboratorio.md#105-generador-de-fichas-de-método)
- → Plataforma educativa: [Tarea 12](./12-plataforma-educativa.md) (exportación pedagógica)
- → Tests: [Tarea 14](./14-testing-aseguramiento-calidad.md)

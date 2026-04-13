# Tarea 02 — Sistema de Gráficos Científicos (`scichart-engine`)

> **Dependencias**: [Tarea 01](./01-arquitectura-plataforma.md) (shell, tokens, dependencias instaladas)  
> **Produce**: Capa de abstracción de gráficos, componentes wrapper, temas integrados  
> **Consumida por**: Tareas 06–12 (todos los módulos que grafican)  
> **Librería**: `scichart-engine` v1.11.x — WebGL, React nativo, MIT  
> **Estado**: ⬚ No iniciada

---

## Tabla de contenidos

- [2.1 Capa de abstracción de gráficos](#21-capa-de-abstracción-de-gráficos)
- [2.2 Componentes wrapper estándar](#22-componentes-wrapper-estándar)
- [2.3 Integración de temas](#23-integración-de-temas)
- [2.4 Patrones de interacción](#24-patrones-de-interacción)
- [2.5 Sistema de exportación de gráficos](#25-sistema-de-exportación-de-gráficos)
- [2.6 Migración de gráficos SVG existentes](#26-migración-de-gráficos-svg-existentes)
- [Catálogo de tipos de gráfico](#catálogo-de-tipos-de-gráfico)
- [Criterios de aceptación](#criterios-de-aceptación)

---

## 2.1 Capa de abstracción de gráficos

**Objetivo**: Crear una capa intermedia entre `scichart-engine` y los módulos de la app, de modo que los cambios internos de la librería no propaguen a 14+ módulos.

### 2.1.1 Principio de diseño

```
Módulo (acid-base, redox, etc.)
       │
       ▼
┌──────────────────────────┐
│  src/components/charts/  │  ← Capa de abstracción
│  ChemChart               │     Componentes genéricos
│  ChemMultiChart          │     que entienden química
│  ChemHeatmap             │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  scichart-engine         │  ← Librería externa
│  SciChart (React)        │     WebGL rendering
│  createChart (vanilla)   │
└──────────────────────────┘
```

Ningún módulo importa directamente de `scichart-engine`. Siempre usa los wrappers de `src/components/charts/`.

### 2.1.2 Tipos base del sistema de gráficos

```ts
// src/components/charts/types.ts

/** Serie de datos para un gráfico de líneas */
export interface ChemSeries {
  id: string;
  label: string;                    // Nombre visible (i18n)
  x: Float32Array | number[];
  y: Float32Array | number[];
  color?: string;                   // Si no se da, se auto-asigna
  lineWidth?: number;
  dashed?: boolean;
  visible?: boolean;
}

/** Configuración de un eje */
export interface ChemAxis {
  label: string;
  unit?: string;                    // "pH", "mL", "V", "°C"
  min?: number;
  max?: number;
  tickFormat?: (v: number) => string;
  logarithmic?: boolean;
}

/** Anotación sobre el gráfico */
export interface ChemAnnotation {
  type: 'vertical-line' | 'horizontal-line' | 'band' | 'text' | 'point';
  value?: number;
  from?: number;
  to?: number;
  label?: string;
  color?: string;
}

/** Configuración del gráfico completo */
export interface ChemChartConfig {
  xAxis: ChemAxis;
  yAxis: ChemAxis;
  series: ChemSeries[];
  annotations?: ChemAnnotation[];
  showLegend?: boolean;
  showControls?: boolean;           // Zoom, pan, reset
  colorScheme?: 'vibrant' | 'pastel' | 'neon' | 'earth' | 'ocean';
  height?: number | string;
}
```

### 2.1.3 Estructura de archivos

```
src/components/charts/
├── index.ts                ← Re-exportaciones públicas
├── types.ts                ← Tipos compartidos
├── chem-chart.tsx          ← Gráfico principal (líneas, scatter, band)
├── chem-multi-chart.tsx    ← Múltiples ejes Y independientes
├── chem-heatmap.tsx        ← Mapa de calor 2D (predominancia)
├── chem-chart-toolbar.tsx  ← Barra de herramientas (zoom, pan, export)
├── use-chart-theme.ts      ← Hook para sincronizar tema app ↔ chart
└── chart-utils.ts          ← Helpers: generar ticks, formatear ejes
```

### 2.1.4 Entregables

- [ ] `types.ts` con todos los tipos definidos
- [ ] `index.ts` con re-exportaciones limpias
- [ ] Estructura de archivos creada
- [ ] Ningún módulo importa directamente de `scichart-engine`

---

## 2.2 Componentes wrapper estándar

**Objetivo**: Crear los 3 wrappers principales que cubren el 95% de los gráficos de la app.

### 2.2.1 `ChemChart` — Gráfico principal

El componente más usado. Soporta líneas, scatter, band y area.

```tsx
// Ejemplo de uso en un módulo
import { ChemChart } from '@/components/charts';

function SpeciationChart({ acids, pH }) {
  const series = useMemo(() => 
    acids.map(acid => ({
      id: acid.id,
      label: acid.name,
      x: phRange,          // Float32Array
      y: calcAlphas(phRange, acid.pKas),
      color: acid.color,
    })),
    [acids]
  );

  return (
    <ChemChart
      xAxis={{ label: 'pH', min: 0, max: 14 }}
      yAxis={{ label: 'α', min: 0, max: 1 }}
      series={series}
      annotations={[
        { type: 'vertical-line', value: pH, label: `pH = ${pH}`, color: '#ff0000' }
      ]}
      showLegend
      showControls
      height={400}
    />
  );
}
```

**Capacidades del wrapper**:

| Feature | Implementación via `scichart-engine` |
|---------|-------------------------------------|
| Múltiples series | `series` prop → `chart.addSeries()` por cada una |
| Auto-color | `colorScheme` prop → paleta automática si no se da color |
| Zoom/Pan | `showControls` → controles nativos de scichart-engine |
| Tooltip hover | Integrado por defecto con crosshair |
| Líneas verticales | `annotations` → Anotaciones nativas |
| Bandas | `annotations type: 'band'` → BandSeries |
| Responsive | Container query, resize observer |

### 2.2.2 `ChemMultiChart` — Ejes múltiples

Para gráficos donde se superponen magnitudes diferentes (pH + volumen, α + β):

```tsx
<ChemMultiChart
  xAxis={{ label: 'Volumen NaOH (mL)' }}
  leftAxis={{ label: 'pH', min: 0, max: 14, series: [phSeries] }}
  rightAxis={{ label: 'β (mol/L·pH)', min: 0, max: 0.1, series: [bufferSeries] }}
  showLegend
/>
```

### 2.2.3 `ChemHeatmap` — Mapa de calor 2D

Para diagramas de predominancia multivariable (pH vs pL, pH vs E):

```tsx
<ChemHeatmap
  xAxis={{ label: 'pH', min: 0, max: 14 }}
  yAxis={{ label: 'pL', min: 0, max: 20 }}
  data={predominanceMatrix}    // Float32Array[rows × cols]
  colorMap="spectral"
  labels={speciesLabels}
  resolution={200}
/>
```

### 2.2.4 Tabla de mapeo SVG → scichart-engine

Los gráficos actuales usan SVG manual (`svg-chart.tsx`). Esta tabla mapea la migración:

| Gráfico actual (SVG) | Archivo actual | Wrapper v2 | Ganancia |
|-----------------------|---------------|------------|----------|
| Speciation (α vs pH) | `speciation-chart.tsx` | `ChemChart` | WebGL: 10x más puntos, zoom |
| Titulación (pH vs V) | `titration-chart.tsx` | `ChemChart` | Crosshair interactivo |
| Buffer capacity (β vs pH) | `buffer-capacity-chart.tsx` | `ChemChart` | Tooltip con valores |
| Multi-escenario | `multi-scenario-chart.tsx` | `ChemChart` | Leyenda interactiva |
| Sensibilidad | `sensitivity-panel.tsx` | `ChemChart` + bands | Bandas de incertidumbre |
| Predominancia 2D | `predominance-map-2d.tsx` | `ChemHeatmap` | WebGL heatmap nativo |
| Alpha complejación | `complexation-explorer-alpha-chart.tsx` | `ChemChart` | Mismo wrapper |
| Conditional K | `complexation-explorer-conditional-chart.tsx` | `ChemChart` | Mismo wrapper |
| pK vs T | `temp-correction-panel.tsx` | `ChemChart` | Mismo wrapper |
| Operating window | `operating-window.tsx` | `ChemChart` + annotations | Zonas coloreadas |
| Sparklines | `complexation-panel-sparkline.tsx` | `ChemChart` (mini) | Consistencia visual |

### 2.2.5 Entregables

- [ ] `ChemChart` funcional con todas las capacidades listadas
- [ ] `ChemMultiChart` funcional con ejes duales
- [ ] `ChemHeatmap` funcional con colormap y labels
- [ ] Prueba con datos reales de especiación (H₃PO₄)
- [ ] Responsive en desktop y móvil

---

## 2.3 Integración de temas

**Objetivo**: Los gráficos deben adaptarse automáticamente al tema (light/dark) de la app.

### 2.3.1 Mapeo de tokens CSS → tema de scichart-engine

```ts
// src/components/charts/use-chart-theme.ts

import { useTheme } from 'next-themes';

export function useChartTheme() {
  const { resolvedTheme } = useTheme();
  
  return useMemo(() => ({
    background: resolvedTheme === 'dark' ? '#0f1117' : '#ffffff',
    gridColor: resolvedTheme === 'dark' ? '#2a2d35' : '#e5e7eb',
    axisColor: resolvedTheme === 'dark' ? '#9ca3af' : '#4b5563',
    textColor: resolvedTheme === 'dark' ? '#e5e7eb' : '#1f2937',
    crosshairColor: resolvedTheme === 'dark' ? '#60a5fa' : '#2563eb',
    tooltipBg: resolvedTheme === 'dark' ? '#1f2937' : '#ffffff',
    fontFamily: 'Sora Variable, sans-serif',
    monoFont: 'JetBrains Mono, monospace',
  }), [resolvedTheme]);
}
```

### 2.3.2 Transición de tema sin re-render completo

`scichart-engine` soporta themes dinámicos (`'dark'` | `'light'` | custom). Se usa la prop `theme` del componente `<SciChart>`:

```tsx
<SciChart
  theme={resolvedTheme === 'dark' ? 'midnight' : 'light'}
  // ...
/>
```

### 2.3.3 Esquemas de color para series

| Esquema | Uso recomendado | Colors (primeros 5) |
|---------|----------------|---------------------|
| `vibrant` | General | `#00f2ff, #ff6b6b, #4ecdc4, #ffd93d, #6c5ce7` |
| `earth` | Laboratorio | `#795548, #8d6e63, #a1887f, #bcaaa4, #d7ccc8` |
| `ocean` | Ambientales | `#006994, #0097a7, #00acc1, #26c6da, #4dd0e1` |
| `neon` | Presentaciones | `#39ff14, #ff073a, #ff6700, #ffd300, #9d00ff` |
| `pastel` | Docencia | `#ffd1dc, #bae1ff, #baffc9, #ffffba, #e8baff` |

### 2.3.4 Entregables

- [ ] `useChartTheme` hook implementado
- [ ] Transición light/dark sin flicker
- [ ] 5 esquemas de color disponibles
- [ ] Fuentes consistentes con el sistema de diseño

---

## 2.4 Patrones de interacción

**Objetivo**: Definir interacciones estándar que todos los gráficos soporten consistentemente.

### 2.4.1 Controles de navegación

| Interacción | Desktop | Mobile | Implementación |
|-------------|---------|--------|----------------|
| Zoom in | Scroll wheel up | Pinch out | Nativo scichart-engine |
| Zoom out | Scroll wheel down | Pinch in | Nativo scichart-engine |
| Pan | Click + arrastrar | 1 dedo arrastrar | Nativo scichart-engine |
| Reset zoom | Doble click | Doble tap | Custom handler |
| Selección de rango | Shift + arrastrar | — | Custom modifier |

### 2.4.2 Toolbar del gráfico

```
┌──────────────────────────────────────────┐
│  🔍+ 🔍- 🔄 ↔ ↕ 📷 📊 ⬇️             │
│  Zoom Zoom Reset Fit  Fit Screenshot     │
│  In   Out       X    Y    Export  Data   │
└──────────────────────────────────────────┘
```

| Botón | Acción | Atajo |
|-------|--------|-------|
| 🔍+ | Zoom in 2x al centro | `+` |
| 🔍- | Zoom out 2x al centro | `-` |
| 🔄 | Reset zoom a vista original | `0` |
| ↔ | Ajustar eje X a datos | `X` |
| ↕ | Ajustar eje Y a datos | `Y` |
| 📷 | Exportar como PNG/SVG | `Ctrl+Shift+S` |
| 📊 | Exportar datos como CSV | `Ctrl+Shift+D` |

### 2.4.3 Crosshair y tooltips

```
┌─────────────────────────────────┐
│         │          ┌──────────┐ │
│         │    ·     │ pH: 7.19 │ │
│    ·    │   / \    │ α₀: 0.12│ │
│   / \   │  /   ·  │ α₁: 0.76│ │
│  /   \  │ /       │ α₂: 0.12│ │
│ /     ──┼──────── └──────────┘ │
│         │                      │
│─────────┼──────────────────────│
│     Crosshair sigue cursor     │
└─────────────────────────────────┘
```

- El crosshair aparece al pasar el mouse sobre el gráfico
- El tooltip muestra los valores de **todas las series** en esa posición X
- Los valores se formatean con las unidades del eje
- En mobile, el tooltip aparece al tocar y mantener

### 2.4.4 Leyenda interactiva

`scichart-engine` soporta hover en la leyenda para resaltar series:

| Acción sobre leyenda | Resultado |
|----------------------|-----------|
| Hover sobre nombre | Serie resaltada, otras atenuadas |
| Click sobre nombre | Toggle visibilidad de la serie |
| Click en "Solo" (aparece al hover) | Oculta todas excepto esa |
| Click en "Todas" | Restaura visibilidad |

### 2.4.5 Entregables

- [ ] `ChemChartToolbar` componente con todos los botones
- [ ] Crosshair con tooltip multi-serie
- [ ] Leyenda interactiva con toggle/solo/todas
- [ ] Atajos de teclado documentados en tooltip
- [ ] Touch bien en mobile

---

## 2.5 Sistema de exportación de gráficos

**Objetivo**: Cada gráfico debe poder exportarse para informes, presentaciones y publicaciones.

### 2.5.1 Formatos de exportación

| Formato | Calidad | Uso típico | Implementación |
|---------|---------|-----------|----------------|
| PNG | 2x DPI (300dpi) | Informes, presentaciones | `scichart-engine` export API |
| SVG | Vectorial | Publicaciones, posters | `scichart-engine` SVG export |
| CSV | — | Procesamiento de datos | Custom: series → CSV |
| JSON | — | Reproducibilidad | Custom: config + datos |

### 2.5.2 Opciones de exportación

```
┌──── Exportar gráfico ─────────────────┐
│                                        │
│  Formato:  ○ PNG  ○ SVG  ○ CSV  ○ JSON │
│                                        │
│  Incluir:                              │
│  ☑ Título                              │
│  ☑ Ejes con unidades                   │
│  ☑ Leyenda                             │
│  ☑ Notas técnicas                      │
│  ☐ Marca de agua                       │
│                                        │
│  Resolución (PNG): 150 / 300 / 600 dpi │
│                                        │
│  ┌─────────────────┐ ┌──────────┐      │
│  │   Exportar ⬇️   │ │ Cancelar │      │
│  └─────────────────┘ └──────────┘      │
└────────────────────────────────────────┘
```

### 2.5.3 Metadatos incluidos en exportación

```json
{
  "title": "Especiación de H₃PO₄",
  "exportedAt": "2026-04-13T10:30:00Z",
  "app": "Acid-Base Dynamics v2",
  "conditions": {
    "temperature": "25°C",
    "ionicStrength": "0.1 M",
    "activityModel": "Davies"
  },
  "axes": {
    "x": { "label": "pH", "min": 0, "max": 14 },
    "y": { "label": "α (fracción molar)", "min": 0, "max": 1 }
  }
}
```

### 2.5.4 Entregables

- [ ] Exportación PNG con DPI configurable
- [ ] Exportación SVG vectorial
- [ ] Exportación CSV con headers
- [ ] Exportación JSON con metadatos
- [ ] Modal de opciones de exportación
- [ ] Nombre de archivo automático (descriptivo)

---

## 2.6 Migración de gráficos SVG existentes

**Objetivo**: Reemplazar todos los gráficos SVG manuales por wrappers de `scichart-engine`.

### 2.6.1 Inventario de gráficos a migrar

| # | Gráfico | Archivo origen | Wrapper destino | Complejidad |
|---|---------|---------------|-----------------|-------------|
| 1 | Especiación (α vs pH) | `speciation-chart.tsx` | `ChemChart` | Media |
| 2 | Titulación (pH vs V) | `titration-chart.tsx` | `ChemChart` + annotations | Media |
| 3 | Buffer capacity | `buffer-capacity-chart.tsx` | `ChemChart` | Baja |
| 4 | Multi-escenario | `multi-scenario-chart.tsx` | `ChemChart` (4+ series) | Baja |
| 5 | Sensibilidad | `sensitivity-panel.tsx` | `ChemChart` + bands | Media |
| 6 | Predominancia 2D | `predominance-map-2d.tsx` | `ChemHeatmap` | Alta |
| 7 | Alpha complejación | `complexation-explorer-alpha-chart.tsx` | `ChemChart` | Baja |
| 8 | Condicional complejación | `complexation-explorer-conditional-chart.tsx` | `ChemChart` | Baja |
| 9 | pK vs temperatura | `temp-correction-panel.tsx` | `ChemChart` | Baja |
| 10 | Operating window | `operating-window.tsx` | `ChemChart` + zone annotations | Media |
| 11 | Sparklines complejación | `complexation-panel-sparkline.tsx` | `ChemChart` (mini) | Baja |
| 12 | SVG chart base | `svg-chart.tsx` | **Eliminar** — reemplazado por wrappers | — |
| 13 | Escenario comparison | `scenario-comparison.tsx` | `ChemChart` (overlay) | Media |
| 14 | Sensitivity bands | `sensitivity-bands.tsx` | `ChemChart` + BandSeries | Media |
| 15 | Titration planner | `titration-planner.tsx` | `ChemChart` + annotations | Media |

### 2.6.2 Estrategia de migración

```
Paso 1: Crear wrappers (§2.2) con tests
Paso 2: Migrar gráficos uno a uno, empezando por los más simples
Paso 3: Verificar paridad visual con capturas de pantalla
Paso 4: Eliminar svg-chart.tsx y código SVG manual
Paso 5: Verificar que no quede ningún <svg> manual para gráficos de datos
```

### 2.6.3 Checklist de paridad por gráfico

Para cada gráfico migrado, verificar:

- [ ] Mismos datos renderizados
- [ ] Mismas series con mismos colores
- [ ] Ejes con mismas etiquetas y rangos
- [ ] Anotaciones (líneas verticales, puntos de equivalencia)
- [ ] Responsive (mismos breakpoints)
- [ ] Dark mode funcional
- [ ] Interacciones nuevas (zoom, pan, tooltip) funcionan
- [ ] Rendimiento ≥ anterior (medido con 1000+ puntos)

### 2.6.4 Entregables

- [ ] 15 gráficos migrados
- [ ] `svg-chart.tsx` eliminado
- [ ] Cero `<svg>` manuales para datos (iconos SVG se mantienen)
- [ ] Tests de paridad visual
- [ ] Documento de mejoras ganadas (zoom, tooltip, export)

---

## Catálogo de tipos de gráfico

Referencia visual de los tipos que `scichart-engine` soporta y cómo se usan en la app:

```
LÍNEAS (ChemChart)                    BANDAS (ChemChart + BandSeries)
┌────────────────────┐                ┌────────────────────┐
│     ╱╲             │                │   ╱▓▓▓╲           │
│    ╱  ╲    ╱╲      │                │  ╱▓▓▓▓▓╲  ╱▓▓╲   │
│   ╱    ╲  ╱  ╲     │                │ ╱▓▓▓▓▓▓▓╲╱▓▓▓▓╲  │
│  ╱      ╲╱    ╲    │                │╱▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╲ │
│ ╱              ╲   │                │                    │
│ Especiación, α(pH) │                │ Incertidumbre, ±   │
└────────────────────┘                └────────────────────┘

HEATMAP (ChemHeatmap)                 MULTI-EJE (ChemMultiChart)
┌────────────────────┐                ┌────────────────────┐
│ ▓▓▓▓░░░░████▓▓▓▓  │                │pH│    ╱╲       │β  │
│ ▓▓▓░░░░░░███▓▓▓▓  │                │  │   ╱  ╲      │   │
│ ▓▓░░░░░░░░██▓▓▓▓  │                │  │  ╱    · · · │   │
│ ▓░░░░░░░░░░█▓▓▓▓  │                │  │ ╱           │   │
│ ░░░░░░░░░░░░▓▓▓▓  │                │  │╱            │   │
│ Predominancia 2D   │                │ pH + β superpuestos│
└────────────────────┘                └────────────────────┘
```

---

## Criterios de aceptación

| # | Criterio | Verificación |
|---|----------|-------------|
| 1 | `ChemChart` renderiza 5+ series con 1000 puntos cada una a 60fps | Performance test |
| 2 | Zoom in/out funciona con mouse wheel y pinch | Manual |
| 3 | Tooltip muestra valores de todas las series en la posición X del cursor | Manual |
| 4 | Leyenda permite toggle de visibilidad por serie | Manual |
| 5 | Exportación PNG produce imagen legible a 300dpi | Visual |
| 6 | Exportación SVG es editable en Inkscape/Illustrator | Visual |
| 7 | Tema dark/light se aplica sin re-render ni flicker | Manual |
| 8 | `ChemHeatmap` renderiza mapa 200×200 sin lag | Performance test |
| 9 | Ningún módulo importa directamente de `scichart-engine` | `grep -r "from.*scichart-engine" src/modules/` |
| 10 | Los 15 gráficos SVG han sido migrados y verificados | Checklist |

---

## Referencias cruzadas

- → Tokens de color de: [Tarea 01 §1.3](./01-arquitectura-plataforma.md#13-sistema-de-diseño-y-tokens)
- → Usado en especiación: [Tarea 06 §6.1](./06-modulo-acido-base.md#61-especiación-interactiva)
- → Usado en titulación: [Tarea 06 §6.2](./06-modulo-acido-base.md#62-curvas-de-titulación)
- → Usado en complejación: [Tarea 07 §7.2](./07-modulo-complejacion.md#72-gráficos-de-fracciones-alpha)
- → Usado en precipitación: [Tarea 08 §8.2](./08-modulo-precipitacion.md#82-curvas-de-solubilidad)
- → Usado en redox: [Tarea 09 §9.3](./09-modulo-redox.md#93-diagramas-de-pourbaix)
- → Usado en reportes: [Tarea 11 §11.4](./11-visualizacion-reportes.md#114-exportación-para-informes)
- → Exportación de gráficos usada en: [Tarea 11](./11-visualizacion-reportes.md)
- → Tests de gráficos en: [Tarea 14 §14.3](./14-testing-aseguramiento-calidad.md#143-tests-de-componentes)

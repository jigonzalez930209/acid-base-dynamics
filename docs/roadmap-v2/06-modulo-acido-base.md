# Tarea 06 — Módulo de Análisis Ácido-Base

> **Dependencias**: [Tarea 02](./02-sistema-graficos-scichart.md), [Tarea 03](./03-sistema-grids-scigrid.md), [Tarea 04](./04-motor-equilibrio-universal.md)  
> **Produce**: Módulo completo de ácido-base con especiación, titulación, buffer, predominancia, sensibilidad  
> **Consumida por**: [Tarea 10](./10-herramientas-laboratorio.md), [Tarea 11](./11-visualizacion-reportes.md), [Tarea 12](./12-plataforma-educativa.md)  
> **Estado**: ⬚ No iniciada

---

## Tabla de contenidos

- [6.1 Especiación interactiva](#61-especiación-interactiva)
- [6.2 Curvas de titulación](#62-curvas-de-titulación)
- [6.3 Capacidad buffer](#63-capacidad-buffer)
- [6.4 Predominancia y clasificación](#64-predominancia-y-clasificación)
- [6.5 Análisis de sensibilidad](#65-análisis-de-sensibilidad)
- [6.6 Resolución paso a paso](#66-resolución-paso-a-paso)
- [6.7 Selector de ácidos](#67-selector-de-ácidos)
- [Estructura del módulo](#estructura-del-módulo)
- [Criterios de aceptación](#criterios-de-aceptación)

---

## Estructura del módulo

```
src/modules/acid-base/
├── index.tsx                      ← Router del módulo con sub-rutas
├── components/
│   ├── speciation-view.tsx        ← Vista de especiación (§6.1)
│   ├── titration-view.tsx         ← Vista de titulación (§6.2)
│   ├── buffer-view.tsx            ← Vista de buffer (§6.3)
│   ├── predominance-view.tsx      ← Vista de predominancia (§6.4)
│   ├── sensitivity-view.tsx       ← Vista de sensibilidad (§6.5)
│   ├── step-solver-view.tsx       ← Resolución paso a paso (§6.6)
│   ├── acid-selector.tsx          ← Selector de ácidos (§6.7)
│   ├── acid-info-card.tsx         ← Card de de información del ácido
│   ├── ph-control.tsx             ← Control de pH (slider + input)
│   └── conditions-panel.tsx       ← Panel de T, I, modelo
├── hooks/
│   ├── use-speciation.ts          ← Cálculos de especiación
│   ├── use-titration.ts           ← Cálculos de titulación
│   └── use-buffer.ts              ← Cálculos de buffer
├── lib/
│   └── series-builders.ts         ← Constructores de series para charts
└── types.ts                       ← Tipos del módulo
```

### Sub-rutas del módulo

```
/acid-base                  → Vista por defecto (especiación)
/acid-base/speciation       → Especiación α vs pH
/acid-base/titration        → Curvas de titulación
/acid-base/buffer           → Capacidad buffer
/acid-base/predominance     → Zonas de predominancia
/acid-base/sensitivity      → Análisis dα/dpH
/acid-base/solver           → Resolución paso a paso
```

---

## 6.1 Especiación interactiva

**Objetivo**: Visualizar cómo cambia la distribución de especies de un ácido al variar el pH, con gráficos profesionales de `scichart-engine`.

### 6.1.1 Layout de la vista

```
┌──────────────────────────────────────────────────────────────┐
│  Acid-Base > Especiación > H₃PO₄                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─── Ácido ──────────────┐  ┌─── Condiciones ───────────┐   │
│  │ [H₃PO₄ · Fosfórico ▼]  │  │ T: 25°C  I: 0.0  Ideal    │   │
│  │ C = [0.100] M          │  └───────────────────────────┘   │
│  └────────────────────────┘                                  │
│                                                              │
│  ┌─── Gráfico de especiación (scichart-engine) ──────────┐   │
│  │  α                                                    │   │
│  │ 1.0 ┬────────╲           ╱────────────────            │   │
│  │     │  H₃PO₄  ╲   H₂PO₄⁻╱  HPO₄²⁻                     │   │
│  │ 0.5 ┤          ╲  ╱╲   ╱                              │   │
│  │     │           ╲╱  ╲ ╱        PO₄³⁻                  │   │
│  │ 0.0 ┴────┼────┼──┼──┼────┼────┼────┼────              │   │
│  │     0    2    4  6  8   10   12   14   pH             │   │
│  │                  ↕ pH = 7.19 (crosshair)              │   │
│  │  [🔍+ 🔍- 🔄 📷 📊]                                   │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─── Valores en pH = 7.19 (grid) ──────────────────────┐    │
│  │  Especie   │ α        │ [C] mol/L    │ Predomina     │    │
│  │  H₃PO₄     │ 0.0000   │ 4.5×10⁻⁶     │               │    │
│  │  H₂PO₄⁻    │ 0.1201   │ 1.2×10⁻²     │               │    │
│  │  HPO₄²⁻    │ 0.8782   │ 8.8×10⁻²     │ ★             │    │
│  │  PO₄³⁻     │ 0.0017   │ 1.7×10⁻⁴     │               │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 6.1.2 Gráfico — implementación con `ChemChart`

```tsx
// src/modules/acid-base/components/speciation-view.tsx
import { ChemChart } from '@/components/charts';
import { calcAlphas } from '@/engine';

function SpeciationView() {
  const { acid, pH, concentration, temperature } = useAcidBaseContext();
  
  const series = useMemo(() => {
    const phRange = new Float32Array(1000);
    for (let i = 0; i < 1000; i++) phRange[i] = i * 14 / 999;
    
    return acid.speciesNames.map((name, idx) => ({
      id: `alpha-${idx}`,
      label: name,   // e.g., "H₃PO₄", "H₂PO₄⁻"
      x: phRange,
      y: phRange.map(ph => calcAlphas(ph, acid.pKas)[idx]),
    }));
  }, [acid]);

  return (
    <ChemChart
      xAxis={{ label: 'pH', min: 0, max: 14 }}
      yAxis={{ label: 'α (fracción molar)', min: 0, max: 1 }}
      series={series}
      annotations={[
        { type: 'vertical-line', value: pH, label: `pH = ${pH.toFixed(2)}` }
      ]}
      showLegend
      showControls
    />
  );
}
```

### 6.1.3 Grid de valores — implementación con `ChemCompactGrid`

```tsx
import { ChemCompactGrid } from '@/components/grids';

const columns = [
  { id: 'species', header: 'Especie', accessor: 'name', cellRenderer: 'formula' },
  { id: 'alpha', header: 'α', accessor: 'alpha', cellRenderer: 'number',
    cellRendererParams: { decimals: 4 } },
  { id: 'conc', header: '[C] mol/L', accessor: 'concentration', cellRenderer: 'number',
    cellRendererParams: { scientific: true, decimals: 2 } },
  { id: 'predominance', header: 'Predomina', accessor: 'isPredominant',
    cellRenderer: 'status' },
];
```

### 6.1.4 Entregables

- [ ] Vista de especiación con `ChemChart`
- [ ] Grid de valores con `ChemCompactGrid`
- [ ] Crosshair sincronizado con pH global
- [ ] Soporte para mono-, di- y tri-próticos
- [ ] 1000 puntos de resolución, 60fps

---

## 6.2 Curvas de titulación

**Objetivo**: Simular la titulación de un ácido con una base, con detección de punto de equivalencia.

### 6.2.1 Layout de la vista

```
┌──────────────────────────────────────────────────────────────┐
│  ┌─── Parámetros ────────────────────────────────────────┐   │
│  │ Ácido: [H₃PO₄ ▼]  Cₐ: [0.1] M  V₀: [50.0] mL          │   │
│  │ Base:  [NaOH ▼]   C_b: [0.1] M                        │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─── Curva de titulación (scichart-engine) ──────────────┐  │
│  │  pH                                                    │  │
│  │ 14 ┬                        ┌──────────────            │  │
│  │    │                       ╱                           │  │
│  │ 10 ┤                    ╱─╱   pKₐ₃                     │  │
│  │    │                  ╱                                │  │
│  │  7 ┤  ─ ─ ─ ── ── ╱─    pKₐ₂                           │  │
│  │    │             ╱                                     │  │
│  │  4 ┤     ─ ─ ─╱─        pKₐ₁                           │  │
│  │    │        ╱                                          │  │
│  │  1 ┴──┼──┼──┼──┼──┼──┼──┼──┼──                         │  │
│  │    0  25  50 75 100 125 150  V_NaOH (mL)               │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─── Puntos de equivalencia ───────────────────────────┐    │
│  │  # │ Veq (mL)  │ pH_eq  │ Indicador sugerido         │    │
│  │  1 │ 50.0      │ 4.67   │ Verde de bromocresol       │    │
│  │  2 │ 100.0     │ 9.75   │ Fenolftaleína              │    │
│  │  3 │ 150.0     │ 12.5   │ (No práctico)              │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

### 6.2.2 Anotaciones en la curva

| Anotación | Tipo | Descripción |
|-----------|------|-------------|
| Línea vertical en cada Veq | `vertical-line` | Marca punto de equivalencia |
| Banda horizontal en cada pKa | `horizontal-line` | Marca buffer region |
| Punto en cada Veq | `point` | Marca precisa del punto |
| Banda de indicador | `band` | Rango de viraje del indicador sugerido |

### 6.2.3 Entregables

- [ ] Curva de titulación con `ChemChart`
- [ ] Detección automática de puntos de equivalencia
- [ ] Sugerencia de indicador por punto
- [ ] Grid de puntos de equivalencia con `ChemCompactGrid`
- [ ] Slider de volumen con crosshair sincronizado
- [ ] Multi-prótico: 1, 2 o 3 puntos de equivalencia

---

## 6.3 Capacidad buffer

**Objetivo**: Visualizar la resistencia de la solución al cambio de pH.

### 6.3.1 Gráfico β vs pH

```
β (mol/L·pH)
  0.10 ┬
       │     ·
  0.05 ┤   ·   ·
       │ ·       ·     ·
  0.00 ┴──────────·───·───·─────  pH
       0    2    4  6   8  10  14
           pKa₁    pKa₂
```

- Picos de β en cada pKa
- β mínimo entre pKas
- Contribución de [H⁺] y [OH⁻] en los extremos

### 6.3.2 Multi-eje: β superpuesto con α

→ Usar `ChemMultiChart` de [Tarea 02 §2.2.2](./02-sistema-graficos-scichart.md#222-chemmultichart--ejes-múltiples) para superponer β (eje derecho) con α (eje izquierdo).

### 6.3.3 Entregables

- [ ] Gráfico β vs pH con `ChemChart`
- [ ] Opción de superponer con α usando `ChemMultiChart`
- [ ] Identificación de pH óptimo para buffer
- [ ] Rango útil de buffer (β > 0.01, configurable)

---

## 6.4 Predominancia y clasificación

**Objetivo**: Mostrar las zonas de pH donde predomina cada especie.

### 6.4.1 Diagrama de barras horizontal

```
┌─── Zonas de predominancia ──────────────────────────────┐
│                                                         │
│  H₃PO₄    ████████████                                  │
│            0 ─────── 2.14                               │
│                                                         │
│  H₂PO₄⁻              ████████████████                   │
│                        2.14 ───── 7.19                  │
│                                                         │
│  HPO₄²⁻                              █████████████      │ 
│                                       7.19 ── 12.34     │
│                                                         │
│  PO₄³⁻                                          ██████  │
│                                                 12.34─14│
│                                                         │
│  ← más ácido          neutro           más básico →     │
└─────────────────────────────────────────────────────────┘
```

### 6.4.2 Entregables

- [ ] Diagrama de barras con zonas coloreadas
- [ ] Etiquetas de especie con fórmula química
- [ ] Tooltip con pKa de transición
- [ ] Líneas de transición en pKa exactos

---

## 6.5 Análisis de sensibilidad

**Objetivo**: Mostrar cómo de sensible es la distribución de especies a cambios de pH.

### 6.5.1 Gráfico dα/dpH

- Derivada numérica de cada αᵢ respecto al pH
- Picos indican transiciones rápidas
- Útil para decidir dónde medir y dónde no

### 6.5.2 Bandas de incertidumbre

→ Usar capacidad de `ChemChart` + BandSeries ([Tarea 02 §2.2.1](./02-sistema-graficos-scichart.md#221-chemchart--gráfico-principal)) para mostrar ±σ.

### 6.5.3 Entregables

- [ ] Gráfico dα/dpH con `ChemChart`
- [ ] Bandas de incertidumbre para ±0.5 en pKa
- [ ] Grid con puntos de máxima sensibilidad

---

## 6.6 Resolución paso a paso

**Objetivo**: Mostrar al usuario exactamente cómo se resuelve el pH, paso a paso.

### 6.6.1 Pasos del resolver

```
┌─── Resolución de pH ─────────────────────────────────────┐
│                                                          │
│  Paso 1: Identificar componentes                         │
│  H₃PO₄ (0.1 M) → ácido triprótico                        │
│  pKa₁ = 2.14, pKa₂ = 7.19, pKa₃ = 12.34                  │
│                                                          │
│  Paso 2: Escribir equilibrios                            │
│  H₃PO₄ ⇌ H⁺ + H₂PO₄⁻      Ka₁ = 7.24×10⁻³                │
│  H₂PO₄⁻ ⇌ H⁺ + HPO₄²⁻     Ka₂ = 6.46×10⁻⁸                │
│  HPO₄²⁻ ⇌ H⁺ + PO₄³⁻      Ka₃ = 4.57×10⁻¹³               │
│                                                          │
│  Paso 3: Balance de protones                             │
│  [H⁺] = [H₂PO₄⁻] + 2[HPO₄²⁻] + 3[PO₄³⁻] + [OH⁻]          │
│                                                          │
│  Paso 4: Resolver iterativamente                         │
│  Iter 1: pH = 7.000 → f = 0.099 → pH = 1.587             │
│  Iter 5: pH = 1.619 → f = 2.1×10⁻⁵ → pH = 1.619          │
│  Iter 8: pH = 1.619 → f = 3.2×10⁻¹² ✅                   │
│                                                          │
│  Resultado: pH = 1.62                                    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 6.6.2 Entregables

- [ ] Resolución paso a paso con ecuaciones KaTeX
- [ ] Cada paso expandible/colapsable
- [ ] Historial de convergencia con mini-gráfico
- [ ] Comparación con pH medido (si se proporciona)

---

## 6.7 Selector de ácidos

**Objetivo**: Elegir de forma rápida entre los 80+ ácidos de la base de datos.

### 6.7.1 Diseño del selector

```
┌─── Seleccionar ácido ─────────────────────────────────┐
│  🔍 Buscar por nombre o fórmula...                    │
│                                                       │
│  FAVORITOS ⭐                                         │
│  ├─ H₃PO₄  Ácido fosfórico (triprótico)               │
│  └─ CH₃COOH  Ácido acético (monoprótico)              │
│                                                       │
│  MONOPRÓTICOS (32)                                    │
│  ├─ HF      Ácido fluorhídrico        pKa 3.16        │
│  ├─ HAc     Ácido acético              pKa 4.75       │
│  ├─ HCN     Ácido cianhídrico          pKa 9.20       │
│  └─ ...                                               │
│                                                       │
│  DIPRÓTICOS (28)                                      │
│  ├─ H₂CO₃  Ácido carbónico    pKa 6.35, 10.32         │
│  └─ ...                                               │
│                                                       │
│  TRIPRÓTICOS (12)                                     │
│  ├─ H₃PO₄  Ácido fosfórico    pKa 2.14, 7.19, 12.34   │
│  └─ ...                                               │
│                                                       │
└───────────────────────────────────────────────────────┘
```

### 6.7.2 Entregables

- [ ] Selector con búsqueda, agrupado por tipo
- [ ] Favoritos persistidos en localStorage
- [ ] Fórmula renderizada con KaTeX
- [ ] pKa visibles en la lista
- [ ] Selección inmediata actualiza todo el módulo

---

## Criterios de aceptación

| # | Criterio | Verificación |
|---|----------|-------------|
| 1 | Especiación renderiza 4 curvas de H₃PO₄ a 60fps | Performance |
| 2 | Titulación detecta 3 puntos de equivalencia para H₃PO₄ | Funcional |
| 3 | Buffer capacity pico coincide con pKa ± 0.01 | Numérico |
| 4 | Predominancia muestra zonas correctas para 5 ácidos test | Visual + numérico |
| 5 | Resolver paso a paso produce pH consistente con solver | Comparación |
| 6 | Selector busca en 80+ ácidos en < 50ms | Performance |
| 7 | Todos los gráficos usan `ChemChart` (no SVG manual) | Code review |
| 8 | Todas las tablas usan `ChemGrid` (no HTML manual) | Code review |
| 9 | Dark mode funcional en toda la vista | Visual |
| 10 | Responsive en mobile | Visual |

---

## Referencias cruzadas

- → Gráficos via: [Tarea 02](./02-sistema-graficos-scichart.md)
- → Grids via: [Tarea 03](./03-sistema-grids-scigrid.md)
- → Cálculos via: [Tarea 04](./04-motor-equilibrio-universal.md) (`calcAlphas`, `calcTitrationCurve`, `calcBufferCapacity`)
- → Selector de ácidos reutilizado en: [Tarea 10](./10-herramientas-laboratorio.md)
- → Reportes de este módulo: [Tarea 11](./11-visualizacion-reportes.md)
- → Explicaciones de este módulo: [Tarea 12 §12.1](./12-plataforma-educativa.md#121-explicaciones-paso-a-paso)
- → Tests del módulo: [Tarea 14 §14.2](./14-testing-aseguramiento-calidad.md#142-tests-de-módulos)

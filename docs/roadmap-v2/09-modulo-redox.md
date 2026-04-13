# Tarea 09 — Módulo de Redox y Electroquímica

> **Dependencias**: [Tarea 02](./02-sistema-graficos-scichart.md), [Tarea 03](./03-sistema-grids-scigrid.md), [Tarea 04](./04-motor-equilibrio-universal.md)  
> **Produce**: Módulo de redox con Nernst, celdas, Pourbaix, titulaciones redox  
> **Consumida por**: [Tarea 10](./10-herramientas-laboratorio.md), [Tarea 11](./11-visualizacion-reportes.md), [Tarea 12](./12-plataforma-educativa.md)  
> **Estado**: ⬚ No iniciada

---

## Tabla de contenidos

- [9.1 Base de datos de potenciales estándar](#91-base-de-datos-de-potenciales-estándar)
- [9.2 Calculadora Nernst](#92-calculadora-nernst)
- [9.3 Diagramas de Pourbaix](#93-diagramas-de-pourbaix)
- [9.4 Simulador de celdas galvánicas](#94-simulador-de-celdas-galvánicas)
- [9.5 Titulaciones redox](#95-titulaciones-redox)
- [Estructura del módulo](#estructura-del-módulo)
- [Criterios de aceptación](#criterios-de-aceptación)

---

## Estructura del módulo

```
src/modules/redox/
├── index.tsx
├── components/
│   ├── nernst-calculator-view.tsx     ← Calculadora Nernst (§9.2)
│   ├── pourbaix-view.tsx              ← Diagramas de Pourbaix (§9.3)
│   ├── cell-simulator-view.tsx        ← Celdas galvánicas (§9.4)
│   ├── redox-titration-view.tsx       ← Titulaciones redox (§9.5)
│   ├── half-reaction-selector.tsx     ← Selector de semirreacción
│   └── cell-diagram.tsx               ← Diagrama visual de celda
├── hooks/
│   ├── use-nernst.ts
│   └── use-pourbaix.ts
├── lib/
│   └── series-builders.ts
└── types.ts
```

### Sub-rutas

```
/redox                    → Vista por defecto (calculadora Nernst)
/redox/nernst             → Ecuación de Nernst interactiva
/redox/pourbaix           → Diagramas de Pourbaix
/redox/cell               → Simulador de celda
/redox/titration          → Titulaciones redox
```

---

## 9.1 Base de datos de potenciales estándar

**Objetivo**: Potenciales estándar de reducción con datos completos.

### 9.1.1 Estructura de datos

```ts
// src/data/redox.ts

export interface RedoxEntry {
  id: string;
  halfReaction: string;         // "Fe³⁺ + e⁻ → Fe²⁺"
  halfReactionLatex: string;    // Para KaTeX
  oxidized: string;             // "Fe³⁺"
  reduced: string;              // "Fe²⁺"
  E0: number;                   // V (vs SHE)
  n: number;                    // Electrones transferidos
  temperature: number;
  source: string;
  category: 'metal' | 'nonmetal' | 'organic' | 'biological';
  notes?: string;
}
```

### 9.1.2 Grid con `ChemGrid`

| Columna | Renderer | Sortable |
|---------|----------|----------|
| Semirreacción | `formula` | — |
| E° (V) | `number` | ✅ |
| n (e⁻) | `number` | ✅ |
| Categoría | `badge` | ✅ |
| Fuente | `text` | — |

### 9.1.3 Entregables

- [ ] `src/data/redox.ts` con ≥ 25 semirreacciones
- [ ] Grid con búsqueda y filtro por categoría
- [ ] Datos verificados contra tablas estándar

---

## 9.2 Calculadora Nernst

**Objetivo**: Calcular E en condiciones no estándar.

### 9.2.1 Ecuación de Nernst

$$E = E^\circ - \frac{RT}{nF} \ln Q = E^\circ - \frac{0.05916}{n} \log Q \quad (25°C)$$

### 9.2.2 Layout de la calculadora

```
┌─── Calculadora Nernst ──────────────────────────────────┐
│                                                         │
│  Semirreacción: [Fe³⁺ + e⁻ → Fe²⁺  ▼]                   │
│                                                         │
│  E° = +0.771 V                                          │
│  n = 1 e⁻                                               │
│                                                         │
│  Concentraciones:                                       │
│  [Fe³⁺] = [0.001] M                                     │
│  [Fe²⁺] = [0.100] M                                     │
│                                                         │
│  T = [25] °C                                            │
│                                                         │
│  ──────────────────────────────────────────             │
│                                                         │
│  Q = [Fe²⁺]/[Fe³⁺] = 100                                │
│  E = 0.771 - (0.05916/1) × log(100)                     │
│  E = 0.771 - 0.118                                      │
│  E = +0.653 V                                           │
│                                                         │
│  ΔG = -nFE = -(1)(96485)(0.653) = -63.0 kJ/mol          │
│  Reacción: ✅ Espontánea (ΔG < 0)                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 9.2.3 Entregables

- [ ] Selector de semirreacción
- [ ] Inputs de concentraciones
- [ ] Cálculo paso a paso con KaTeX
- [ ] ΔG y espontaneidad
- [ ] Gráfico E vs log Q con `ChemChart`

---

## 9.3 Diagramas de Pourbaix

**Objetivo**: Diagramas E vs pH que muestran regiones de estabilidad termodinámica.

### 9.3.1 Diagrama de Pourbaix para Fe

```
E (V)
+1.5 ┬─────────────────────────
     │   Fe³⁺       │
+1.0 ┤              │  Fe₂O₃
     │              │
+0.5 ┤──────────────┤
     │   Fe²⁺       │
 0.0 ┤              │  Fe₃O₄
     │──────────────┤
-0.5 ┤              │
     │        Fe    │
-1.0 ┴──┼──┼──┼──┼──┼──  pH
     0  2  4  6  8  14
```

### 9.3.2 Implementación con `ChemHeatmap`

→ Usar `ChemHeatmap` de [Tarea 02 §2.2.3](./02-sistema-graficos-scichart.md#223-chemheatmap--mapa-de-calor-2d) con:
- Eje X: pH (0–14)
- Eje Y: E (V) (-1.5 a +2.0)
- Colores: especie estable en cada punto (E, pH)

Líneas de equilibrio:
- Líneas horizontales: equilibrios E-dependientes sin H⁺
- Líneas con pendiente: equilibrios E y pH dependientes
- Líneas verticales: equilibrios solo pH-dependientes

### 9.3.3 Líneas del agua

Siempre incluir las líneas de estabilidad del agua:

$$E_{O_2/H_2O} = 1.229 - 0.05916 \cdot pH$$
$$E_{H^+/H_2} = 0 - 0.05916 \cdot pH$$

### 9.3.4 Entregables

- [ ] Diagrama de Pourbaix para Fe, Al, Cu (mínimo 3 metales)
- [ ] Líneas de estabilidad del agua
- [ ] Regiones etiquetadas con especies
- [ ] Crosshair con especie al hover
- [ ] Selector de metal

---

## 9.4 Simulador de celdas galvánicas

**Objetivo**: Construir visualmente una celda y calcular su potencial.

### 9.4.1 Layout del simulador

```
┌─── Celda galvánica ─────────────────────────────────────┐
│                                                         │
│  ÁNODO (oxidación)         CÁTODO (reducción)           │
│  [Zn²⁺/Zn ▼]              [Cu²⁺/Cu ▼]                   │
│  E° = -0.763 V             E° = +0.342 V                │
│                                                         │
│  ┌────────┐  ──e⁻──→  ┌────────┐                        │
│  │  Zn    │  ←──────── │  Cu    │                       │
│  │  ↓     │  puente    │  ↑     │                       │
│  │ Zn²⁺  │  salino    │ Cu²⁺  │                         │
│  └────────┘            └────────┘                       │
│                                                         │
│  E°_celda = E°_catodo - E°_anodo                        │
│  E°_celda = 0.342 - (-0.763) = +1.105 V                 │
│                                                         │
│  Con Q: E_celda = 1.105 - (0.05916/2)log(Q) = ...       │
│                                                         │
│  ΔG° = -nFE° = -213.2 kJ/mol                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 9.4.2 Entregables

- [ ] Selector de ánodo y cátodo
- [ ] Diagrama visual esquemático de la celda
- [ ] Cálculo de E°, E, ΔG, ΔG°
- [ ] Ecuaciones paso a paso con KaTeX
- [ ] Indicador de espontaneidad

---

## 9.5 Titulaciones redox

**Objetivo**: Simular curvas de titulación redox (E vs volumen).

### 9.5.1 Curva E vs V para Ce⁴⁺ titulando Fe²⁺

```
E (V)
+1.8 ┬
     │                     ┌──── E°(Ce⁴⁺/Ce³⁺)
+1.4 ┤                   ╱─────────
     │                 ╱
+1.0 ┤  - - - - - - ╱─ punto de equivalencia
     │             ╱
+0.6 ┤──────────╱
     │ E°(Fe³⁺/Fe²⁺)
+0.2 ┴──┼──┼──┼──┼──┼──  V(Ce⁴⁺) mL
     0  10 20 30 40 50
```

### 9.5.2 Entregables

- [ ] Curva E vs V con `ChemChart`
- [ ] Detección del punto de equivalencia
- [ ] Indicadores redox sugeridos
- [ ] Multi-par: soporte para 2+ pares redox

---

## Criterios de aceptación

| # | Criterio | Verificación |
|---|----------|-------------|
| 1 | E° de ≥ 25 semirreacciones verificados | Data review |
| 2 | Nernst para Fe³⁺/Fe²⁺ produce E correcto ± 0.001V | Numérico |
| 3 | Pourbaix de Fe muestra regiones correctas (comparar con bibliografía) | Visual + manual |
| 4 | Celda Zn/Cu produce E° = 1.10V ± 0.01V | Numérico |
| 5 | Titulación redox detecta punto de equivalencia correcto | Numérico |
| 6 | Todos los gráficos con `scichart-engine` wrappers | Code review |
| 7 | Dark mode y responsive | Visual |

---

## Referencias cruzadas

- → Gráficos: [Tarea 02](./02-sistema-graficos-scichart.md)
- → Grids: [Tarea 03](./03-sistema-grids-scigrid.md)
- → Engine redox: [Tarea 04](./04-motor-equilibrio-universal.md) (`calcNernstPotential`, `calcCellPotential`)
- → Datos actuales: `src/features/advanced/redox-data.ts`
- → Pourbaix relacionado con: [Tarea 08](./08-modulo-precipitacion.md) (regiones de precipitación)
- → Tests: [Tarea 14](./14-testing-aseguramiento-calidad.md)

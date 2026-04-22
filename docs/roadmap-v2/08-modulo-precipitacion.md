# Tarea 08 — Módulo de Precipitación y Solubilidad

> **Dependencias**: [Tarea 02](./02-sistema-graficos-scichart.md), [Tarea 03](./03-sistema-grids-scigrid.md), [Tarea 04](./04-motor-equilibrio-universal.md)  
> **Produce**: Módulo de precipitación con solubilidad, Ksp, precipitación selectiva, efecto del ion común  
> **Consumida por**: [Tarea 10](./10-herramientas-laboratorio.md), [Tarea 11](./11-visualizacion-reportes.md), [Tarea 12](./12-plataforma-educativa.md)  
> **Estado**: ⬚ No iniciada

---

## Tabla de contenidos

- [8.1 Base de datos de solubilidad](#81-base-de-datos-de-solubilidad)
- [8.2 Curvas de solubilidad vs pH](#82-curvas-de-solubilidad-vs-ph)
- [8.3 Precipitación selectiva](#83-precipitación-selectiva)
- [8.4 Efecto del ion común](#84-efecto-del-ion-común)
- [8.5 Solubilidad con equilibrios competitivos](#85-solubilidad-con-equilibrios-competitivos)
- [Estructura del módulo](#estructura-del-módulo)
- [Criterios de aceptación](#criterios-de-aceptación)

---

## Estructura del módulo

```
src/modules/precipitation/
├── index.tsx
├── components/
│   ├── solubility-chart-view.tsx      ← Curvas S vs pH (§8.2)
│   ├── selective-precip-view.tsx       ← Precipitación selectiva (§8.3)
│   ├── common-ion-view.tsx            ← Efecto del ion común (§8.4)
│   ├── competitive-view.tsx           ← Con equilibrios competitivos (§8.5)
│   ├── salt-selector.tsx              ← Selector de sal
│   └── ksp-info-card.tsx              ← Card de info del precipitado
├── hooks/
│   └── use-solubility.ts
├── lib/
│   └── series-builders.ts
└── types.ts
```

### Sub-rutas

```
/precipitation                → Vista por defecto (solubilidad)
/precipitation/solubility     → S vs pH
/precipitation/selective      → Precipitación selectiva
/precipitation/common-ion     → Efecto del ion común
/precipitation/competitive    → Equilibrios competitivos
```

---

## 8.1 Base de datos de solubilidad

**Objetivo**: Datos de Ksp con trazabilidad completa.

### 8.1.1 Estructura de datos

```ts
// src/data/solubility.ts

export interface SolubilityEntry {
  id: string;
  salt: string;              // "AgCl", "BaSO4", "Fe(OH)3"
  saltFormula: string;       // Para KaTeX: "AgCl"
  cation: string;            // "Ag+"
  anion: string;             // "Cl-"
  Ksp: number;               // Producto de solubilidad
  pKsp: number;              // -log(Ksp)
  stoichiometry: {           // M_a X_b → aM + bX
    cationCoeff: number;
    anionCoeff: number;
  };
  temperature: number;
  source: string;
  notes?: string;
}
```

### 8.1.2 Grid con `ChemGrid`

| Columna | Renderer | Sortable |
|---------|----------|----------|
| Sal | `formula` | ✅ |
| Catión | `formula` | ✅ |
| Anión | `formula` | ✅ |
| Ksp | `number` (scientific) | ✅ |
| pKsp | `number` | ✅ |
| Fuente | `text` | — |

### 8.1.3 Entregables

- [ ] `src/data/solubility.ts` con ≥ 20 sales
- [ ] Grid buscable y filtrable
- [ ] Datos verificados contra Harris/Skoog

---

## 8.2 Curvas de solubilidad vs pH

**Objetivo**: Visualizar cómo la solubilidad de hidróxidos y sales depende del pH.

### 8.2.1 Gráfico log S vs pH

```
log S
 0 ┬
   │ ╲
-2 ┤  ╲
   │   ╲         Fe(OH)₃
-4 ┤    ╲      ╱
   │     ╲   ╱
-6 ┤      ╲╱    mínimo de solubilidad
   │       ╲
-8 ┤        ╲
   │         Al(OH)₃
   ┴──┼──┼──┼──┼──┼──┼──  pH
   0  2  4  6  8  10 14
```

Para hidróxidos M(OH)n:
$$S = \frac{K_{sp}}{[OH^-]^n} = \frac{K_{sp} \cdot [H^+]^n}{K_w^n}$$

→ Usar `ChemChart` de [Tarea 02](./02-sistema-graficos-scichart.md) con eje Y logarítmico.

### 8.2.2 Anotaciones

| Anotación | Tipo | Descripción |
|-----------|------|-------------|
| pH de mínima solubilidad | `point` | Punto óptimo para precipitar |
| Zona de precipitación | `band` | Donde S < concentración del ion |
| pH de disolución | `vertical-line` | Donde el precipitado empieza a disolverse |

### 8.2.3 Entregables

- [ ] Gráfico log S vs pH con `ChemChart` (eje Y logarítmico)
- [ ] Overlay de múltiples sales
- [ ] Anotación de pH mínimo de solubilidad
- [ ] Grid con valores clave (pH mín, S mín, rango de precipitación)

---

## 8.3 Precipitación selectiva

**Objetivo**: Determinar el pH óptimo para separar dos cationes.

### 8.3.1 Escenario típico

> Separar Fe³⁺ de Mg²⁺ por precipitación de hidróxidos.

```
log S
 0 ┬
   │  Mg(OH)₂
-2 ┤  ╲
   │   ╲
-4 ┤    ╲───────────  
   │                        
-6 ┤       Fe(OH)₃         
   │      ╲                 
-8 ┤       ╲──────  VENTANA DE SEPARACIÓN
   │  ▓▓▓▓▓▓▓▓▓▓▓▓  Fe precipita, Mg no
   ┴──┼──┼──┼──┼──  pH
   0  2  4  6  8
```

### 8.3.2 Cálculo de ventana de separación

```
pH mínimo: Fe(OH)₃ empieza a precipitar → [Fe³⁺] > Ksp/[OH⁻]³
pH máximo: Mg(OH)₂ empieza a precipitar → [Mg²⁺] > Ksp/[OH⁻]²
Ventana: pH_min_Fe < pH < pH_max_Mg
```

### 8.3.3 UI del simulador

```
┌─── Precipitación selectiva ──────────────────────────────┐
│                                                          │
│  Catión 1: [Fe³⁺ ▼]  [0.01] M                            │
│  Catión 2: [Mg²⁺ ▼]  [0.01] M                            │
│  Precipitante: [OH⁻ ▼]                                   │
│                                                          │
│  Resultado:                                              │
│  Fe³⁺ precipita a pH ≥ 3.0                               │
│  Mg²⁺ precipita a pH ≥ 9.4                               │
│  Ventana de separación: pH 3.0 – 9.4 ✅                  │
│  Separación cuantitativa (>99.9%): pH 4.0 – 9.0          │
│                                                          │
│  [Gráfico de ambas curvas con ventana sombreada]         │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 8.3.4 Entregables

- [ ] Selector de 2 cationes
- [ ] Cálculo de ventana de separación
- [ ] Gráfico con banda sombreada
- [ ] Grid con pH críticos y % de precipitación

---

## 8.4 Efecto del ion común

**Objetivo**: Mostrar cómo la adición de un ion común afecta la solubilidad.

### 8.4.1 Ejemplo: AgCl con exceso de Cl⁻

$$S = \frac{K_{sp}}{[Cl^-]_{total}}$$

### 8.4.2 Gráfico S vs [ion común]

```
S (M)
0.01 ┬───╲
     │    ╲
0.005┤     ╲
     │      ╲───────────────
0.00 ┴──┼──┼──┼──┼──┼──  [Cl⁻] añadido (M)
     0  0.01 0.05 0.1 0.5
```

### 8.4.3 Entregables

- [ ] Selector de sal + ion común
- [ ] Gráfico S vs [ion común] con `ChemChart`
- [ ] Tabla de S a diferentes [ion común]

---

## 8.5 Solubilidad con equilibrios competitivos

**Objetivo**: Considerar efectos de complejación y ácido-base sobre la solubilidad.

### 8.5.1 Caso: AgCl + NH₃

```
AgCl(s) ⇌ Ag⁺ + Cl⁻        Ksp = 1.8×10⁻¹⁰
Ag⁺ + 2NH₃ ⇌ Ag(NH₃)₂⁺    β₂ = 1.7×10⁷

→ La complejación AUMENTA la solubilidad
S = Ksp/[Cl⁻] × (1 + β₁[NH₃] + β₂[NH₃]²)
```

### 8.5.2 Entregables

- [ ] Gráfico S vs [ligando] mostrando el aumento de solubilidad
- [ ] Comparación sin/con complejación
- [ ] Link a [Tarea 07](./07-modulo-complejacion.md) para datos de complejos

→ Este acápite conecta precipitación con complejación, demostrando la integración entre módulos.

---

## Criterios de aceptación

| # | Criterio | Verificación |
|---|----------|-------------|
| 1 | Base de datos con ≥ 20 sales y Ksp verificados | Data review |
| 2 | Curva de solubilidad de Fe(OH)₃ coincide con valores tabulados ± 5% | Numérico |
| 3 | Ventana de separación Fe³⁺/Mg²⁺ correcta | Comparación con Harris |
| 4 | Efecto del ion común produce la hipérbola esperada | Visual + numérico |
| 5 | Gráficos con `ChemChart`, grids con `ChemGrid` | Code review |
| 6 | Dark mode funcional | Visual |
| 7 | Responsive | Visual |

---

## Referencias cruzadas

- → Gráficos: [Tarea 02](./02-sistema-graficos-scichart.md)
- → Grids: [Tarea 03](./03-sistema-grids-scigrid.md)
- → Engine: [Tarea 04](./04-motor-equilibrio-universal.md) (`calcSolubility`, `calcSelectivePrecipitation`)
- → Datos actuales: `src/features/advanced/precipitation-data.ts`
- → Complejación competitiva: [Tarea 07](./07-modulo-complejacion.md)
- → Interferencias: [Tarea 10 §10.4](./10-herramientas-laboratorio.md#104-evaluador-de-interferencias)
- → Tests: [Tarea 14](./14-testing-aseguramiento-calidad.md)

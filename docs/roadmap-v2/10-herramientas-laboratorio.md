# Tarea 10 — Herramientas de Laboratorio y Flujo de Trabajo

> **Dependencias**: [Tarea 04](./04-motor-equilibrio-universal.md), [Tarea 05](./05-dashboard-y-navegacion.md), [Tarea 06](./06-modulo-acido-base.md)  
> **Produce**: Módulo de herramientas prácticas para planificación y ejecución de laboratorio  
> **Consumida por**: [Tarea 11](./11-visualizacion-reportes.md), [Tarea 12](./12-plataforma-educativa.md)  
> **Estado**: ⬚ No iniciada

---

## Tabla de contenidos

- [10.1 Calculadora de preparación de soluciones](#101-calculadora-de-preparación-de-soluciones)
- [10.2 Planificador de titulaciones](#102-planificador-de-titulaciones)
- [10.3 Calculadora de diluciones](#103-calculadora-de-diluciones)
- [10.4 Evaluador de interferencias](#104-evaluador-de-interferencias)
- [10.5 Generador de fichas de método](#105-generador-de-fichas-de-método)
- [10.6 Presets de matrices reales](#106-presets-de-matrices-reales)
- [Estructura del módulo](#estructura-del-módulo)
- [Criterios de aceptación](#criterios-de-aceptación)

---

## Estructura del módulo

```
src/modules/lab-tools/
├── index.tsx
├── components/
│   ├── solution-prep-view.tsx         ← Preparación de soluciones (§10.1)
│   ├── titration-planner-view.tsx     ← Planificador de titulaciones (§10.2)
│   ├── dilution-calc-view.tsx         ← Calculadora de diluciones (§10.3)
│   ├── interference-eval-view.tsx     ← Evaluador de interferencias (§10.4)
│   ├── method-card-view.tsx           ← Fichas de método (§10.5)
│   ├── matrix-presets-view.tsx        ← Matrices reales (§10.6)
│   └── unit-converter-view.tsx        ← Conversión de unidades
├── hooks/
│   ├── use-solution-prep.ts
│   └── use-titration-plan.ts
├── lib/
│   ├── dilution-calc.ts
│   └── matrix-data.ts
└── types.ts
```

### Sub-rutas

```
/lab-tools                    → Vista resumen con cards de herramientas
/lab-tools/solutions          → Preparación de soluciones
/lab-tools/titration-plan     → Planificador de titulaciones
/lab-tools/dilutions          → Calculadora de diluciones
/lab-tools/interference       → Evaluador de interferencias
/lab-tools/methods            → Fichas de método
/lab-tools/matrices           → Presets de matrices reales
/lab-tools/units              → Conversión de unidades
```

---

## 10.1 Calculadora de preparación de soluciones

**Objetivo**: Calcular masa necesaria, volumen, pureza y pasos operativos para preparar una solución.

### 10.1.1 Layout del calculador

```
┌─── Preparar solución ────────────────────────────────────┐
│                                                          │
│  ┌─── ¿Qué quieres preparar? ────────────────────────┐   │
│  │                                                   │   │
│  │  Reactivo: [H₃PO₄ ▼] (búsqueda con autocompletado)│   │
│  │  M = 98.0 g/mol                                   │   │
│  │                                                   │   │
│  │  Concentración objetivo: [0.1] M                  │   │
│  │  Volumen a preparar: [500] mL                     │   │
│  │  Pureza del reactivo: [85] %                      │   │
│  │  Densidad (si líquido): [1.685] g/mL              │   │
│  │                                                   │   │
│  └───────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─── Resultado ──────────────────────────────────────┐  │
│  │                                                    │  │
│  │  Masa necesaria:   5.765 g (reactivo puro)         │  │
│  │  Masa corregida:   6.783 g (con pureza 85%)        │  │
│  │  Volumen (liq.):   4.03 mL  (con densidad)         │  │
│  │                                                    │  │
│  │  Pasos operativos:                                 │  │
│  │  1. Pesar 6.78 g de H₃PO₄ en balanza analítica     │  │
│  │  2. Disolver en ~300 mL de agua destilada          │  │
│  │  3. Transferir a matraz aforado de 500 mL          │  │
│  │  4. Aforar a 500 mL con agua destilada             │  │
│  │  5. Homogeneizar                                   │  │
│  │                                                    │  │
│  │  ⚠️ H₃PO₄ concentrado es corrosivo                 │  │
│  │     Usar guantes, gafas y campana                  │  │
│  │                                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  [📋 Copiar pasos] [📄 Generar ficha] [💾 Guardar]       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 10.1.2 Ecuaciones

| Cálculo | Ecuación |
|---------|---------|
| Masa pura | $m = C \times V \times M$ |
| Masa con pureza | $m_{real} = m / (\text{pureza}/100)$ |
| Volumen líquido | $V_{liq} = m_{real} / \rho$ |

### 10.1.3 Base de datos de masas molares

→ Reutilizar y extender `src/data/sources.ts` (actual: 16 masas molares).

| Dato necesario | Fuente |
|----------------|--------|
| M (g/mol) | `ACID_DATABASE` → extender con M para cada ácido |
| ρ (g/mL) | Nueva tabla para reactivos comunes líquidos |
| Pureza típica | Nueva tabla para grados comerciales |

### 10.1.4 Entregables

- [ ] Calculadora funcional con todos los campos
- [ ] Selección de ácido con autocompletado (→ reusar selector de [Tarea 06 §6.7](./06-modulo-acido-base.md#67-selector-de-ácidos))
- [ ] Pasos operativos generados automáticamente
- [ ] Advertencias de seguridad para reactivos peligrosos
- [ ] Copy/export de los pasos

---

## 10.2 Planificador de titulaciones

**Objetivo**: Estimar parámetros operativos antes de ir al laboratorio.

### 10.2.1 Parámetros de planificación

```
┌─── Planificar titulación ────────────────────────────────┐
│                                                          │
│  Analito: [H₃PO₄ ▼]  Cₐ ≈ [0.1] M  V₀ = [25] mL          │
│  Titulante: [NaOH ▼]  C_b = [0.1] M                      │
│                                                          │
│  PLANIFICACIÓN:                                          │
│  ──────────────                                          │
│  Veq₁ = 25.0 mL  (1er punto)                             │
│  Veq₂ = 50.0 mL  (2do punto)                             │
│  V total estimado: ~55 mL                                │
│                                                          │
│  BURETA RECOMENDADA:                                     │
│  ● 50 mL (si se titula al 1er punto)                     │
│  ● 100 mL (si se titula al 2do punto)                    │
│                                                          │
│  INDICADOR RECOMENDADO:                                  │
│  ● 1er punto (pH ≈ 4.7): Verde de bromocresol            │
│  ● 2do punto (pH ≈ 9.8): Fenolftaleína                   │
│                                                          │
│  CURVA ESTIMADA:                                         │
│  [Gráfico pH vs V con ChemChart]                         │
│                                                          │
│  ⚠️ El 3er punto no es titulable (salto insuficiente)    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 10.2.2 Cálculos automáticos

| Dato | Cálculo | Fórmula |
|------|---------|---------|
| Veq | $V_{eq} = \frac{C_a \times V_0}{C_b}$ por cada pKa | Engine |
| pH en Veq | Solver en el punto de equivalencia | Engine |
| ΔpH/ΔV en Veq | Derivada numérica de la curva | Engine |
| Indicador | Match por rango de viraje vs pH_eq | Tabla interna |
| Bureta | Veq × 1.1 → redondear al tamaño estándar | Tabla |
| Titulabilidad | ΔpH ≥ 2 unidades en ±0.1 mL | Criterio numérico |

### 10.2.3 Entregables

- [ ] Planificador con predicción de Veq, indicador, bureta
- [ ] Curva estimada con `ChemChart` (→ [Tarea 02](./02-sistema-graficos-scichart.md))
- [ ] Alertas de titulabilidad
- [ ] Grid de puntos de equivalencia con `ChemCompactGrid`

---

## 10.3 Calculadora de diluciones

**Objetivo**: C₁V₁ = C₂V₂ con validaciones y pasos operativos.

### 10.3.1 Layout

```
┌─── Dilución ─────────────────────────────┐
│                                          │
│  Solución madre:                         │
│  C₁ = [1.00] M    V₁ = ? mL              │
│                                          │
│  Solución deseada:                       │
│  C₂ = [0.10] M    V₂ = [100] mL          │
│                                          │
│  ─────────────────────────────           │
│  V₁ = C₂ × V₂ / C₁ = 10.0 mL             │
│                                          │
│  Pasos:                                  │
│  1. Medir 10.0 mL de solución madre      │
│  2. Transferir a matraz de 100 mL        │
│  3. Aforar con solvente                  │
│                                          │
│  ⚠️ Factor de dilución: 10×              │
│                                          │
└──────────────────────────────────────────┘
```

### 10.3.2 Diluciones seriadas

Soporte para calcular N diluciones sucesivas:

```
C₀ = 1.0 M → C₁ = 0.1 M → C₂ = 0.01 M → C₃ = 0.001 M
              V₁ = 10 mL    V₂ = 10 mL    V₃ = 10 mL
              (en 100 mL)   (en 100 mL)   (en 100 mL)
```

→ Mostrar en grid con `ChemCompactGrid`.

### 10.3.3 Entregables

- [ ] Calculadora C₁V₁ = C₂V₂
- [ ] Diluciones seriadas (N pasos)
- [ ] Pasos operativos
- [ ] Grid de serie de diluciones

---

## 10.4 Evaluador de interferencias

**Objetivo**: Identificar qué puede salir mal cuando hay múltiples especies en solución.

### 10.4.1 Matriz de interferencias

| Analito | Método | Interferente | Efecto | Severidad | Mitigación |
|---------|--------|-------------|--------|-----------|-----------|
| Fe³⁺ | EDTA pH 2 | Al³⁺ | Co-compleja | ⚠️ Media | Enmascarar con F⁻ |
| Ca²⁺ | EDTA pH 10 | Mg²⁺ | Co-titula | 🔴 Alta | Usar EGTA selectivo |
| Cl⁻ | Mohr | CrO₄²⁻ | Precipita | 🟡 Baja | Ajustar pH 6.5-10 |

→ Tabla con `ChemGrid` de [Tarea 03](./03-sistema-grids-scigrid.md), con renderer `status` para severidad.

### 10.4.2 Evaluador interactivo

```
┌─── Evaluar interferencias ────────────────────────────────┐
│                                                           │
│  Analito: [Ca²⁺ ▼]                                        │
│  Método: [EDTA a pH 10 ▼]                                 │
│  Matriz: [Agua potable ▼]                                 │
│                                                           │
│  INTERFERENCIAS DETECTADAS:                               │
│                                                           │
│  🔴 Mg²⁺ (presente en agua potable)                       │
│     → Co-titula con EDTA a pH 10                          │
│     → Mitigación: Precipitar como Mg(OH)₂ a pH > 12       │
│                                                           │
│  ⚠️ Fe³⁺ (puede estar presente)                           │
│     → Interfiere si [Fe³⁺] > 1 ppm                        │
│     → Mitigación: Reducir a Fe²⁺ con ascórbico            │
│                                                           │
│  ✅ Na⁺, K⁺ (no interfieren)                              │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

→ Conecta con datos de complejación ([Tarea 07](./07-modulo-complejacion.md)) y precipitación ([Tarea 08](./08-modulo-precipitacion.md)).

### 10.4.3 Entregables

- [ ] Matriz de ≥ 15 interferencias documentadas
- [ ] Evaluador interactivo por analito + método + matriz
- [ ] Severidad codificada por color
- [ ] Estrategias de mitigación
- [ ] Grid filtrable

---

## 10.5 Generador de fichas de método

**Objetivo**: Producir una ficha operativa imprimible para lleva al laboratorio.

### 10.5.1 Estructura de la ficha

```
┌═══════════════════════════════════════════════════════════┐
║  FICHA OPERATIVA                                          ║
║  Determinación de Ca²⁺ por titulación con EDTA            ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  REACTIVOS                                                ║
║  □ EDTA 0.01M (250 mL)     □ Buffer pH 10 (50 mL)         ║
║  □ Negro de eriocromo T     □ Agua destilada              ║
║                                                           ║
║  CONDICIONES                                              ║
║  pH: 10 ± 0.5  │  T: 20-25°C  │  Indicador: NET           ║
║                                                           ║
║  PROCEDIMIENTO (resumen)                                  ║
║  1. Pipetear 25 mL de muestra                             ║
║  2. Añadir 5 mL de buffer pH 10                           ║
║  3. Añadir 2 gotas de NET (azul→rojo)                     ║
║  4. Titular con EDTA hasta viraje (rojo→azul)             ║
║  5. Anotar volumen consumido                              ║
║                                                           ║
║  CÁLCULO                                                  ║
║  [Ca²⁺] = (C_EDTA × V_EDTA) / V_muestra                   ║
║                                                           ║
║  RIESGOS ANALÍTICOS                                       ║
║  ⚠️ Mg²⁺ interfiere → verificar con EGTA                  ║
║  ⚠️ Fe³⁺ > 1 ppm → reducir con ascórbico                  ║
║                                                           ║
║  CHECKLIST                                                ║
║  □ pH verificado con pHmetro                              ║
║  □ Bureta 50 mL limpia y cebada                           ║
║  □ Blanco realizado                                       ║
║  □ Duplicado preparado                                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

### 10.5.2 Entregables

- [ ] Generador de fichas desde parámetros del sistema
- [ ] Formatos: vista en app + PDF-ready (CSS print)
- [ ] Checklist interactivo (checkboxes)
- [ ] Cálculo integrado desde engine
- [ ] Riesgos importados del evaluador de interferencias (§10.4)

---

## 10.6 Presets de matrices reales

**Objetivo**: Cargar condiciones típicas de muestras reales.

### 10.6.1 Matrices disponibles

| Matriz | Componentes típicos | Uso |
|--------|--------------------|-----|
| Agua potable | Ca²⁺, Mg²⁺, Na⁺, Cl⁻, HCO₃⁻, SO₄²⁻ | Dureza, alcalinidad |
| Agua residual | NH₄⁺, PO₄³⁻, DBO, metales traza | Ambiental |
| Leche | Ca²⁺, fosfato, citrato, lactosa | Alimentario |
| Suelo | Fe, Al, Ca, Mg, pH, CIC | Agrícola |
| Farmacéutico | API, excipientes, pH, fuerza iónica | QC farmacéutico |
| Mineral | Metales pesados, sílice, sulfuros | Minería |
| Sangre | pH 7.4, HCO₃⁻/H₂CO₃, proteínas | Clínico (docente) |

### 10.6.2 Entregables

- [ ] ≥ 7 presets de matrices
- [ ] Cada preset carga componentes típicos
- [ ] Notas de manipulación y advertencias
- [ ] Link a módulo correspondiente para análisis

---

## Criterios de aceptación

| # | Criterio | Verificación |
|---|----------|-------------|
| 1 | Calculadora de soluciones produce masa correcta para 5 reagentes test | Numérico |
| 2 | Planificador predice Veq ± 0.1 mL | Numérico |
| 3 | Diluciones seriadas son correctas a 4 decimales | Numérico |
| 4 | Evaluador encuentra ≥ 2 interferencias para EDTA-Ca²⁺ en agua | Funcional |
| 5 | Ficha de método es imprimible (CSS print media) | Visual |
| 6 | 7 presets de matrices cargan datos reales | Funcional |
| 7 | Todas las vistas responsive | Visual |
| 8 | Dark mode funcional | Visual |

---

## Referencias cruzadas

- → Engine: [Tarea 04](./04-motor-equilibrio-universal.md) (cálculos de titulación, conversiones)
- → Selector de ácido: [Tarea 06 §6.7](./06-modulo-acido-base.md#67-selector-de-ácidos)
- → Datos de complejación: [Tarea 07](./07-modulo-complejacion.md)
- → Datos de precipitación: [Tarea 08](./08-modulo-precipitacion.md)
- → Gráficos: [Tarea 02](./02-sistema-graficos-scichart.md)
- → Grids: [Tarea 03](./03-sistema-grids-scigrid.md)
- → Fichas exportadas como reportes: [Tarea 11](./11-visualizacion-reportes.md)
- → Tests: [Tarea 14](./14-testing-aseguramiento-calidad.md)

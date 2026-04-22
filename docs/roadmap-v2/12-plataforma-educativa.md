# Tarea 12 — Plataforma Educativa y Explicaciones Interactivas

> **Dependencias**: [Tarea 05](./05-dashboard-y-navegacion.md), [Tareas 06–09](./06-modulo-acido-base.md), [Tarea 11](./11-visualizacion-reportes.md)  
> **Produce**: Sistema de aprendizaje guiado, ejercicios interactivos y gestión de sesiones  
> **Consumida por**: [Tarea 13](./13-i18n-accesibilidad-pwa.md), [Tarea 14](./14-testing-aseguramiento-calidad.md)  
> **Estado**: ⬚ No iniciada

---

## Tabla de contenidos

- [12.1 Explicaciones paso a paso](#121-explicaciones-paso-a-paso)
- [12.2 Rutas de aprendizaje](#122-rutas-de-aprendizaje)
- [12.3 Ejercicios interactivos](#123-ejercicios-interactivos)
- [12.4 Gestión de sesiones y progreso](#124-gestión-de-sesiones-y-progreso)
- [12.5 Exportación pedagógica](#125-exportación-pedagógica)
- [Estructura del módulo](#estructura-del-módulo)
- [Criterios de aceptación](#criterios-de-aceptación)

---

## Estructura del módulo

```
src/modules/education/
├── index.tsx
├── components/
│   ├── step-explanation.tsx           ← Explicaciones paso a paso (§12.1)
│   ├── learning-path-view.tsx         ← Rutas de aprendizaje (§12.2)
│   ├── learning-path-card.tsx
│   ├── exercise-view.tsx              ← Ejercicios (§12.3)
│   ├── exercise-card.tsx
│   ├── quiz-question.tsx
│   ├── session-manager-view.tsx       ← Gestión de sesiones (§12.4)
│   └── pedagogy-export-view.tsx       ← Exportación (§12.5)
├── hooks/
│   ├── use-learning-progress.ts
│   ├── use-exercises.ts
│   └── use-session.ts
├── data/
│   ├── learning-paths.ts
│   ├── exercises-acid-base.ts
│   ├── exercises-complexation.ts
│   ├── exercises-precipitation.ts
│   └── exercises-redox.ts
└── types.ts
```

### Sub-rutas

```
/education                  → Vista general con rutas disponibles
/education/learn/:pathId    → Ruta de aprendizaje específica
/education/exercise/:id     → Ejercicio interactivo
/education/sessions         → Gestión de sesiones guardadas
/education/progress         → Progreso del estudiante
```

---

## 12.1 Explicaciones paso a paso

**Objetivo**: Cada cálculo puede mostrarse como derivación expandible paso a paso.

### 12.1.1 Anatomía de una explicación

```
┌─── Explicación: pH de H₃PO₄ 0.1M ─────────────────────────┐
│                                                           │
│  Paso 1  │ Identificar el ácido                           │
│  ────────┤                                                │
│          │ H₃PO₄ es un ácido poliprótico (3 pKa)          │
│          │ pKa₁ = 2.15  pKa₂ = 7.20  pKa₃ = 12.35         │
│          │ Ka₁ = 7.08×10⁻³                                │
│          │                                                │
│  Paso 2  │ Simplificar                                    │
│  ────────┤                                                │
│          │ Como Ka₁ >> Ka₂ >> Ka₃, el pH está             │
│          │ dominado por la primera disociación:           │
│          │                                                │
│          │   H₃PO₄ ⇌ H₂PO₄⁻ + H⁺                          │
│          │                                                │
│  Paso 3  │ Plantear equilibrio                            │
│  ────────┤                                                │
│          │ Ka₁ = [H⁺][H₂PO₄⁻] / [H₃PO₄]                   │
│          │                                                │
│          │ Si x = [H⁺]:                                   │
│          │   Ka₁ = x² / (C - x)                           │
│          │   7.08×10⁻³ = x² / (0.1 - x)                   │
│          │                                                │
│  Paso 4  │ Resolver                                       │
│  ────────┤                                                │
│          │ x² + 7.08×10⁻³·x - 7.08×10⁻⁴ = 0               │
│          │                                                │
│          │        -Ka₁ + √(Ka₁² + 4·Ka₁·C)                │
│          │   x = ─────────────────────────────            │
│          │                   2                            │
│          │                                                │
│          │   x = 0.02328 M                                │
│          │                                                │
│  Paso 5  │ Resultado                                      │
│  ────────┤                                                │
│          │   pH = -log(0.02328) = 1.63                    │
│          │                                                │
│          │ ✅ Verificación con solver numérico: pH = 1.63 │
│          │                                                │
│  ─────────────────────────────────────────────────────────│
│  📊 [Ver gráfico de especiación]  📖 [Teoría completa]    │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### 12.1.2 Motor de explicaciones

```typescript
interface ExplanationStep {
  number: number;
  title: string;
  content: string;           // Markdown con KaTeX
  equation?: string;         // KaTeX standalone
  highlight?: {
    chart: string;           // ID del gráfico donde resaltar
    point?: { x: number; y: number };
    region?: { xMin: number; xMax: number };
  };
}

interface Explanation {
  id: string;
  title: string;
  context: string;           // "Cálculo de pH", "Punto de equivalencia"
  steps: ExplanationStep[];
  verificationValue?: number;
  module: 'acid-base' | 'complexation' | 'precipitation' | 'redox';
}
```

### 12.1.3 Plantillas de explicación

| Cálculo | Pasos | Módulo |
|---------|-------|--------|
| pH de ácido débil | 5 pasos (identificar, simplificar, equilibrio, resolver, resultado) | Ácido-base |
| pH de buffer | 4 pasos (identificar, Henderson-Hasselbalch, sustituir, resultado) | Ácido-base |
| Punto de equivalencia | 5 pasos (estequiometría, concentración sal, hidrólisis, Ka_b, pH) | Ácido-base |
| Capacidad buffer | 3 pasos (definición, derivar, evaluar) | Ácido-base |
| αY⁴⁻ a pH dado | 4 pasos (identificar ligando, constantes, fórmula, resultado) | Complejación |
| K' condicional | 3 pasos (αY⁴⁻, αM, K' = Kf·αY⁴⁻) | Complejación |
| Solubilidad vs pH | 4 pasos (Ksp, efecto pH, equilibrio, resolver) | Precipitación |
| Potencial de Nernst | 3 pasos (E°, ecuación Nernst, sustituir) | Redox |

### 12.1.4 Integración con gráficos

Cada paso puede resaltar una zona del gráfico interactivo:

```typescript
// Al pasar al paso 3, resaltar la zona del equilibrio
onStepChange={(step) => {
  if (step.highlight) {
    chartRef.current?.highlightRegion(step.highlight.region);
  }
}}
```

### 12.1.5 Entregables

- [ ] Componente `StepExplanation` con navegación paso a paso
- [ ] ≥ 8 plantillas de explicación (tabla arriba)
- [ ] Renderizado KaTeX de ecuaciones
- [ ] Sincronización con gráficos (highlight)
- [ ] Toggle para expandir/colapsar pasos
- [ ] Verificación cruzada con solver numérico

---

## 12.2 Rutas de aprendizaje

**Objetivo**: Guiar al estudiante desde conceptos básicos hasta análisis avanzado.

### 12.2.1 Estructura de una ruta

```
┌─── Ruta: Fundamentos Ácido-Base ─────────────────────────┐
│                                                          │
│  Progreso: ████████░░░░░░░░ 53%     (8 de 15 completados)│
│                                                          │
│  Nivel 1 — Conceptos fundamentales                       │
│  ├── ✅ 1.1 Ácidos y bases de Brønsted                   │
│  ├── ✅ 1.2 Constantes Ka y pKa                          │
│  ├── ✅ 1.3 pH de ácidos fuertes                         │
│  └── ✅ 1.4 pH de ácidos débiles                         │
│                                                          │
│  Nivel 2 — Equilibrios en solución                       │
│  ├── ✅ 2.1 Especies en equilibrio (α fracciones)        │
│  ├── ✅ 2.2 Efecto de la concentración                   │
│  ├── ✅ 2.3 Ácidos polipróticos                          │
│  ├── ✅ 2.4 Soluciones buffer                            │
│  └── 🔵 2.5 Capacidad buffer ← ACTUAL                    │
│                                                          │
│  Nivel 3 — Titulaciones                                  │
│  ├── ⬚ 3.1 Curva de titulación ácido fuerte              │
│  ├── ⬚ 3.2 Curva de titulación ácido débil               │
│  ├── ⬚ 3.3 Indicadores y detección del punto final       │
│  ├── ⬚ 3.4 Titulación de polipróticos                    │
│  └── ⬚ 3.5 Análisis de sensibilidad                      │
│                                                          │
│  Nivel 4 — Aplicaciones avanzadas                        │
│  └── ⬚ 4.1 Diseño experimental completo                  │
│                                                          │
│  [▶ Continuar ruta]  [📊 Ver logros]                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 12.2.2 Rutas disponibles

| Ruta | Niveles | Lecciones | Ejercicios | Módulo |
|------|---------|-----------|-----------|--------|
| Fundamentos Ácido-Base | 4 | 15 | 20 | Ácido-base |
| Complejación y EDTA | 3 | 10 | 12 | Complejación |
| Precipitación y Solubilidad | 3 | 9 | 10 | Precipitación |
| Redox y Electroquímica | 3 | 10 | 12 | Redox |
| Flujo de Laboratorio | 2 | 6 | 8 | Lab Tools |

### 12.2.3 Modelo de datos

```typescript
interface LearningPath {
  id: string;
  title: string;
  description: string;
  module: ModuleName;
  levels: LearningLevel[];
  totalLessons: number;
  estimatedTime: string;  // "3-4 horas"
}

interface LearningLevel {
  number: number;
  title: string;
  lessons: Lesson[];
  requiredCompletions: number;  // Mínimo de lecciones para desbloquear siguiente
}

interface Lesson {
  id: string;
  title: string;
  theory: string;                // Markdown con KaTeX
  explanation?: Explanation;     // Explicación paso a paso (§12.1)
  exercise?: Exercise;          // Ejercicio de práctica (§12.3)
  interactiveChart?: {
    module: string;
    initialParams: Record<string, number>;
    task: string;               // "Mueve el slider de pH hasta encontrar el buffer"
  };
}
```

### 12.2.4 Entregables

- [ ] 5 rutas de aprendizaje definidas
- [ ] Progreso persistido en localStorage
- [ ] Navegación por niveles con desbloqueo progresivo
- [ ] Vista de progreso global
- [ ] Cada lección incluye teoría, explicación interactiva y/o ejercicio

---

## 12.3 Ejercicios interactivos

**Objetivo**: Verificar comprensión con problemas que usan los mismos gráficos y herramientas.

### 12.3.1 Tipos de ejercicios

| Tipo | Interacción | Evaluación |
|------|-------------|-----------|
| Numérico | Ingresar un valor (pH, concentración, Veq) | ± tolerancia |
| Selección | Elegir opción correcta | Exacta |
| Identificar | Hacer clic en un punto del gráfico | Coordenada ± margen |
| Ordenar | Ordenar ácidos por fuerza, reacciones por pasos | Secuencia correcta |
| Manipular | Mover slider hasta lograr condición | Rango objetivo |
| Construir | Armar la expresión de equilibrio | Matching de componentes |

### 12.3.2 Layout de un ejercicio

```
┌─── Ejercicio 2.4.1 ─────────────────────────────────────────┐
│                                                             │
│  ★★☆ Intermedio                                             │
│                                                             │
│  PREGUNTA:                                                  │
│  ────────                                                   │
│  Se prepara un buffer mezclando 25 mL de ácido acético      │
│  0.2 M con 15 mL de acetato de sodio 0.3 M.                 │
│                                                             │
│  a) ¿Cuál es el pH del buffer?                              │
│     Respuesta: [_____] pH                                   │
│                                                             │
│  b) ¿Cuál es la capacidad buffer (β)?                       │
│     Respuesta: [_____] M/pH                                 │
│                                                             │
│  c) En el gráfico, haga clic en el punto que                │
│     corresponde a esta composición:                         │
│     [Gráfico interactivo de especiación]                    │
│                                                             │
│  ┌─ Pista (click para revelar) ─────────────────────────┐   │
│  │ Recuerde: Henderson-Hasselbalch: pH = pKa + log(A/HA)│   │
│  │ Calcule primero las moles de cada componente         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  [Verificar respuesta]   [Mostrar solución]   [Siguiente →] │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 12.3.3 Evaluación y feedback

```
┌─── Resultado ─────────────────────────────────────────────┐
│                                                           │
│  a) pH = 4.60                                             │
│     Tu respuesta: 4.58  ✅ Correcto (± 0.05)              │
│                                                           │
│  b) β = 0.089 M/pH                                        │
│     Tu respuesta: 0.12  ❌ Incorrecto                     │
│                                                           │
│     💡 Solución:                                          │
│     β = 2.303 × C_total × Ka × [H⁺] / (Ka + [H⁺])²        │
│     C_total = (0.2×25 + 0.3×15) / 40 = 0.2375 M           │
│     β = 2.303 × 0.2375 × ... = 0.089 M/pH                 │
│                                                           │
│  c) Punto identificado: (pH=4.6, α=0.69)                  │
│     Correcto: (pH=4.60, α=0.715)  ⚠️ Cerca                │
│                                                           │
│  Puntuación: 2/3 (67%)                                    │
│                                                           │
│  [🔄 Reintentar]  [📖 Ver explicación completa]  [→]      │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### 12.3.4 Banco de ejercicios

| Módulo | Ejercicios | Niveles |
|--------|-----------|---------|
| Ácido-base | 20 | Básico (8), Intermedio (8), Avanzado (4) |
| Complejación | 12 | Básico (4), Intermedio (5), Avanzado (3) |
| Precipitación | 10 | Básico (4), Intermedio (4), Avanzado (2) |
| Redox | 12 | Básico (4), Intermedio (5), Avanzado (3) |

### 12.3.5 Modelo de datos

```typescript
interface Exercise {
  id: string;
  title: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  module: ModuleName;
  statement: string;         // Markdown con KaTeX
  questions: Question[];
  hints: string[];
  solution: string;          // Markdown con KaTeX (explicación completa)
  relatedLesson?: string;
}

interface Question {
  id: string;
  type: 'numeric' | 'choice' | 'identify' | 'order' | 'manipulate';
  prompt: string;
  correctAnswer: number | string | string[];
  tolerance?: number;        // Para tipo numérico
  unit?: string;
  points: number;
}
```

### 12.3.6 Entregables

- [ ] 6 tipos de ejercicios implementados
- [ ] Banco de ≥ 54 ejercicios (tabla arriba)
- [ ] Sistema de evaluación con tolerancia numérica
- [ ] Pistas y solución completa
- [ ] Feedback inmediato con explicación
- [ ] Puntuación y tracking de progreso

---

## 12.4 Gestión de sesiones y progreso

**Objetivo**: Guardar y restaurar el estado completo del trabajo.

### 12.4.1 Sesión

```typescript
interface AppSession {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;       // Screenshot miniatura
  state: {
    activeModule: string;
    moduleStates: Record<string, unknown>;  // Estado de cada módulo
    selectedAcids: AcidEntry[];
    chartConfigs: ChartConfig[];
  };
  reports: Report[];
  progress: LearningProgress;
}
```

### 12.4.2 Layout del gestor

```
┌─── Mis sesiones ─────────────────────────────────────────┐
│                                                          │
│  [🔍 Buscar]  [+ Nueva sesión]  [📦 Importar]            │
│                                                          │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐               │
│  │ [thumb]   │ │ [thumb]   │ │ [thumb]   │               │
│  │           │ │           │ │           │               │
│  │ Lab 5     │ │ Examen    │ │ Proyecto  │               │
│  │ H₃PO₄     │ │ Complej.  │ │ Redox     │               │
│  │ Ene 15    │ │ Ene 12    │ │ Dic 20    │               │
│  │           │ │           │ │           │               │
│  │ [Abrir]   │ │ [Abrir]   │ │ [Abrir]   │               │
│  │ [Exportar]│ │ [Exportar]│ │ [Exportar]│               │
│  └───────────┘ └───────────┘ └───────────┘               │
│                                                          │
│  Progreso global:                                        │
│  ● Ácido-base: ████████░░ 80%                            │
│  ● Complejación: ██████░░░░ 60%                          │
│  ● Precipitación: ████░░░░░░ 40%                         │
│  ● Redox: ██░░░░░░░░ 20%                                 │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 12.4.3 Persistencia

| Dato | Almacenamiento | Formato |
|------|---------------|---------|
| Sesiones | IndexedDB | JSON serializado |
| Progreso | localStorage | JSON compacto |
| Thumbnails | IndexedDB | Base64 PNG |
| Exportación | Archivo | `.chemsession.json` |

### 12.4.4 Entregables

- [ ] Guardar sesión completa (estado + reportes + progreso)
- [ ] Restaurar sesión
- [ ] Galería de sesiones con thumbnails
- [ ] Exportar/importar sesión como archivo
- [ ] Progreso por módulo y global
- [ ] Auto-save cada 30 segundos

---

## 12.5 Exportación pedagógica

**Objetivo**: Exportar contenido formateado para uso docente.

### 12.5.1 Formatos pedagógicos

| Formato | Descripción | Uso |
|---------|-------------|-----|
| Guía de práctica | Pasos + espacios para respuestas | Laboratorio |
| Hoja de ejercicios | Problemas sin solución | Examen |
| Hoja con solución | Problemas + solución paso a paso | Corrección |
| Resumen teórico | Conceptos + ecuaciones + gráficos | Estudio |
| Rúbrica | Criterios de evaluación | Evaluación |

### 12.5.2 Entregables

- [ ] Exportar guía de práctica (PDF, print-ready)
- [ ] Exportar hoja de ejercicios (con/sin soluciones)
- [ ] Exportar resumen teórico del módulo
- [ ] Formato A4 con márgenes para anotaciones
- [ ] Opción de incluir/excluir soluciones

---

## Criterios de aceptación

| # | Criterio | Verificación |
|---|----------|-------------|
| 1 | Explicación paso a paso muestra ≥ 3 pasos con KaTeX | Visual |
| 2 | Ruta de aprendizaje muestra progreso persistente | Funcional |
| 3 | Ejercicio numérico evalúa respuesta con tolerancia ± 0.05 | Funcional |
| 4 | Sesión guardada se restaura con estado completo | Funcional |
| 5 | Exportación pedagógica genera PDF legible | Funcional |
| 6 | Progreso sobrevive a cerrar/abrir navegador | Persistencia |
| 7 | ≥ 54 ejercicios en el banco | Contenido |
| 8 | Auto-save funciona sin bloquear la UI | Performance |

---

## Referencias cruzadas

- → Gráficos interactivos: [Tarea 02](./02-sistema-graficos-scichart.md) (highlight, annotations)
- → Grids: [Tarea 03](./03-sistema-grids-scigrid.md)
- → Engine (verificación de respuestas): [Tarea 04](./04-motor-equilibrio-universal.md)
- → Dashboard (acceso a rutas): [Tarea 05](./05-dashboard-y-navegacion.md)
- → Módulos de contenido: [Tareas 06–09](./06-modulo-acido-base.md)
- → Reportes: [Tarea 11](./11-visualizacion-reportes.md)
- → i18n de contenido educativo: [Tarea 13](./13-i18n-accesibilidad-pwa.md)
- → Tests de educación: [Tarea 14](./14-testing-aseguramiento-calidad.md)

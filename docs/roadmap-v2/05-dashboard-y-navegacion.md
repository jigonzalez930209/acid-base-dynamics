# Tarea 05 — Dashboard Inteligente y Navegación

> **Dependencias**: [Tarea 01](./01-arquitectura-plataforma.md), [Tarea 02](./02-sistema-graficos-scichart.md), [Tarea 03](./03-sistema-grids-scigrid.md)  
> **Produce**: Dashboard principal, accesos rápidos, command palette, sesiones recientes  
> **Consumida por**: Experiencia general del usuario, Tareas 12–13  
> **Estado**: ⬚ No iniciada

---

## Tabla de contenidos

- [5.1 Diseño del dashboard](#51-diseño-del-dashboard)
- [5.2 Cards de módulos](#52-cards-de-módulos)
- [5.3 Panel de sesiones recientes y favoritos](#53-panel-de-sesiones-recientes-y-favoritos)
- [5.4 Command Palette](#54-command-palette)
- [5.5 Quick-start wizard](#55-quick-start-wizard)
- [5.6 Status bar contextual](#56-status-bar-contextual)
- [Criterios de aceptación](#criterios-de-aceptación)

---

## 5.1 Diseño del dashboard

**Objetivo**: La pantalla de inicio debe dar acceso inmediato a todo sin abrumar. Un vistazo, una decisión.

### 5.1.1 Layout del dashboard

```
┌──────────────────────────────────────────────────────────────┐
│  Header: Acid-Base Dynamics     🔍 Ctrl+K   🌐 ES  🌙  ⚙️    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Buenos días · 3 sesiones guardadas · Última: hace 2h        │
│                                                              │
│  ┌─── ANÁLISIS RÁPIDO ──────────────────────────────────┐    │
│  │                                                      │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │    │
│  │  │🧪        │ │⚗️        │ │💎        │ │⚡         │ │    │
│  │  │Ácido-Base│ │Complej.  │ │Precip.   │ │Redox     │ │    │
│  │  │80 ácidos │ │12 metales│ │15 sales  │ │20 pares  │ │    │
│  │  │→ Abrir   │ │→ Abrir   │ │→ Abrir   │ │→ Abrir   │ │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │    │
│  │                                                      │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─── HERRAMIENTAS ──────────┐ ┌─── RECIENTES ──────────┐    │
│  │                           │ │                        │    │
│  │  🔬 Preparar solución     │ │  📄 H₃PO₄ especiación  │    │
│  │  📐 Convertir unidades    │ │     hace 2 horas       │    │
│  │  📊 Generar reporte       │ │  📄 EDTA-Fe³⁺ complej. │    │
│  │  📚 Rutas de aprendizaje  │ │     hace 1 día         │    │
│  │                           │ │  📄 Titulación NaOH    │    │
│  │                           │ │     hace 3 días        │    │
│  └───────────────────────────┘ └────────────────────────┘    │
│                                                              │
│  ┌─── INICIO RÁPIDO ────────────────────────────────────┐    │
│  │  ¿Qué quieres hacer?                                 │    │
│  │  [Calcular pH] [Titular un ácido] [Explorar EDTA]    │    │
│  │  [Preparar solución] [Ver tutorial]                  │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 5.1.2 Componentes del dashboard

| Componente | Archivo | Contenido |
|------------|---------|-----------|
| `DashboardPage` | `src/modules/dashboard/index.tsx` | Layout del dashboard |
| `ModuleCards` | `src/modules/dashboard/module-cards.tsx` | Cards de los 4 módulos de análisis |
| `ToolLinks` | `src/modules/dashboard/tool-links.tsx` | Links a herramientas |
| `RecentSessions` | `src/modules/dashboard/recent-sessions.tsx` | Panel de sesiones recientes |
| `QuickActions` | `src/modules/dashboard/quick-actions.tsx` | Botones de inicio rápido |
| `WelcomeBar` | `src/modules/dashboard/welcome-bar.tsx` | Saludo + estadísticas |

### 5.1.3 Entregables

- [ ] Dashboard renderizado como ruta `/`
- [ ] Todos los componentes creados
- [ ] Responsive (1 columna en mobile, 2+ en desktop)
- [ ] Data real (conteo de ácidos, sesiones, etc.)

---

## 5.2 Cards de módulos

**Objetivo**: Cada módulo de análisis tiene su card con información clave y acceso directo.

### 5.2.1 Diseño de card

```
┌──────────────────────────┐
│  🧪  Ácido-Base          │
│                          │
│  80 ácidos disponibles   │
│  Especiación · Titulación│
│  Buffer · Predominancia  │
│                          │
│  [Abrir módulo →]        │
└──────────────────────────┘
```

### 5.2.2 Datos por card

| Módulo | Icono | Stat principal | Sub-features |
|--------|-------|---------------|-------------|
| Ácido-Base | 🧪 | 80 ácidos | Especiación, Titulación, Buffer, Predominancia, Sensibilidad |
| Complejación | ⚗️ | 12 metales | EDTA, Alpha fractions, Constantes condicionales |
| Precipitación | 💎 | 15 sales | Solubilidad, Precipitación selectiva, pH-dependiente |
| Redox | ⚡ | 20 pares | Nernst, Celdas galvánicas, Pourbaix |

### 5.2.3 Interacción de la card

| Acción | Resultado |
|--------|-----------|
| Click en card | Navega al módulo |
| Hover | Elevación + brillo sutil |
| Click en sub-feature | Navega directamente a esa sub-vista |

### 5.2.4 Entregables

- [ ] 4 cards con datos reales
- [ ] Navegación directa a módulos y sub-features
- [ ] Animación sutil de hover
- [ ] Colores de módulo consistentes con tokens de [Tarea 01 §1.3](./01-arquitectura-plataforma.md#13-sistema-de-diseño-y-tokens)

---

## 5.3 Panel de sesiones recientes y favoritos

**Objetivo**: El usuario retoma su trabajo sin buscar.

### 5.3.1 Sesión guardada — estructura

```ts
interface SavedSession {
  id: string;
  name: string;                    // "Especiación de H₃PO₄"
  module: 'acid-base' | 'complexation' | 'precipitation' | 'redox' | 'lab-tools';
  createdAt: string;               // ISO date
  updatedAt: string;
  thumbnail?: string;              // Data URL de captura del gráfico
  state: Record<string, unknown>;  // Estado serializado del módulo
  isFavorite: boolean;
}
```

### 5.3.2 UI del panel

```
┌─── Sesiones recientes ─────────────────────┐
│                                            │
│  ⭐ H₃PO₄ especiación         hace 2h      │
│     🧪 Ácido-Base · pH 4.75 · 25°C         │
│                                            │
│  📄 EDTA-Fe³⁺ complejación    hace 1 día   │
│     ⚗️ Complejación · pH 2-12              │
│                                            │
│  📄 Titulación HCl/NaOH       hace 3 días  │
│     🧪 Ácido-Base · 0.1M                   │
│                                            │
│  [Ver todas las sesiones]                  │
│                                            │
└────────────────────────────────────────────┘
```

### 5.3.3 Almacenamiento

- Sesiones en `localStorage` (≤ 50 sesiones, FIFO)
- Favoritos marcados con estrella (no se borran por FIFO)
- Exportación de sesión como JSON (para compartir)
- Importación de sesión desde JSON

### 5.3.4 Entregables

- [ ] Guardar/Cargar sesión funcional
- [ ] Panel de recientes en dashboard
- [ ] Favoritos con toggle de estrella
- [ ] Exportar/Importar sesión como JSON
- [ ] Límite de 50 sesiones con FIFO

---

## 5.4 Command Palette

**Objetivo**: Acceso instantáneo a cualquier funcionalidad con `Ctrl+K`.

### 5.4.1 Diseño visual

```
┌──────────────────────────────────────────┐
│  🔍 Buscar módulo, ácido o acción...     │
├──────────────────────────────────────────┤
│                                          │
│  MÓDULOS                                 │
│  ├─ 🧪 Ácido-Base                        │
│  ├─ ⚗️ Complejación                      │
│  └─ ...                                  │
│                                          │
│  ÁCIDOS                                  │
│  ├─ H₃PO₄ Ácido fosfórico                │
│  ├─ CH₃COOH Ácido acético                │
│  └─ ...                                  │
│                                          │
│  ACCIONES                                │
│  ├─ Calcular pH de una solución          │
│  ├─ Preparar solución                    │
│  └─ Cambiar tema                         │
│                                          │
│  RECIENTES                               │
│  ├─ H₃PO₄ especiación (hace 2h)          │
│  └─ ...                                  │
│                                          │
└──────────────────────────────────────────┘
```

### 5.4.2 Categorías de búsqueda

| Categoría | Fuente de datos | Acción al seleccionar |
|-----------|----------------|----------------------|
| Módulos | Lista estática (6 módulos) | Navegar al módulo |
| Ácidos | `ACID_DATABASE` (80+ entradas) | Abrir ácido-base con ese ácido |
| Acciones | Lista estática (~15 acciones) | Ejecutar acción |
| Sesiones | `localStorage` | Cargar sesión |
| Configuración | Lista estática | Abrir panel de config |

### 5.4.3 Atajos de teclado

| Atajo | Acción |
|-------|--------|
| `Ctrl+K` / `Cmd+K` | Abrir command palette |
| `Escape` | Cerrar |
| `↑` / `↓` | Navegar resultados |
| `Enter` | Seleccionar resultado |
| Escribir | Filtrar resultados |

### 5.4.4 Entregables

- [ ] Command palette funcional
- [ ] Búsqueda fuzzy en todas las categorías
- [ ] Atajos de teclado
- [ ] Resultados agrupados por categoría
- [ ] Historial de búsquedas recientes

---

## 5.5 Quick-start wizard

**Objetivo**: Un usuario nuevo debe poder hacer algo útil en < 30 segundos.

### 5.5.1 Flujo del wizard

```
Paso 1: ¿Qué quieres hacer?
┌──────────────────────────────────────────┐
│  Calcular el pH de una solución          │  → pH Calculator
│  Graficar la especiación de un ácido     │  → Speciation
│  Planificar una titulación               │  → Titration planner
│  Preparar una solución                   │  → Solution prep
│  Explorar la complejación con EDTA       │  → EDTA explorer
│  Solo quiero explorar                    │  → Dashboard
└──────────────────────────────────────────┘

Paso 2 (si eligió "Calcular pH"):
┌──────────────────────────────────────────┐
│  ¿Qué ácido?                             │
│  [Selector con búsqueda: 80+ ácidos]     │
│                                          │
│  ¿Concentración?                         │
│  [0.1] M                                 │
│                                          │
│  [Calcular →]                            │
└──────────────────────────────────────────┘
```

### 5.5.2 Entregables

- [ ] Wizard de 2 pasos máximo
- [ ] 6 opciones de inicio
- [ ] Cada opción lleva al módulo correspondiente con datos precargados
- [ ] Detectable como primer uso (no se muestra después del primer setup)
- [ ] Opción "No mostrar de nuevo"

---

## 5.6 Status bar contextual

**Objetivo**: El usuario siempre sabe en qué contexto está sin buscar.

### 5.6.1 Diseño

```
┌──────────────────────────────────────────────────────────────┐
│  pH 4.75  │  H₃PO₄ 0.1M  │  25°C  │  Davies  │  ES  │  ☾     │
└──────────────────────────────────────────────────────────────┘
```

### 5.6.2 Segmentos de la status bar

| Segmento | Dato | Clickeable |
|----------|------|-----------|
| pH | pH global actual | → Abre slider de pH |
| Ácido actual | Fórmula + concentración | → Abre selector de ácido |
| Temperatura | °C actual | → Abre panel de temperatura |
| Modelo | Modelo de actividad | → Abre selector de modelo |
| Idioma | ES / EN | → Toggle idioma |
| Tema | ☀ / ☾ | → Toggle tema |

### 5.6.3 Entregables

- [ ] Status bar fija en parte inferior
- [ ] 6 segmentos funcionales
- [ ] Cada segmento es clickeable con acción
- [ ] Se oculta en mobile (la info va al header)

---

## Criterios de aceptación

| # | Criterio | Verificación |
|---|----------|-------------|
| 1 | Dashboard carga en < 1s | Performance |
| 2 | Command palette se abre en < 200ms | Medición |
| 3 | Buscar "fosf" encuentra H₃PO₄ | Manual |
| 4 | Sesión guardada se restaura correctamente | E2E |
| 5 | Quick-start lleva al módulo correcto con datos | Manual |
| 6 | Status bar muestra datos contextuales reales | Manual |
| 7 | Todo funciona en mobile (responsive) | Mobile test |
| 8 | Navegación completa por teclado | A11y test |
| 9 | Dark mode en todos los componentes del dashboard | Visual |
| 10 | El dashboard no rompe cuando no hay sesiones guardadas | Edge case |

---

## Referencias cruzadas

- → Shell del Tarea 01: [Tarea 01 §1.1](./01-arquitectura-plataforma.md#11-unificación-de-layouts)
- → Cards usan colores de módulo de: [Tarea 01 §1.3](./01-arquitectura-plataforma.md#13-sistema-de-diseño-y-tokens)
- → Sesiones usadas en: [Tarea 12 §12.3](./12-plataforma-educativa.md#123-sesiones-reproducibles)
- → Command palette busca ácidos de: `src/data/acids.ts`
- → Status bar conecta con: [Tarea 04 §4.7](./04-motor-equilibrio-universal.md#47-api-del-engine) (ChemistryStore)

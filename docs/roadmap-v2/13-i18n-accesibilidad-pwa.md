# Tarea 13 — Internacionalización, Accesibilidad y PWA

> **Dependencias**: [Tareas 01–12](./01-arquitectura-plataforma.md) (todos los módulos deben estar funcionales)  
> **Produce**: Aplicación bilingüe, accesible WCAG 2.1 AA, responsive, e instalable offline  
> **Consumida por**: [Tarea 14](./14-testing-aseguramiento-calidad.md)  
> **Estado**: ⬚ No iniciada

---

## Tabla de contenidos

- [13.1 Sistema de internacionalización completo](#131-sistema-de-internacionalización-completo)
- [13.2 Accesibilidad WCAG 2.1 AA](#132-accesibilidad-wcag-21-aa)
- [13.3 Diseño responsive y móvil](#133-diseño-responsive-y-móvil)
- [13.4 Progressive Web App (PWA)](#134-progressive-web-app-pwa)
- [13.5 Rendimiento y optimización](#135-rendimiento-y-optimización)
- [Estructura del módulo](#estructura-del-módulo)
- [Criterios de aceptación](#criterios-de-aceptación)

---

## Estructura del módulo

```
src/
├── i18n/
│   ├── index.ts                      ← Configuración i18next
│   ├── language-switcher.tsx          ← Componente de cambio de idioma
│   ├── locales/
│   │   ├── es/
│   │   │   ├── common.json           ← Textos generales
│   │   │   ├── acid-base.json        ← Módulo ácido-base
│   │   │   ├── complexation.json     ← Módulo complejación
│   │   │   ├── precipitation.json    ← Módulo precipitación
│   │   │   ├── redox.json            ← Módulo redox
│   │   │   ├── lab-tools.json        ← Herramientas lab
│   │   │   ├── education.json        ← Plataforma educativa
│   │   │   └── reports.json          ← Reportes
│   │   ├── en/
│   │   │   ├── common.json
│   │   │   ├── acid-base.json
│   │   │   ├── complexation.json
│   │   │   ├── precipitation.json
│   │   │   ├── redox.json
│   │   │   ├── lab-tools.json
│   │   │   ├── education.json
│   │   │   └── reports.json
│   │   ├── pt/                        ← Preparado para portugués
│   │   └── fr/                        ← Preparado para francés
│   └── utils/
│       ├── chemical-i18n.ts           ← Nombres de ácidos/bases bilingüe
│       └── unit-i18n.ts              ← Unidades localizadas
├── a11y/
│   ├── skip-link.tsx
│   ├── sr-only.tsx
│   ├── focus-trap.tsx
│   └── announcer.tsx
└── sw/
    ├── service-worker.ts
    └── sw-register.ts
```

---

## 13.1 Sistema de internacionalización completo

**Objetivo**: Toda la interfaz y contenido científico disponible en español e inglés, extensible a otros idiomas.

### 13.1.1 Estado actual y migración

La app actual ya tiene un sistema i18n parcial:

| Archivo actual | Líneas | Contenido | Estado |
|----------------|--------|-----------|--------|
| `src/features/i18n/i18n.ts` | ~30 | Configuración i18next | ✅ Base |
| `src/features/i18n/messages.ts` | ~200 | Traducciones inline | ⚠️ Migrar a JSON |
| `src/features/i18n/language-switcher.tsx` | ~40 | Toggle ES/EN | ✅ Reusar |

**Migración**: Separar `messages.ts` en archivos JSON por namespace.

### 13.1.2 Namespaces i18n

| Namespace | Claves estimadas | Ejemplo |
|-----------|-----------------|---------|
| `common` | ~100 | `common.save`, `common.cancel`, `common.export` |
| `acid-base` | ~80 | `acid-base.speciation.title`, `acid-base.buffer.capacity` |
| `complexation` | ~60 | `complexation.alpha.title`, `complexation.edta.explorer` |
| `precipitation` | ~40 | `precipitation.ksp`, `precipitation.selective` |
| `redox` | ~50 | `redox.nernst`, `redox.pourbaix` |
| `lab-tools` | ~50 | `lab-tools.dilution`, `lab-tools.interference` |
| `education` | ~80 | `education.exercise`, `education.progress` |
| `reports` | ~30 | `reports.export`, `reports.builder` |
| **Total** | **~490** | |

### 13.1.3 Contenido científico bilingüe

Nombres de compuestos y reacciones deben localizarse cuidadosamente:

```typescript
// Los nombres IUPAC son universales, pero los comunes varían
const chemicalNames: Record<string, Record<Locale, string>> = {
  'acetic-acid': {
    es: 'Ácido acético',
    en: 'Acetic acid',
  },
  'phosphoric-acid': {
    es: 'Ácido fosfórico',
    en: 'Phosphoric acid',
  },
  // Las fórmulas (HAc, H₃PO₄) NO se traducen
};

// Unidades: usar Intl.NumberFormat
function formatConcentration(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value) + ' M';
}
```

### 13.1.4 Lazy loading de idiomas

```typescript
// Solo cargar el idioma activo
i18n.use(Backend).init({
  lng: navigator.language.startsWith('es') ? 'es' : 'en',
  fallbackLng: 'en',
  ns: ['common'],                // Solo common al inicio
  defaultNS: 'common',
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
  },
  partialBundledLanguages: true,  // Lazy load namespaces
});
```

### 13.1.5 Entregables

- [ ] Migrar messages.ts a archivos JSON por namespace
- [ ] ~490 claves traducidas ES + EN
- [ ] Lazy loading de namespaces por módulo
- [ ] Nombres científicos bilingües
- [ ] Números formateados según locale
- [ ] Esqueleto preparado para PT y FR
- [ ] Selector de idioma en header

---

## 13.2 Accesibilidad WCAG 2.1 AA

**Objetivo**: Cumplir con WCAG 2.1 nivel AA para que la app sea usable con tecnología asistiva.

### 13.2.1 Checklist de cumplimiento

| Criterio WCAG | Nivel | Área | Implementación |
|---------------|-------|------|---------------|
| 1.1.1 Contenido no textual | A | Gráficos | Alt text para cada chart, tabla alternativa |
| 1.3.1 Información y relaciones | A | Estructura | Headings jerárquicos, landmarks ARIA |
| 1.4.1 Uso del color | A | Alerts | No depender solo del color para información |
| 1.4.3 Contraste mínimo | AA | Todo | Ratio ≥ 4.5:1 texto, ≥ 3:1 grande |
| 1.4.11 Contraste no textual | AA | Charts | Colores de series con contraste suficiente |
| 2.1.1 Teclado | A | Todo | Tab order lógico, Enter/Space activar |
| 2.1.2 Sin trampa de teclado | A | Modals | Focus trap con escape |
| 2.4.1 Saltar bloques | A | Nav | Skip to main content link |
| 2.4.3 Orden de foco | A | Forms | Tab order = visual order |
| 2.4.6 Encabezados descriptivos | AA | Todo | Headings descriptivos por sección |
| 2.4.7 Foco visible | AA | Todo | Outline visible en elementos con foco |
| 3.1.1 Idioma de la página | A | HTML | `lang` attribute dinámico |
| 3.1.2 Idioma de las partes | AA | Fórmulas | `lang` en bloques de idioma diferente |
| 4.1.2 Nombre, rol, valor | A | Widgets | ARIA labels para controles custom |

### 13.2.2 Accesibilidad de gráficos

Los gráficos científicos son intrínsecamente visuales. Estrategia:

```
┌─── Gráfico accesible ───────────────────────────────────┐
│                                                         │
│  [Gráfico de especiación de H₃PO₄]                      │
│                                                         │
│  ┌─ Descripción alternativa (screen reader) ──────────┐ │
│  │ "Gráfico de fracciones molares α vs pH para H₃PO₄. │ │
│  │  H₃PO₄ predomina de pH 0 a 2.15.                   │ │
│  │  H₂PO₄⁻ predomina de pH 2.15 a 7.20.               │ │
│  │  HPO₄²⁻ predomina de pH 7.20 a 12.35.              │ │
│  │  PO₄³⁻ predomina de pH > 12.35.                    │ │
│  │  Los puntos de cruce ocurren en pH = pKa."         │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌─ Tabla alternativa (toggle) ───────────────────────┐ │
│  │ pH │ α(H₃PO₄) │ α(H₂PO₄⁻) │ α(HPO₄²⁻)  │ α(PO₄³⁻)  │ │
│  │  0 │ 0.993    │ 0.007     │ 0.000      │ 0.000     │ │
│  │  2 │ 0.585    │ 0.414     │ 0.000      │ 0.000     │ │
│  │  4 │ 0.014    │ 0.986     │ 0.001      │ 0.000     │ │
│  │ ...│ ...      │ ...       │ ...        │ ...       │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 13.2.3 Componentes de accesibilidad

```typescript
// Skip link
export function SkipLink() {
  return (
    <a href="#main-content" className="sr-only focus:not-sr-only ...">
      {t('common.skipToMain')}
    </a>
  );
}

// Live region para anuncios
export function Announcer() {
  const [message, setMessage] = useState('');
  return (
    <div role="status" aria-live="polite" aria-atomic className="sr-only">
      {message}
    </div>
  );
}

// Chart con aria
<div role="img" aria-label={chartDescription}>
  <ChemChart ... />
  <details>
    <summary>{t('common.viewAsTable')}</summary>
    <ChemCompactGrid data={chartDataAsTable} />
  </details>
</div>
```

### 13.2.4 Entregables

- [ ] Skip link en todas las páginas
- [ ] ARIA landmarks (`main`, `nav`, `complementary`)
- [ ] Descripciones alternativas para gráficos
- [ ] Tablas alternativas para gráficos (toggle)
- [ ] Focus visible en todos los controles
- [ ] Tab order lógico en todas las vistas
- [ ] Contraste ≥ 4.5:1 verificado (paleta light + dark)
- [ ] `lang` attribute dinámico en `<html>`
- [ ] Roles ARIA en widgets custom (sliders, tabs, accordions)
- [ ] Live region para anuncios de resultados

---

## 13.3 Diseño responsive y móvil

**Objetivo**: Experiencia adecuada en tablets y dispositivos móviles.

### 13.3.1 Breakpoints

| Breakpoint | Nombre | Layout |
|------------|--------|--------|
| < 640px | `sm` | Móvil: stack vertical, sidebar colapsada |
| 640–1024px | `md` | Tablet: sidebar mini, contenido al 100% |
| 1024–1440px | `lg` | Desktop: sidebar expandida, contenido centrado |
| > 1440px | `xl` | Wide: sidebar + contenido + panel lateral |

### 13.3.2 Adaptaciones por componente

| Componente | Móvil | Tablet | Desktop |
|-----------|-------|--------|---------|
| Sidebar | Bottom nav (5 iconos) | Mini sidebar (iconos) | Full sidebar |
| Charts | Touch gestures, full width | Full width, cursor | Cursor, tooltips |
| Grids | Card list view | Horizontal scroll | Full table |
| Dashboard | 1 columna, swipeable | 2 columnas | 3+ columnas |
| Exercise | Stacked, large touch | Side by side | Side by side |
| Sliders | Larger thumb, label | Normal | Normal |

### 13.3.3 Gráficos en móvil

```typescript
// Adaptar interacción táctil para scichart-engine
const chartModifiers = isMobile
  ? [
      new ZoomExtentsModifier(),
      new PinchZoomModifier(),       // Pinch to zoom
      new TouchCursorModifier(),     // Long press for cursor
    ]
  : [
      new RubberBandXyZoomModifier(),
      new MouseWheelZoomModifier(),
      new RolloverModifier(),
    ];
```

### 13.3.4 Entregables

- [ ] Layout responsive en todos los módulos
- [ ] Navegación móvil (bottom nav)
- [ ] Touch interactions para gráficos
- [ ] Card view para grids en móvil
- [ ] Gráficos auto-resize al rotar dispositivo
- [ ] Test en viewport 375px, 768px, 1024px, 1440px

---

## 13.4 Progressive Web App (PWA)

**Objetivo**: Instalar la app como nativa, con soporte offline para referencia rápida.

### 13.4.1 Manifest actual

La app ya tiene `public/manifest.webmanifest`. Verificar y completar:

```jsonc
{
  "name": "Acid-Base Dynamics",
  "short_name": "ChemDynamics",
  "description": "Interactive chemical equilibrium calculator",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1e40af",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "categories": ["education", "productivity"],
  "screenshots": [
    { "src": "/screenshots/speciation.png", "sizes": "1280x720", "type": "image/png" }
  ]
}
```

### 13.4.2 Service Worker

```typescript
// Estrategia: Cache-first para assets, network-first para datos
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';

// Precache de assets de build
precacheAndRoute(self.__WB_MANIFEST);

// Cache-first para fuentes y assets estáticos
registerRoute(
  ({ request }) => request.destination === 'font' || request.destination === 'image',
  new CacheFirst({ cacheName: 'assets-cache' })
);

// Network-first para datos dinámicos (si hubiera API)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({ cacheName: 'api-cache' })
);
```

### 13.4.3 Capacidad offline

| Funcionalidad | Offline | Notas |
|---------------|---------|-------|
| Especiación | ✅ | Todo local |
| Titulación | ✅ | Todo local |
| Buffer / Sensibilidad | ✅ | Todo local |
| Complejación | ✅ | Datos en bundle |
| Precipitación | ✅ | Datos en bundle |
| Redox | ✅ | Datos en bundle |
| Lab Tools | ✅ | Todo local |
| Exportar PNG | ✅ | Canvas API |
| Exportar PDF | ✅ | jspdf en bundle |
| Guardar sesión | ✅ | IndexedDB |
| Instalar app | ✅ | PWA standard |

> La app es 100% client-side, lo que facilita el offline completo.

### 13.4.4 Entregables

- [ ] Manifest completo con iconos 192+512+maskable
- [ ] Service worker con Workbox
- [ ] Funcionamiento offline completo
- [ ] Banner de instalación
- [ ] Screenshots para store
- [ ] Cache de assets precargada

---

## 13.5 Rendimiento y optimización

**Objetivo**: Tiempos de carga rápidos y operación fluida.

### 13.5.1 Targets de rendimiento

| Métrica | Target | Herramienta |
|---------|--------|-----------|
| LCP (Largest Contentful Paint) | < 2.5s | Lighthouse |
| FID (First Input Delay) | < 100ms | Lighthouse |
| CLS (Cumulative Layout Shift) | < 0.1 | Lighthouse |
| Bundle size (gzipped) | < 500 KB initial | Vite |
| Time to Interactive | < 3s (3G) | Lighthouse |
| Cálculo de especiación | < 10ms | Performance.now() |
| Render de chart | < 100ms | Performance.now() |

### 13.5.2 Estrategias de optimización

```
┌─── Carga inicial ──────────────────────────────────────┐
│                                                        │
│  Ruta /                                                │
│  ├── Shell (sidebar + header): ~30 KB                  │
│  ├── Dashboard: ~15 KB                                 │
│  └── Total inicial: ~80 KB (gzipped)                   │
│                                                        │
│  Lazy loaded (por ruta):                               │
│  ├── acid-base module: ~40 KB                          │
│  ├── complexation module: ~35 KB                       │
│  ├── scichart-engine (WebGL): ~200 KB                  │
│  ├── @sci-grid: ~80 KB                                 │
│  └── KaTeX: ~100 KB                                    │
│                                                        │
│  Estrategia: React.lazy() + Suspense por módulo        │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### 13.5.3 Code splitting

```typescript
// Cada módulo se carga lazy
const AcidBaseModule = lazy(() => import('./modules/acid-base'));
const ComplexationModule = lazy(() => import('./modules/complexation'));
const PrecipitationModule = lazy(() => import('./modules/precipitation'));
const RedoxModule = lazy(() => import('./modules/redox'));
const LabToolsModule = lazy(() => import('./modules/lab-tools'));
const EducationModule = lazy(() => import('./modules/education'));
const VisualizationModule = lazy(() => import('./modules/visualization'));
```

### 13.5.4 Entregables

- [ ] Lazy loading de todos los módulos
- [ ] Lighthouse score ≥ 90 en Performance
- [ ] Bundle initial < 500 KB gzipped
- [ ] Preload de módulo al hover sobre nav item
- [ ] Web Workers para cálculos pesados (heatmap, multi-scenario)
- [ ] Memoización de cálculos costosos

---

## Criterios de aceptación

| # | Criterio | Verificación |
|---|----------|-------------|
| 1 | ≥ 490 claves i18n en ES y EN | Conteo |
| 2 | Cambio de idioma recarga strings sin refresh | Funcional |
| 3 | Axe DevTools reporta 0 violaciones nivel A/AA | Herramienta |
| 4 | Contraste ≥ 4.5:1 en ambos temas | Herramienta |
| 5 | App usable en 375px width | Visual |
| 6 | App instalable como PWA | Chrome DevTools |
| 7 | App funcional sin conexión a internet | Manual |
| 8 | Lighthouse Performance ≥ 90 | Lighthouse |
| 9 | Bundle initial < 500 KB gzipped | Build stats |
| 10 | Tab navigation funcional en todas las vistas | Manual |

---

## Referencias cruzadas

- → Arquitectura base: [Tarea 01](./01-arquitectura-plataforma.md)
- → Gráficos (accesibilidad de charts): [Tarea 02](./02-sistema-graficos-scichart.md)
- → Grids (vista card para móvil): [Tarea 03](./03-sistema-grids-scigrid.md)
- → Dashboard (responsive): [Tarea 05](./05-dashboard-y-navegacion.md)
- → Todos los módulos (contenido a traducir): [Tareas 06–10](./06-modulo-acido-base.md)
- → Reportes (exportación accessible): [Tarea 11](./11-visualizacion-reportes.md)
- → Educación (contenido pedagógico bilingüe): [Tarea 12](./12-plataforma-educativa.md)
- → Tests de accesibilidad: [Tarea 14 §14.6](./14-testing-aseguramiento-calidad.md#146-tests-de-accesibilidad)

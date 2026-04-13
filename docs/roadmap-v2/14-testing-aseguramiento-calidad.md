# Tarea 14 — Testing y Aseguramiento de Calidad

> **Dependencias**: [Tareas 01–13](./01-arquitectura-plataforma.md) (todos los módulos completados)  
> **Produce**: Suite completa de testing, validación científica y benchmarks de rendimiento  
> **Consumida por**: Ninguna (tarea final)  
> **Estado**: ⬚ No iniciada

---

## Tabla de contenidos

- [14.1 Tests unitarios del motor de cálculo](#141-tests-unitarios-del-motor-de-cálculo)
- [14.2 Tests de componentes React](#142-tests-de-componentes-react)
- [14.3 Tests de integración](#143-tests-de-integración)
- [14.4 Tests end-to-end (E2E)](#144-tests-end-to-end-e2e)
- [14.5 Validación científica](#145-validación-científica)
- [14.6 Tests de accesibilidad](#146-tests-de-accesibilidad)
- [14.7 Benchmarks de rendimiento](#147-benchmarks-de-rendimiento)
- [14.8 Infraestructura de CI/CD](#148-infraestructura-de-cicd)
- [Estructura del módulo](#estructura-del-módulo)
- [Criterios de aceptación](#criterios-de-aceptación)

---

## Estructura del módulo

```
tests/
├── unit/
│   ├── engine/
│   │   ├── solver.test.ts                ← Newton-Raphson solver
│   │   ├── speciation.test.ts            ← Fracciones α
│   │   ├── titration.test.ts             ← Curvas de titulación
│   │   ├── buffer.test.ts                ← Capacidad buffer
│   │   ├── activity.test.ts              ← Modelos de actividad
│   │   ├── temperature.test.ts           ← Correcciones de T
│   │   └── balance.test.ts              ← Balances de masa/carga
│   ├── complexation/
│   │   ├── alpha-fractions.test.ts
│   │   ├── conditional-k.test.ts
│   │   └── edta-calculator.test.ts
│   ├── precipitation/
│   │   ├── solubility.test.ts
│   │   └── selective-precipitation.test.ts
│   ├── redox/
│   │   ├── nernst.test.ts
│   │   └── cell-potential.test.ts
│   └── lab-tools/
│       ├── dilution.test.ts
│       └── solution-prep.test.ts
├── components/
│   ├── charts/
│   │   ├── chem-chart.test.tsx
│   │   ├── chem-multi-chart.test.tsx
│   │   └── chem-heatmap.test.tsx
│   ├── grids/
│   │   ├── chem-grid.test.tsx
│   │   └── cell-renderers.test.tsx
│   ├── modules/
│   │   ├── acid-base-speciation.test.tsx
│   │   ├── acid-base-titration.test.tsx
│   │   ├── complexation-explorer.test.tsx
│   │   ├── precipitation-view.test.tsx
│   │   └── redox-nernst.test.tsx
│   └── shared/
│       ├── chemical-formula.test.tsx
│       ├── math-expression.test.tsx
│       └── language-switcher.test.tsx
├── integration/
│   ├── acid-base-workflow.test.ts
│   ├── engine-chart-sync.test.ts
│   ├── session-persistence.test.ts
│   └── export-pipeline.test.ts
├── e2e/
│   ├── navigation.spec.ts
│   ├── acid-base-flow.spec.ts
│   ├── complexation-flow.spec.ts
│   ├── lab-tools-flow.spec.ts
│   ├── education-flow.spec.ts
│   ├── export-flow.spec.ts
│   └── pwa-install.spec.ts
├── scientific/
│   ├── reference-cases.test.ts           ← 22+ casos de referencia
│   ├── numerics-stability.test.ts        ← Estabilidad numérica
│   ├── edge-cases.test.ts               ← Extremos pH 0-14
│   └── cross-validation.test.ts         ← Comparación con literatura
├── a11y/
│   ├── axe-audit.test.ts
│   └── keyboard-navigation.test.ts
├── performance/
│   ├── calculation-benchmarks.test.ts
│   ├── chart-render-benchmarks.test.ts
│   └── bundle-size.test.ts
├── setup.ts                              ← Configuración global Vitest
├── helpers/
│   ├── render-with-providers.tsx
│   ├── test-acids.ts                     ← Ácidos de prueba
│   └── tolerance.ts                      ← Comparación numérica
└── vitest.config.ts
```

---

## 14.1 Tests unitarios del motor de cálculo

**Objetivo**: Verificar que todas las funciones matemáticas y de cálculo producen resultados correctos.

### 14.1.1 Framework y configuración

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',        // Engine tests no necesitan DOM
    include: ['tests/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/engine/**', 'src/modules/**/lib/**'],
      thresholds: {
        branches: 90,
        functions: 95,
        lines: 90,
        statements: 90,
      },
    },
  },
});
```

### 14.1.2 Helpers de tolerancia numérica

```typescript
// tests/helpers/tolerance.ts

/**
 * Compara valores de pH con tolerancia apropiada.
 * Los cálculos químicos típicamente tienen precisión de ±0.01 pH.
 */
export function expectPH(actual: number, expected: number, tolerance = 0.02) {
  expect(actual).toBeCloseTo(expected, -Math.log10(tolerance));
}

/**
 * Compara fracciones molares (0 a 1).
 */
export function expectAlpha(actual: number, expected: number, tolerance = 0.005) {
  expect(actual).toBeCloseTo(expected, -Math.log10(tolerance));
}

/**
 * Compara volúmenes de equivalencia (mL).
 */
export function expectVolume(actual: number, expected: number, tolerance = 0.1) {
  expect(actual).toBeCloseTo(expected, -Math.log10(tolerance));
}
```

### 14.1.3 Tests del solver

```typescript
// tests/unit/engine/solver.test.ts
import { solve } from '@/engine/core/solver';

describe('Newton-Raphson solver', () => {
  it('converge para ácido fuerte HCl 0.1M', () => {
    const result = solve({ acid: HCl, concentration: 0.1 });
    expectPH(result.pH, 1.00);
  });

  it('converge para ácido débil HAc 0.1M', () => {
    const result = solve({ acid: HAc, concentration: 0.1 });
    expectPH(result.pH, 2.87);
  });

  it('converge para ácido poliprótico H₃PO₄ 0.1M', () => {
    const result = solve({ acid: H3PO4, concentration: 0.1 });
    expectPH(result.pH, 1.63);
  });

  it('converge para concentración extrema baja (10⁻⁸M HCl)', () => {
    const result = solve({ acid: HCl, concentration: 1e-8 });
    // A concentración tan baja, el agua domina
    expectPH(result.pH, 6.98, 0.05);
  });

  it('informa error de convergencia para parámetros imposibles', () => {
    expect(() => solve({ acid: HAc, concentration: -1 })).toThrow();
  });

  it('converge en ≤ 20 iteraciones', () => {
    const result = solve({ acid: H3PO4, concentration: 0.1 });
    expect(result.iterations).toBeLessThanOrEqual(20);
  });
});
```

### 14.1.4 Tests de especiación (fracciones α)

```typescript
// tests/unit/engine/speciation.test.ts
import { calcAlphas } from '@/engine/core/speciation';

describe('Fracciones α', () => {
  const H3PO4 = { pKa: [2.15, 7.20, 12.35] };

  it('α₀ ≈ 1 a pH muy bajo', () => {
    const alphas = calcAlphas(0, H3PO4.pKa);
    expectAlpha(alphas[0], 1.0, 0.01);
  });

  it('α₀ = α₁ = 0.5 en pH = pKa₁', () => {
    const alphas = calcAlphas(2.15, H3PO4.pKa);
    expectAlpha(alphas[0], 0.5);
    expectAlpha(alphas[1], 0.5);
  });

  it('suma de αs = 1 para cualquier pH', () => {
    for (let pH = 0; pH <= 14; pH += 0.5) {
      const alphas = calcAlphas(pH, H3PO4.pKa);
      const sum = alphas.reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 10);
    }
  });

  it('α₃ ≈ 1 a pH muy alto (14)', () => {
    const alphas = calcAlphas(14, H3PO4.pKa);
    expectAlpha(alphas[3], 1.0, 0.01);
  });
});
```

### 14.1.5 Tests de modelos de actividad

```typescript
// tests/unit/engine/activity.test.ts
import { debyeHuckel, davies, pitzer } from '@/engine/activity/models';

describe('Debye-Hückel', () => {
  it('γ = 1 a fuerza iónica 0', () => {
    expect(debyeHuckel(0, 1)).toBeCloseTo(1.0);
  });

  it('γ < 1 para iones en solución', () => {
    const gamma = debyeHuckel(0.1, 2); // I=0.1, z=2
    expect(gamma).toBeLessThan(1.0);
    expect(gamma).toBeGreaterThan(0);
  });
});

describe('Davies', () => {
  it('coincide con DH a bajas I', () => {
    const gammaDH = debyeHuckel(0.001, 1);
    const gammaD = davies(0.001, 1);
    expect(gammaD).toBeCloseTo(gammaDH, 2);
  });
});
```

### 14.1.6 Cobertura mínima por módulo

| Módulo | Archivos | Tests | Cobertura objetivo |
|--------|----------|-------|-------------------|
| Engine core (solver, speciation, titration) | 6 | ≥ 30 | ≥ 95% |
| Activity models | 2 | ≥ 10 | ≥ 90% |
| Temperature corrections | 1 | ≥ 6 | ≥ 90% |
| Complexation math | 3 | ≥ 15 | ≥ 90% |
| Precipitation math | 2 | ≥ 10 | ≥ 90% |
| Redox math | 2 | ≥ 10 | ≥ 90% |
| Lab tools math | 2 | ≥ 8 | ≥ 90% |
| **Total** | **18** | **≥ 89** | **≥ 90%** |

### 14.1.7 Entregables

- [ ] ≥ 89 tests unitarios del engine
- [ ] Cobertura ≥ 90% en engine y math
- [ ] Helpers de tolerancia numérica
- [ ] Tests de convergencia del solver
- [ ] Tests de edge cases (pH extremos, concentraciones 10⁻⁸)
- [ ] Tests de modelos de actividad

---

## 14.2 Tests de componentes React

**Objetivo**: Verificar que los componentes renderizan correctamente y responden a interacciones.

### 14.2.1 Framework

```typescript
// tests/helpers/render-with-providers.tsx
import { render } from '@testing-library/react';
import { ThemeProvider } from '@/features/theme/theme-provider';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';

export function renderWithProviders(ui: React.ReactElement) {
  return render(
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        {ui}
      </ThemeProvider>
    </I18nextProvider>
  );
}
```

### 14.2.2 Tests de componentes chart

```typescript
// tests/components/charts/chem-chart.test.tsx
import { renderWithProviders } from '../../helpers/render-with-providers';
import { ChemChart } from '@/components/charts/chem-chart';

describe('ChemChart', () => {
  it('renderiza sin errores con datos válidos', () => {
    const { container } = renderWithProviders(
      <ChemChart
        title="Test"
        xLabel="pH"
        yLabel="α"
        series={[{ label: 'Test', data: [{ x: 0, y: 1 }], color: '#000' }]}
      />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('muestra título del gráfico', () => {
    const { getByText } = renderWithProviders(
      <ChemChart title="Especiación" xLabel="pH" yLabel="α" series={[]} />
    );
    expect(getByText('Especiación')).toBeInTheDocument();
  });

  it('renderiza N series', () => {
    const series = Array.from({ length: 4 }, (_, i) => ({
      label: `Serie ${i}`,
      data: [{ x: 0, y: i * 0.25 }],
      color: `hsl(${i * 90}, 70%, 50%)`,
    }));
    const { container } = renderWithProviders(
      <ChemChart title="Multi" xLabel="x" yLabel="y" series={series} />
    );
    // Verificar que se crearon 4 series
    expect(container.querySelectorAll('[data-series]')).toHaveLength(4);
  });
});
```

### 14.2.3 Tests de componentes grid

```typescript
// tests/components/grids/chem-grid.test.tsx
import { renderWithProviders } from '../../helpers/render-with-providers';
import { ChemGrid } from '@/components/grids/chem-grid';

describe('ChemGrid', () => {
  const columns = [
    { field: 'name', headerName: 'Ácido' },
    { field: 'pKa', headerName: 'pKa' },
  ];
  const data = [
    { name: 'Acético', pKa: 4.76 },
    { name: 'Fosfórico', pKa: 2.15 },
  ];

  it('muestra headers correctos', () => {
    const { getByText } = renderWithProviders(
      <ChemGrid columns={columns} data={data} />
    );
    expect(getByText('Ácido')).toBeInTheDocument();
    expect(getByText('pKa')).toBeInTheDocument();
  });

  it('muestra datos en filas', () => {
    const { getByText } = renderWithProviders(
      <ChemGrid columns={columns} data={data} />
    );
    expect(getByText('Acético')).toBeInTheDocument();
    expect(getByText('4.76')).toBeInTheDocument();
  });

  it('filtra por búsqueda', async () => {
    const { getByRole, queryByText } = renderWithProviders(
      <ChemGrid columns={columns} data={data} searchable />
    );
    const searchInput = getByRole('searchbox');
    await userEvent.type(searchInput, 'Acético');
    expect(queryByText('Fosfórico')).not.toBeInTheDocument();
  });
});
```

### 14.2.4 Tests de módulos

| Componente | Tests | Verificaciones clave |
|-----------|-------|---------------------|
| ChemChart | 5 | Render, series, título, resize, export |
| ChemMultiChart | 3 | Render, overlay series, legend |
| ChemHeatmap | 3 | Render, color scale, data matrix |
| ChemGrid | 5 | Render, sort, filter, search, export |
| Cell renderers | 6 | Formula, badge, pH, sparkline, number, status |
| Acid selector | 3 | Render, search, select |
| Chemical Formula | 2 | Render subscripts, superscripts |
| Math Expression | 2 | KaTeX render, error handling |
| Language Switcher | 2 | Toggle, persistence |
| Step Explanation | 3 | Steps navigation, KaTeX, highlight |
| **Total** | **34** | |

### 14.2.5 Entregables

- [ ] ≥ 34 tests de componentes
- [ ] Helper de render con providers
- [ ] Mocking de scichart-engine para tests
- [ ] Tests de interacción (click, type, toggle)
- [ ] Tests de renderizado condicional (loading, error, empty states)

---

## 14.3 Tests de integración

**Objetivo**: Verificar que módulos trabajan correctamente juntos.

### 14.3.1 Flujos de integración

| Flujo | Componentes involucrados | Verificación |
|-------|------------------------|-------------|
| Ácido → Chart | Selector + Engine + ChemChart | Seleccionar ácido → se muestra curva correcta |
| Engine → Grid | Solver + ChemCompactGrid | Calcular → tabla muestra datos del engine |
| Session save/load | Módulos + IndexedDB | Guardar estado → restaurar idéntico |
| Export pipeline | ChemChart → PNG → Report → PDF | Gráfico exporta correctamente |
| i18n switch | Todos los componentes | Cambiar idioma → todos los textos cambian |

### 14.3.2 Ejemplo: flujo ácido-base completo

```typescript
// tests/integration/acid-base-workflow.test.ts
describe('Flujo ácido-base completo', () => {
  it('seleccionar ácido → calcular pH → mostrar especiación → mostrar titulación', async () => {
    const { getByText, getByRole } = renderWithProviders(<AcidBaseModule />);

    // 1. Seleccionar ácido
    const selector = getByRole('combobox', { name: /ácido/i });
    await userEvent.click(selector);
    await userEvent.click(getByText('Ácido acético'));

    // 2. Verificar pH calculado
    expect(getByText(/pH = 2\.87/)).toBeInTheDocument();

    // 3. Verificar que chart de especiación apareció
    expect(getByRole('img', { name: /especiación/i })).toBeInTheDocument();

    // 4. Navegar a titulación
    await userEvent.click(getByText(/titulación/i));
    expect(getByRole('img', { name: /titulación/i })).toBeInTheDocument();
  });
});
```

### 14.3.3 Entregables

- [ ] ≥ 5 tests de integración (tabla arriba)
- [ ] Flujo completo por módulo
- [ ] Test de persistencia (save → refresh → load)
- [ ] Test de export pipeline

---

## 14.4 Tests end-to-end (E2E)

**Objetivo**: Verificar flujos completos de usuario en un navegador real.

### 14.4.1 Framework: Playwright

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  webServer: {
    command: 'pnpm dev',
    port: 5173,
    reuseExistingServer: true,
  },
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
});
```

### 14.4.2 Specs E2E

| Spec | Flujo | Pasos |
|------|-------|-------|
| navigation | Navegación general | Dashboard → cada módulo → volver |
| acid-base-flow | Análisis ácido-base | Seleccionar ácido → ver especiación → titulación → buffer |
| complexation-flow | Análisis complejación | Seleccionar metal → ver αY → calcular K' |
| lab-tools-flow | Herramientas lab | Preparar solución → planificar titulación |
| education-flow | Plataforma educativa | Abrir ruta → completar lección → resolver ejercicio |
| export-flow | Exportar datos | Crear gráfico → exportar PNG → crear reporte |
| pwa-install | Instalación PWA | Verificar manifest → simular install prompt |

### 14.4.3 Ejemplo E2E

```typescript
// tests/e2e/acid-base-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Análisis ácido-base', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('flujo completo de especiación', async ({ page }) => {
    // Navegar al módulo
    await page.click('[data-testid="nav-acid-base"]');
    await expect(page).toHaveURL(/acid-base/);

    // Seleccionar ácido
    await page.click('[data-testid="acid-selector"]');
    await page.fill('[data-testid="acid-search"]', 'fosfórico');
    await page.click('text=Ácido fosfórico');

    // Verificar chart visible
    const chart = page.locator('[data-testid="speciation-chart"]');
    await expect(chart).toBeVisible();

    // Verificar pH mostrado
    await expect(page.locator('text=pH')).toBeVisible();

    // Mover slider de concentración
    const slider = page.locator('[data-testid="concentration-slider"]');
    await slider.fill('0.01');

    // Verificar que chart se actualiza (esperar re-render)
    await page.waitForTimeout(300);
    await expect(chart).toBeVisible();
  });

  test('exportar gráfico como PNG', async ({ page }) => {
    await page.click('[data-testid="nav-acid-base"]');
    await page.click('[data-testid="acid-selector"]');
    await page.click('text=Ácido acético');

    // Abrir menú de exportación
    await page.click('[data-testid="export-button"]');
    
    // Descargar PNG
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('[data-testid="export-png"]'),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.png$/);
  });
});
```

### 14.4.4 Entregables

- [ ] ≥ 7 specs E2E (tabla arriba)
- [ ] Configuración Playwright para 3 navegadores
- [ ] Screenshots on failure
- [ ] Traces para debugging
- [ ] Page object helpers reutilizables

---

## 14.5 Validación científica

**Objetivo**: Verificar la exactitud de los cálculos comparando con valores publicados.

### 14.5.1 Casos de referencia

La app actual ya tiene 22 casos de referencia en `src/layouts/full/data/reference-cases.ts`. Sistematizar como tests:

```typescript
// tests/scientific/reference-cases.test.ts
import { REFERENCE_CASES } from '@/data/reference-cases';

describe('Casos de referencia publicados', () => {
  REFERENCE_CASES.forEach((refCase) => {
    it(`${refCase.name}: pH = ${refCase.expectedPH}`, () => {
      const result = solve({
        acid: refCase.acid,
        concentration: refCase.concentration,
        ionicStrength: refCase.ionicStrength,
        temperature: refCase.temperature,
      });
      expectPH(result.pH, refCase.expectedPH, refCase.tolerance ?? 0.02);
    });
  });
});
```

### 14.5.2 Matriz de validación

| # | Ácido | C (M) | I | T (°C) | pH esperado | Fuente | Tolerancia |
|---|-------|-------|---|---------|------------|--------|-----------|
| 1 | HCl | 0.1 | 0 | 25 | 1.00 | Analítico | ± 0.01 |
| 2 | HAc | 0.1 | 0 | 25 | 2.87 | Harris 9th | ± 0.02 |
| 3 | H₃PO₄ | 0.1 | 0 | 25 | 1.63 | Skoog 9th | ± 0.02 |
| 4 | NaH₂PO₄ | 0.1 | 0 | 25 | 4.68 | Harris 9th | ± 0.03 |
| 5 | H₂CO₃ | 0.1 | 0 | 25 | 3.91 | Stumm & Morgan | ± 0.02 |
| 6 | HAc/NaAc | 0.1/0.1 | 0 | 25 | 4.76 | Henderson-H. | ± 0.01 |
| 7 | H₃PO₄ | 0.01 | 0.5 | 25 | 2.25 | Calculado DH | ± 0.05 |
| 8 | HF | 0.1 | 0 | 25 | 2.08 | Harris 9th | ± 0.02 |
| 9 | NH₄⁺ | 0.1 | 0 | 25 | 5.12 | Harris 9th | ± 0.02 |
| 10 | H₂C₂O₄ | 0.1 | 0 | 25 | 1.29 | Skoog 9th | ± 0.02 |
| ... | ... | ... | ... | ... | ... | ... | ... |
| 22+ | Diversos | Diversas | 0-1 | 15-50 | Diversos | Literatura | Variable |

### 14.5.3 Tests de estabilidad numérica

```typescript
// tests/scientific/numerics-stability.test.ts
describe('Estabilidad numérica', () => {
  it('maneja pH 0 sin overflow', () => {
    const result = solve({ acid: HCl, concentration: 1.0 });
    expect(isFinite(result.pH)).toBe(true);
  });

  it('maneja pH 14 sin underflow', () => {
    const result = solve({ base: NaOH, concentration: 1.0 });
    expect(isFinite(result.pH)).toBe(true);
  });

  it('maneja concentración 10⁻¹⁰ sin NaN', () => {
    const result = solve({ acid: HAc, concentration: 1e-10 });
    expect(isNaN(result.pH)).toBe(false);
  });

  it('fracciones α nunca son negativas', () => {
    for (let pH = -1; pH <= 15; pH += 0.1) {
      const alphas = calcAlphas(pH, [2.15, 7.20, 12.35]);
      alphas.forEach(a => expect(a).toBeGreaterThanOrEqual(0));
    }
  });

  it('balance de masa se conserva ± 10⁻¹⁰', () => {
    const result = solve({ acid: H3PO4, concentration: 0.1 });
    expect(Math.abs(result.massBalance)).toBeLessThan(1e-10);
  });
});
```

### 14.5.4 Entregables

- [ ] ≥ 22 casos de referencia como tests automatizados
- [ ] Tests de estabilidad numérica en extremos
- [ ] Tests de edge cases (C → 0, pH extremos)
- [ ] Balance de masa verificado en todos los casos
- [ ] Documentación de fuentes bibliográficas

---

## 14.6 Tests de accesibilidad

**Objetivo**: Verificar cumplimiento WCAG 2.1 AA de forma automatizada.

### 14.6.1 Axe-core integration

```typescript
// tests/a11y/axe-audit.test.ts
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

const PAGES = [
  { name: 'Dashboard', component: DashboardView },
  { name: 'Acid-Base', component: AcidBaseModule },
  { name: 'Complexation', component: ComplexationModule },
  { name: 'Lab Tools', component: LabToolsModule },
  { name: 'Education', component: EducationModule },
];

describe.each(PAGES)('Accesibilidad: $name', ({ component: Component }) => {
  it('no tiene violaciones axe', async () => {
    const { container } = renderWithProviders(<Component />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### 14.6.2 Tests de navegación por teclado

```typescript
// tests/a11y/keyboard-navigation.test.ts
describe('Navegación por teclado', () => {
  it('Tab navega por la sidebar en orden', async () => {
    const { getByTestId } = renderWithProviders(<AppShell />);
    
    // Tab through navigation items
    await userEvent.tab();
    expect(getByTestId('nav-dashboard')).toHaveFocus();
    
    await userEvent.tab();
    expect(getByTestId('nav-acid-base')).toHaveFocus();
    
    await userEvent.tab();
    expect(getByTestId('nav-complexation')).toHaveFocus();
  });

  it('Escape cierra modals', async () => {
    const { getByRole, queryByRole } = renderWithProviders(<ExportDialog open />);
    
    await userEvent.keyboard('{Escape}');
    expect(queryByRole('dialog')).not.toBeInTheDocument();
  });
});
```

### 14.6.3 Entregables

- [ ] Axe audit en ≥ 5 componentes de página
- [ ] Tests de keyboard navigation
- [ ] Tests de focus management
- [ ] 0 violaciones nivel A/AA

---

## 14.7 Benchmarks de rendimiento

**Objetivo**: Medir y monitorear rendimiento de cálculos y renderizado.

### 14.7.1 Benchmarks de cálculo

```typescript
// tests/performance/calculation-benchmarks.test.ts
describe('Benchmarks de cálculo', () => {
  it('solver Newton-Raphson < 1ms para monoprótico', () => {
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      solve({ acid: HAc, concentration: 0.1 });
    }
    const elapsed = (performance.now() - start) / 1000;
    expect(elapsed).toBeLessThan(1); // < 1ms promedio
  });

  it('solver Newton-Raphson < 5ms para poliprótico', () => {
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      solve({ acid: H3PO4, concentration: 0.1 });
    }
    const elapsed = (performance.now() - start) / 1000;
    expect(elapsed).toBeLessThan(5);
  });

  it('curva de titulación (200 puntos) < 50ms', () => {
    const start = performance.now();
    buildTitrationCurve({
      acid: H3PO4,
      concentration: 0.1,
      volume: 25,
      titrant: { concentration: 0.1 },
      points: 200,
    });
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(50);
  });

  it('heatmap 100×100 < 2000ms', () => {
    const start = performance.now();
    generateHeatmapData({
      xSteps: 100,
      ySteps: 100,
      fn: (pH, logC) => calcAlphas(pH, [2.15, 7.20, 12.35])[0],
    });
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(2000);
  });
});
```

### 14.7.2 Targets de rendimiento

| Operación | Target | Medición |
|-----------|--------|---------|
| Solver monoprótico | < 1 ms | `performance.now()` |
| Solver poliprótico | < 5 ms | `performance.now()` |
| Curva titulación (200 pts) | < 50 ms | `performance.now()` |
| Especiación (500 pts) | < 20 ms | `performance.now()` |
| Heatmap 100×100 | < 2 s | `performance.now()` |
| Chart render | < 100 ms | FPS monitor |
| Bundle initial load | < 500 KB gz | Build output |
| Lighthouse Performance | ≥ 90 | Lighthouse CI |

### 14.7.3 Entregables

- [ ] ≥ 5 benchmarks de cálculo
- [ ] Benchmark de generación de heatmap
- [ ] Test de bundle size < 500 KB
- [ ] Todos los benchmarks en CI

---

## 14.8 Infraestructura de CI/CD

**Objetivo**: Ejecutar todos los tests automáticamente en cada push/PR.

### 14.8.1 GitHub Actions workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:unit -- --coverage
      - uses: codecov/codecov-action@v4

  component-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:components

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: npx playwright install --with-deps
      - run: pnpm test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  scientific-validation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:scientific

  a11y-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:a11y

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - uses: treosh/lighthouse-ci-action@v12
        with:
          configPath: ./lighthouserc.json
```

### 14.8.2 Scripts de package.json

```jsonc
{
  "scripts": {
    "test": "vitest run",
    "test:unit": "vitest run tests/unit",
    "test:components": "vitest run tests/components",
    "test:integration": "vitest run tests/integration",
    "test:scientific": "vitest run tests/scientific",
    "test:a11y": "vitest run tests/a11y",
    "test:e2e": "playwright test",
    "test:perf": "vitest run tests/performance",
    "test:all": "vitest run && playwright test",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

### 14.8.3 Entregables

- [ ] GitHub Actions workflow completo
- [ ] 6 jobs paralelos (unit, components, e2e, scientific, a11y, lighthouse)
- [ ] Codecov integration para coverage
- [ ] Playwright artifacts on failure
- [ ] Lighthouse CI con thresholds
- [ ] Scripts de npm para cada suite

---

## Resumen cuantitativo

```
┌─── Resumen de tests ──────────────────────────────────────┐
│                                                           │
│  Tests unitarios (engine/math):         ≥  89             │
│  Tests de componentes (React):          ≥  34             │
│  Tests de integración:                  ≥   5             │
│  Tests E2E (Playwright):                ≥   7             │
│  Tests científicos (referencia):        ≥  22             │
│  Tests de accesibilidad:                ≥   7             │
│  Benchmarks de rendimiento:             ≥   5             │
│  ─────────────────────────────────────────────            │
│  TOTAL                                  ≥ 169             │
│                                                           │
│  Cobertura objetivo:  ≥ 90% engine, ≥ 80% componentes     │
│  Navegadores:         Chromium, Firefox, WebKit           │
│  CI:                  GitHub Actions (6 jobs paralelos)   │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## Criterios de aceptación

| # | Criterio | Verificación |
|---|----------|-------------|
| 1 | ≥ 169 tests ejecutan sin errores | `pnpm test:all` |
| 2 | Cobertura engine ≥ 90% | Codecov |
| 3 | 22 casos de referencia pasan con tolerancia publicada | `pnpm test:scientific` |
| 4 | E2E pasa en Chromium, Firefox, WebKit | `pnpm test:e2e` |
| 5 | 0 violaciones axe nivel A/AA | `pnpm test:a11y` |
| 6 | Solver < 5ms para polipróticos | Benchmark |
| 7 | Bundle < 500 KB gzipped | Build output |
| 8 | Lighthouse Performance ≥ 90 | Lighthouse CI |
| 9 | CI pipeline ejecuta en < 10 minutos | GitHub Actions |
| 10 | Todos los tests documentan qué verifican | Code review |

---

## Referencias cruzadas

- → Engine bajo test: [Tarea 04](./04-motor-equilibrio-universal.md)
- → Charts bajo test: [Tarea 02](./02-sistema-graficos-scichart.md)
- → Grids bajo test: [Tarea 03](./03-sistema-grids-scigrid.md)
- → Módulos bajo test: [Tareas 06–10](./06-modulo-acido-base.md)
- → Accesibilidad spec: [Tarea 13 §13.2](./13-i18n-accesibilidad-pwa.md#132-accesibilidad-wcag-21-aa)
- → Rendimiento spec: [Tarea 13 §13.5](./13-i18n-accesibilidad-pwa.md#135-rendimiento-y-optimización)
- → Casos de referencia originales: `src/layouts/full/data/reference-cases.ts`
- → Índice maestro: [00-INDICE-MAESTRO.md](./00-INDICE-MAESTRO.md)

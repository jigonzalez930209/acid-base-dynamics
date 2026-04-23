# Roadmap de desarrollo

## Estado actual

Línea base completada: base Vite + React + TypeScript + shadcn + Tailwind + i18n + theming, motor ácido-base, curvas de titulación, capacidad buffer, complejación comparativa, precipitación, redox, overlays avanzados, exportes, render químico correcto y refactor de componentes TSX para mantener la UI modular.

## Visión de siguiente nivel

La app ya dejó de ser un visor bonito de curvas. El siguiente salto es convertirla en una plataforma de análisis químico que sirva para estudiar, comparar, planificar y documentar sistemas reales de laboratorio. El foco no debe estar sólo en añadir más módulos, sino en unificar datos, ecuaciones, validación científica, flujos de trabajo y resultados exportables.

## Principios rectores

- Cada cálculo debe declarar sus supuestos, límites de validez, temperatura, fuerza iónica y origen de constantes.
- Cada familia química nueva debe entrar por descriptores y motores reutilizables, no por lógica aislada en componentes.
- Cada vista debe ser útil tanto para exploración rápida como para análisis técnico reproducible.
- Cada resultado importante debe poder explicarse, compararse, exportarse y trazarse hasta su fuente.

## Fase 1 · Blindaje científico y trazabilidad

Objetivo: convertir la base actual en una plataforma científicamente auditable.

1. Consolidar una base maestra de datos químicos. Pautas a cumplir: cada especie, constante, pKa, logK, logBeta, Ksp y dato auxiliar debe registrar fuente, temperatura, fuerza iónica, unidad, nota de validez y fecha de revisión.
2. Crear una matriz de validación cruzada. Pautas a cumplir: cada módulo debe compararse contra al menos una fuente bibliográfica o caso patrón, con tolerancias numéricas explícitas y tests de regresión automatizados.
3. Normalizar unidades y conversiones. Pautas a cumplir: soportar mol/L, mmol/L, µmol/L, mg/L, ppm y % m/v con conversiones coherentes, redondeo técnico y advertencias cuando una conversión dependa de masa molar o densidad.
4. Declarar supuestos del modelo por dominio. Pautas a cumplir: cada panel debe exponer si usa actividades o concentraciones, si asume solución ideal, si ignora fuerza iónica y cuáles son los rangos de uso recomendados.
5. Construir un banco de casos de referencia de laboratorio. Pautas a cumplir: incluir al menos 10 casos patrón por dominio principal, con entradas, resultados esperados, explicación química y estado de verificación.

## Fase 2 · Lenguaje químico unificado

Objetivo: dar una sintaxis común a especies, equilibrios, balances y observables.

1. Diseñar un descriptor universal de especies. Pautas a cumplir: debe soportar fórmula, carga, estado ácido-base, estequiometría, nombre localizado, alias, fase, hidratación y representación renderizable.
2. Diseñar un descriptor universal de equilibrios. Pautas a cumplir: debe almacenar reactivos, productos, constantes, dependencia con temperatura, restricciones del modelo, notas de competencia y metadatos bibliográficos.
3. Implementar descriptores de balances. Pautas a cumplir: cada sistema debe declarar balance de materia, balance de carga, restricciones analíticas y variables observables sin duplicar fórmulas en la UI.
4. Crear un DSL o esquema serializable de escenarios. Pautas a cumplir: debe permitir guardar y reabrir sistemas con presets, comparativas, condiciones experimentales y comentarios, manteniendo compatibilidad futura con versionado.
5. Unificar el render químico en toda la app. Pautas a cumplir: fórmulas, ecuaciones, especies y notas deben salir del mismo pipeline visual, con soporte consistente para subíndices, superíndices, cargas, estados y notación mixta.

## Fase 3 · Motor universal de equilibrio

Objetivo: pasar de calculadoras separadas a un resolver químico acoplado.

1. Integrar un solver de equilibrio multicomponente. Pautas a cumplir: debe resolver sistemas con ácido-base, complejación, precipitación y redox acoplados cuando compartan especies y restricciones.
2. Incorporar balance global de carga y masa. Pautas a cumplir: el motor debe cerrar balances completos por sistema, reportar residuos y marcar cuando un escenario no converja o viole consistencia química.
3. Añadir correcciones por actividad y fuerza iónica. Pautas a cumplir: incluir modelos aproximados utilizables en laboratorio docente y una ruta extensible para modelos más rigurosos en medios no ideales.
4. Añadir correcciones por temperatura. Pautas a cumplir: permitir extrapolación controlada de constantes, marcar incertidumbre de la corrección y diferenciar claramente dato tabulado de dato estimado.
5. Fortalecer la estabilidad numérica y el diagnóstico. Pautas a cumplir: exponer convergencia, iteraciones, tolerancia, sensibilidad a condiciones iniciales y mensajes útiles cuando el sistema sea mal condicionado.

## Fase 4 · Visualización analítica avanzada

Objetivo: ofrecer vistas que realmente ayuden a decidir en laboratorio y docencia.

1. Crear mapas de predominio multivariable. Pautas a cumplir: soportar ejes como pH, pL, potencial, concentración total o temperatura, con regiones etiquetadas y transiciones interpretables.
2. Ampliar las comparativas multi-escenario. Pautas a cumplir: permitir comparar al menos 4 escenarios bien diferenciados, con filtros, leyendas legibles, resaltado de diferencias y exporte de tablas comparativas.
3. Incorporar análisis de sensibilidad e incertidumbre. Pautas a cumplir: cada parámetro crítico debe poder barrerse, graficarse y resumirse con bandas, escenarios extremos y puntos de mayor vulnerabilidad del método.
4. Añadir ventanas operativas experimentales. Pautas a cumplir: la UI debe señalar zonas recomendadas de trabajo, límites por interferencias, umbrales de titulación y regiones donde el método pierde robustez.
5. Crear salidas gráficas listas para informe. Pautas a cumplir: los gráficos deben poder exportarse con títulos, leyendas, unidades, notas técnicas y estilos aptos para informe, docencia o publicación interna.

## Fase 5 · Flujo de trabajo de laboratorio

Objetivo: transformar la app en una herramienta para preparar y ejecutar métodos.

1. Implementar un modo de preparación de soluciones. Pautas a cumplir: calcular masas, diluciones, factores de corrección, incertidumbre básica y pasos operativos según concentración objetivo y material disponible.
2. Añadir planificación de titulaciones y ensayos. Pautas a cumplir: estimar volúmenes de trabajo, rango útil de indicador o electrodo, concentración óptima del titulante y puntos críticos del procedimiento.
3. Incorporar evaluación de interferencias. Pautas a cumplir: identificar especies competitivas, efectos de complejantes, precipitados indeseados y ventanas en las que la selectividad del método cae.
4. Añadir presets de matrices reales. Pautas a cumplir: incluir agua, alimentos, farmacéutica, minerales y muestras docentes, con variables típicas, notas de manipulación y advertencias metodológicas.
5. Generar fichas operativas del método. Pautas a cumplir: cada escenario debe poder producir una ficha breve con reactivos, condiciones, cálculos clave, riesgos analíticos y checklist de ejecución.

## Fase 6 · Docencia, explicación y reproducibilidad

Objetivo: hacer que la app no sólo calcule, sino que enseñe y deje evidencia reproducible.

1. Crear un motor de explicación paso a paso. Pautas a cumplir: debe justificar por qué domina una especie, por qué cambia una curva y por qué una condición experimental mejora o empeora el método.
2. Añadir rutas guiadas de aprendizaje. Pautas a cumplir: cada dominio debe tener recorridos progresivos con objetivos, preguntas clave, errores frecuentes y mini-validaciones del razonamiento.
3. Soportar guardado reproducible de sesiones. Pautas a cumplir: cada estudio debe guardar entradas, versión del modelo, idioma, supuestos, fecha y notas del usuario para poder reabrirse sin ambigüedad.
4. Añadir exportes pedagógicos y técnicos. Pautas a cumplir: permitir salidas en formato breve para clase y formato técnico para laboratorio, manteniendo coherencia entre números, ecuaciones y narrativa.
5. Mejorar accesibilidad y lectura técnica. Pautas a cumplir: asegurar contraste, navegación por teclado, lectura móvil real, tipografía química legible y textos claros en español e inglés.

## Fase 7 · Escalado, interoperabilidad y ecosistema

Objetivo: abrir la plataforma a dominios más grandes y a integración externa.

1. Extender el catálogo de dominios químicos. Pautas a cumplir: incorporar complejometría avanzada, diagramas de Pourbaix, buffers multicomponente, especiación ambiental y métodos híbridos entre dominios.
2. Abrir importación y exportación de datos. Pautas a cumplir: soportar CSV, JSON y plantillas tabulares para escenarios, resultados y bibliotecas químicas, con validación antes de importar.
3. Diseñar arquitectura de módulos o plugins científicos. Pautas a cumplir: cada nuevo dominio debe conectarse al mismo núcleo de especies, equilibrios, observables y render, sin duplicar infraestructura.
4. Preparar integración con flujos externos. Pautas a cumplir: definir contratos para conectar con LIMS, cuadernos digitales, repositorios docentes o catálogos internos sin acoplar la UI a un proveedor concreto.
5. Establecer gobernanza de calidad y releases. Pautas a cumplir: definir criterios de aceptación científica, revisión por pares internos, changelog técnico, benchmark de rendimiento y plan de mantenimiento de datasets.

## Criterios transversales de arquitectura

- Mantener `src/**/*.tsx` por debajo de 200 líneas siempre que sea posible, extrayendo secciones visuales y lógica reusable.
- Mantener la matemática y las transformaciones químicas en archivos `.ts`, no incrustadas en componentes visuales.
- Centralizar textos en i18n, datos químicos en constantes versionadas y supuestos del modelo en estructuras explícitas.
- No introducir nuevas vistas si antes no queda claro qué observable químico producen, cómo se valida y cómo se explica.
- Tratar `ROADMAP.md` como documento maestro de estrategia y usarlo como base para sincronizar luego la versión resumida mostrada dentro de la app.

---

## Módulo `/phosph` · PhosphateLab — Validación visual en tiempo real para TP

### Contexto y propósito

Ruta dedicada al Trabajo Práctico de fosfatos. Funciona en modo **Zero-Backend**: no guarda nada, no requiere servidor. El alumno abre la página desde su celular o la PC del laboratorio, ingresa sus valores de la experiencia (pH medido, volumen gastado, indicador elegido) y recibe instantáneamente la curva teórica de titulación con su punto experimental superpuesto, el error porcentual respecto al punto de equivalencia y retroalimentación didáctica sobre su decisión de indicador.

### Arquitectura de archivos

```
src/layouts/phosph/
├── index.tsx                     # Entry point de la ruta /#/phosph, layout mobile-first
├── phosph-context.tsx            # Estado compartido: muestra, pH, volumen, indicador
├── views/
│   ├── input-view.tsx            # Paso 1: selector de muestra + lectura de pH + volumen
│   ├── indicator-view.tsx        # Paso 2: selector de indicador con bandas de viraje
│   └── result-view.tsx           # Paso 3: curva + punto experimental + error + feedback
├── components/
│   ├── sample-selector.tsx       # 4 variantes de buffer fosfato (presets de concentración)
│   ├── ph-input.tsx              # Entrada de pH con validación de rango (0–14)
│   ├── volume-input.tsx          # Entrada de volumen en mL con validación numérica
│   ├── indicator-picker.tsx      # Lista de indicadores con rangos de viraje visuales
│   ├── titration-chart.tsx       # Curva teórica pH vs V con overlay del punto experimental
│   ├── error-badge.tsx           # Visualización del % error con código de color
│   └── feedback-card.tsx         # Texto didáctico contextual según resultado
└── engine/
    ├── phosphate-system.ts       # Descriptor H₃PO₄: pKa₁=2.15, pKa₂=7.20, pKa₃=12.35
    ├── titration-curve.ts        # Cálculo de pH vs V para cada variante de muestra
    ├── equivalence-finder.ts     # Localización de puntos de equivalencia por escalonamiento
    ├── error-calculator.ts       # % error respecto al volumen de equivalencia teórico
    └── indicators.ts             # Datos de indicadores: nombre, pKin, color de viraje
```

### Fase P-1 · Sistema fosfato y motor de curvas

Objetivo: tener el núcleo científico validado antes de construir cualquier UI.

1. Implementar `phosphate-system.ts`. Pautas a cumplir: declarar las tres constantes de disociación con fuente bibliográfica, temperatura de referencia (25 °C) y supuestos del modelo (actividades = concentraciones, solución ideal). Incluir las cuatro muestras de buffer con sus concentraciones analíticas totales de fosfato y las concentraciones del titulante (NaOH 0.1 mol/L).
2. Implementar `titration-curve.ts`. Pautas a cumplir: calcular pH en función del volumen de NaOH agregado para cada muestra, usando balance de protones y balance de masa. El vector de puntos debe cubrir de 0 mL hasta 1.5 veces el volumen del segundo equivalente, con densidad de puntos mayor en los saltos de pH.
3. Implementar `equivalence-finder.ts`. Pautas a cumplir: localizar V₁eq y V₂eq para cada muestra con criterio de segunda derivada (máximo de dpH/dV). Exponer la función como utilidad pura con tests unitarios.
4. Implementar `error-calculator.ts`. Pautas a cumplir: calcular error relativo porcentual `(V_experimental − V_eq) / V_eq × 100` para el punto de equivalencia más cercano al volumen ingresado. Distinguir claramente entre error positivo (gastó más de lo necesario) y negativo.
5. Implementar `indicators.ts`. Pautas a cumplir: incluir los indicadores usados en el TP (naranja de metilo, azul de bromocresol, verde de bromocresol, rojo de fenol, fenolftaleína, timolftaleína) con sus rangos de viraje numéricos y colores visuales. Marcar cuál es el recomendado para cada punto de equivalencia.

### Fase P-2 · Contexto y flujo de estado

Objetivo: coordinar el estado entre los tres pasos del flujo sin props drilling.

1. Implementar `phosph-context.tsx`. Pautas a cumplir: usar `useReducer` para manejar las transiciones de estado (selección de muestra → entrada de valores → resultado). Exponer funciones tipadas para cada acción: `selectSample`, `setPH`, `setVolume`, `setIndicator`, `reset`.
2. Diseñar el esquema de tipos del contexto. Pautas a cumplir: definir `PhosphSample`, `PhosphInput`, `PhosphResult` y `PhosphStep` como tipos separados en un archivo `types.ts` dentro del layout. No mezclar tipos de UI con tipos del motor.
3. Conectar el motor al contexto. Pautas a cumplir: calcular la curva teórica y el error de forma reactiva al cambiar la muestra o los valores. Usar `useMemo` para evitar recálculos innecesarios en renders intermedios.

### Fase P-3 · UI de ingreso de datos (mobile-first)

Objetivo: flujo de tres pasos limpio y usable desde un celular en el laboratorio.

1. Implementar `sample-selector.tsx`. Pautas a cumplir: mostrar las cuatro muestras como tarjetas con nombre, descripción breve y composición de fosfato. La selección debe ser táctil, con área mínima de 44×44 px y contraste suficiente para entornos con luz de laboratorio.
2. Implementar `ph-input.tsx` y `volume-input.tsx`. Pautas a cumplir: inputs numéricos con teclado numérico nativo en móvil (`inputMode="decimal"`), validación en tiempo real (pH entre 0 y 14, volumen entre 0 y 50 mL), mensajes de error inline sin bloquear el flujo.
3. Implementar `indicator-picker.tsx`. Pautas a cumplir: mostrar cada indicador con su banda de viraje visual (franja de color en el rango pH correspondiente). Resaltar los recomendados para la muestra seleccionada. Permitir selección única.
4. Implementar `input-view.tsx` e `indicator-view.tsx`. Pautas a cumplir: cada vista debe caber en una pantalla de 360 px de ancho sin scroll horizontal. Navegación hacia adelante sólo si los campos requeridos están completos.

### Fase P-4 · Visualización de resultados

Objetivo: que el alumno entienda su resultado en menos de 10 segundos de lectura.

1. Implementar `titration-chart.tsx`. Pautas a cumplir: renderizar la curva teórica como línea continua, los puntos de equivalencia como marcadores verticales etiquetados (V₁eq, V₂eq), el rango de viraje del indicador como banda horizontal semitransparente y el punto experimental del alumno como marcador diferenciado (círculo con borde). El gráfico debe ser legible a 360 px de ancho.
2. Implementar `error-badge.tsx`. Pautas a cumplir: mostrar el error porcentual con código de color (verde ≤ 2%, amarillo 2–5%, rojo > 5%) y un icono que indique si el alumno gastó de más o de menos. No mostrar más de dos cifras significativas.
3. Implementar `feedback-card.tsx`. Pautas a cumplir: generar texto contextual en función del error y la elección de indicador. Debe cubrir al menos cuatro casos: indicador correcto + error bajo, indicador correcto + error alto, indicador incorrecto + viraje fuera del salto, indicador incorrecto + viraje dentro del salto por azar.
4. Implementar `result-view.tsx`. Pautas a cumplir: ordenar los elementos por jerarquía visual (primero el gráfico, luego el error, luego el feedback). Incluir botón de reinicio y, opcionalmente, un botón para copiar el resumen de resultados como texto plano (para transcribir al Excel del laboratorio).

### Fase P-5 · Integración, i18n y accesibilidad

Objetivo: ruta operativa y lista para el aula.

1. Registrar la ruta `/#/phosph` en `main.tsx`. Pautas a cumplir: importar el layout de forma lazy (`React.lazy`) para no afectar el tiempo de carga de las rutas existentes.
2. Añadir strings i18n. Pautas a cumplir: todos los textos visibles en el layout deben estar en `messages.ts` bajo el namespace `phosph.*`. Soportar español como lengua primaria e inglés como secundaria.
3. Validar accesibilidad móvil. Pautas a cumplir: el flujo completo debe poder ejecutarse sin mouse, con navegación por teclado virtual, etiquetas ARIA en los inputs y foco gestionado al avanzar entre pasos.
4. Escribir tests de regresión del motor. Pautas a cumplir: cubrir al menos dos muestras con valores conocidos de V₁eq y V₂eq, verificar que el error sea cero cuando el volumen ingresado coincide con el teórico y que el feedback cambie correctamente al cruzar los umbrales de 2% y 5%.

---

## Módulo `/doc` · DocDashboard — Análisis masivo de resultados del TP

### Contexto y propósito

Ruta dedicada al docente-investigador para el análisis post-TP. Funciona en modo **Client-Side Data Processing**: el docente carga su archivo Excel (hasta ~2400 filas por cohorte) directamente en el navegador. SheetJS lo parsea localmente. No se sube ningún dato a internet. La web genera automáticamente las figuras del paper y el resumen estadístico, listos para exportar a congreso.

### Arquitectura de archivos

```
src/layouts/doc/
├── index.tsx                     # Entry point de la ruta /#/doc, layout desktop-first
├── doc-context.tsx               # Estado global: dataset parseado, filtros activos, selección
├── views/
│   ├── upload-view.tsx           # Zona de carga + mapeo de columnas
│   ├── validate-view.tsx         # Preview de datos + errores de validación
│   ├── explore-view.tsx          # Filtros, estadísticas de resumen, tabla agregada
│   ├── charts-view.tsx           # Todas las figuras listas para el congreso
│   └── export-view.tsx           # Exportación de figuras, CSV y reporte imprimible
├── components/
│   ├── file-dropzone.tsx         # Drag & drop o click para .xlsx / .csv
│   ├── column-mapper.tsx         # Mapeo de columnas del Excel al esquema esperado
│   ├── data-preview-table.tsx    # Tabla paginada del dataset cargado
│   ├── filter-panel.tsx          # Filtros por comisión, semana, muestra y resultado
│   ├── sankey-chart.tsx          # Flujo: muestra → pH → indicador → resultado
│   ├── violin-chart.tsx          # Comparación 1er intento vs duplicado por muestra
│   ├── error-histogram.tsx       # Distribución de error % segmentada por muestra
│   ├── summary-stats-card.tsx    # N, media, desvío, mediana, IQR por grupo
│   └── export-panel.tsx          # Descarga SVG/PNG por figura + CSV + reporte HTML
└── engine/
    ├── xlsx-parser.ts            # Wrapper de SheetJS: lectura y normalización de filas
    ├── schema.ts                 # Columnas esperadas, tipos, rangos válidos y aliases
    ├── aggregator.ts             # Estadísticas: media, desvío, mediana, IQR, percentiles
    ├── classifier.ts             # Clasificación éxito/fallo por tolerancia configurable
    ├── sankey-builder.ts         # Construcción de nodos y enlaces para el diagrama Sankey
    └── report-builder.ts         # Ensamblado del reporte HTML imprimible
```

### Fase D-1 · Parser y esquema de datos

Objetivo: tener la capa de ingesta robusta antes de escribir cualquier visualización.

1. Añadir SheetJS (`xlsx`) como dependencia. Pautas a cumplir: importar sólo los módulos necesarios para reducir bundle size. Verificar que la licencia sea compatible con el despliegue en GitHub Pages.
2. Implementar `schema.ts`. Pautas a cumplir: definir el tipo `StudentRow` con los campos: `studentId`, `commission`, `week`, `sample` (1–4), `phRead`, `volumeAttempt1`, `indicatorChosen`, `volumeDuplicate`, `notes`. Cada campo debe declarar tipo TypeScript, rango válido, si es requerido y aliases de columna aceptados para tolerar variaciones en el nombre del encabezado del Excel.
3. Implementar `xlsx-parser.ts`. Pautas a cumplir: leer el archivo como `ArrayBuffer`, parsear con SheetJS, extraer la primera hoja, mapear filas al esquema usando el mapeo de columnas provisto por el usuario, coercionar tipos (string a número donde corresponda) y retornar `{ rows: StudentRow[], errors: ParseError[] }`.
4. Diseñar `ParseError`. Pautas a cumplir: incluir fila, columna, valor recibido, valor esperado y un mensaje legible en español. Distinguir entre errores que impiden el uso del registro (tipo incorrecto, campo requerido vacío) y advertencias que permiten usarlo con cautela (campo opcional ausente, valor en límite).

### Fase D-2 · Motor de análisis

Objetivo: derivar todos los observables estadísticos del dataset de forma pura y testeada.

1. Implementar `classifier.ts`. Pautas a cumplir: clasificar cada fila como `success` (error ≤ umbral, configurable, por defecto 2%) o `fail` para el primer intento y para el duplicado por separado. Exponer también `improved` (fallo en intento 1, éxito en duplicado) y `degraded` (éxito en intento 1, fallo en duplicado).
2. Implementar `aggregator.ts`. Pautas a cumplir: calcular por grupo (muestra, comisión, semana o combinación) los siguientes estadísticos: N, media, mediana, desvío estándar muestral, IQR, percentil 5 y 95, tasa de éxito en intento 1 y en duplicado. Las funciones deben ser puras y testeables sin DOM.
3. Implementar `sankey-builder.ts`. Pautas a cumplir: construir la estructura de nodos y enlaces compatible con la librería de Sankey elegida (D3-Sankey o similar). Los nodos representan: muestra asignada, rango de pH medido (bajo/correcto/alto), indicador elegido, resultado (éxito/fallo). El peso de cada enlace es el recuento de alumnos que siguieron ese camino.
4. Implementar `report-builder.ts`. Pautas a cumplir: generar una cadena HTML auto-contenida con: título, fecha de análisis, resumen ejecutivo de estadísticos, todas las figuras como SVG inline y tabla de resultados por comisión. El HTML debe ser imprimible directamente desde el navegador sin dependencias externas.

### Fase D-3 · Ingesta de datos y validación (UI)

Objetivo: que el docente pueda cargar y verificar su dataset en menos de 2 minutos.

1. Implementar `file-dropzone.tsx`. Pautas a cumplir: aceptar `.xlsx` y `.csv` por drag-and-drop y por click. Mostrar nombre, tamaño y número de filas detectadas tras la carga. Rechazar archivos mayores a 10 MB con mensaje claro. Usar la API nativa `File` y `FileReader` sin librerías de terceros adicionales.
2. Implementar `column-mapper.tsx`. Pautas a cumplir: detectar automáticamente los encabezados del archivo y proponer el mapeo al esquema. Permitir al usuario corregir el mapeo mediante selectores. Mostrar una vista previa de las primeras 3 filas con el mapeo aplicado antes de confirmar.
3. Implementar `data-preview-table.tsx`. Pautas a cumplir: tabla paginada (20 filas por página) con resaltado visual de filas con errores. Las celdas con advertencia deben mostrar un ícono tooltip con el mensaje del error. Las filas inválidas deben poder excluirse del análisis con un toggle.
4. Implementar `validate-view.tsx`. Pautas a cumplir: mostrar el resumen de la validación (N total, N válidos, N con errores, N excluidos), lista de errores agrupados por tipo y botón para continuar al análisis sólo si hay al menos 10 filas válidas.

### Fase D-4 · Exploración y estadísticas

Objetivo: que el docente pueda filtrar y revisar los datos antes de generar las figuras.

1. Implementar `filter-panel.tsx`. Pautas a cumplir: filtros por comisión (multi-selección), semana (multi-selección), muestra (1–4, multi-selección) y resultado (todos / sólo éxito / sólo fallo). Los filtros deben actuar de forma reactiva sobre todos los componentes de la vista sin recargar el dataset.
2. Implementar `summary-stats-card.tsx`. Pautas a cumplir: mostrar para el conjunto filtrado: N total, tasa de éxito global en intento 1 y duplicado, error medio con desvío y mediana. Actualizar al cambiar filtros. Incluir un pequeño sparkline de la distribución de errores.
3. Implementar `explore-view.tsx`. Pautas a cumplir: combinar el panel de filtros, las tarjetas de estadísticas y la tabla de datos paginada en un layout de dos columnas (filtros a la izquierda, contenido a la derecha) que colapse a una sola columna en pantallas menores a 1024 px.

### Fase D-5 · Figuras para el congreso

Objetivo: generar las cuatro figuras del paper de forma automática y exportable.

1. Implementar `sankey-chart.tsx`. Pautas a cumplir: usar D3-Sankey o Plotly Sankey. El diagrama debe mostrar el flujo completo de decisiones: muestra → rango de pH medido → indicador elegido → resultado. Los nodos deben estar etiquetados con nombre y recuento. Los enlaces coloreados por muestra. Debe ser exportable como SVG.
2. Implementar `violin-chart.tsx`. Pautas a cumplir: mostrar para cada muestra dos violines lado a lado: distribución del error porcentual en el intento 1 y en el duplicado. Superponer la mediana como marca. Incluir línea de referencia en 0% (error perfecto). Debe ser exportable como SVG/PNG.
3. Implementar `error-histogram.tsx`. Pautas a cumplir: histograma de frecuencias del error porcentual absoluto, segmentado por muestra (cuatro histogramas en un grid 2×2 o apilados). Ejes compartidos para comparabilidad. Líneas verticales en los umbrales de 2% y 5%. Debe ser exportable como SVG/PNG.
4. Implementar `charts-view.tsx`. Pautas a cumplir: organizar las tres figuras en una página con títulos editables inline (para que el docente pueda personalizar las leyendas del paper), selector de paleta de colores (modo claro/oscuro/publicación) y controles de exportación individuales por figura.

### Fase D-6 · Exportación y reporte

Objetivo: que el docente salga de la web con todos los archivos que necesita para el congreso.

1. Implementar `export-panel.tsx`. Pautas a cumplir: ofrecer descarga individual de cada figura como SVG y PNG (usando `canvas` y `toBlob`), descarga del dataset filtrado como CSV y descarga del reporte completo como HTML imprimible. Los botones de descarga deben ser accesibles con teclado y no deben abrir nueva pestaña.
2. Implementar `export-view.tsx`. Pautas a cumplir: vista final que muestra un resumen de todo lo generado, permite editar el título y la fecha del reporte, y ofrece un botón de "Imprimir / Guardar como PDF" que activa `window.print()` con estilos CSS `@media print` optimizados.
3. Añadir estilos de impresión. Pautas a cumplir: en `@media print` ocultar navegación, filtros y controles de exportación. Mostrar sólo las figuras con sus títulos, la tabla de estadísticos y el encabezado del reporte. Asegurar que las figuras SVG no se corten entre páginas.

### Fase D-7 · Integración, i18n y calidad

Objetivo: ruta integrada, traducida y con cobertura de tests suficiente para confiar en los resultados del congreso.

1. Registrar la ruta `/#/doc` en `main.tsx`. Pautas a cumplir: importar el layout con `React.lazy`. Considerar que el bundle de SheetJS es pesado; separarlo en un chunk propio con `/* webpackChunkName */` o equivalente en Vite.
2. Añadir strings i18n. Pautas a cumplir: todos los textos bajo namespace `doc.*`. Labels de columnas del esquema también deben estar en i18n para facilitar la adaptación a otros idiomas del dataset.
3. Escribir tests del motor de análisis. Pautas a cumplir: cubrir `classifier` con datasets sintéticos de al menos 20 filas incluyendo casos borde (error exactamente en el umbral, campos opcionales ausentes). Cubrir `aggregator` verificando media y desvío contra valores calculados a mano. Cubrir `sankey-builder` verificando que la suma de pesos de enlaces salientes de un nodo sea igual al recuento de ese nodo.
4. Proteger la privacidad por diseño. Pautas a cumplir: añadir un banner visible en `upload-view.tsx` que declare explícitamente que ningún dato sale del navegador. Verificar que ninguna dependencia añadida realice requests de red al procesar el archivo. Documentar esto en el README para fines de cumplimiento institucional.

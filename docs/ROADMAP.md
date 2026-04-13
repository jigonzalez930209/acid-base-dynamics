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

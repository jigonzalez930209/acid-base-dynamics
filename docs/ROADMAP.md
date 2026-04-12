# Roadmap de desarrollo

## Visión

La aplicación ya quedó montada como una base científica y visual sobre Vite, React, shadcn, Tailwind, i18n y theming. El próximo paso no es solo agregar pantallas: es construir un lenguaje químico propio que permita describir sistemas, ecuaciones y resultados de forma consistente.

## Sistema descriptivo de ecuaciones

Propuesta de evolución del motor matemático:

1. Descriptor de especies: un formato común para fórmula, carga, estado ácido/base y nombre localizado.
2. Descriptor de equilibrio: una entidad que defina reactivos, productos, constante, temperatura y restricciones del modelo.
3. Balance de materia: ecuaciones normalizadas por sistema para conservar masa total por familia química.
4. Balance de carga: ecuación global del medio para resolver casos más complejos que el modelo tabulado actual.
5. Descriptor observable: valores derivados como predominio, fracción molar, capacidad buffer, volumen de equivalencia y sensibilidad.

Con eso se puede pasar de un simulador de curvas a una plataforma química extensible.

## Fase 1 · Núcleo científico

- Consolidar la base completa de ácidos con validaciones automáticas contra el PDF y revisión manual de OCR dudoso.
- Separar claramente datos tabulados, supuestos del modelo y casos especiales como ácidos fuertes o formulaciones parciales.
- Añadir tests unitarios al motor de alfas, carga promedio y titulación.
- Definir esquema de datos versionado para especies, pKa, fórmulas y notas del modelo.

## Fase 2 · Lenguaje químico

- Diseñar un DSL para especies, equilibrios y balances.
- Soportar ecuaciones estructurales, simbólicas y mixtas con render consistente.
- Modelar series ácido-base, pares conjugados y sistemas parciales.
- Preparar serialización para presets, ejercicios y escenarios comparables.

## Fase 3 · Visualización profunda

- Mapas de predominio y regiones de estabilidad.
- Curvas de sensibilidad por pKa, concentración, volumen inicial y fuerza del titulante.
- Superposición de múltiples escenarios con filtros avanzados.
- Paneles de storytelling visual para laboratorio, docencia y análisis exploratorio.

## Fase 4 · Plataforma guiada

- Modo docente con resolución paso a paso.
- Explicaciones automáticas del comportamiento químico según el sistema elegido.
- Guardado de sesiones, presets reproducibles y exportes técnicos.
- Vistas de accesibilidad y lectura móvil optimizada para clases y prácticas.

## Fase 5 · Expansión infinita

- Integrar buffers complejos, mezclas multicomponente y fuerza iónica.
- Extender a precipitación, complejometría, redox y agentes quelantes.
- Incorporar simulación por temperatura y condiciones experimentales.
- Exportación de reportes científicos, datasets y material docente.

## Criterio de arquitectura

- Mantener los componentes visuales por debajo de 150 líneas.
- Usar shadcn como capa base de UI y Tailwind como sistema visual.
- Centralizar textos en i18n y datos químicos en constantes versionadas.
- Tratar cada nueva familia de ecuaciones como una extensión del descriptor químico, no como lógica aislada en componentes.

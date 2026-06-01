# Formulario de laboratorio

| Ruta | Uso |
|------|-----|
| `#/form` | Alumnos — carga de resultados |
| `#/profesor` | Docentes — consulta por DNI y eliminación de envíos |

Código: [`src/features/laboratory-form/`](../src/features/laboratory-form/).  
URL del script: [`api.ts`](../src/features/laboratory-form/api.ts) (`LAB_API_URL`).

El formulario de alumnos (`#/form`) muestra **dos secciones en la misma pantalla**: fosfatos (ácido-base) y Redox. Al enviar se hacen **dos POST** seguidos (primero la técnica de fosfatos, luego `tecnica: redox`).

## Técnicas / hojas

| Envío | `tecnica` (payload) | Hoja |
|-------|----------------------|------|
| Fosfatos | `1-hcl-1-naoh`, `2-hcl` o `2-naoh` | **Fosfato** |
| Redox | `redox` (automático en el 2.º POST) | **Redox** |

## Campos comunes (todas las técnicas)

| Campo UI | Clave payload |
|----------|---------------|
| DNI | `dni` |
| Muestra asignada | `muestra` |
| pH inicial | `ph` |
| Tipo de técnica | `tecnica` |

## Titulación Redox (`tecnica: redox`)

| Campo UI | Clave payload |
|----------|---------------|
| Normalidad de tiosulfato de sodio | `redox_n_tiosulfato` |
| Normalidad del KI₃ | `redox_n_ki3` |
| Peso muestra 1 (g) | `redox_peso_m1` |
| Ácido ascórbico % 1 | `redox_acido_pct_m1` |
| Peso muestra 2 (g) | `redox_peso_m2` |
| Ácido ascórbico % 2 | `redox_acido_pct_m2` |
| Volumen Na₂S₂O₃ 1 (mL) | `redox_vol_s2o3_1` |
| Volumen Na₂S₂O₃ 2 (mL) | `redox_vol_s2o3_2` |

Las claves ácido-base (`hcl2_*`, `naoh2_*`, `mix_*`) se envían vacías cuando `tecnica === 'redox'`, y viceversa.

## Validación en cliente

Ver [`validation.ts`](../src/features/laboratory-form/validation.ts):

- DNI: 7–8 dígitos, sin puntos
- pH: 0–14
- Normalidades: 0.001–2 mol/L
- Pesos muestra: 0.0001–10 g
- % ácido ascórbico: 0–100
- Volúmenes: 0–200 mL

## Google Sheets / Apps Script

**Un solo archivo** para Apps Script: [`docs/google-apps-script.gs`](./google-apps-script.gs) (incluye Fosfato, Redox, intentos y panel docente).  
No uses el antiguo fragmento `.gs` de Redox — ver [`google-apps-script-redox.md`](./google-apps-script-redox.md).

1. Copiá **todo** `google-apps-script.gs` en el editor del spreadsheet (reemplazá el código anterior) y re-desplegá el Web App (**Nueva implementación**).
2. Pestañas: **Padron**, **Fosfato**, **Redox** (Redox se crea sola si no existe).
3. Ajustá `MAX_INTENTOS` en el script (por defecto **3**: 1 carga + 2 actualizaciones).
4. Si ya tenías filas duplicadas, ejecutá una vez en el editor: `migrarIntentosYLimpiarDuplicados()`.

### Una fila por alumno (upsert) + columna Intentos

- **Fosfato**: una fila por DNI; un nuevo envío **sobreescribe** la fila e incrementa la columna **Intentos**.
- **Redox**: igual, hoja **Redox**, una fila por DNI.
- Columna **Intentos** (última columna): `1` = primer envío, `2` y `3` = actualizaciones. Al llegar a 3 no se aceptan más POST para esa hoja.
- Si había filas duplicadas del comportamiento anterior, el script las fusiona al guardar o con `migrarIntentosYLimpiarDuplicados()`.

### Intentos disponibles (respuesta JSON)

Cada alumno tiene hasta `MAX_INTENTOS` envíos por hoja (**Fosfato** y **Redox** por separado).

**POST** — respuesta de éxito o error (cuando aplica):

```json
{
  "status": "success",
  "message": "…",
  "alumno": "…",
  "intentosMaximos": 2,
  "intentosUsados": 1,
  "intentosDisponibles": 1
}
```

**GET** — consultar antes de cargar el formulario:

```
{API_URL}?accion=intentos&dni=12345678&tecnica=2-hcl
```

```json
{
  "status": "success",
  "alumno": "…",
  "comision": "…",
  "tecnica": "2-hcl",
  "intentosMaximos": 2,
  "intentosUsados": 0,
  "intentosDisponibles": 2,
  "puedeEnviar": true
}
```

### Consulta docente (`#/profesor`)

**GET** — todos los envíos del alumno + intentos por técnica:

```
{API_URL}?accion=profesor&dni=12345678
```

```json
{
  "status": "success",
  "dni": "12345678",
  "alumno": "…",
  "comision": "…",
  "intentosMaximos": 2,
  "intentosPorTecnica": {
    "2-hcl": { "usados": 1, "disponibles": 1 },
    "redox": { "usados": 0, "disponibles": 2 }
  },
  "registros": [
    {
      "id": "Fosfato-5",
      "hoja": "Fosfato",
      "fila": 5,
      "tecnica": "2-hcl",
      "timestamp": "2025-06-01T14:30:00.000Z",
      "datos": { "Timestamp": "…", "DNI": "12345678", "…": "…" }
    }
  ]
}
```

**POST** — eliminar una fila (libera un intento si corresponde):

```json
{
  "accion": "eliminar",
  "dni": "12345678",
  "hoja": "Fosfato",
  "fila": 5
}
```

Validaciones en servidor: DNI en padrón, `hoja` ∈ {Fosfato, Redox}, fila ≥ 2, DNI de la fila coincide con el pedido.

> Sin contraseña en la UI: compartí `#/profesor` solo con el cuerpo docente o agregá un PIN en Apps Script si lo necesitás.

Pestaña recomendada **Redox** (fila 1 = cabeceras):

```
timestamp | dni | alumno | muestra | ph | redox_n_tiosulfato | redox_n_ki3 | redox_peso_m1 | redox_acido_pct_m1 | redox_peso_m2 | redox_acido_pct_m2 | redox_vol_s2o3_1 | redox_vol_s2o3_2
```

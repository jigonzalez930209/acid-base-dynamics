/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ÚNICO ARCHIVO para Google Apps Script — copiá TODO este .gs en el editor.
 * NO uses google-apps-script-redox.gs (obsoleto; Redox ya está integrado aquí).
 * Pegar ambos archivos duplica funciones y el despliegue falla.
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Hojas: Padron | Fosfato (ácido-base) | Redox
 * Respuestas JSON incluyen intentosDisponibles, intentosUsados, intentosMaximos.
 *
 * Consulta alumno (GET):
 *   ?accion=intentos&dni=12345678&tecnica=2-hcl
 *
 * Consulta profesor (GET):
 *   ?accion=profesor&dni=12345678
 *
 * Eliminar registro (POST JSON):
 *   { "accion": "eliminar", "dni": "12345678", "hoja": "Fosfato", "fila": 5 }
 *
 * Export por comisión (GET):
 *   ?comision=3
 */

const NOMBRE_HOJA_PADRON = 'Padron';
const NOMBRE_HOJA_FOSFATOS = 'Fosfato';
const NOMBRE_HOJA_REDOX = 'Redox';

/** 1 carga inicial + 2 actualizaciones (sobreescritura de la misma fila) */
const MAX_INTENTOS = 3;

const COL_INTENTOS_LABEL = 'Intentos';

const TECNICAS_VALIDAS = ['1-hcl-1-naoh', '2-hcl', '2-naoh', 'redox'];

// ─── POST ─────────────────────────────────────────────────────────────────────

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.accion === 'eliminar') {
      return eliminarRegistroProfesor_(data);
    }

    const dni = normalizarDni_(data.dni);
    if (!dni) {
      return crearRespuesta({ status: 'error', message: 'DNI inválido.' });
    }
    data.dni = dni;

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const alumnoInfo = buscarEnPadron_(ss, dni);
    if (!alumnoInfo) {
      return crearRespuesta({ status: 'error', message: 'DNI no encontrado en el padrón.' });
    }

    const tecnica = String(data.tecnica || '').trim();
    if (!tecnica) {
      return crearRespuesta({ status: 'error', message: 'Falta el campo técnica.' });
    }

    const previo = obtenerEstadoIntentos_(ss, dni, tecnica);
    if (previo.usados >= MAX_INTENTOS) {
      return crearRespuesta({
        status: 'error',
        message: 'Ya usaste los ' + MAX_INTENTOS + ' envíos permitidos (1 carga + 2 actualizaciones).',
        alumno: alumnoInfo.nombre,
        intentosMaximos: MAX_INTENTOS,
        intentosUsados: previo.usados,
        intentosDisponibles: 0,
      });
    }

    let resultadoGuardado;
    if (tecnica === 'redox') {
      const errRedox = validarRedox_(data);
      if (errRedox) {
        return crearRespuesta(conIntentosEnRespuesta_({
          status: 'error',
          message: errRedox,
          alumno: alumnoInfo.nombre,
        }, previo));
      }
      resultadoGuardado = guardarRedox_(ss, data, alumnoInfo.nombre);
    } else if (tecnica === '2-hcl' || tecnica === '2-naoh' || tecnica === '1-hcl-1-naoh') {
      resultadoGuardado = guardarFosfato_(ss, data, alumnoInfo);
    } else {
      return crearRespuesta({
        status: 'error',
        message: 'Técnica no reconocida: ' + tecnica,
      });
    }

    const esActualizacion = previo.fila != null;
    return crearRespuesta({
      status: 'success',
      message: esActualizacion
        ? 'Datos actualizados correctamente (intento ' + resultadoGuardado.usados + ' de ' + MAX_INTENTOS + ').'
        : 'Datos guardados correctamente (primer envío).',
      alumno: alumnoInfo.nombre,
      comision: alumnoInfo.comision,
      intentosMaximos: MAX_INTENTOS,
      intentosUsados: resultadoGuardado.usados,
      intentosDisponibles: resultadoGuardado.disponibles,
    });
  } catch (error) {
    return crearRespuesta({ status: 'error', message: 'Error del servidor: ' + error.toString() });
  }
}

// ─── GET ────────────────────────────────────────────────────────────────────

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};

  if (params.accion === 'intentos') {
    return consultarIntentos_(params);
  }
  if (params.accion === 'profesor') {
    return consultarProfesor_(params);
  }

  const comision = params.comision;
  if (!comision) {
    return crearRespuesta({
      status: 'error',
      message: 'Parámetros inválidos. Usá accion=intentos, accion=profesor o comision=…',
    });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(NOMBRE_HOJA_FOSFATOS);
  if (!sheet || sheet.getLastRow() < 1) {
    return crearRespuesta([]);
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const filtrados = data.slice(1).filter(fila => String(fila[2]) === String(comision));

  const jsonResult = filtrados.map(fila => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = fila[i]; });
    return obj;
  });

  return crearRespuesta(jsonResult);
}

// ─── Profesor: consulta y eliminación ───────────────────────────────────────

function consultarProfesor_(params) {
  const dni = normalizarDni_(params.dni);
  if (!dni) {
    return crearRespuesta({ status: 'error', message: 'DNI inválido (7 u 8 dígitos, solo números).' });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const alumnoInfo = buscarEnPadron_(ss, dni);
  if (!alumnoInfo) {
    return crearRespuesta({ status: 'error', message: 'DNI no encontrado en el padrón.' });
  }

  const intentosPorTecnica = {};
  for (let t = 0; t < TECNICAS_VALIDAS.length; t++) {
    const tecnica = TECNICAS_VALIDAS[t];
    const c = contarIntentosAlumno_(ss, dni, tecnica);
    intentosPorTecnica[tecnica] = {
      usados: c.usados,
      disponibles: c.disponibles,
    };
  }

  return crearRespuesta({
    status: 'success',
    dni: dni,
    alumno: alumnoInfo.nombre,
    comision: alumnoInfo.comision,
    intentosMaximos: MAX_INTENTOS,
    intentosPorTecnica: intentosPorTecnica,
    registros: listarRegistrosAlumno_(ss, dni),
  });
}

function listarRegistrosAlumno_(ss, dni) {
  const registros = [];
  registros.push.apply(registros, listarRegistrosEnHoja_(ss.getSheetByName(NOMBRE_HOJA_FOSFATOS), NOMBRE_HOJA_FOSFATOS, dni, 1, 5));
  registros.push.apply(registros, listarRegistrosEnHoja_(ss.getSheetByName(NOMBRE_HOJA_REDOX), NOMBRE_HOJA_REDOX, dni, 1, null));
  registros.sort(function(a, b) {
    const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return tb - ta;
  });
  return registros;
}

/**
 * @param colDniIndex índice 0-based de la columna DNI
 * @param colTecnicaIndex índice técnica o null → "redox"
 */
function listarRegistrosEnHoja_(sheet, nombreHoja, dni, colDniIndex, colTecnicaIndex) {
  if (!sheet || sheet.getLastRow() < 2) return [];
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const out = [];
  for (let i = 1; i < data.length; i++) {
    if (normalizarDni_(data[i][colDniIndex]) !== dni) continue;
    const fila = i + 1;
    const tecnica = colTecnicaIndex === null
      ? 'redox'
      : String(data[i][colTecnicaIndex] || '').trim() || 'desconocida';
    const datos = {};
    for (let c = 0; c < headers.length; c++) {
      const key = String(headers[c] != null && headers[c] !== '' ? headers[c] : 'col_' + (c + 1));
      datos[key] = valorCeldaJSON_(data[i][c]);
    }
    out.push({
      id: nombreHoja + '-' + fila,
      hoja: nombreHoja,
      fila: fila,
      tecnica: tecnica,
      timestamp: valorCeldaJSON_(data[i][0]),
      datos: datos,
    });
  }
  return out;
}

function eliminarRegistroProfesor_(data) {
  const dni = normalizarDni_(data.dni);
  if (!dni) {
    return crearRespuesta({ status: 'error', message: 'DNI inválido.' });
  }

  const hoja = String(data.hoja || '').trim();
  if (hoja !== NOMBRE_HOJA_FOSFATOS && hoja !== NOMBRE_HOJA_REDOX) {
    return crearRespuesta({ status: 'error', message: 'Hoja inválida. Debe ser Fosfato o Redox.' });
  }

  const fila = parseInt(String(data.fila), 10);
  if (isNaN(fila) || fila < 2) {
    return crearRespuesta({ status: 'error', message: 'Número de fila inválido.' });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!buscarEnPadron_(ss, dni)) {
    return crearRespuesta({ status: 'error', message: 'DNI no encontrado en el padrón.' });
  }

  const sheet = ss.getSheetByName(hoja);
  if (!sheet || fila > sheet.getLastRow()) {
    return crearRespuesta({ status: 'error', message: 'El registro ya no existe en la hoja.' });
  }

  const filaDatos = sheet.getRange(fila, 1, 1, sheet.getLastColumn()).getValues()[0];
  const dniEnFila = normalizarDni_(filaDatos[1]);
  if (dniEnFila !== dni) {
    return crearRespuesta({
      status: 'error',
      message: 'La fila no pertenece a ese DNI. Actualizá la consulta e intentá de nuevo.',
    });
  }

  const tecnicaEliminada = hoja === NOMBRE_HOJA_REDOX
    ? 'redox'
    : String(filaDatos[5] || '').trim();

  sheet.deleteRow(fila);

  const intentos = tecnicaEliminada && TECNICAS_VALIDAS.indexOf(tecnicaEliminada) >= 0
    ? contarIntentosAlumno_(ss, dni, tecnicaEliminada)
    : null;

  const resp = {
    status: 'success',
    message: 'Registro eliminado. El alumno puede volver a cargar si tiene intentos disponibles.',
    hoja: hoja,
    filaEliminada: fila,
    tecnica: tecnicaEliminada,
  };

  if (intentos) {
    resp.intentosMaximos = MAX_INTENTOS;
    resp.intentosUsados = intentos.usados;
    resp.intentosDisponibles = intentos.disponibles;
  }

  return crearRespuesta(resp);
}

function valorCeldaJSON_(v) {
  if (v instanceof Date) return v.toISOString();
  if (v === null || v === undefined) return '';
  return v;
}

function consultarIntentos_(params) {
  const dni = normalizarDni_(params.dni);
  const tecnica = String(params.tecnica || '').trim();

  if (!dni || !tecnica) {
    return crearRespuesta({
      status: 'error',
      message: 'Parámetros requeridos: dni y tecnica',
    });
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const alumnoInfo = buscarEnPadron_(ss, dni);
  if (!alumnoInfo) {
    return crearRespuesta({ status: 'error', message: 'DNI no encontrado en el padrón.' });
  }

  const intentos = contarIntentosAlumno_(ss, dni, tecnica);
  return crearRespuesta({
    status: 'success',
    alumno: alumnoInfo.nombre,
    comision: alumnoInfo.comision,
    tecnica: tecnica,
    intentosMaximos: MAX_INTENTOS,
    intentosUsados: intentos.usados,
    intentosDisponibles: intentos.disponibles,
    puedeEnviar: intentos.disponibles > 0,
  });
}

// ─── Padrón e intentos ──────────────────────────────────────────────────────

/**
 * Padrón: A = Nombre, B = DNI, C = Comisión (según tu script actual).
 */
function buscarEnPadron_(ss, dni) {
  const padronSheet = ss.getSheetByName(NOMBRE_HOJA_PADRON);
  if (!padronSheet) throw new Error('No existe la hoja "' + NOMBRE_HOJA_PADRON + '".');
  const padronData = padronSheet.getDataRange().getValues();
  for (let i = 1; i < padronData.length; i++) {
    if (normalizarDni_(padronData[i][1]) === dni) {
      return { nombre: padronData[i][0], comision: padronData[i][2] };
    }
  }
  return null;
}

/** Lee intentos desde la columna Intentos (una fila por DNI por hoja). */
function contarIntentosAlumno_(ss, dni, tecnica) {
  return obtenerEstadoIntentos_(ss, dni, tecnica);
}

function obtenerEstadoIntentos_(ss, dni, tecnica) {
  if (tecnica === 'redox') {
    const sh = ss.getSheetByName(NOMBRE_HOJA_REDOX);
    const meta = getMetaRedox_(sh);
    if (!meta) return { usados: 0, disponibles: MAX_INTENTOS, fila: null };
    const found = buscarFilaPorDni_(sh, dni, meta.colDni, meta.colIntentos);
    const usados = found.fila ? found.intentos : 0;
    return { usados: usados, disponibles: Math.max(0, MAX_INTENTOS - usados), fila: found.fila };
  }
  const sh = ss.getSheetByName(NOMBRE_HOJA_FOSFATOS);
  const meta = getMetaFosfato_(sh);
  if (!meta) return { usados: 0, disponibles: MAX_INTENTOS, fila: null };
  const found = buscarFilaPorDni_(sh, dni, meta.colDni, meta.colIntentos);
  const usados = found.fila ? found.intentos : 0;
  return { usados: usados, disponibles: Math.max(0, MAX_INTENTOS - usados), fila: found.fila };
}

function indiceColumnaIntentos_(headers) {
  for (let i = 0; i < headers.length; i++) {
    const h = String(headers[i] || '').trim().toLowerCase();
    if (h === 'intentos' || h === 'intento') return i;
  }
  return -1;
}

function leerIntentosCelda_(valor) {
  const n = parseInt(String(valor == null ? '' : valor).trim(), 10);
  if (isNaN(n) || n < 1) return 1;
  return Math.min(n, MAX_INTENTOS);
}

/**
 * Primera fila que coincide con DNI; si hay duplicados, devuelve la de menor número de fila.
 */
function buscarFilaPorDni_(sheet, dni, colDniIndex, colIntentosIndex) {
  const vacio = { fila: null, intentos: 0, duplicadas: [] };
  if (!sheet || sheet.getLastRow() < 2) return vacio;

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  const datos = sheet.getRange(2, 1, lastRow, lastCol).getValues();
  let primera = null;
  const duplicadas = [];

  for (let i = 0; i < datos.length; i++) {
    if (normalizarDni_(datos[i][colDniIndex]) !== dni) continue;
    const fila = i + 2;
    if (primera === null) {
      primera = {
        fila: fila,
        intentos: leerIntentosCelda_(datos[i][colIntentosIndex]),
      };
    } else {
      duplicadas.push(fila);
    }
  }

  if (!primera) return vacio;
  return { fila: primera.fila, intentos: primera.intentos, duplicadas: duplicadas };
}

function eliminarFilasDuplicadas_(sheet, filasDuplicadas) {
  const ordenadas = filasDuplicadas.slice().sort(function(a, b) { return b - a; });
  for (let i = 0; i < ordenadas.length; i++) {
    sheet.deleteRow(ordenadas[i]);
  }
}

function asegurarColumnaIntentos_(sheet, columnNames) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(columnNames);
    return;
  }
  const lastCol = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  if (indiceColumnaIntentos_(headers) >= 0) return;

  const nuevaCol = lastCol + 1;
  sheet.getRange(1, nuevaCol).setValue(COL_INTENTOS_LABEL);
  const lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    const backfill = [];
    for (let r = 2; r <= lastRow; r++) backfill.push([1]);
    sheet.getRange(2, nuevaCol, lastRow, nuevaCol).setValues(backfill);
  }
}

function normalizarNombreColumna_(s) {
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[áàä]/g, 'a')
    .replace(/[éèë]/g, 'e')
    .replace(/[íìï]/g, 'i')
    .replace(/[óòö]/g, 'o')
    .replace(/[úùü]/g, 'u');
}

/** Escribe cada campo en la columna correcta según la fila 1 (evita desfasajes). */
function indiceColumnaPorNombre_(headers, nombreEsperado, claveAlternativa) {
  const objetivo = normalizarNombreColumna_(nombreEsperado);
  const alt = claveAlternativa ? normalizarNombreColumna_(claveAlternativa) : '';
  for (let i = 0; i < headers.length; i++) {
    const h = normalizarNombreColumna_(headers[i]);
    if (h === objetivo || (alt && h === alt)) return i;
  }
  const alias = {
    'muestra redox': ['muestra_redox', 'muestra'],
    timestamp: ['fecha', 'hora'],
    dni: ['documento'],
  };
  const key = normalizarNombreColumna_(nombreEsperado);
  if (alias[key]) {
    for (let a = 0; a < alias[key].length; a++) {
      const buscado = normalizarNombreColumna_(alias[key][a]);
      for (let i = 0; i < headers.length; i++) {
        if (normalizarNombreColumna_(headers[i]) === buscado) return i;
      }
    }
  }
  return -1;
}

function construirFilaDesdeCabeceras_(headers, columnKeys, columnNames, dataObj) {
  const fila = [];
  for (let c = 0; c < headers.length; c++) fila.push('');
  for (let i = 0; i < columnKeys.length; i++) {
    let idx = indiceColumnaPorNombre_(headers, columnNames[i], columnKeys[i]);
    if (idx < 0 && i < headers.length) idx = i;
    if (idx >= 0) {
      const v = dataObj[columnKeys[i]];
      fila[idx] = v !== undefined && v !== null ? v : '';
    }
  }
  return fila;
}

function asegurarCabecerasHoja_(sheet, columnNames) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(columnNames);
    return;
  }
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  let falta = false;
  for (let i = 0; i < columnNames.length; i++) {
    if (indiceColumnaPorNombre_(headers, columnNames[i], null) < 0) {
      falta = true;
      break;
    }
  }
  if (!falta) return;
  sheet.getRange(1, 1, 1, columnNames.length).setValues([columnNames]);
}

function upsertPorDni_(sheet, columnKeys, columnNames, dataObj, colDniIndex) {
  asegurarCabecerasHoja_(sheet, columnNames);
  asegurarColumnaIntentos_(sheet, columnNames);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const colIntentos = indiceColumnaIntentos_(headers);
  if (colIntentos < 0) throw new Error('No se pudo crear la columna Intentos.');

  const dni = normalizarDni_(dataObj.dni);
  const colDniReal = indiceColumnaPorNombre_(headers, columnNames[colDniIndex], 'dni');
  const colDni = colDniReal >= 0 ? colDniReal : colDniIndex;
  const found = buscarFilaPorDni_(sheet, dni, colDni, colIntentos);
  const nuevoIntentos = found.fila ? found.intentos + 1 : 1;

  dataObj.intentos = nuevoIntentos;
  dataObj.timestamp = new Date();

  const filaValores = construirFilaDesdeCabeceras_(headers, columnKeys, columnNames, dataObj);
  const numCols = headers.length;

  if (found.fila) {
    sheet.getRange(found.fila, 1, 1, numCols).setValues([filaValores]);
    if (found.duplicadas.length > 0) eliminarFilasDuplicadas_(sheet, found.duplicadas);
  } else {
    sheet.appendRow(filaValores);
    const dup = buscarFilaPorDni_(sheet, dni, colDni, colIntentos);
    if (dup.duplicadas.length > 0) eliminarFilasDuplicadas_(sheet, dup.duplicadas);
  }

  return {
    usados: nuevoIntentos,
    disponibles: Math.max(0, MAX_INTENTOS - nuevoIntentos),
    fila: found.fila || sheet.getLastRow(),
  };
}

function getMetaFosfato_(sheet) {
  if (!sheet) return null;
  const headers = sheet.getLastRow() >= 1
    ? sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0]
    : [];
  let colIntentos = indiceColumnaIntentos_(headers);
  if (colIntentos < 0 && sheet.getLastRow() === 0) colIntentos = 30;
  else if (colIntentos < 0) colIntentos = headers.length;
  return { colDni: 1, colIntentos: colIntentos };
}

function getMetaRedox_(sheet) {
  if (!sheet) return null;
  const headers = sheet.getLastRow() >= 1
    ? sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0]
    : [];
  let colIntentos = indiceColumnaIntentos_(headers);
  if (colIntentos < 0 && sheet.getLastRow() === 0) colIntentos = 12;
  else if (colIntentos < 0) colIntentos = headers.length;
  return { colDni: 1, colIntentos: colIntentos };
}

function conIntentosEnRespuesta_(base, intentos) {
  base.intentosMaximos = MAX_INTENTOS;
  base.intentosUsados = intentos.usados;
  base.intentosDisponibles = intentos.disponibles;
  return base;
}

function normalizarDni_(valor) {
  const s = String(valor == null ? '' : valor).replace(/\D/g, '');
  return s.length >= 7 && s.length <= 8 ? s : '';
}

// ─── Fosfato (ácido-base) ───────────────────────────────────────────────────

function getFosfatoColumnas_() {
  return {
    keys: [
      'timestamp', 'dni', 'comision', 'ph', 'muestra', 'tecnica',
      'hcl2_n1', 'hcl2_ind1', 'hcl2_v1_1', 'hcl2_v2_1',
      'hcl2_n2', 'hcl2_ind2', 'hcl2_v1_2', 'hcl2_v2_2',
      'naoh2_n1', 'naoh2_ind1', 'naoh2_v1_1', 'naoh2_v2_1',
      'naoh2_n2', 'naoh2_ind2', 'naoh2_v1_2', 'naoh2_v2_2',
      'mix_hcl_n', 'mix_hcl_ind', 'mix_hcl_v1', 'mix_hcl_v2',
      'mix_naoh_n', 'mix_naoh_ind', 'mix_naoh_v1', 'mix_naoh_v2',
      'intentos',
    ],
    names: [
      'Timestamp', 'DNI', 'Comisión', 'pH Inicial', 'Muestra', 'Técnica',
      '[HCl #1] N', '[HCl #1] Ind', '[HCl #1] V1', '[HCl #1] V2',
      '[HCl #2] N', '[HCl #2] Ind', '[HCl #2] V1', '[HCl #2] V2',
      '[NaOH #1] N', '[NaOH #1] Ind', '[NaOH #1] V1', '[NaOH #1] V2',
      '[NaOH #2] N', '[NaOH #2] Ind', '[NaOH #2] V1', '[NaOH #2] V2',
      '[MIX - HCl] N', '[MIX - HCl] Ind', '[MIX - HCl] V1', '[MIX - HCl] V2',
      '[MIX - NaOH] N', '[MIX - NaOH] Ind', '[MIX - NaOH] V1', '[MIX - NaOH] V2',
      COL_INTENTOS_LABEL,
    ],
  };
}

function guardarFosfato_(ss, data, alumnoInfo) {
  const resultadosSheet = ss.getSheetByName(NOMBRE_HOJA_FOSFATOS);
  if (!resultadosSheet) throw new Error('No existe la hoja "' + NOMBRE_HOJA_FOSFATOS + '".');

  const cols = getFosfatoColumnas_();
  data.comision = alumnoInfo.comision;
  return upsertPorDni_(resultadosSheet, cols.keys, cols.names, data, 1);
}

// ─── Redox ───────────────────────────────────────────────────────────────────

function validarRedox_(d) {
  const muestraRedox = String(d.muestra_redox != null ? d.muestra_redox : d.muestra || '').trim();
  if (!muestraRedox) return 'Ingresá el número de muestra Redox.';

  const req = [
    'redox_n_tiosulfato', 'redox_n_ki3',
    'redox_peso_m1', 'redox_acido_pct_m1',
    'redox_peso_m2', 'redox_acido_pct_m2',
    'redox_vol_s2o3_1', 'redox_vol_s2o3_2',
  ];
  for (let i = 0; i < req.length; i++) {
    const k = req[i];
    if (d[k] === '' || d[k] === null || d[k] === undefined) {
      return 'Complete todos los campos de Titulación Redox.';
    }
  }
  if (!enRango_(d.redox_n_tiosulfato, 0.001, 2)) return 'Normalidad de tiosulfato fuera de rango (0.001–2 mol/L).';
  if (!enRango_(d.redox_n_ki3, 0.001, 2)) return 'Normalidad del KI₃ fuera de rango (0.001–2 mol/L).';
  if (!enRango_(d.redox_peso_m1, 0.0001, 10)) return 'Peso muestra 1 inválido (0.0001–10 g).';
  if (!enRango_(d.redox_peso_m2, 0.0001, 10)) return 'Peso muestra 2 inválido (0.0001–10 g).';
  if (!enRango_(d.redox_acido_pct_m1, 0, 100)) return 'Ácido ascórbico % 1 inválido (0–100).';
  if (!enRango_(d.redox_acido_pct_m2, 0, 100)) return 'Ácido ascórbico % 2 inválido (0–100).';
  if (!enRango_(d.redox_vol_s2o3_1, 0, 200)) return 'Volumen Na₂S₂O₃ 1 inválido (0–200 mL).';
  if (!enRango_(d.redox_vol_s2o3_2, 0, 200)) return 'Volumen Na₂S₂O₃ 2 inválido (0–200 mL).';
  return null;
}

function getRedoxColumnas_() {
  return {
    keys: [
      'timestamp', 'dni', 'alumno', 'muestra_redox',
      'redox_n_tiosulfato', 'redox_n_ki3',
      'redox_peso_m1', 'redox_acido_pct_m1',
      'redox_peso_m2', 'redox_acido_pct_m2',
      'redox_vol_s2o3_1', 'redox_vol_s2o3_2',
      'intentos',
    ],
    names: [
      'Timestamp', 'DNI', 'Alumno', 'Muestra Redox',
      'N tiosulfato (mol/L)', 'N KI3 (mol/L)',
      'Peso muestra 1 (g)', 'Acido ascorbico % 1',
      'Peso muestra 2 (g)', 'Acido ascorbico % 2',
      'Vol Na2S2O3 1 (mL)', 'Vol Na2S2O3 2 (mL)',
      COL_INTENTOS_LABEL,
    ],
  };
}

function guardarRedox_(ss, data, nombreAlumno) {
  let sh = ss.getSheetByName(NOMBRE_HOJA_REDOX);
  if (!sh) {
    sh = ss.insertSheet(NOMBRE_HOJA_REDOX);
    sh.setFrozenRows(1);
  }

  const cols = getRedoxColumnas_();
  const payload = {
    dni: data.dni,
    alumno: nombreAlumno,
    muestra_redox: String(data.muestra_redox != null ? data.muestra_redox : data.muestra || '').trim(),
    redox_n_tiosulfato: data.redox_n_tiosulfato,
    redox_n_ki3: data.redox_n_ki3,
    redox_peso_m1: data.redox_peso_m1,
    redox_acido_pct_m1: data.redox_acido_pct_m1,
    redox_peso_m2: data.redox_peso_m2,
    redox_acido_pct_m2: data.redox_acido_pct_m2,
    redox_vol_s2o3_1: data.redox_vol_s2o3_1,
    redox_vol_s2o3_2: data.redox_vol_s2o3_2,
  };
  return upsertPorDni_(sh, cols.keys, cols.names, payload, 1);
}

function enRango_(val, min, max) {
  const n = parseFloat(String(val).replace(',', '.'));
  return !isNaN(n) && n >= min && n <= max;
}

function crearRespuesta(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── Utilidad: crear hoja Redox (ejecutar una vez desde el editor) ────────────

function setupRedoxSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const redox = ss.getSheetByName(NOMBRE_HOJA_REDOX) || ss.insertSheet(NOMBRE_HOJA_REDOX);
  const cols = getRedoxColumnas_();
  redox.clear();
  redox.getRange(1, 1, 1, cols.names.length).setValues([cols.names]);
  redox.setFrozenRows(1);
  redox.getRange('A:A').setNumberFormat('dd/mm/yyyy hh:mm');
}

/** Ejecutar una vez: añade columna Intentos y deja 1 fila por DNI en Fosfato y Redox. */
function migrarIntentosYLimpiarDuplicados() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const fosfato = ss.getSheetByName(NOMBRE_HOJA_FOSFATOS);
  const redox = ss.getSheetByName(NOMBRE_HOJA_REDOX);
  if (fosfato) asegurarColumnaIntentos_(fosfato, getFosfatoColumnas_().names);
  if (redox) asegurarColumnaIntentos_(redox, getRedoxColumnas_().names);
  consolidarDuplicadosEnHoja_(fosfato, 1);
  consolidarDuplicadosEnHoja_(redox, 1);
}

function consolidarDuplicadosEnHoja_(sheet, colDniIndex) {
  if (!sheet || sheet.getLastRow() < 2) return;
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const colIntentos = indiceColumnaIntentos_(headers);
  if (colIntentos < 0) return;

  const lastRow = sheet.getLastRow();
  const datos = sheet.getRange(2, 1, lastRow, sheet.getLastColumn()).getValues();
  const visto = {};
  const borrar = [];

  for (let i = 0; i < datos.length; i++) {
    const dni = normalizarDni_(datos[i][colDniIndex]);
    if (!dni) continue;
    const fila = i + 2;
    if (!visto[dni]) {
      visto[dni] = { fila: fila, intentos: leerIntentosCelda_(datos[i][colIntentos]) };
    } else {
      visto[dni].intentos = Math.min(MAX_INTENTOS, visto[dni].intentos + 1);
      borrar.push(fila);
    }
  }

  Object.keys(visto).forEach(function(dni) {
    const info = visto[dni];
    sheet.getRange(info.fila, colIntentos + 1).setValue(info.intentos);
  });
  eliminarFilasDuplicadas_(sheet, borrar);
}

/*
 * Validación opcional en celdas de la hoja Redox (Datos → Validación de datos):
 *   DNI (B):     =Y(LEN(B2)>=7;LEN(B2)<=8;ESNUMERO(B2*1))
 *   pH (E):      =Y(E2>=0;E2<=14)
 *   Normalidad:  =Y(E2>0;E2<=2)
 *   % duplicado: =SI(Y(K2>0;L2>0);ABS(K2-L2)/((K2+L2)/2)*100;"")
 * Ver más en docs/google-apps-script-redox.md
 */

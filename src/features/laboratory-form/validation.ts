import type { RedoxFields, TitrationFields } from './schemas'

export type TitrationBlock = TitrationFields

function parseNum(val: string): number | null {
  const n = parseFloat(String(val).replace(',', '.').trim())
  return Number.isNaN(n) ? null : n
}

export function validateDni(dni: string): string | null {
  const digits = dni.replace(/\D/g, '')
  if (!digits) return 'Ingresá el DNI (solo números, sin puntos).'
  if (digits.length < 7 || digits.length > 8) return 'El DNI debe tener 7 u 8 dígitos.'
  return null
}

export function validatePh(ph: string): string | null {
  const n = parseNum(ph)
  if (n === null) return 'Ingresá un pH inicial válido.'
  if (n < 0 || n > 14) return 'El pH debe estar entre 0 y 14.'
  return null
}

export function validateNormality(value: string, label: string): string | null {
  const n = parseNum(value)
  if (n === null) return `${label}: ingresá un número válido.`
  if (n <= 0 || n > 2) return `${label}: debe estar entre 0.001 y 2 mol/L.`
  return null
}

export function validateVolume(value: string, label: string): string | null {
  const n = parseNum(value)
  if (n === null) return `${label}: ingresá un número válido.`
  if (n < 0 || n > 200) return `${label}: debe estar entre 0 y 200 mL.`
  return null
}

export function validateWeight(value: string, label: string): string | null {
  const n = parseNum(value)
  if (n === null) return `${label}: ingresá un número válido.`
  if (n <= 0 || n > 10) return `${label}: debe estar entre 0.0001 y 10 g.`
  return null
}

export function validatePercent(value: string, label: string): string | null {
  const n = parseNum(value)
  if (n === null) return `${label}: ingresá un número válido.`
  if (n < 0 || n > 100) return `${label}: debe estar entre 0 y 100 %.`
  return null
}

function validateTitrationBlock(block: TitrationBlock, title: string): string | null {
  return (
    validateNormality(block.normalidad, `${title} — normalidad`) ??
    (block.indicador ? null : `${title}: seleccioná un indicador.`) ??
    validateVolume(block.v1, `${title} — volumen 1`) ??
    validateVolume(block.v2, `${title} — volumen 2`)
  )
}

export function validateRedox(redox: RedoxFields, muestraRedox: string): string | null {
  if (!muestraRedox.trim()) return 'Ingresá el número de muestra Redox.'
  return (
    validateNormality(redox.nTiosulfato, 'Normalidad de tiosulfato de sodio') ??
    validateNormality(redox.nKi3, 'Normalidad del KI₃') ??
    validateWeight(redox.pesoM1, 'Peso muestra 1') ??
    validatePercent(redox.acidoPctM1, 'Ácido ascórbico % 1') ??
    validateWeight(redox.pesoM2, 'Peso muestra 2') ??
    validatePercent(redox.acidoPctM2, 'Ácido ascórbico % 2') ??
    validateVolume(redox.volS2o3_1, 'Volumen Na₂S₂O₃ 1') ??
    validateVolume(redox.volS2o3_2, 'Volumen Na₂S₂O₃ 2')
  )
}

export { isAcidBaseTechnique } from './constants'

export function validateFosfatoSection(params: {
  dni: string
  muestra: string
  ph: string
  tecnica: string
  t1: TitrationBlock
  t2: TitrationBlock
}): string | null {
  const { dni, muestra, ph, tecnica, t1, t2 } = params

  const dniErr = validateDni(dni)
  if (dniErr) return dniErr
  if (!muestra.trim()) return 'Ingresá la muestra asignada.'
  if (!tecnica) return 'Seleccioná la técnica de titulación de fosfatos.'
  if (!['1-hcl-1-naoh', '2-hcl', '2-naoh'].includes(tecnica)) return 'Técnica de fosfatos no válida.'

  const phErr = validatePh(ph)
  if (phErr) return phErr

  return (
    validateTitrationBlock(t1, 'Primera valoración (fosfatos)') ??
    validateTitrationBlock(t2, 'Segunda valoración (fosfatos)')
  )
}

/** Valida fosfatos + Redox en el mismo envío. */
export function validateCombinedLaboratoryForm(params: {
  dni: string
  muestraFosfato: string
  ph: string
  tecnica: string
  t1: TitrationBlock
  t2: TitrationBlock
  muestraRedox: string
  redox: RedoxFields
}): string | null {
  return (
    validateFosfatoSection({
      dni: params.dni,
      muestra: params.muestraFosfato,
      ph: params.ph,
      tecnica: params.tecnica,
      t1: params.t1,
      t2: params.t2,
    }) ?? validateRedox(params.redox, params.muestraRedox)
  )
}

/** Claves redox vacías para el payload ácido-base. */
export function emptyRedoxPayload(): Record<string, string> {
  return {
    redox_n_tiosulfato: '',
    redox_n_ki3: '',
    redox_peso_m1: '',
    redox_acido_pct_m1: '',
    redox_peso_m2: '',
    redox_acido_pct_m2: '',
    redox_vol_s2o3_1: '',
    redox_vol_s2o3_2: '',
  }
}

export function redoxToPayload(redox: RedoxFields): Record<string, string> {
  return {
    redox_n_tiosulfato: redox.nTiosulfato,
    redox_n_ki3: redox.nKi3,
    redox_peso_m1: redox.pesoM1,
    redox_acido_pct_m1: redox.acidoPctM1,
    redox_peso_m2: redox.pesoM2,
    redox_acido_pct_m2: redox.acidoPctM2,
    redox_vol_s2o3_1: redox.volS2o3_1,
    redox_vol_s2o3_2: redox.volS2o3_2,
  }
}

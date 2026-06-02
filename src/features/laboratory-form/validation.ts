import type { RedoxFields } from './schemas'

export type TitrationBlock = import('./schemas').TitrationFields

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

export { isAcidBaseTechnique } from './constants'

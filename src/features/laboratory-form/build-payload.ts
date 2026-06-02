import { emptyRedoxPayload, redoxToPayload } from './validation'
import type { RedoxFields, TitrationFields } from './schemas'

export function emptyAcidBasePayload(): Record<string, string> {
  return {
    hcl2_n1: '', hcl2_ind1: '', hcl2_v1_1: '', hcl2_v2_1: '',
    hcl2_n2: '', hcl2_ind2: '', hcl2_v1_2: '', hcl2_v2_2: '',
    naoh2_n1: '', naoh2_ind1: '', naoh2_v1_1: '', naoh2_v2_1: '',
    naoh2_n2: '', naoh2_ind2: '', naoh2_v1_2: '', naoh2_v2_2: '',
    mix_hcl_n: '', mix_hcl_ind: '', mix_hcl_v1: '', mix_hcl_v2: '',
    mix_naoh_n: '', mix_naoh_ind: '', mix_naoh_v1: '', mix_naoh_v2: '',
  }
}

export function buildFosfatoPayload(
  dni: string,
  muestraFosfato: string,
  ph: string,
  tecnica: string,
  t1: TitrationFields,
  t2: TitrationFields,
): Record<string, string> {
  const payload: Record<string, string> = {
    dni: dni.replace(/\D/g, ''),
    muestra: muestraFosfato,
    ph,
    tecnica,
    ...emptyAcidBasePayload(),
    ...emptyRedoxPayload(),
  }

  if (tecnica === '2-hcl') {
    payload.hcl2_n1 = t1.normalidad
    payload.hcl2_ind1 = t1.indicador
    payload.hcl2_v1_1 = t1.v1
    payload.hcl2_v2_1 = t1.v2
    payload.hcl2_n2 = t2.normalidad
    payload.hcl2_ind2 = t2.indicador
    payload.hcl2_v1_2 = t2.v1
    payload.hcl2_v2_2 = t2.v2
  } else if (tecnica === '2-naoh') {
    payload.naoh2_n1 = t1.normalidad
    payload.naoh2_ind1 = t1.indicador
    payload.naoh2_v1_1 = t1.v1
    payload.naoh2_v2_1 = t1.v2
    payload.naoh2_n2 = t2.normalidad
    payload.naoh2_ind2 = t2.indicador
    payload.naoh2_v1_2 = t2.v1
    payload.naoh2_v2_2 = t2.v2
  } else if (tecnica === '1-hcl-1-naoh') {
    payload.mix_hcl_n = t1.normalidad
    payload.mix_hcl_ind = t1.indicador
    payload.mix_hcl_v1 = t1.v1
    payload.mix_hcl_v2 = t1.v2
    payload.mix_naoh_n = t2.normalidad
    payload.mix_naoh_ind = t2.indicador
    payload.mix_naoh_v1 = t2.v1
    payload.mix_naoh_v2 = t2.v2
  }

  return payload
}

export function buildRedoxPayload(
  dni: string,
  muestraRedox: string,
  redox: RedoxFields,
): Record<string, string> {
  return {
    dni: dni.replace(/\D/g, ''),
    muestra_redox: muestraRedox,
    tecnica: 'redox',
    ...emptyAcidBasePayload(),
    ...emptyRedoxPayload(),
    ...redoxToPayload(redox),
  }
}

export const INDICADORES = [
  'Fenolftaleína',
  'Timolftaleína',
  'Naranja de Metilo',
  'Rojo de Metilo',
  'Verde de Bromocresol',
  'Azul de Bromotimol',
  'Otro',
] as const

export const ACID_BASE_TECHNIQUES = ['1-hcl-1-naoh', '2-hcl', '2-naoh'] as const

export type AcidBaseTechnique = (typeof ACID_BASE_TECHNIQUES)[number]

export function isAcidBaseTechnique(tecnica: string): tecnica is AcidBaseTechnique {
  return (ACID_BASE_TECHNIQUES as readonly string[]).includes(tecnica)
}

export const LAB_TECHNIQUES = ['1-hcl-1-naoh', '2-hcl', '2-naoh', 'redox'] as const

export type LabTechnique = (typeof LAB_TECHNIQUES)[number]

export const TECHNIQUE_LABELS: Record<LabTechnique, string> = {
  '1-hcl-1-naoh': '1 con HCl y 1 con NaOH',
  '2-hcl': '2 con HCl',
  '2-naoh': '2 con NaOH',
  redox: 'Titulación Redox',
}

export function techniqueLabel(tecnica: string): string {
  return TECHNIQUE_LABELS[tecnica as LabTechnique] ?? tecnica
}

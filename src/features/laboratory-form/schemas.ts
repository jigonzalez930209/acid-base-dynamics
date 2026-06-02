import { z } from 'zod'
import { isAcidBaseTechnique } from './constants'

export type TitrationFields = {
  tipo: string
  normalidad: string
  indicador: string
  v1: string
  v2: string
}

export type RedoxFields = {
  nTiosulfato: string
  nKi3: string
  pesoM1: string
  acidoPctM1: string
  pesoM2: string
  acidoPctM2: string
  volS2o3_1: string
  volS2o3_2: string
}

export type LaboratoryFormOutput = {
  dni: string
  muestraFosfato: string
  ph: string
  tecnica: string
  t1: TitrationFields
  t2: TitrationFields
  muestraRedox: string
  redox: RedoxFields
}

const requiredString = (msg: string) => z.string().trim().min(1, msg)

const titrationSchema = z.object({
  tipo: z.string(),
  normalidad: requiredString('Ingresá la normalidad.').refine(val => {
    const n = parseFloat(val.replace(',', '.'))
    return !Number.isNaN(n) && n > 0 && n <= 2
  }, { message: 'Normalidad: entre 0.001 y 2 mol/L.' }),
  indicador: requiredString('Seleccioná un indicador.'),
  v1: requiredString('Ingresá el volumen 1.').refine(val => {
    const n = parseFloat(val.replace(',', '.'))
    return !Number.isNaN(n) && n >= 0 && n <= 200
  }, { message: 'Volumen 1: entre 0 y 200 mL.' }),
  v2: requiredString('Ingresá el volumen 2.').refine(val => {
    const n = parseFloat(val.replace(',', '.'))
    return !Number.isNaN(n) && n >= 0 && n <= 200
  }, { message: 'Volumen 2: entre 0 y 200 mL.' }),
})

const redoxFieldsSchema = z.object({
  nTiosulfato: requiredString('Ingresá la normalidad de tiosulfato.').refine(val => {
    const n = parseFloat(val.replace(',', '.'))
    return !Number.isNaN(n) && n >= 0.001 && n <= 2
  }, { message: 'Tiosulfato: entre 0.001 y 2 mol/L.' }),
  nKi3: requiredString('Ingresá la normalidad del KI₃.').refine(val => {
    const n = parseFloat(val.replace(',', '.'))
    return !Number.isNaN(n) && n >= 0.001 && n <= 2
  }, { message: 'KI₃: entre 0.001 y 2 mol/L.' }),
  pesoM1: requiredString('Ingresá el peso muestra 1.').refine(val => {
    const n = parseFloat(val.replace(',', '.'))
    return !Number.isNaN(n) && n >= 0.0001 && n <= 10
  }, { message: 'Peso muestra 1: entre 0.0001 y 10 g.' }),
  acidoPctM1: requiredString('Ingresá el % ácido ascórbico 1.').refine(val => {
    const n = parseFloat(val.replace(',', '.'))
    return !Number.isNaN(n) && n >= 0 && n <= 100
  }, { message: '% ácido 1: entre 0 y 100.' }),
  pesoM2: requiredString('Ingresá el peso muestra 2.').refine(val => {
    const n = parseFloat(val.replace(',', '.'))
    return !Number.isNaN(n) && n >= 0.0001 && n <= 10
  }, { message: 'Peso muestra 2: entre 0.0001 y 10 g.' }),
  acidoPctM2: requiredString('Ingresá el % ácido ascórbico 2.').refine(val => {
    const n = parseFloat(val.replace(',', '.'))
    return !Number.isNaN(n) && n >= 0 && n <= 100
  }, { message: '% ácido 2: entre 0 y 100.' }),
  volS2o3_1: requiredString('Ingresá el volumen Na₂S₂O₃ 1.').refine(val => {
    const n = parseFloat(val.replace(',', '.'))
    return !Number.isNaN(n) && n >= 0 && n <= 200
  }, { message: 'Volumen 1: entre 0 y 200 mL.' }),
  volS2o3_2: requiredString('Ingresá el volumen Na₂S₂O₃ 2.').refine(val => {
    const n = parseFloat(val.replace(',', '.'))
    return !Number.isNaN(n) && n >= 0 && n <= 200
  }, { message: 'Volumen 2: entre 0 y 200 mL.' }),
})

export const laboratoryFormSchema = z
  .object({
    dni: z
      .string()
      .transform(s => s.replace(/\D/g, ''))
      .pipe(
        z
          .string()
          .min(7, 'El DNI debe tener 7 u 8 dígitos.')
          .max(8, 'El DNI debe tener 7 u 8 dígitos.'),
      ),
    muestraFosfato: requiredString('Ingresá la muestra de fosfatos.'),
    ph: requiredString('Ingresá el pH inicial.').refine(val => {
      const n = parseFloat(val.replace(',', '.'))
      return !Number.isNaN(n) && n >= 0 && n <= 14
    }, { message: 'El pH debe estar entre 0 y 14.' }),
    tecnica: z.string().refine(isAcidBaseTechnique, {
      message: 'Seleccioná la técnica de fosfatos.',
    }),
    t1: titrationSchema,
    t2: titrationSchema,
    muestraRedox: requiredString('Ingresá el número de muestra Redox.'),
    redox: redoxFieldsSchema,
  })
  .superRefine((data, ctx) => {
    const expect = (t1: string, t2: string) => {
      if (data.t1.tipo !== t1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Primera valoración debe ser ${t1}.`,
          path: ['t1', 'tipo'],
        })
      }
      if (data.t2.tipo !== t2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Segunda valoración debe ser ${t2}.`,
          path: ['t2', 'tipo'],
        })
      }
    }
    if (data.tecnica === '1-hcl-1-naoh') expect('HCl', 'NaOH')
    else if (data.tecnica === '2-hcl') expect('HCl', 'HCl')
    else if (data.tecnica === '2-naoh') expect('NaOH', 'NaOH')
  })

export type LaboratoryFormValues = z.input<typeof laboratoryFormSchema>

export function parseLaboratoryForm(values: LaboratoryFormValues): LaboratoryFormOutput {
  return laboratoryFormSchema.parse(values) as LaboratoryFormOutput
}

export const defaultLaboratoryFormValues: LaboratoryFormValues = {
  dni: '',
  muestraFosfato: '',
  ph: '',
  tecnica: '',
  t1: { tipo: '', normalidad: '', indicador: '', v1: '', v2: '' },
  t2: { tipo: '', normalidad: '', indicador: '', v1: '', v2: '' },
  muestraRedox: '',
  redox: {
    nTiosulfato: '',
    nKi3: '',
    pesoM1: '',
    acidoPctM1: '',
    pesoM2: '',
    acidoPctM2: '',
    volS2o3_1: '',
    volS2o3_2: '',
  },
}

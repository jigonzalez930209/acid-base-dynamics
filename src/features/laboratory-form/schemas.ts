import { zodResolver } from '@hookform/resolvers/zod'
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

function parseDecimal(value: string): number {
  return parseFloat(value.replace(',', '.').trim())
}

const requiredString = (message: string) => z.string().trim().min(1, message)

function requiredDecimalString(options: {
  required: string
  min: number
  max: number
  rangeMessage: string
  exclusiveMin?: boolean
}) {
  return requiredString(options.required).refine(value => {
    const n = parseDecimal(value)
    if (Number.isNaN(n)) return false
    if (options.exclusiveMin) return n > options.min && n <= options.max
    return n >= options.min && n <= options.max
  }, { message: options.rangeMessage })
}

export const dniInputSchema = z
  .string()
  .transform(value => value.replace(/\D/g, ''))
  .pipe(
    z
      .string()
      .min(7, 'El DNI debe tener 7 u 8 dígitos.')
      .max(8, 'El DNI debe tener 7 u 8 dígitos.'),
  )

const titrationSchema = z.object({
  tipo: z.string(),
  normalidad: requiredDecimalString({
    required: 'Ingresá la normalidad.',
    min: 0,
    max: 2,
    exclusiveMin: true,
    rangeMessage: 'Normalidad: entre 0.001 y 2 mol/L.',
  }),
  indicador: requiredString('Seleccioná un indicador.'),
  v1: requiredDecimalString({
    required: 'Ingresá el volumen 1.',
    min: 0,
    max: 200,
    rangeMessage: 'Volumen 1: entre 0 y 200 mL.',
  }),
  v2: requiredDecimalString({
    required: 'Ingresá el volumen 2.',
    min: 0,
    max: 200,
    rangeMessage: 'Volumen 2: entre 0 y 200 mL.',
  }),
})

const redoxFieldsSchema = z.object({
  nTiosulfato: requiredDecimalString({
    required: 'Ingresá la normalidad de tiosulfato.',
    min: 0.001,
    max: 2,
    rangeMessage: 'Tiosulfato: entre 0.001 y 2 mol/L.',
  }),
  nKi3: requiredDecimalString({
    required: 'Ingresá la normalidad del KI₃.',
    min: 0.001,
    max: 2,
    rangeMessage: 'KI₃: entre 0.001 y 2 mol/L.',
  }),
  pesoM1: requiredDecimalString({
    required: 'Ingresá el peso muestra 1.',
    min: 0.0001,
    max: 10,
    rangeMessage: 'Peso muestra 1: entre 0.0001 y 10 g.',
  }),
  acidoPctM1: requiredDecimalString({
    required: 'Ingresá el % ácido ascórbico 1.',
    min: 0,
    max: 100,
    rangeMessage: '% ácido 1: entre 0 y 100.',
  }),
  pesoM2: requiredDecimalString({
    required: 'Ingresá el peso muestra 2.',
    min: 0.0001,
    max: 10,
    rangeMessage: 'Peso muestra 2: entre 0.0001 y 10 g.',
  }),
  acidoPctM2: requiredDecimalString({
    required: 'Ingresá el % ácido ascórbico 2.',
    min: 0,
    max: 100,
    rangeMessage: '% ácido 2: entre 0 y 100.',
  }),
  volS2o3_1: requiredDecimalString({
    required: 'Ingresá el volumen Na₂S₂O₃ 1.',
    min: 0,
    max: 200,
    rangeMessage: 'Volumen 1: entre 0 y 200 mL.',
  }),
  volS2o3_2: requiredDecimalString({
    required: 'Ingresá el volumen Na₂S₂O₃ 2.',
    min: 0,
    max: 200,
    rangeMessage: 'Volumen 2: entre 0 y 200 mL.',
  }),
})

export const laboratoryFormSchema = z
  .object({
    dni: dniInputSchema,
    muestraFosfato: requiredString('Ingresá la muestra de fosfatos.'),
    ph: requiredDecimalString({
      required: 'Ingresá el pH inicial.',
      min: 0,
      max: 14,
      rangeMessage: 'El pH debe estar entre 0 y 14.',
    }),
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

/** Resolver de react-hook-form: toda la validación del formulario pasa por Zod. */
export const laboratoryFormResolver = zodResolver(laboratoryFormSchema)

export function parseLaboratoryForm(values: LaboratoryFormValues): LaboratoryFormOutput {
  return laboratoryFormSchema.parse(values) as LaboratoryFormOutput
}

export function firstZodIssueMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Valor inválido.'
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

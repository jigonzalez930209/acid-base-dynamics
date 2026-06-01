import { useState } from 'react'
import { useForm, FormProvider, Controller, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RedoxBlock } from './redox-block'
import { LAB_API_URL, labFetchJson } from './api'
import { buildFosfatoPayload, buildRedoxPayload } from './build-payload'
import { INDICADORES, isAcidBaseTechnique } from './constants'
import { FormField, labInputClassName } from './form-field'
import {
  defaultLaboratoryFormValues,
  laboratoryFormSchema,
  type LaboratoryFormOutput,
  type LaboratoryFormValues,
} from './schemas'
import type { TitrationBlock } from './validation'

type LabApiResponse = {
  status: string
  message?: string
  alumno?: string
  intentosMaximos?: number
  intentosUsados?: number
  intentosDisponibles?: number
}

async function postLabPayload(payload: Record<string, string>): Promise<LabApiResponse> {
  return labFetchJson(LAB_API_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  })
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-semibold border-b border-border/60 pb-2">{children}</h2>
}

function titrationDefaults(tipo: string): TitrationBlock {
  return { tipo, normalidad: '', indicador: '', v1: '', v2: '' }
}

type TitrationPrefix = 't1' | 't2'

function TitrationFields({ prefix, title }: { prefix: TitrationPrefix; title: string }) {
  const {
    register,
    watch,
    formState: { errors, isSubmitting },
  } = useFormContext<LaboratoryFormValues>()
  const tipo = watch(`${prefix}.tipo`)
  const blockErrors = errors[prefix]

  return (
    <fieldset className="border rounded-md p-4 space-y-4">
      <legend className="text-sm font-semibold px-2">
        {title} ({tipo || '—'})
      </legend>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FormField label="Normalidad (N)" error={blockErrors?.normalidad}>
          <input
            type="number"
            step="0.0001"
            min={0.001}
            max={2}
            disabled={isSubmitting}
            aria-invalid={!!blockErrors?.normalidad}
            className={labInputClassName}
            {...register(`${prefix}.normalidad`)}
          />
        </FormField>
        <FormField label="Indicador" error={blockErrors?.indicador}>
          <select
            disabled={isSubmitting}
            aria-invalid={!!blockErrors?.indicador}
            className={labInputClassName}
            {...register(`${prefix}.indicador`)}
          >
            <option value="">Seleccione...</option>
            {INDICADORES.map(ind => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Volumen 1 (mL)" error={blockErrors?.v1}>
          <input
            type="number"
            step="0.01"
            min={0}
            max={200}
            disabled={isSubmitting}
            aria-invalid={!!blockErrors?.v1}
            className={labInputClassName}
            {...register(`${prefix}.v1`)}
          />
        </FormField>
        <FormField label="Volumen 2 (mL)" error={blockErrors?.v2}>
          <input
            type="number"
            step="0.01"
            min={0}
            max={200}
            disabled={isSubmitting}
            aria-invalid={!!blockErrors?.v2}
            className={labInputClassName}
            {...register(`${prefix}.v2`)}
          />
        </FormField>
      </div>
    </fieldset>
  )
}

export default function LaboratoryForm() {
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)

  const methods = useForm<LaboratoryFormValues>({
    resolver: zodResolver(laboratoryFormSchema),
    defaultValues: defaultLaboratoryFormValues,
    mode: 'onChange',
  })

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = methods

  const tecnica = watch('tecnica')

  const handleTecnicaChange = (val: string) => {
    setValue('tecnica', val, { shouldValidate: true })
    if (val === '1-hcl-1-naoh') {
      setValue('t1', titrationDefaults('HCl'), { shouldValidate: true })
      setValue('t2', titrationDefaults('NaOH'), { shouldValidate: true })
    } else if (val === '2-hcl') {
      setValue('t1', titrationDefaults('HCl'), { shouldValidate: true })
      setValue('t2', titrationDefaults('HCl'), { shouldValidate: true })
    } else if (val === '2-naoh') {
      setValue('t1', titrationDefaults('NaOH'), { shouldValidate: true })
      setValue('t2', titrationDefaults('NaOH'), { shouldValidate: true })
    }
  }

  const onSubmit = async (values: LaboratoryFormValues) => {
    setFeedback({ type: 'info', message: 'Validando DNI y enviando…' })

    try {
      const parsed: LaboratoryFormOutput = laboratoryFormSchema.parse(values)
      const fosfatoPayload = buildFosfatoPayload(
        parsed.dni,
        parsed.muestraFosfato,
        parsed.ph,
        parsed.tecnica,
        parsed.t1,
        parsed.t2,
      )
      const fosfatoRes = await postLabPayload(fosfatoPayload)

      if (fosfatoRes.status !== 'success') {
        setFeedback({
          type: 'error',
          message: `Fosfatos: ${fosfatoRes.message ?? 'Error al guardar.'}`,
        })
        return
      }

      const redoxPayload = buildRedoxPayload(parsed.dni, parsed.muestraRedox, parsed.redox)
      const redoxRes = await postLabPayload(redoxPayload)

      if (redoxRes.status !== 'success') {
        setFeedback({
          type: 'error',
          message:
            `Fosfatos guardados. Redox: ${redoxRes.message ?? 'Error al guardar.'} ` +
            'Podés reenviar solo completando la sección Redox.',
        })
        return
      }

      const alumno = fosfatoRes.alumno ?? redoxRes.alumno ?? parsed.dni
      const fmtIntentos = (res: LabApiResponse, label: string) => {
        if (res.intentosDisponibles == null) return ''
        return ` ${label}: ${res.intentosDisponibles} restante${res.intentosDisponibles === 1 ? '' : 's'} (${res.intentosUsados ?? '?'}/${res.intentosMaximos ?? 3}).`
      }
      setFeedback({
        type: 'success',
        message:
          `✅ Fosfatos y Redox guardados (Alumno: ${alumno}).` +
          fmtIntentos(fosfatoRes, 'Fosfatos') +
          fmtIntentos(redoxRes, 'Redox'),
      })
      reset(defaultLaboratoryFormValues)
    } catch (error) {
      console.error(error)
      setFeedback({ type: 'error', message: 'Error de conexión. Intente nuevamente.' })
    }
  }

  const onInvalid = () => {
    setFeedback({ type: 'error', message: 'Revisá los campos marcados en rojo.' })
  }

  return (
    <div className="min-h-screen p-4 flex items-center justify-center bg-muted/30">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Registro de Resultados de Laboratorio</CardTitle>
          <CardDescription>
            Fosfatos (ácido-base) y Redox en un solo envío. La muestra y el pH de fosfatos son independientes de
            Redox.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-8" noValidate>
              <section className="space-y-4">
                <SectionHeading>Datos generales</SectionHeading>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="DNI (sin puntos)" error={errors.dni}>
                    <Controller
                      name="dni"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={8}
                          autoComplete="off"
                          disabled={isSubmitting}
                          aria-invalid={!!errors.dni}
                          className={labInputClassName}
                          placeholder="Ej: 12345678"
                          value={field.value}
                          onChange={e => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 8))}
                          onBlur={field.onBlur}
                        />
                      )}
                    />
                  </FormField>
                </div>
              </section>

              <section className="space-y-4">
                <SectionHeading>Titulación de fosfatos (ácido-base)</SectionHeading>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                  <FormField label="Muestra fosfatos" error={errors.muestraFosfato}>
                    <input
                      type="text"
                      disabled={isSubmitting}
                      aria-invalid={!!errors.muestraFosfato}
                      className={labInputClassName}
                      {...register('muestraFosfato')}
                    />
                  </FormField>
                  <FormField label="pH inicial" error={errors.ph}>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      max={14}
                      disabled={isSubmitting}
                      aria-invalid={!!errors.ph}
                      className={labInputClassName}
                      {...register('ph')}
                    />
                  </FormField>
                </div>
                <FormField label="Técnica asignada" error={errors.tecnica} className="max-w-md">
                  <select
                    disabled={isSubmitting}
                    aria-invalid={!!errors.tecnica}
                    className={labInputClassName}
                    value={tecnica}
                    onChange={e => handleTecnicaChange(e.target.value)}
                  >
                    <option value="">Seleccione...</option>
                    <option value="1-hcl-1-naoh">1 con HCl y 1 con NaOH</option>
                    <option value="2-naoh">2 con NaOH</option>
                    <option value="2-hcl">2 con HCl</option>
                  </select>
                </FormField>

                {isAcidBaseTechnique(tecnica) && (
                  <div className="space-y-6">
                    <TitrationFields prefix="t1" title="Primera valoración" />
                    <TitrationFields prefix="t2" title="Segunda valoración" />
                  </div>
                )}
              </section>

              <section className="space-y-4">
                <SectionHeading>Titulación Redox</SectionHeading>
                <p className="text-sm text-muted-foreground">
                  Muestra Redox propia (no usa el pH ni la muestra de fosfatos).
                </p>
                <RedoxBlock />
              </section>

              {feedback && (
                <div
                  role="alert"
                  className={`p-3 rounded-md text-sm font-medium ${
                    feedback.type === 'success'
                      ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
                      : feedback.type === 'error'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                  }`}
                >
                  {feedback.message}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !isAcidBaseTechnique(tecnica)}
              >
                {isSubmitting ? 'Enviando…' : 'Enviar fosfatos y Redox'}
              </Button>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  )
}

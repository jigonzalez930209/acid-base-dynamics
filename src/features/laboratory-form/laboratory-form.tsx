import { useCallback, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LAB_API_URL, labFetchJson } from './api'
import { buildFosfatoPayload, buildRedoxPayload } from './build-payload'
import {
  FosfatoSection,
  GeneralSection,
  RedoxSection,
  SubmitButton,
  titrationDefaults,
} from './form-sections'
import {
  defaultLaboratoryFormValues,
  laboratoryFormResolver,
  parseLaboratoryForm,
  type LaboratoryFormValues,
} from './schemas'

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

export default function LaboratoryForm() {
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)

  const methods = useForm<LaboratoryFormValues>({
    resolver: laboratoryFormResolver,
    defaultValues: defaultLaboratoryFormValues,
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  })

  const { handleSubmit, setValue, reset } = methods

  const handleTecnicaChange = useCallback((val: string) => {
    if (val === '1-hcl-1-naoh') {
      setValue('t1', titrationDefaults('HCl'))
      setValue('t2', titrationDefaults('NaOH'))
    } else if (val === '2-hcl') {
      setValue('t1', titrationDefaults('HCl'))
      setValue('t2', titrationDefaults('HCl'))
    } else if (val === '2-naoh') {
      setValue('t1', titrationDefaults('NaOH'))
      setValue('t2', titrationDefaults('NaOH'))
    }
  }, [setValue])

  const onSubmit = async (values: LaboratoryFormValues) => {
    setFeedback({ type: 'info', message: 'Validando DNI y enviando…' })

    try {
      const parsed = parseLaboratoryForm(values)
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
            <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6 md:space-y-8" noValidate>
              <GeneralSection />
              <FosfatoSection onTecnicaChange={handleTecnicaChange} />
              <RedoxSection />

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

              <SubmitButton />
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  )
}

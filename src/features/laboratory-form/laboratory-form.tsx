import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RedoxBlock } from './redox-block'
import { EMPTY_REDOX, type RedoxFields } from './types'
import { LAB_API_URL, labFetchJson } from './api'
import { DniInput } from './dni-input'
import { buildFosfatoPayload, buildRedoxPayload } from './build-payload'
import {
  isAcidBaseTechnique,
  validateCombinedLaboratoryForm,
  type TitrationBlock,
} from './validation'

const INDICADORES = [
  'Fenolftaleína',
  'Timolftaleína',
  'Naranja de Metilo',
  'Rojo de Metilo',
  'Verde de Bromocresol',
  'Azul de Bromotimol',
  'Otro',
]

const EMPTY_TITRATION: TitrationBlock = { tipo: '', normalidad: '', indicador: '', v1: '', v2: '' }

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
  return (
    <h2 className="text-base font-semibold border-b border-border/60 pb-2">{children}</h2>
  )
}

export default function LaboratoryForm() {
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)

  const [dni, setDni] = useState('')
  const [muestra, setMuestra] = useState('')
  const [ph, setPh] = useState('')
  const [tecnica, setTecnica] = useState('')

  const [t1, setT1] = useState<TitrationBlock>({ ...EMPTY_TITRATION })
  const [t2, setT2] = useState<TitrationBlock>({ ...EMPTY_TITRATION })
  const [redox, setRedox] = useState<RedoxFields>({ ...EMPTY_REDOX })

  const handleTecnicaChange = (val: string) => {
    setTecnica(val)
    if (val === '1-hcl-1-naoh') {
      setT1({ tipo: 'HCl', normalidad: '', indicador: '', v1: '', v2: '' })
      setT2({ tipo: 'NaOH', normalidad: '', indicador: '', v1: '', v2: '' })
    } else if (val === '2-hcl') {
      setT1({ tipo: 'HCl', normalidad: '', indicador: '', v1: '', v2: '' })
      setT2({ tipo: 'HCl', normalidad: '', indicador: '', v1: '', v2: '' })
    } else if (val === '2-naoh') {
      setT1({ tipo: 'NaOH', normalidad: '', indicador: '', v1: '', v2: '' })
      setT2({ tipo: 'NaOH', normalidad: '', indicador: '', v1: '', v2: '' })
    } else {
      setT1({ ...EMPTY_TITRATION })
      setT2({ ...EMPTY_TITRATION })
    }
  }

  const resetForm = () => {
    setDni('')
    setMuestra('')
    setPh('')
    setTecnica('')
    setT1({ ...EMPTY_TITRATION })
    setT2({ ...EMPTY_TITRATION })
    setRedox({ ...EMPTY_REDOX })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateCombinedLaboratoryForm({ dni, muestra, ph, tecnica, t1, t2, redox })
    if (validationError) {
      setFeedback({ type: 'error', message: validationError })
      return
    }

    setLoading(true)
    setFeedback({ type: 'info', message: 'Enviando fosfatos y Redox…' })

    try {
      const fosfatoPayload = buildFosfatoPayload(dni, muestra, ph, tecnica, t1, t2)
      const fosfatoRes = await postLabPayload(fosfatoPayload)

      if (fosfatoRes.status !== 'success') {
        setFeedback({
          type: 'error',
          message: `Fosfatos: ${fosfatoRes.message ?? 'Error al guardar.'}`,
        })
        return
      }

      const redoxPayload = buildRedoxPayload(dni, muestra, ph, redox)
      const redoxRes = await postLabPayload(redoxPayload)

      if (redoxRes.status !== 'success') {
        setFeedback({
          type: 'error',
          message:
            `Fosfatos guardados correctamente, pero Redox falló: ${redoxRes.message ?? 'Error al guardar.'} ` +
            'Completá solo la sección Redox y volvé a enviar, o pedí al docente que elimine el registro de fosfatos si necesitás reintentar.',
        })
        return
      }

      const alumno = fosfatoRes.alumno ?? redoxRes.alumno ?? dni
      const fmtIntentos = (res: LabApiResponse, label: string) => {
        if (res.intentosDisponibles == null) return ''
        return ` ${label}: ${res.intentosDisponibles} intento${res.intentosDisponibles === 1 ? '' : 's'} restante${res.intentosDisponibles === 1 ? '' : 's'} (${res.intentosUsados ?? '?'}/${res.intentosMaximos ?? 3} usados).`
      }
      setFeedback({
        type: 'success',
        message:
          `✅ Fosfatos y Redox guardados (Alumno: ${alumno}).` +
          fmtIntentos(fosfatoRes, 'Fosfatos') +
          fmtIntentos(redoxRes, 'Redox'),
      })
      resetForm()
    } catch (error) {
      console.error(error)
      setFeedback({ type: 'error', message: 'Error de conexión. Intente nuevamente.' })
    } finally {
      setLoading(false)
    }
  }

  const inputClassName =
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

  const renderTitrationBlock = (
    title: string,
    data: TitrationBlock,
    setData: React.Dispatch<React.SetStateAction<TitrationBlock>>,
  ) => (
    <fieldset className="border rounded-md p-4 space-y-4">
      <legend className="text-sm font-semibold px-2">
        {title} ({data.tipo})
      </legend>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Normalidad (N)</label>
          <input
            required
            type="number"
            step="0.0001"
            min={0.001}
            max={2}
            className={inputClassName}
            value={data.normalidad}
            onChange={e => setData({ ...data, normalidad: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Indicador</label>
          <select
            required
            className={inputClassName}
            value={data.indicador}
            onChange={e => setData({ ...data, indicador: e.target.value })}
          >
            <option value="">Seleccione...</option>
            {INDICADORES.map(ind => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Volumen 1 (mL)</label>
          <input
            required
            type="number"
            step="0.01"
            min={0}
            max={200}
            className={inputClassName}
            value={data.v1}
            onChange={e => setData({ ...data, v1: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Volumen 2 (mL)</label>
          <input
            required
            type="number"
            step="0.01"
            min={0}
            max={200}
            className={inputClassName}
            value={data.v2}
            onChange={e => setData({ ...data, v2: e.target.value })}
          />
        </div>
      </div>
    </fieldset>
  )

  return (
    <div className="min-h-screen p-4 flex items-center justify-center bg-muted/30">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Registro de Resultados de Laboratorio</CardTitle>
          <CardDescription>
            Completá la titulación de fosfatos (ácido-base) y la titulación Redox en este mismo formulario. Se
            envían ambas al guardar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8" noValidate>
            <section className="space-y-4">
              <SectionHeading>Datos generales</SectionHeading>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">DNI (sin puntos)</label>
                  <DniInput value={dni} onChange={setDni} className={inputClassName} disabled={loading} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Muestra asignada</label>
                  <input
                    required
                    type="text"
                    className={inputClassName}
                    value={muestra}
                    onChange={e => setMuestra(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">pH inicial</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min={0}
                    max={14}
                    className={inputClassName}
                    value={ph}
                    onChange={e => setPh(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <SectionHeading>Titulación de fosfatos (ácido-base)</SectionHeading>
              <div className="space-y-2 max-w-md">
                <label className="text-sm font-medium leading-none">Técnica asignada</label>
                <select
                  required
                  className={inputClassName}
                  value={tecnica}
                  onChange={e => handleTecnicaChange(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Seleccione...</option>
                  <option value="1-hcl-1-naoh">1 con HCl y 1 con NaOH</option>
                  <option value="2-naoh">2 con NaOH</option>
                  <option value="2-hcl">2 con HCl</option>
                </select>
              </div>

              {isAcidBaseTechnique(tecnica) && (
                <div className="space-y-6">
                  {renderTitrationBlock('Primera valoración', t1, setT1)}
                  {renderTitrationBlock('Segunda valoración', t2, setT2)}
                </div>
              )}
            </section>

            <section className="space-y-4">
              <SectionHeading>Titulación Redox</SectionHeading>
              <p className="text-sm text-muted-foreground">
                Completá los datos de Redox (dos muestras y volúmenes duplicados de Na₂S₂O₃).
              </p>
              <RedoxBlock data={redox} onChange={setRedox} inputClassName={inputClassName} />
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

            <Button type="submit" className="w-full" disabled={loading || !isAcidBaseTechnique(tecnica)}>
              {loading ? 'Enviando…' : 'Enviar fosfatos y Redox'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DniInput, dniValidationMessage } from './dni-input'
import { consultarAlumnoProfesor, eliminarRegistroProfesor } from './teacher-api'
import { LAB_TECHNIQUES, techniqueLabel } from './techniques'
import type { ConsultaProfesorResponse, RegistroAlumno } from './teacher-types'

const inputClassName =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

function formatTimestamp(ts: string | undefined): string {
  if (!ts) return '—'
  const d = new Date(ts)
  return Number.isNaN(d.getTime()) ? String(ts) : d.toLocaleString('es-AR')
}

function RegistroCard({
  registro,
  deleting,
  onDelete,
}: {
  registro: RegistroAlumno
  deleting: boolean
  onDelete: (r: RegistroAlumno) => void
}) {
  const [open, setOpen] = useState(false)
  const entries = Object.entries(registro.datos).filter(([, v]) => v !== '' && v != null)

  return (
    <div className="rounded-md border border-border/60 p-4 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{registro.hoja}</Badge>
            <Badge variant="secondary">{techniqueLabel(registro.tecnica)}</Badge>
            <span className="text-xs text-muted-foreground">Fila {registro.fila}</span>
          </div>
          <p className="text-sm text-muted-foreground">{formatTimestamp(registro.timestamp)}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(v => !v)}>
            {open ? 'Ocultar' : 'Ver datos'}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={deleting}
            onClick={() => onDelete(registro)}
          >
            {deleting ? 'Eliminando…' : 'Eliminar'}
          </Button>
        </div>
      </div>
      {open && (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm border-t pt-3">
          {entries.map(([key, value]) => (
            <div key={key} className="min-w-0">
              <dt className="text-muted-foreground truncate">{key}</dt>
              <dd className="font-mono text-xs break-all">{String(value)}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}

export default function TeacherConsultation() {
  const [dni, setDni] = useState('')
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)
  const [consulta, setConsulta] = useState<ConsultaProfesorResponse | null>(null)

  const buscar = useCallback(async () => {
    const err = dniValidationMessage(dni)
    if (err) {
      setFeedback({ type: 'error', message: err })
      setConsulta(null)
      return
    }

    setLoading(true)
    setFeedback({ type: 'info', message: 'Buscando registros…' })
    try {
      const res = await consultarAlumnoProfesor(dni)
      if (res.status !== 'success') {
        setConsulta(null)
        setFeedback({ type: 'error', message: res.message ?? 'No se pudo consultar.' })
        return
      }
      setConsulta(res)
      const n = res.registros?.length ?? 0
      setFeedback({
        type: 'success',
        message: n === 0
          ? `Alumno encontrado (${res.alumno}). Sin envíos cargados.`
          : `${n} registro${n === 1 ? '' : 's'} encontrado${n === 1 ? '' : 's'}.`,
      })
    } catch {
      setConsulta(null)
      setFeedback({ type: 'error', message: 'Error de conexión. Intente nuevamente.' })
    } finally {
      setLoading(false)
    }
  }, [dni])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void buscar()
  }

  const handleDelete = async (registro: RegistroAlumno) => {
    const err = dniValidationMessage(dni)
    if (err) {
      setFeedback({ type: 'error', message: err })
      return
    }

    const ok = window.confirm(
      `¿Eliminar este envío (${techniqueLabel(registro.tecnica)}, ${registro.hoja}, fila ${registro.fila})?\n\n` +
        'El alumno recuperará un intento si aún no alcanzó el máximo.',
    )
    if (!ok) return

    setDeletingId(registro.id)
    setFeedback({ type: 'info', message: 'Eliminando registro…' })
    try {
      const res = await eliminarRegistroProfesor({
        dni,
        hoja: registro.hoja,
        fila: registro.fila,
      })
      if (res.status !== 'success') {
        setFeedback({ type: 'error', message: res.message ?? 'No se pudo eliminar.' })
        return
      }
      setFeedback({
        type: 'success',
        message: res.message ?? 'Registro eliminado.',
      })
      await buscar()
    } catch {
      setFeedback({ type: 'error', message: 'Error de conexión al eliminar.' })
    } finally {
      setDeletingId(null)
    }
  }

  const intentos = consulta?.intentosPorTecnica
  const registros = consulta?.registros ?? []

  return (
    <div className="min-h-screen p-4 flex items-center justify-center bg-muted/30">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>Consulta docente</CardTitle>
              <CardDescription>
                Buscá por DNI todos los envíos del alumno. Podés eliminar un registro para liberar un intento.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/form">Formulario alumno</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="space-y-2 flex-1 w-full">
              <label htmlFor="prof-dni" className="text-sm font-medium leading-none">
                DNI del alumno
              </label>
              <DniInput
                id="prof-dni"
                value={dni}
                onChange={setDni}
                disabled={loading || deletingId !== null}
                className={inputClassName}
                aria-invalid={!!dniValidationMessage(dni) && dni.length > 0}
              />
              <p className="text-xs text-muted-foreground">Solo números, 7 u 8 dígitos, sin puntos.</p>
            </div>
            <Button type="submit" disabled={loading || deletingId !== null || !dni}>
              {loading ? 'Buscando…' : 'Consultar'}
            </Button>
          </form>

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

          {consulta?.status === 'success' && (
            <>
              <div className="rounded-md border bg-muted/40 p-4 space-y-1">
                <p className="font-medium">{consulta.alumno}</p>
                <p className="text-sm text-muted-foreground">
                  DNI {consulta.dni} · Comisión {consulta.comision}
                </p>
                <p className="text-sm text-muted-foreground">
                  Máximo {consulta.intentosMaximos ?? 3} intentos por hoja (1 carga + 2 actualizaciones)
                </p>
              </div>

              {intentos && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Intentos por técnica</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {LAB_TECHNIQUES.map(tecnica => {
                      const info = intentos[tecnica]
                      const disp = info?.disponibles ?? consulta.intentosMaximos ?? 3
                      const usados = info?.usados ?? 0
                      return (
                        <div
                          key={tecnica}
                          className="flex justify-between items-center rounded-md border px-3 py-2 text-sm"
                        >
                          <span className="text-muted-foreground">{techniqueLabel(tecnica)}</span>
                          <span>
                            <span className="font-medium text-foreground">{disp}</span>
                            <span className="text-muted-foreground"> disp. · {usados} usados</span>
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Registros cargados</h3>
                {registros.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay envíos en Fosfato ni Redox.</p>
                ) : (
                  registros.map(reg => (
                    <RegistroCard
                      key={reg.id}
                      registro={reg}
                      deleting={deletingId === reg.id}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

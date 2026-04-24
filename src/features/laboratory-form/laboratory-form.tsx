import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const API_URL = "https://script.google.com/macros/s/AKfycbz8l-eW7JiQv6FCep00TUyGc5f0mFGvferIfzTZNOvJ7jCoxprUbSWW_9jNLdGLtRqJBA/exec" // Reemplaza con tu propia URL de Apps Script

const INDICADORES = [
  "Fenolftaleína",
  "Naranja de Metilo",
  "Rojo de Metilo",
  "Verde de Bromocresol",
  "Azul de Bromotimol",
  "Otro"
]

export default function LaboratoryForm() {
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)

  const [dni, setDni] = useState('')
  const [muestra, setMuestra] = useState('')
  const [ph, setPh] = useState('')
  const [tecnica, setTecnica] = useState('')

  const [t1, setT1] = useState({ tipo: '', normalidad: '', indicador: '', v1: '', v2: '' })
  const [t2, setT2] = useState({ tipo: '', normalidad: '', indicador: '', v1: '', v2: '' })

  const handleTecnicaChange = (val: string) => {
    setTecnica(val)
    if (val === '1-hcl-1-naoh') {
      setT1(prev => ({ ...prev, tipo: 'HCl', normalidad: '', indicador: '', v1: '', v2: '' }))
      setT2(prev => ({ ...prev, tipo: 'NaOH', normalidad: '', indicador: '', v1: '', v2: '' }))
    } else if (val === '2-hcl') {
      setT1(prev => ({ ...prev, tipo: 'HCl', normalidad: '', indicador: '', v1: '', v2: '' }))
      setT2(prev => ({ ...prev, tipo: 'HCl', normalidad: '', indicador: '', v1: '', v2: '' }))
    } else if (val === '2-naoh') {
      setT1(prev => ({ ...prev, tipo: 'NaOH', normalidad: '', indicador: '', v1: '', v2: '' }))
      setT2(prev => ({ ...prev, tipo: 'NaOH', normalidad: '', indicador: '', v1: '', v2: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tecnica) {
      setFeedback({ type: 'error', message: 'Debe seleccionar un tipo de técnica.' })
      return
    }

    setLoading(true)
    setFeedback({ type: 'info', message: 'Validando DNI y enviando...' })

    try {
      const payload: Record<string, string> = {
        dni, 
        muestra, 
        ph, 
        tecnica,
        // Grupo 2 HCl
        hcl2_n1: '', hcl2_ind1: '', hcl2_v1_1: '', hcl2_v2_1: '',
        hcl2_n2: '', hcl2_ind2: '', hcl2_v1_2: '', hcl2_v2_2: '',
        // Grupo 2 NaOH
        naoh2_n1: '', naoh2_ind1: '', naoh2_v1_1: '', naoh2_v2_1: '',
        naoh2_n2: '', naoh2_ind2: '', naoh2_v1_2: '', naoh2_v2_2: '',
        // Grupo Mixto (HCl y NaOH)
        mix_hcl_n: '', mix_hcl_ind: '', mix_hcl_v1: '', mix_hcl_v2: '',
        mix_naoh_n: '', mix_naoh_ind: '', mix_naoh_v1: '', mix_naoh_v2: ''
      }

      if (tecnica === '2-hcl') {
        payload.hcl2_n1 = t1.normalidad; payload.hcl2_ind1 = t1.indicador; payload.hcl2_v1_1 = t1.v1; payload.hcl2_v2_1 = t1.v2;
        payload.hcl2_n2 = t2.normalidad; payload.hcl2_ind2 = t2.indicador; payload.hcl2_v1_2 = t2.v1; payload.hcl2_v2_2 = t2.v2;
      } else if (tecnica === '2-naoh') {
        payload.naoh2_n1 = t1.normalidad; payload.naoh2_ind1 = t1.indicador; payload.naoh2_v1_1 = t1.v1; payload.naoh2_v2_1 = t1.v2;
        payload.naoh2_n2 = t2.normalidad; payload.naoh2_ind2 = t2.indicador; payload.naoh2_v1_2 = t2.v1; payload.naoh2_v2_2 = t2.v2;
      } else if (tecnica === '1-hcl-1-naoh') {
        payload.mix_hcl_n = t1.normalidad; payload.mix_hcl_ind = t1.indicador; payload.mix_hcl_v1 = t1.v1; payload.mix_hcl_v2 = t1.v2;
        payload.mix_naoh_n = t2.normalidad; payload.mix_naoh_ind = t2.indicador; payload.mix_naoh_v1 = t2.v1; payload.mix_naoh_v2 = t2.v2;
      }

      const respuesta = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "text/plain;charset=utf-8" }
      })

      const resultadoJSON = await respuesta.json()

      if (resultadoJSON.status === "success") {
        setFeedback({ type: 'success', message: `✅ ${resultadoJSON.message} (Alumno: ${resultadoJSON.alumno || dni})` })
        setDni(''); setMuestra(''); setPh(''); setTecnica('');
        setT1({ tipo: '', normalidad: '', indicador: '', v1: '', v2: '' })
        setT2({ tipo: '', normalidad: '', indicador: '', v1: '', v2: '' })
      } else {
        setFeedback({ type: 'error', message: `❌ Error: ${resultadoJSON.message}` })
      }
    } catch (error) {
      console.error(error)
      setFeedback({ type: 'error', message: 'Error de conexión. Intente nuevamente.' })
    } finally {
      setLoading(false)
    }
  }

  const inputClassName = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"

  const renderTitrationBlock = (title: string, data: { tipo: string, normalidad: string, indicador: string, v1: string, v2: string }, setData: any) => (
      <fieldset className="border rounded-md p-4 space-y-4">
        <legend className="text-sm font-semibold px-2">{title} ({data.tipo})</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Normalidad (N)</label>
            <input required type="number" step="0.0001" className={inputClassName} value={data.normalidad} onChange={e => setData({ ...data, normalidad: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Indicador</label>
            <select required className={inputClassName} value={data.indicador} onChange={e => setData({ ...data, indicador: e.target.value })}>
              <option value="">Seleccione...</option>
              {INDICADORES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Volumen 1 (mL)</label>
            <input required type="number" step="0.01" className={inputClassName} value={data.v1} onChange={e => setData({ ...data, v1: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Volumen 2 (mL)</label>
            <input required type="number" step="0.01" className={inputClassName} value={data.v2} onChange={e => setData({ ...data, v2: e.target.value })} />
          </div>
        </div>
      </fieldset>
    )

  return (
    <div className="min-h-screen p-4 flex items-center justify-center bg-muted/30">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Registro de Resultados de Laboratorio</CardTitle>
          <CardDescription>Complete sus dos valoraciones.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">DNI (sin puntos)</label>
                <input required type="text" className={inputClassName} value={dni} onChange={e => setDni(e.target.value)} placeholder="Ej: 12345678" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Muestra Asignada</label>
                <input required type="text" className={inputClassName} value={muestra} onChange={e => setMuestra(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">pH Inicial</label>
                <input required type="number" step="0.01" className={inputClassName} value={ph} onChange={e => setPh(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Tipo de Técnica</label>
                <select required className={inputClassName} value={tecnica} onChange={e => handleTecnicaChange(e.target.value)}>
                  <option value="">Seleccione...</option>
                  <option value="1-hcl-1-naoh">1 con HCl y 1 con NaOH</option>
                  <option value="2-naoh">2 con NaOH</option>
                  <option value="2-hcl">2 con HCl</option>
                </select>
              </div>
            </div>

            {tecnica && (
              <div className="space-y-6">
                {renderTitrationBlock('Primera Valoración', t1, setT1)}
                {renderTitrationBlock('Segunda Valoración', t2, setT2)}
              </div>
            )}

            {feedback && (
              <div className={`p-3 rounded-md text-sm font-medium ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : feedback.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                {feedback.message}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Resultados'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
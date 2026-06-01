import type { LabTechnique } from './techniques'

export type IntentosTecnica = {
  usados: number
  disponibles: number
}

export type RegistroAlumno = {
  id: string
  hoja: 'Fosfato' | 'Redox' | string
  fila: number
  tecnica: string
  timestamp: string
  datos: Record<string, string | number>
}

export type ConsultaProfesorResponse = {
  status: 'success' | 'error'
  message?: string
  dni?: string
  alumno?: string
  comision?: string
  intentosMaximos?: number
  intentosPorTecnica?: Partial<Record<LabTechnique | string, IntentosTecnica>>
  registros?: RegistroAlumno[]
}

export type EliminarRegistroResponse = {
  status: 'success' | 'error'
  message?: string
  hoja?: string
  filaEliminada?: number
  tecnica?: string
  intentosMaximos?: number
  intentosUsados?: number
  intentosDisponibles?: number
}

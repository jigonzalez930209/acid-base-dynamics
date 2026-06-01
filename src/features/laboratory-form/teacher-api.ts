import { LAB_API_URL, labFetchJson } from './api'
import type { ConsultaProfesorResponse, EliminarRegistroResponse } from './teacher-types'

export async function consultarAlumnoProfesor(dni: string): Promise<ConsultaProfesorResponse> {
  const params = new URLSearchParams({
    accion: 'profesor',
    dni: dni.replace(/\D/g, ''),
  })
  return labFetchJson(`${LAB_API_URL}?${params}`)
}

export async function eliminarRegistroProfesor(payload: {
  dni: string
  hoja: string
  fila: number
}): Promise<EliminarRegistroResponse> {
  return labFetchJson(`${LAB_API_URL}`, {
    method: 'POST',
    body: JSON.stringify({
      accion: 'eliminar',
      dni: payload.dni.replace(/\D/g, ''),
      hoja: payload.hoja,
      fila: payload.fila,
    }),
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  })
}

import { TiempoLiturgico, isTiempoLiturgico } from './TiempoLiturgico.vo'

export type TipoSolemnidad = 'liturgica' | 'mariana' | 'propia'

export interface Solemnidad {
  nombre: string
  tipo: TipoSolemnidad
  fecha?: string              // MM-DD, opcional para fechas variables (Pentecostés)
  descripcion?: string
  tiempoLiturgico?: TiempoLiturgico  // obligatorio solo para tipo 'liturgica'
}

export const isSolemnidad = (value: unknown): value is Solemnidad => {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  if (typeof v.nombre !== 'string' || v.nombre.length === 0) return false
  if (!['liturgica', 'mariana', 'propia'].includes(v.tipo as string)) return false
  if (v.tipo === 'liturgica' && !isTiempoLiturgico(v.tiempoLiturgico as string)) return false
  if (v.fecha !== undefined && !/^\d{2}-\d{2}$/.test(v.fecha as string)) return false
  return true
}
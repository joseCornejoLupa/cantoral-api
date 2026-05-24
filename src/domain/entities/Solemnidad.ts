import { TipoSolemnidad } from '../value-objects/Solemnidad.vo'
import { TiempoLiturgico } from '../value-objects/TiempoLiturgico.vo'

export interface Solemnidad {
  id: string
  nombre: string
  tipo: TipoSolemnidad
  fecha?: string
  descripcion?: string
  tiempoLiturgico?: TiempoLiturgico
}

import { Partitura } from '../../entities/Partitura'

export interface FiltrosPartitura {
  idioma?: string
  impresa?: boolean
  solemnidadId?: string
  contexto?: string
  momento?: string
}

export interface IPartituraRepository {
  crear(data: Omit<Partitura, 'id'>): Promise<Partitura>
  buscarPorId(id: string): Promise<Partitura | null>
  listar(filtros?: FiltrosPartitura): Promise<Partitura[]>
  actualizar(id: string, data: Partial<Omit<Partitura, 'id'>>): Promise<Partitura>
  actualizarImpresa(id: string, impresa: boolean): Promise<Partitura>
  buscarRelacionadas(id: string): Promise<Partitura[]>
  eliminar(id: string): Promise<void>
}

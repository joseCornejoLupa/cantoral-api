import { Solemnidad } from '../../entities/Solemnidad'

export interface ISolemnidadRepository {
  crear(data: Omit<Solemnidad, 'id'>): Promise<Solemnidad>
  buscarPorId(id: string): Promise<Solemnidad | null>
  listar(tipo?: 'liturgica' | 'mariana' | 'propia'): Promise<Solemnidad[]>
}

import { Evento, CantoEnEvento } from '../../entities/Evento'

export interface IEventoRepository {
  crear(data: Omit<Evento, 'id'>): Promise<Evento>
  buscarPorId(id: string): Promise<Evento | null>
  listar(): Promise<Evento[]>
  eliminar(id: string): Promise<void>
}

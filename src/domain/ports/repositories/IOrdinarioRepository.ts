import { Ordinario, ParteOrdinario } from '../../entities/Ordinario'

export interface IOrdinarioRepository {
  crear(data: Omit<Ordinario, 'id' | 'piezas'>): Promise<Ordinario>
  buscarPorId(id: string): Promise<Ordinario | null>
  listar(): Promise<Ordinario[]>
  asignarPieza(ordinarioId: string, partituraId: string, parte: ParteOrdinario): Promise<Ordinario>
}

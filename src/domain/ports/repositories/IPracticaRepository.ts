import { Practica } from '../../entities/Practica'
import { Partitura } from '../../entities/Partitura'

export interface IPracticaRepository {
  crear(data: Omit<Practica, 'id'>): Promise<Practica>
  buscarPorId(id: string): Promise<Practica | null>
  listar(): Promise<Practica[]>
  listarNoImpresos(practicaId: string): Promise<Partitura[]>
  eliminar(id: string): Promise<void>
}

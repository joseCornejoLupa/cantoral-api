import { IPracticaRepository } from '../../../domain/ports/repositories/IPracticaRepository'
import { Practica } from '../../../domain/entities/Practica'

export class ListarPracticas {
  constructor(private readonly repo: IPracticaRepository) {}

  async execute(): Promise<Practica[]> {
    return this.repo.listar()
  }
}

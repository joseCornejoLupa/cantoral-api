import { IPracticaRepository } from '../../../domain/ports/repositories/IPracticaRepository'
import { Partitura } from '../../../domain/entities/Partitura'
import { NotFoundError } from '../../../shared/errors/AppError'

export class ListarNoImpresos {
  constructor(private readonly repo: IPracticaRepository) {}

  async execute(practicaId: string): Promise<Partitura[]> {
    const existe = await this.repo.buscarPorId(practicaId)
    if (!existe) throw new NotFoundError(`Práctica ${practicaId} no encontrada`)
    return this.repo.listarNoImpresos(practicaId)
  }
}

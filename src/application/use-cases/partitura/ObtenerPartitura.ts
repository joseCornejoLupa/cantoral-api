import { IPartituraRepository } from '../../../domain/ports/repositories/IPartituraRepository'
import { Partitura } from '../../../domain/entities/Partitura'
import { NotFoundError } from '../../../shared/errors/AppError'

export class ObtenerPartitura {
  constructor(private readonly repo: IPartituraRepository) {}

  async execute(id: string): Promise<Partitura> {
    const partitura = await this.repo.buscarPorId(id)
    if (!partitura) throw new NotFoundError(`Partitura ${id} no encontrada`)
    return partitura
  }
}

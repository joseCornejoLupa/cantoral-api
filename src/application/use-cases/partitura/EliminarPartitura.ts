import { IPartituraRepository } from '../../../domain/ports/repositories/IPartituraRepository'
import { NotFoundError } from '../../../shared/errors/AppError'

export class EliminarPartitura {
  constructor(private readonly repo: IPartituraRepository) {}

  async execute(id: string): Promise<void> {
    const existe = await this.repo.buscarPorId(id)
    if (!existe) throw new NotFoundError(`Partitura ${id} no encontrada`)
    await this.repo.eliminar(id)
  }
}

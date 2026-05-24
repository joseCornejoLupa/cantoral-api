import { IPartituraRepository } from '../../../domain/ports/repositories/IPartituraRepository'
import { Partitura } from '../../../domain/entities/Partitura'
import { NotFoundError } from '../../../shared/errors/AppError'

export class ActualizarImpresa {
  constructor(private readonly repo: IPartituraRepository) {}

  async execute(id: string, impresa: boolean): Promise<Partitura> {
    const existe = await this.repo.buscarPorId(id)
    if (!existe) throw new NotFoundError(`Partitura ${id} no encontrada`)
    return this.repo.actualizarImpresa(id, impresa)
  }
}

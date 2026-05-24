import { IPartituraRepository } from '../../../domain/ports/repositories/IPartituraRepository'
import { Partitura } from '../../../domain/entities/Partitura'
import { ActualizarPartituraDtoType } from '../../dtos/partitura.dto'
import { NotFoundError } from '../../../shared/errors/AppError'

export class ActualizarPartitura {
  constructor(private readonly repo: IPartituraRepository) {}

  async execute(id: string, dto: ActualizarPartituraDtoType): Promise<Partitura> {
    const existe = await this.repo.buscarPorId(id)
    if (!existe) throw new NotFoundError(`Partitura ${id} no encontrada`)
    return this.repo.actualizar(id, dto as Partial<Omit<Partitura, 'id'>>)
  }
}

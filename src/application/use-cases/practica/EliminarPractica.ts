import { IPracticaRepository } from '../../../domain/ports/repositories/IPracticaRepository'
import { NotFoundError } from '../../../shared/errors/AppError'

export class EliminarPractica {
  constructor(private readonly repo: IPracticaRepository) {}

  async execute(id: string): Promise<void> {
    const existe = await this.repo.buscarPorId(id)
    if (!existe) throw new NotFoundError(`Práctica ${id} no encontrada`)
    await this.repo.eliminar(id)
  }
}

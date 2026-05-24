import { IEventoRepository } from '../../../domain/ports/repositories/IEventoRepository'
import { NotFoundError } from '../../../shared/errors/AppError'

export class EliminarEvento {
  constructor(private readonly repo: IEventoRepository) {}

  async execute(id: string): Promise<void> {
    const existe = await this.repo.buscarPorId(id)
    if (!existe) throw new NotFoundError(`Evento ${id} no encontrado`)
    await this.repo.eliminar(id)
  }
}

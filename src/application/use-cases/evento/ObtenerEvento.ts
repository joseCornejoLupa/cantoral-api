import { IEventoRepository } from '../../../domain/ports/repositories/IEventoRepository'
import { Evento } from '../../../domain/entities/Evento'
import { NotFoundError } from '../../../shared/errors/AppError'

export class ObtenerEvento {
  constructor(private readonly repo: IEventoRepository) {}

  async execute(id: string): Promise<Evento> {
    const evento = await this.repo.buscarPorId(id)
    if (!evento) throw new NotFoundError(`Evento ${id} no encontrado`)
    return evento
  }
}

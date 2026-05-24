import { IEventoRepository } from '../../../domain/ports/repositories/IEventoRepository'
import { Evento } from '../../../domain/entities/Evento'

export class ListarEventos {
  constructor(private readonly repo: IEventoRepository) {}

  async execute(): Promise<Evento[]> {
    return this.repo.listar()
  }
}

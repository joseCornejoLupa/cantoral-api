import { IPartituraRepository, FiltrosPartitura } from '../../../domain/ports/repositories/IPartituraRepository'
import { Partitura } from '../../../domain/entities/Partitura'

export class ListarPartituras {
  constructor(private readonly repo: IPartituraRepository) {}

  async execute(filtros?: FiltrosPartitura): Promise<Partitura[]> {
    return this.repo.listar(filtros)
  }
}

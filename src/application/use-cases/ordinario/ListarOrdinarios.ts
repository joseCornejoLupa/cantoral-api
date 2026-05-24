import { IOrdinarioRepository } from '../../../domain/ports/repositories/IOrdinarioRepository'
import { Ordinario } from '../../../domain/entities/Ordinario'

export class ListarOrdinarios {
  constructor(private readonly repo: IOrdinarioRepository) {}

  async execute(): Promise<Ordinario[]> {
    return this.repo.listar()
  }
}

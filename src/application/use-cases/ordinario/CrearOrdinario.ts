import { IOrdinarioRepository } from '../../../domain/ports/repositories/IOrdinarioRepository'
import { Ordinario } from '../../../domain/entities/Ordinario'
import { CrearOrdinarioDtoType } from '../../dtos/ordinario.dto'

export class CrearOrdinario {
  constructor(private readonly repo: IOrdinarioRepository) {}

  async execute(dto: CrearOrdinarioDtoType): Promise<Ordinario> {
    return this.repo.crear(dto)
  }
}

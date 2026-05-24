import { IPracticaRepository } from '../../../domain/ports/repositories/IPracticaRepository'
import { Practica } from '../../../domain/entities/Practica'
import { CrearPracticaDtoType } from '../../dtos/practica.dto'

export class CrearPractica {
  constructor(private readonly repo: IPracticaRepository) {}

  async execute(dto: CrearPracticaDtoType): Promise<Practica> {
    return this.repo.crear({
      fecha: new Date(dto.fecha),
      nota: dto.nota,
      partituraIds: dto.partituraIds,
    })
  }
}

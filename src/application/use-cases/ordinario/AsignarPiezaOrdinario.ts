import { IOrdinarioRepository } from '../../../domain/ports/repositories/IOrdinarioRepository'
import { Ordinario, ParteOrdinario } from '../../../domain/entities/Ordinario'
import { AsignarPiezaDtoType } from '../../dtos/ordinario.dto'
import { NotFoundError } from '../../../shared/errors/AppError'

export class AsignarPiezaOrdinario {
  constructor(private readonly repo: IOrdinarioRepository) {}

  async execute(ordinarioId: string, dto: AsignarPiezaDtoType): Promise<Ordinario> {
    const existe = await this.repo.buscarPorId(ordinarioId)
    if (!existe) throw new NotFoundError(`Ordinario ${ordinarioId} no encontrado`)
    return this.repo.asignarPieza(ordinarioId, dto.partituraId, dto.parte as ParteOrdinario)
  }
}

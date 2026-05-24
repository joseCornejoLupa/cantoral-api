import { ISolemnidadRepository } from '../../../domain/ports/repositories/ISolemnidadRepository'
import { Solemnidad } from '../../../domain/entities/Solemnidad'
import { CrearSolemnidadDtoType } from '../../dtos/solemnidad.dto'
import { AppError } from '../../../shared/errors/AppError'

export class CrearSolemnidad {
  constructor(private readonly repo: ISolemnidadRepository) {}

  async execute(dto: CrearSolemnidadDtoType): Promise<Solemnidad> {
    if (dto.tipo === 'liturgica' && !dto.tiempoLiturgico) {
      throw new AppError('tiempoLiturgico es obligatorio para solemnidades litúrgicas', 400)
    }

    return this.repo.crear({
      nombre: dto.nombre,
      tipo: dto.tipo,
      fecha: dto.fecha,
      descripcion: dto.descripcion,
      tiempoLiturgico: dto.tipo === 'liturgica' ? dto.tiempoLiturgico as Solemnidad['tiempoLiturgico'] : undefined,
    })
  }
}

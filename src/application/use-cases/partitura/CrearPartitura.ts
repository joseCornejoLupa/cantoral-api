import { IPartituraRepository } from '../../../domain/ports/repositories/IPartituraRepository'
import { Partitura } from '../../../domain/entities/Partitura'
import { CrearPartituraDtoType } from '../../dtos/partitura.dto'
import { isMomentoValidoParaContexto } from '../../../domain/value-objects/Momento.vo'
import { isContexto, Contexto } from '../../../domain/value-objects/Contexto.vo'
import { AppError } from '../../../shared/errors/AppError'

export class CrearPartitura {
  constructor(private readonly repo: IPartituraRepository) {}

  async execute(dto: CrearPartituraDtoType): Promise<Partitura> {
    for (const { momento, contexto } of dto.aptitudes) {
      if (!isContexto(contexto)) {
        throw new AppError(`Contexto inválido: ${contexto}`, 400)
      }
      if (!isMomentoValidoParaContexto(momento, contexto as Contexto)) {
        throw new AppError(`Momento "${momento}" no válido para contexto "${contexto}"`, 400)
      }
    }

    return this.repo.crear({
      titulo: dto.titulo,
      autor: dto.autor,
      descripcion: dto.descripcion,
      idioma: dto.idioma as Partitura['idioma'],
      impresa: dto.impresa,
      creadoEn: new Date(),
      solemnidadIds: dto.solemnidadIds,
      aptitudes: dto.aptitudes as Partitura['aptitudes'],
    })
  }
}

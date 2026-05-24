import { IEventoRepository } from '../../../domain/ports/repositories/IEventoRepository'
import { Evento, CantoEnEvento } from '../../../domain/entities/Evento'
import { CrearEventoDtoType } from '../../dtos/evento.dto'
import { isMomentoValidoParaContexto } from '../../../domain/value-objects/Momento.vo'
import { isContexto, Contexto } from '../../../domain/value-objects/Contexto.vo'
import { AppError } from '../../../shared/errors/AppError'

export class CrearEvento {
  constructor(private readonly repo: IEventoRepository) {}

  async execute(dto: CrearEventoDtoType): Promise<Evento> {
    if (!isContexto(dto.tipo)) {
      throw new AppError(`Tipo de evento inválido: ${dto.tipo}`, 400)
    }

    for (const canto of dto.cantos) {
      if (!isMomentoValidoParaContexto(canto.momento, dto.tipo as Contexto)) {
        throw new AppError(`Momento "${canto.momento}" no válido para tipo "${dto.tipo}"`, 400)
      }
    }

    return this.repo.crear({
      tipo: dto.tipo as Contexto,
      fecha: new Date(dto.fecha),
      nota: dto.nota,
      cantos: dto.cantos as CantoEnEvento[],
    })
  }
}

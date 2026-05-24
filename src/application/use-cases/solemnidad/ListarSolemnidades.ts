import { ISolemnidadRepository } from '../../../domain/ports/repositories/ISolemnidadRepository'
import { Solemnidad } from '../../../domain/entities/Solemnidad'

export class ListarSolemnidades {
  constructor(private readonly repo: ISolemnidadRepository) {}

  async execute(tipo?: 'liturgica' | 'mariana' | 'propia'): Promise<Solemnidad[]> {
    return this.repo.listar(tipo)
  }
}

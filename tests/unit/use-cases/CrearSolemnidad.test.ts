import { CrearSolemnidad } from '../../../src/application/use-cases/solemnidad/CrearSolemnidad'
import { ISolemnidadRepository } from '../../../src/domain/ports/repositories/ISolemnidadRepository'
import { Solemnidad } from '../../../src/domain/entities/Solemnidad'
import { TiempoLiturgico } from '../../../src/domain/value-objects/TiempoLiturgico.vo'
import { AppError } from '../../../src/shared/errors/AppError'

const makeRepo = (overrides?: Partial<ISolemnidadRepository>): ISolemnidadRepository => ({
  crear: jest.fn(),
  buscarPorId: jest.fn(),
  listar: jest.fn(),
  ...overrides,
})

const baseSolemnidad: Solemnidad = {
  id: 'uuid-1',
  nombre: 'Navidad',
  tipo: 'liturgica',
  tiempoLiturgico: TiempoLiturgico.NAVIDAD,
}

describe('CrearSolemnidad', () => {
  it('crea solemnidad litúrgica con tiempoLiturgico', async () => {
    const repo = makeRepo({ crear: jest.fn().mockResolvedValue(baseSolemnidad) })
    const uc = new CrearSolemnidad(repo)

    const result = await uc.execute({
      tipo: 'liturgica',
      nombre: 'Navidad',
      tiempoLiturgico: TiempoLiturgico.NAVIDAD,
    })

    expect(result).toEqual(baseSolemnidad)
  })

  it('crea solemnidad mariana sin tiempoLiturgico', async () => {
    const mariana: Solemnidad = { id: 'uuid-2', nombre: 'Guadalupe', tipo: 'mariana' }
    const repo = makeRepo({ crear: jest.fn().mockResolvedValue(mariana) })
    const uc = new CrearSolemnidad(repo)

    const result = await uc.execute({ tipo: 'mariana', nombre: 'Guadalupe' })
    expect(result.tipo).toBe('mariana')
  })
})

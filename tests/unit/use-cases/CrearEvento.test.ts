import { CrearEvento } from '../../../src/application/use-cases/evento/CrearEvento'
import { IEventoRepository } from '../../../src/domain/ports/repositories/IEventoRepository'
import { Evento } from '../../../src/domain/entities/Evento'
import { Contexto } from '../../../src/domain/value-objects/Contexto.vo'
import { MomentoMisa, MomentoAdoracion } from '../../../src/domain/value-objects/Momento.vo'
import { AppError } from '../../../src/shared/errors/AppError'

const makeRepo = (overrides?: Partial<IEventoRepository>): IEventoRepository => ({
  crear: jest.fn(),
  buscarPorId: jest.fn(),
  listar: jest.fn(),
  ...overrides,
})

const baseEvento: Evento = {
  id: 'uuid-1',
  tipo: Contexto.MISA,
  fecha: new Date('2024-12-25'),
  cantos: [{ partituraId: 'p1', momento: MomentoMisa.COMUNION }],
}

describe('CrearEvento', () => {
  it('crea evento con momentos válidos para el tipo', async () => {
    const repo = makeRepo({ crear: jest.fn().mockResolvedValue(baseEvento) })
    const uc = new CrearEvento(repo)

    const result = await uc.execute({
      tipo: Contexto.MISA,
      fecha: '2024-12-25T10:00:00.000Z',
      cantos: [{ partituraId: 'p1', momento: MomentoMisa.COMUNION }],
    })

    expect(result).toEqual(baseEvento)
  })

  it('lanza AppError si momento no corresponde al tipo de evento', async () => {
    const repo = makeRepo()
    const uc = new CrearEvento(repo)

    await expect(
      uc.execute({
        tipo: Contexto.MISA,
        fecha: '2024-12-25T10:00:00.000Z',
        cantos: [{ partituraId: 'p1', momento: MomentoAdoracion.TANTUM_ERGO }],
      })
    ).rejects.toThrow(AppError)
  })
})

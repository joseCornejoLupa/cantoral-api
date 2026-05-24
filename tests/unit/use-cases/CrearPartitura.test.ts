import { CrearPartitura } from '../../../src/application/use-cases/partitura/CrearPartitura'
import { IPartituraRepository } from '../../../src/domain/ports/repositories/IPartituraRepository'
import { Partitura } from '../../../src/domain/entities/Partitura'
import { Idioma } from '../../../src/domain/value-objects/Idioma.vo'
import { Contexto } from '../../../src/domain/value-objects/Contexto.vo'
import { MomentoMisa } from '../../../src/domain/value-objects/Momento.vo'
import { AppError } from '../../../src/shared/errors/AppError'

const makeRepo = (overrides?: Partial<IPartituraRepository>): IPartituraRepository => ({
  crear: jest.fn(),
  buscarPorId: jest.fn(),
  listar: jest.fn(),
  actualizar: jest.fn(),
  actualizarImpresa: jest.fn(),
  buscarRelacionadas: jest.fn(),
  ...overrides,
})

const basePartitura: Partitura = {
  id: 'uuid-1',
  titulo: 'Ave María',
  idioma: Idioma.ESPANOL,
  impresa: false,
  creadoEn: new Date(),
  solemnidadIds: [],
  aptitudes: [],
}

describe('CrearPartitura', () => {
  it('crea partitura con datos válidos', async () => {
    const repo = makeRepo({ crear: jest.fn().mockResolvedValue(basePartitura) })
    const uc = new CrearPartitura(repo)

    const result = await uc.execute({
      titulo: 'Ave María',
      idioma: Idioma.ESPANOL,
      impresa: false,
      solemnidadIds: [],
      aptitudes: [],
    })

    expect(result).toEqual(basePartitura)
    expect(repo.crear).toHaveBeenCalled()
  })

  it('lanza AppError si momento no es válido para contexto', async () => {
    const repo = makeRepo()
    const uc = new CrearPartitura(repo)

    await expect(
      uc.execute({
        titulo: 'Test',
        idioma: Idioma.ESPANOL,
        impresa: false,
        solemnidadIds: [],
        aptitudes: [{ momento: 'Pange Lingua', contexto: Contexto.MISA }],
      })
    ).rejects.toThrow(AppError)
  })

  it('acepta momento válido para contexto correcto', async () => {
    const repo = makeRepo({ crear: jest.fn().mockResolvedValue(basePartitura) })
    const uc = new CrearPartitura(repo)

    await expect(
      uc.execute({
        titulo: 'Test',
        idioma: Idioma.ESPANOL,
        impresa: false,
        solemnidadIds: [],
        aptitudes: [{ momento: MomentoMisa.COMUNION, contexto: Contexto.MISA }],
      })
    ).resolves.toBeDefined()
  })
})

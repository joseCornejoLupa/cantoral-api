import { isMomentoValidoParaContexto, MomentoMisa, MomentoAdoracion } from '../../../src/domain/value-objects/Momento.vo'
import { Contexto } from '../../../src/domain/value-objects/Contexto.vo'

describe('isMomentoValidoParaContexto', () => {
  it('acepta momento válido para misa', () => {
    expect(isMomentoValidoParaContexto(MomentoMisa.COMUNION, Contexto.MISA)).toBe(true)
  })

  it('rechaza momento de adoración en misa', () => {
    expect(isMomentoValidoParaContexto(MomentoAdoracion.TANTUM_ERGO, Contexto.MISA)).toBe(false)
  })

  it('acepta momento válido para adoración', () => {
    expect(isMomentoValidoParaContexto(MomentoAdoracion.PANGE_LINGUA, Contexto.ADORACION)).toBe(true)
  })

  it('rechaza momento inventado', () => {
    expect(isMomentoValidoParaContexto('Inventado', Contexto.MISA)).toBe(false)
  })
})

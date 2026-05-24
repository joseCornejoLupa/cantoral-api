import { isSolemnidad } from '../../../src/domain/value-objects/Solemnidad.vo'
import { TiempoLiturgico } from '../../../src/domain/value-objects/TiempoLiturgico.vo'

describe('isSolemnidad', () => {
  it('valida solemnidad litúrgica con tiempoLiturgico', () => {
    expect(isSolemnidad({
      nombre: 'Navidad',
      tipo: 'liturgica',
      tiempoLiturgico: TiempoLiturgico.NAVIDAD,
      fecha: '12-25',
    })).toBe(true)
  })

  it('rechaza solemnidad litúrgica sin tiempoLiturgico', () => {
    expect(isSolemnidad({ nombre: 'Navidad', tipo: 'liturgica' })).toBe(false)
  })

  it('valida solemnidad mariana sin tiempoLiturgico', () => {
    expect(isSolemnidad({ nombre: 'Guadalupe', tipo: 'mariana', fecha: '12-12' })).toBe(true)
  })

  it('rechaza fecha con formato incorrecto', () => {
    expect(isSolemnidad({ nombre: 'Test', tipo: 'mariana', fecha: '2024-12-12' })).toBe(false)
  })

  it('rechaza tipo inválido', () => {
    expect(isSolemnidad({ nombre: 'Test', tipo: 'desconocido' })).toBe(false)
  })
})

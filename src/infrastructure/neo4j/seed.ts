import 'dotenv/config'
import { getDriver, closeDriver } from './driver'
import { TiempoLiturgico } from '../../domain/value-objects/TiempoLiturgico.vo'
import { Contexto } from '../../domain/value-objects/Contexto.vo'
import { MomentosPorContexto } from '../../domain/value-objects/Momento.vo'
import { v4 as uuidv4 } from 'uuid'

const solemnidades = [
  { nombre: 'Adviento', tipo: 'liturgica', tiempoLiturgico: TiempoLiturgico.ADVIENTO },
  { nombre: 'Navidad', tipo: 'liturgica', tiempoLiturgico: TiempoLiturgico.NAVIDAD, fecha: '12-25' },
  { nombre: 'Epifanía', tipo: 'liturgica', tiempoLiturgico: TiempoLiturgico.NAVIDAD, fecha: '01-06' },
  { nombre: 'Cuaresma', tipo: 'liturgica', tiempoLiturgico: TiempoLiturgico.CUARESMA },
  { nombre: 'Semana Santa', tipo: 'liturgica', tiempoLiturgico: TiempoLiturgico.SEMANA_SANTA },
  { nombre: 'Pascua de Resurrección', tipo: 'liturgica', tiempoLiturgico: TiempoLiturgico.PASCUA },
  { nombre: 'Pentecostés', tipo: 'liturgica', tiempoLiturgico: TiempoLiturgico.PASCUA },
  { nombre: 'Corpus Christi', tipo: 'liturgica', tiempoLiturgico: TiempoLiturgico.TIEMPO_ORDINARIO },
  { nombre: 'Cristo Rey', tipo: 'liturgica', tiempoLiturgico: TiempoLiturgico.TIEMPO_ORDINARIO },
  { nombre: 'Inmaculada Concepción', tipo: 'mariana', fecha: '12-08' },
  { nombre: 'Virgen de Guadalupe', tipo: 'mariana', fecha: '12-12' },
  { nombre: 'Asunción de María', tipo: 'mariana', fecha: '08-15' },
  { nombre: 'Nuestra Señora del Rosario', tipo: 'mariana', fecha: '10-07' },
  { nombre: 'Domingo ordinario', tipo: 'propia' },
  { nombre: 'Difuntos', tipo: 'propia', fecha: '11-02' },
  { nombre: 'Bautismo', tipo: 'propia' },
  { nombre: 'Matrimonio', tipo: 'propia' },
]

const seed = async () => {
  const driver = getDriver()
  const session = driver.session()

  try {
    console.log('Sembrando solemnidades...')
    for (const sol of solemnidades) {
      await session.run(
        `MERGE (s:Solemnidad {nombre: $nombre})
        ON CREATE SET s.id = $id, s.tipo = $tipo, s.fecha = $fecha,
          s.tiempoLiturgico = $tiempoLiturgico
        ON MATCH SET s.tipo = $tipo, s.fecha = $fecha,
          s.tiempoLiturgico = $tiempoLiturgico`,
        {
          id: uuidv4(),
          nombre: sol.nombre,
          tipo: sol.tipo,
          fecha: (sol as { fecha?: string }).fecha ?? null,
          tiempoLiturgico: (sol as { tiempoLiturgico?: string }).tiempoLiturgico ?? null,
        }
      )
    }
    console.log(`  ${solemnidades.length} solemnidades sembradas`)

    console.log('Sembrando nodos Contexto y Momento...')
    for (const [contexto, momentos] of Object.entries(MomentosPorContexto)) {
      await session.run(
        `MERGE (c:Contexto {nombre: $contexto})`,
        { contexto }
      )
      for (const [, nombre] of Object.entries(momentos)) {
        await session.run(
          `MATCH (c:Contexto {nombre: $contexto})
          MERGE (m:Momento {nombre: $nombre, contexto: $contexto})
          MERGE (m)-[:DENTRO_DE]->(c)`,
          { contexto, nombre }
        )
      }
    }
    console.log(`  ${Object.keys(Contexto).length} contextos sembrados con sus momentos`)

    console.log('Seed completado.')
  } finally {
    await session.close()
    await closeDriver()
  }
}

seed().catch(err => {
  console.error('Error en seed:', err)
  process.exit(1)
})

import { Driver } from 'neo4j-driver'
import { v4 as uuidv4 } from 'uuid'
import { ISolemnidadRepository } from '../../../domain/ports/repositories/ISolemnidadRepository'
import { Solemnidad } from '../../../domain/entities/Solemnidad'
import { mapSolemnidad } from '../mappers/solemnidadMapper'

export class Neo4jSolemnidadRepository implements ISolemnidadRepository {
  constructor(private readonly driver: Driver) {}

  private session() {
    return this.driver.session()
  }

  async crear(data: Omit<Solemnidad, 'id'>): Promise<Solemnidad> {
    const session = this.session()
    try {
      const id = uuidv4()
      const result = await session.run(
        `CREATE (s:Solemnidad {
          id: $id, nombre: $nombre, tipo: $tipo,
          fecha: $fecha, descripcion: $descripcion, tiempoLiturgico: $tiempoLiturgico
        })
        RETURN s`,
        {
          id,
          nombre: data.nombre,
          tipo: data.tipo,
          fecha: data.fecha ?? null,
          descripcion: data.descripcion ?? null,
          tiempoLiturgico: data.tiempoLiturgico ?? null,
        }
      )
      return mapSolemnidad(result.records[0])
    } finally {
      await session.close()
    }
  }

  async buscarPorId(id: string): Promise<Solemnidad | null> {
    const session = this.session()
    try {
      const result = await session.run(
        `MATCH (s:Solemnidad {id: $id}) RETURN s`,
        { id }
      )
      if (result.records.length === 0) return null
      return mapSolemnidad(result.records[0])
    } finally {
      await session.close()
    }
  }

  async listar(tipo?: 'liturgica' | 'mariana' | 'propia'): Promise<Solemnidad[]> {
    const session = this.session()
    try {
      const result = await session.run(
        `MATCH (s:Solemnidad)
        WHERE $tipo IS NULL OR s.tipo = $tipo
        RETURN s ORDER BY s.nombre`,
        { tipo: tipo ?? null }
      )
      return result.records.map(mapSolemnidad)
    } finally {
      await session.close()
    }
  }
}

import { Driver } from 'neo4j-driver'
import { v4 as uuidv4 } from 'uuid'
import { IEventoRepository } from '../../../domain/ports/repositories/IEventoRepository'
import { Evento } from '../../../domain/entities/Evento'
import { mapEvento } from '../mappers/eventoMapper'

export class Neo4jEventoRepository implements IEventoRepository {
  constructor(private readonly driver: Driver) {}

  private session() {
    return this.driver.session()
  }

  async crear(data: Omit<Evento, 'id'>): Promise<Evento> {
    const session = this.session()
    try {
      const id = uuidv4()
      const fecha = data.fecha.toISOString()

      const result = await session.run(
        `CREATE (e:Evento {id: $id, tipo: $tipo, fecha: $fecha, nota: $nota})
        WITH e
        UNWIND $cantos AS canto
        MATCH (p:Partitura {id: canto.partituraId})
        MERGE (p)-[:CANTADA_EN {momento: canto.momento}]->(e)
        WITH e
        OPTIONAL MATCH (p2:Partitura)-[r:CANTADA_EN]->(e)
        RETURN e,
          collect({partituraId: p2.id, momento: r.momento}) AS cantos`,
        {
          id,
          tipo: data.tipo,
          fecha,
          nota: data.nota ?? null,
          cantos: data.cantos,
        }
      )
      return mapEvento(result.records[0])
    } finally {
      await session.close()
    }
  }

  async buscarPorId(id: string): Promise<Evento | null> {
    const session = this.session()
    try {
      const result = await session.run(
        `MATCH (e:Evento {id: $id})
        OPTIONAL MATCH (p:Partitura)-[r:CANTADA_EN]->(e)
        RETURN e,
          collect({partituraId: p.id, momento: r.momento}) AS cantos`,
        { id }
      )
      if (result.records.length === 0) return null
      return mapEvento(result.records[0])
    } finally {
      await session.close()
    }
  }

  async eliminar(id: string): Promise<void> {
    const session = this.session()
    try {
      await session.run(`MATCH (e:Evento {id: $id}) DETACH DELETE e`, { id })
    } finally {
      await session.close()
    }
  }

  async listar(): Promise<Evento[]> {
    const session = this.session()
    try {
      const result = await session.run(
        `MATCH (e:Evento)
        OPTIONAL MATCH (p:Partitura)-[r:CANTADA_EN]->(e)
        RETURN e,
          collect({partituraId: p.id, momento: r.momento}) AS cantos
        ORDER BY e.fecha DESC`
      )
      return result.records.map(mapEvento)
    } finally {
      await session.close()
    }
  }
}

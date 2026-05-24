import { Driver } from 'neo4j-driver'
import { v4 as uuidv4 } from 'uuid'
import { IOrdinarioRepository } from '../../../domain/ports/repositories/IOrdinarioRepository'
import { Ordinario, ParteOrdinario } from '../../../domain/entities/Ordinario'
import { mapOrdinario } from '../mappers/ordinarioMapper'

export class Neo4jOrdinarioRepository implements IOrdinarioRepository {
  constructor(private readonly driver: Driver) {}

  private session() {
    return this.driver.session()
  }

  async crear(data: Omit<Ordinario, 'id' | 'piezas'>): Promise<Ordinario> {
    const session = this.session()
    try {
      const id = uuidv4()
      const result = await session.run(
        `CREATE (o:Ordinario {id: $id, nombre: $nombre, compositor: $compositor})
        RETURN o, [] AS piezas`,
        { id, nombre: data.nombre, compositor: data.compositor ?? null }
      )
      return mapOrdinario(result.records[0])
    } finally {
      await session.close()
    }
  }

  async buscarPorId(id: string): Promise<Ordinario | null> {
    const session = this.session()
    try {
      const result = await session.run(
        `MATCH (o:Ordinario {id: $id})
        OPTIONAL MATCH (p:Partitura)-[r:PERTENECE_A_ORDINARIO]->(o)
        RETURN o,
          collect({parte: r.parte, partituraId: p.id}) AS piezas`,
        { id }
      )
      if (result.records.length === 0) return null
      return mapOrdinario(result.records[0])
    } finally {
      await session.close()
    }
  }

  async listar(): Promise<Ordinario[]> {
    const session = this.session()
    try {
      const result = await session.run(
        `MATCH (o:Ordinario)
        OPTIONAL MATCH (p:Partitura)-[r:PERTENECE_A_ORDINARIO]->(o)
        RETURN o, collect({parte: r.parte, partituraId: p.id}) AS piezas
        ORDER BY o.nombre`
      )
      return result.records.map(mapOrdinario)
    } finally {
      await session.close()
    }
  }

  async asignarPieza(ordinarioId: string, partituraId: string, parte: ParteOrdinario): Promise<Ordinario> {
    const session = this.session()
    try {
      await session.run(
        `MATCH (o:Ordinario {id: $ordinarioId})
        MATCH (p:Partitura {id: $partituraId})
        MERGE (p)-[r:PERTENECE_A_ORDINARIO]->(o)
        SET r.parte = $parte`,
        { ordinarioId, partituraId, parte }
      )
      return (await this.buscarPorId(ordinarioId))!
    } finally {
      await session.close()
    }
  }
}

import { Driver } from 'neo4j-driver'
import { v4 as uuidv4 } from 'uuid'
import { IPracticaRepository } from '../../../domain/ports/repositories/IPracticaRepository'
import { Practica } from '../../../domain/entities/Practica'
import { Partitura } from '../../../domain/entities/Partitura'
import { mapPractica } from '../mappers/practicaMapper'
import { mapPartitura } from '../mappers/partituraMapper'

export class Neo4jPracticaRepository implements IPracticaRepository {
  constructor(private readonly driver: Driver) {}

  private session() {
    return this.driver.session()
  }

  async crear(data: Omit<Practica, 'id'>): Promise<Practica> {
    const session = this.session()
    try {
      const id = uuidv4()
      const fecha = data.fecha.toISOString()

      const result = await session.run(
        `CREATE (pr:Practica {id: $id, fecha: $fecha, nota: $nota})
        WITH pr
        UNWIND $partituraIds AS pid
        MATCH (p:Partitura {id: pid})
        MERGE (p)-[:ENSAYADA_EN]->(pr)
        WITH pr
        OPTIONAL MATCH (p2:Partitura)-[:ENSAYADA_EN]->(pr)
        RETURN pr,
          collect(p2.id) AS partituraIds`,
        {
          id,
          fecha,
          nota: data.nota ?? null,
          partituraIds: data.partituraIds,
        }
      )
      return mapPractica(result.records[0])
    } finally {
      await session.close()
    }
  }

  async buscarPorId(id: string): Promise<Practica | null> {
    const session = this.session()
    try {
      const result = await session.run(
        `MATCH (pr:Practica {id: $id})
        OPTIONAL MATCH (p:Partitura)-[:ENSAYADA_EN]->(pr)
        RETURN pr,
          collect(p.id) AS partituraIds`,
        { id }
      )
      if (result.records.length === 0) return null
      return mapPractica(result.records[0])
    } finally {
      await session.close()
    }
  }

  async listar(): Promise<Practica[]> {
    const session = this.session()
    try {
      const result = await session.run(
        `MATCH (pr:Practica)
        OPTIONAL MATCH (p:Partitura)-[:ENSAYADA_EN]->(pr)
        RETURN pr, collect(p.id) AS partituraIds
        ORDER BY pr.fecha DESC`
      )
      return result.records.map(mapPractica)
    } finally {
      await session.close()
    }
  }

  async eliminar(id: string): Promise<void> {
    const session = this.session()
    try {
      await session.run(`MATCH (pr:Practica {id: $id}) DETACH DELETE pr`, { id })
    } finally {
      await session.close()
    }
  }

  async listarNoImpresos(practicaId: string): Promise<Partitura[]> {
    const session = this.session()
    try {
      const result = await session.run(
        `MATCH (p:Partitura)-[:ENSAYADA_EN]->(:Practica {id: $practicaId})
        WHERE p.impresa = false
        OPTIONAL MATCH (p)-[:PERTENECE_A]->(s:Solemnidad)
        OPTIONAL MATCH (p)-[:APTA_PARA]->(m:Momento)
        RETURN p,
          collect(DISTINCT s.id) AS solemnidadIds,
          collect(DISTINCT {momento: m.nombre, contexto: m.contexto}) AS aptitudes
        ORDER BY p.titulo`,
        { practicaId }
      )
      return result.records.map(mapPartitura)
    } finally {
      await session.close()
    }
  }
}

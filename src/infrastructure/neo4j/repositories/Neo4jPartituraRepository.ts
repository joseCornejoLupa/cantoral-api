import { Driver } from 'neo4j-driver'
import { v4 as uuidv4 } from 'uuid'
import { IPartituraRepository, FiltrosPartitura } from '../../../domain/ports/repositories/IPartituraRepository'
import { Partitura } from '../../../domain/entities/Partitura'
import { mapPartitura } from '../mappers/partituraMapper'

export class Neo4jPartituraRepository implements IPartituraRepository {
  constructor(private readonly driver: Driver) {}

  private session() {
    return this.driver.session()
  }

  async crear(data: Omit<Partitura, 'id'>): Promise<Partitura> {
    const session = this.session()
    try {
      const id = uuidv4()
      const creadoEn = data.creadoEn.toISOString()

      const result = await session.run(
        `CREATE (p:Partitura {
          id: $id, titulo: $titulo, autor: $autor, descripcion: $descripcion,
          idioma: $idioma, impresa: $impresa, creadoEn: $creadoEn
        })
        WITH p
        CALL {
          WITH p
          UNWIND $aptitudes AS apt
          MERGE (m:Momento {nombre: apt.momento, contexto: apt.contexto})
          MERGE (p)-[:APTA_PARA]->(m)
          RETURN count(*) AS _apt
        }
        CALL {
          WITH p
          UNWIND $solemnidadIds AS sid
          MATCH (s:Solemnidad {id: sid})
          MERGE (p)-[:PERTENECE_A]->(s)
          RETURN count(*) AS _sol
        }
        OPTIONAL MATCH (p)-[:APTA_PARA]->(m2:Momento)
        OPTIONAL MATCH (p)-[:PERTENECE_A]->(s2:Solemnidad)
        RETURN p,
          collect(DISTINCT s2.id) AS solemnidadIds,
          collect(DISTINCT {momento: m2.nombre, contexto: m2.contexto}) AS aptitudes`,
        {
          id,
          titulo: data.titulo,
          autor: data.autor ?? null,
          descripcion: data.descripcion ?? null,
          idioma: data.idioma,
          impresa: data.impresa,
          creadoEn,
          aptitudes: data.aptitudes,
          solemnidadIds: data.solemnidadIds,
        }
      )
      return mapPartitura(result.records[0])
    } finally {
      await session.close()
    }
  }

  async buscarPorId(id: string): Promise<Partitura | null> {
    const session = this.session()
    try {
      const result = await session.run(
        `MATCH (p:Partitura {id: $id})
        OPTIONAL MATCH (p)-[:PERTENECE_A]->(s:Solemnidad)
        OPTIONAL MATCH (p)-[:APTA_PARA]->(m:Momento)
        RETURN p,
          collect(DISTINCT s.id) AS solemnidadIds,
          collect(DISTINCT {momento: m.nombre, contexto: m.contexto}) AS aptitudes`,
        { id }
      )
      if (result.records.length === 0) return null
      return mapPartitura(result.records[0])
    } finally {
      await session.close()
    }
  }

  async listar(filtros?: FiltrosPartitura): Promise<Partitura[]> {
    const session = this.session()
    try {
      const conditions: string[] = ['1=1']
      const params: Record<string, unknown> = {}

      if (filtros?.idioma) {
        conditions.push('p.idioma = $idioma')
        params.idioma = filtros.idioma
      }
      if (filtros?.impresa !== undefined) {
        conditions.push('p.impresa = $impresa')
        params.impresa = filtros.impresa
      }
      if (filtros?.solemnidadId) {
        conditions.push('EXISTS { MATCH (p)-[:PERTENECE_A]->(:Solemnidad {id: $solemnidadId}) }')
        params.solemnidadId = filtros.solemnidadId
      }
      if (filtros?.contexto) {
        conditions.push('EXISTS { MATCH (p)-[:APTA_PARA]->(:Momento {contexto: $contexto}) }')
        params.contexto = filtros.contexto
      }
      if (filtros?.momento) {
        conditions.push('EXISTS { MATCH (p)-[:APTA_PARA]->(:Momento {nombre: $momento}) }')
        params.momento = filtros.momento
      }

      const result = await session.run(
        `MATCH (p:Partitura)
        WHERE ${conditions.join(' AND ')}
        OPTIONAL MATCH (p)-[:PERTENECE_A]->(s:Solemnidad)
        OPTIONAL MATCH (p)-[:APTA_PARA]->(m:Momento)
        RETURN p,
          collect(DISTINCT s.id) AS solemnidadIds,
          collect(DISTINCT {momento: m.nombre, contexto: m.contexto}) AS aptitudes
        ORDER BY p.titulo`,
        params
      )
      return result.records.map(mapPartitura)
    } finally {
      await session.close()
    }
  }

  async actualizar(id: string, data: Partial<Omit<Partitura, 'id'>>): Promise<Partitura> {
    const session = this.session()
    try {
      const sets: string[] = []
      const params: Record<string, unknown> = { id }

      if (data.titulo !== undefined) { sets.push('p.titulo = $titulo'); params.titulo = data.titulo }
      if (data.autor !== undefined) { sets.push('p.autor = $autor'); params.autor = data.autor }
      if (data.descripcion !== undefined) { sets.push('p.descripcion = $descripcion'); params.descripcion = data.descripcion }
      if (data.idioma !== undefined) { sets.push('p.idioma = $idioma'); params.idioma = data.idioma }
      if (data.impresa !== undefined) { sets.push('p.impresa = $impresa'); params.impresa = data.impresa }

      const setClause = sets.length > 0 ? `SET ${sets.join(', ')}` : ''

      const result = await session.run(
        `MATCH (p:Partitura {id: $id})
        ${setClause}
        WITH p
        OPTIONAL MATCH (p)-[:PERTENECE_A]->(s:Solemnidad)
        OPTIONAL MATCH (p)-[:APTA_PARA]->(m:Momento)
        RETURN p,
          collect(DISTINCT s.id) AS solemnidadIds,
          collect(DISTINCT {momento: m.nombre, contexto: m.contexto}) AS aptitudes`,
        params
      )
      return mapPartitura(result.records[0])
    } finally {
      await session.close()
    }
  }

  async actualizarImpresa(id: string, impresa: boolean): Promise<Partitura> {
    const session = this.session()
    try {
      const result = await session.run(
        `MATCH (p:Partitura {id: $id})
        SET p.impresa = $impresa
        WITH p
        OPTIONAL MATCH (p)-[:PERTENECE_A]->(s:Solemnidad)
        OPTIONAL MATCH (p)-[:APTA_PARA]->(m:Momento)
        RETURN p,
          collect(DISTINCT s.id) AS solemnidadIds,
          collect(DISTINCT {momento: m.nombre, contexto: m.contexto}) AS aptitudes`,
        { id, impresa }
      )
      return mapPartitura(result.records[0])
    } finally {
      await session.close()
    }
  }

  async eliminar(id: string): Promise<void> {
    const session = this.session()
    try {
      await session.run(
        `MATCH (p:Partitura {id: $id}) DETACH DELETE p`,
        { id }
      )
    } finally {
      await session.close()
    }
  }

  async buscarRelacionadas(id: string): Promise<Partitura[]> {
    const session = this.session()
    try {
      // Cantos relacionados: comparten solemnidad o momento con la partitura dada
      const result = await session.run(
        `MATCH (p:Partitura {id: $id})
        MATCH (rel:Partitura)
        WHERE rel.id <> $id
          AND (
            EXISTS { MATCH (p)-[:PERTENECE_A]->(s:Solemnidad)<-[:PERTENECE_A]-(rel) }
            OR EXISTS { MATCH (p)-[:APTA_PARA]->(m:Momento)<-[:APTA_PARA]-(rel) }
          )
        WITH DISTINCT rel AS p
        OPTIONAL MATCH (p)-[:PERTENECE_A]->(s:Solemnidad)
        OPTIONAL MATCH (p)-[:APTA_PARA]->(m:Momento)
        RETURN p,
          collect(DISTINCT s.id) AS solemnidadIds,
          collect(DISTINCT {momento: m.nombre, contexto: m.contexto}) AS aptitudes
        ORDER BY p.titulo`,
        { id }
      )
      return result.records.map(mapPartitura)
    } finally {
      await session.close()
    }
  }
}

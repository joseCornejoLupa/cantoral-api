import { Record as Neo4jRecord } from 'neo4j-driver'
import { Evento, CantoEnEvento } from '../../../domain/entities/Evento'
import { Contexto } from '../../../domain/value-objects/Contexto.vo'
import { Momento } from '../../../domain/value-objects/Momento.vo'

export const mapEvento = (record: Neo4jRecord): Evento => {
  const e = record.get('e').properties

  const cantos: CantoEnEvento[] = record.has('cantos')
    ? ((record.get('cantos') as Array<{ partituraId: string; momento: string }>) ?? []).map(c => ({
        partituraId: c.partituraId,
        momento: c.momento as Momento,
      }))
    : []

  return {
    id: e.id as string,
    tipo: e.tipo as Contexto,
    fecha: new Date(e.fecha as string),
    nota: e.nota as string | undefined,
    cantos,
  }
}

import { Record as Neo4jRecord } from 'neo4j-driver'
import { Practica } from '../../../domain/entities/Practica'

export const mapPractica = (record: Neo4jRecord): Practica => {
  const pr = record.get('pr').properties

  const partituraIds: string[] = record.has('partituraIds')
    ? (record.get('partituraIds') as string[]) ?? []
    : []

  return {
    id: pr.id as string,
    fecha: new Date(pr.fecha as string),
    nota: pr.nota as string | undefined,
    partituraIds,
  }
}

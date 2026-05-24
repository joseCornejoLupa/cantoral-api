import { Record as Neo4jRecord } from 'neo4j-driver'
import { Ordinario, PiezaOrdinario, ParteOrdinario } from '../../../domain/entities/Ordinario'

export const mapOrdinario = (record: Neo4jRecord): Ordinario => {
  const o = record.get('o').properties

  const piezas: PiezaOrdinario[] = record.has('piezas')
    ? ((record.get('piezas') as Array<{ parte: string; partituraId: string }>) ?? []).map(p => ({
        parte: p.parte as ParteOrdinario,
        partituraId: p.partituraId,
      }))
    : []

  return {
    id: o.id as string,
    nombre: o.nombre as string,
    compositor: o.compositor as string | undefined,
    piezas,
  }
}

import { Record as Neo4jRecord } from 'neo4j-driver'
import { Solemnidad } from '../../../domain/entities/Solemnidad'
import { TipoSolemnidad } from '../../../domain/value-objects/Solemnidad.vo'
import { TiempoLiturgico } from '../../../domain/value-objects/TiempoLiturgico.vo'

export const mapSolemnidad = (record: Neo4jRecord): Solemnidad => {
  const s = record.get('s').properties

  return {
    id: s.id as string,
    nombre: s.nombre as string,
    tipo: s.tipo as TipoSolemnidad,
    fecha: s.fecha as string | undefined,
    descripcion: s.descripcion as string | undefined,
    tiempoLiturgico: s.tiempoLiturgico as TiempoLiturgico | undefined,
  }
}

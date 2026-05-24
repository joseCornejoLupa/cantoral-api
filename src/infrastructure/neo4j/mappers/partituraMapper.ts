import { Record as Neo4jRecord } from 'neo4j-driver'
import { Partitura, AptitudMomento } from '../../../domain/entities/Partitura'
import { Idioma } from '../../../domain/value-objects/Idioma.vo'
import { Momento } from '../../../domain/value-objects/Momento.vo'
import { Contexto } from '../../../domain/value-objects/Contexto.vo'

export const mapPartitura = (record: Neo4jRecord): Partitura => {
  const p = record.get('p').properties

  const solemnidadIds: string[] = record.has('solemnidadIds')
    ? (record.get('solemnidadIds') as string[]) ?? []
    : []

  const aptitudes: AptitudMomento[] = record.has('aptitudes')
    ? ((record.get('aptitudes') as Array<{ momento: string; contexto: string }>) ?? []).map(a => ({
        momento: a.momento as Momento,
        contexto: a.contexto as Contexto,
      }))
    : []

  return {
    id: p.id as string,
    titulo: p.titulo as string,
    autor: p.autor as string | undefined,
    descripcion: p.descripcion as string | undefined,
    idioma: p.idioma as Idioma,
    impresa: p.impresa as boolean,
    creadoEn: new Date(p.creadoEn as string),
    solemnidadIds,
    aptitudes,
  }
}

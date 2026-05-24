import { Idioma } from '../value-objects/Idioma.vo'
import { Momento } from '../value-objects/Momento.vo'
import { Contexto } from '../value-objects/Contexto.vo'

export interface AptitudMomento {
  momento: Momento
  contexto: Contexto
}

export interface Partitura {
  id: string
  titulo: string
  autor?: string
  descripcion?: string
  idioma: Idioma
  impresa: boolean
  creadoEn: Date
  solemnidadIds: string[]
  aptitudes: AptitudMomento[]
}

import { Contexto } from '../value-objects/Contexto.vo'
import { Momento } from '../value-objects/Momento.vo'

export interface CantoEnEvento {
  partituraId: string
  momento: Momento
}

export interface Evento {
  id: string
  tipo: Contexto
  fecha: Date
  nota?: string
  cantos: CantoEnEvento[]
}

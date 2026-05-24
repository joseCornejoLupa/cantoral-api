export type ParteOrdinario = 'Kyrie' | 'Gloria' | 'Santo' | 'Cordero'

export interface PiezaOrdinario {
  parte: ParteOrdinario
  partituraId: string
}

export interface Ordinario {
  id: string
  nombre: string
  compositor?: string
  piezas: PiezaOrdinario[]
}

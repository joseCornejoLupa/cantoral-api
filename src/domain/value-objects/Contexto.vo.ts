export const Contexto = {
  MISA: 'Misa',
  ADORACION: 'Adoración',
  VIA_CRUCIS: 'Vía Crucis',
  ROSARIO: 'Rosario',
  PROCESION: 'Procesión',
  OTRO: 'Otro',
} as const

export type Contexto = (typeof Contexto)[keyof typeof Contexto]

export const isContexto = (value: string): value is Contexto =>
  Object.values(Contexto).includes(value as Contexto)
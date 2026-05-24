export const TiempoLiturgico = {
  ADVIENTO: 'Adviento',
  NAVIDAD: 'Navidad',
  CUARESMA: 'Cuaresma',
  SEMANA_SANTA: 'Semana Santa',
  PASCUA: 'Pascua',
  TIEMPO_ORDINARIO: 'Tiempo Ordinario',
} as const

export type TiempoLiturgico = (typeof TiempoLiturgico)[keyof typeof TiempoLiturgico]

export const isTiempoLiturgico = (value: string): value is TiempoLiturgico =>
  Object.values(TiempoLiturgico).includes(value as TiempoLiturgico)
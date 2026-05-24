import { Contexto } from './Contexto.vo'

export const MomentoMisa = {
  CANTO_DE_INICIO: 'Canto de Inicio',
  MISA: 'Misa',
  ALELUYA: 'Aleluya',
  OFERTORIO: 'Ofertorio',
  PADRENUESTRO: 'Padrenuestro',
  COMUNION: 'Comunión',
  ANTIFONA_MARIANA: 'Antífona Mariana',
  CANTO_DE_SALIDA: 'Canto de Salida',
} as const

export const MomentoAdoracion = {
  ENTRADA: 'Entrada',
  PANGE_LINGUA: 'Pange Lingua',
  TANTUM_ERGO: 'Tantum Ergo',
  CANTO_DE_ADORACION: 'Canto de Adoración',
  BENDICION: 'Bendición',
  RESERVA: 'Reserva',
} as const

export const MomentoViaCrucis = {
  ESTACION_1: 'Estación 1',
  ESTACION_2: 'Estación 2',
  ESTACION_3: 'Estación 3',
  ESTACION_4: 'Estación 4',
  ESTACION_5: 'Estación 5',
  ESTACION_6: 'Estación 6',
  ESTACION_7: 'Estación 7',
  ESTACION_8: 'Estación 8',
  ESTACION_9: 'Estación 9',
  ESTACION_10: 'Estación 10',
  ESTACION_11: 'Estación 11',
  ESTACION_12: 'Estación 12',
  ESTACION_13: 'Estación 13',
  ESTACION_14: 'Estación 14',
} as const

export const MomentoRosario = {
  MISTERIO: 'Misterio',
} as const

export const MomentosProcesion = {
  CANTO_DE_PROCESION: 'Canto de Procesión',
} as const

export const MomentoOtro = {
  GENERAL: 'General',
} as const

// Unión de todos los momentos posibles
export type MomentoMisa = (typeof MomentoMisa)[keyof typeof MomentoMisa]
export type MomentoAdoracion = (typeof MomentoAdoracion)[keyof typeof MomentoAdoracion]
export type MomentoViaCrucis = (typeof MomentoViaCrucis)[keyof typeof MomentoViaCrucis]
export type MomentoRosario = (typeof MomentoRosario)[keyof typeof MomentoRosario]
export type MomentosProcesion = (typeof MomentosProcesion)[keyof typeof MomentosProcesion]
export type MomentoOtro = (typeof MomentoOtro)[keyof typeof MomentoOtro]

export type Momento =
  | MomentoMisa
  | MomentoAdoracion
  | MomentoViaCrucis
  | MomentoRosario
  | MomentosProcesion
  | MomentoOtro

// Mapa de momentos válidos por contexto
export const MomentosPorContexto: Record<Contexto, Record<string, string>> = {
  [Contexto.MISA]:       MomentoMisa,
  [Contexto.ADORACION]:  MomentoAdoracion,
  [Contexto.VIA_CRUCIS]: MomentoViaCrucis,
  [Contexto.ROSARIO]:    MomentoRosario,
  [Contexto.PROCESION]:  MomentosProcesion,
  [Contexto.OTRO]:       MomentoOtro,
}

// Guard: valida que un momento sea válido para un contexto dado
export const isMomentoValidoParaContexto = (
  momento: string,
  contexto: Contexto
): boolean => {
  const momentosValidos = Object.values(MomentosPorContexto[contexto])
  return momentosValidos.includes(momento)
}

// Orden litúrgico dentro de la misa
export const OrdenMomentoMisa: Record<MomentoMisa, number> = {
  [MomentoMisa.CANTO_DE_INICIO]:   1,
  [MomentoMisa.MISA]:               2,
  [MomentoMisa.ALELUYA]:            3,
  [MomentoMisa.OFERTORIO]:          4,
  [MomentoMisa.PADRENUESTRO]:       5,
  [MomentoMisa.COMUNION]:           6,
  [MomentoMisa.ANTIFONA_MARIANA]:   7,
  [MomentoMisa.CANTO_DE_SALIDA]:    8,
}

// Orden litúrgico dentro de la adoración
export const OrdenMomentoAdoracion: Record<MomentoAdoracion, number> = {
  [MomentoAdoracion.ENTRADA]:            1,
  [MomentoAdoracion.PANGE_LINGUA]:       2,
  [MomentoAdoracion.TANTUM_ERGO]:        3,
  [MomentoAdoracion.CANTO_DE_ADORACION]: 4,
  [MomentoAdoracion.BENDICION]:          5,
  [MomentoAdoracion.RESERVA]:            6,
}
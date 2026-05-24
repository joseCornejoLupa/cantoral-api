export const Idioma = {
  ESPANOL: 'Español',
  LATIN: 'Latín',
  GRIEGO: 'Griego',
  HEBREO: 'Hebreo',
  BILINGUE: 'Bilingüe',
} as const

export type Idioma = (typeof Idioma)[keyof typeof Idioma]

export const isIdioma = (value: string): value is Idioma =>
  Object.values(Idioma).includes(value as Idioma)
import { z } from 'zod'
import { Idioma } from '../../domain/value-objects/Idioma.vo'
import { Contexto } from '../../domain/value-objects/Contexto.vo'

const AptitudMomentoSchema = z.object({
  momento: z.string().min(1),
  contexto: z.enum(Object.values(Contexto) as [string, ...string[]]),
})

export const CrearPartituraDto = z.object({
  titulo: z.string().min(1),
  autor: z.string().optional(),
  descripcion: z.string().optional(),
  idioma: z.enum(Object.values(Idioma) as [string, ...string[]]),
  impresa: z.boolean().default(false),
  solemnidadIds: z.array(z.string().uuid()).default([]),
  aptitudes: z.array(AptitudMomentoSchema).default([]),
})

export type CrearPartituraDtoType = z.infer<typeof CrearPartituraDto>

export const ActualizarPartituraDto = z.object({
  titulo: z.string().min(1).optional(),
  autor: z.string().optional(),
  descripcion: z.string().optional(),
  idioma: z.enum(Object.values(Idioma) as [string, ...string[]]).optional(),
})

export type ActualizarPartituraDtoType = z.infer<typeof ActualizarPartituraDto>

export const ActualizarImpresaDto = z.object({
  impresa: z.boolean(),
})

export type ActualizarImpresaDtoType = z.infer<typeof ActualizarImpresaDto>

export const FiltrosPartituraDto = z.object({
  idioma: z.string().optional(),
  impresa: z.preprocess(v => v === 'true' ? true : v === 'false' ? false : v, z.boolean().optional()),
  solemnidadId: z.string().uuid().optional(),
  contexto: z.string().optional(),
  momento: z.string().optional(),
})

export type FiltrosPartituraDtoType = z.infer<typeof FiltrosPartituraDto>

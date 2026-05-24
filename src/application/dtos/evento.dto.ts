import { z } from 'zod'
import { Contexto } from '../../domain/value-objects/Contexto.vo'

export const CantoEnEventoDto = z.object({
  partituraId: z.string().uuid(),
  momento: z.string().min(1),
})

export const CrearEventoDto = z.object({
  tipo: z.enum(Object.values(Contexto) as [string, ...string[]]),
  fecha: z.string().datetime(),
  nota: z.string().optional(),
  cantos: z.array(CantoEnEventoDto).min(1),
})

export type CrearEventoDtoType = z.infer<typeof CrearEventoDto>

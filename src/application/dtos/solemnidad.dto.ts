import { z } from 'zod'
import { TiempoLiturgico } from '../../domain/value-objects/TiempoLiturgico.vo'

export const CrearSolemnidadDto = z.discriminatedUnion('tipo', [
  z.object({
    tipo: z.literal('liturgica'),
    nombre: z.string().min(1),
    tiempoLiturgico: z.enum(Object.values(TiempoLiturgico) as [string, ...string[]]),
    fecha: z.string().regex(/^\d{2}-\d{2}$/).optional(),
    descripcion: z.string().optional(),
  }),
  z.object({
    tipo: z.literal('mariana'),
    nombre: z.string().min(1),
    fecha: z.string().regex(/^\d{2}-\d{2}$/).optional(),
    descripcion: z.string().optional(),
  }),
  z.object({
    tipo: z.literal('propia'),
    nombre: z.string().min(1),
    fecha: z.string().regex(/^\d{2}-\d{2}$/).optional(),
    descripcion: z.string().optional(),
  }),
])

export type CrearSolemnidadDtoType = z.infer<typeof CrearSolemnidadDto>

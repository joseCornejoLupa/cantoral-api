import { z } from 'zod'

export const CrearPracticaDto = z.object({
  fecha: z.string().datetime(),
  nota: z.string().optional(),
  partituraIds: z.array(z.string().uuid()).min(1),
})

export type CrearPracticaDtoType = z.infer<typeof CrearPracticaDto>

import { z } from 'zod'

export const CrearOrdinarioDto = z.object({
  nombre: z.string().min(1),
  compositor: z.string().optional(),
})

export type CrearOrdinarioDtoType = z.infer<typeof CrearOrdinarioDto>

export const AsignarPiezaDto = z.object({
  partituraId: z.string().uuid(),
  parte: z.enum(['Kyrie', 'Gloria', 'Santo', 'Cordero']),
})

export type AsignarPiezaDtoType = z.infer<typeof AsignarPiezaDto>

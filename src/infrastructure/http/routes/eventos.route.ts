import { FastifyInstance } from 'fastify'
import { CrearEvento } from '../../../application/use-cases/evento/CrearEvento'
import { ObtenerEvento } from '../../../application/use-cases/evento/ObtenerEvento'
import { ListarEventos } from '../../../application/use-cases/evento/ListarEventos'
import { CrearEventoDto } from '../../../application/dtos/evento.dto'
import { EliminarEvento } from '../../../application/use-cases/evento/EliminarEvento'

const contextoEnum = ['Misa', 'Adoración', 'Vía Crucis', 'Rosario', 'Procesión', 'Otro']

const eventoSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    tipo: { type: 'string', enum: contextoEnum },
    fecha: { type: 'string', format: 'date-time' },
    nota: { type: 'string' },
    cantos: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          partituraId: { type: 'string', format: 'uuid' },
          momento: { type: 'string' },
        },
      },
    },
  },
}

export const eventosRoute = (
  crearEvento: CrearEvento,
  obtenerEvento: ObtenerEvento,
  listarEventos: ListarEventos,
  eliminarEvento: EliminarEvento
) => async (fastify: FastifyInstance) => {

  fastify.post('/', {
    schema: {
      tags: ['Eventos'],
      summary: 'Registrar evento litúrgico con cantos',
      description: 'El campo `momento` de cada canto debe ser válido para el `tipo` de evento. Ej: si tipo=Misa, los momentos válidos son Comunión, Aleluya, etc.',
      body: {
        type: 'object',
        required: ['tipo', 'fecha', 'cantos'],
        example: {
          tipo: 'Misa',
          fecha: '2024-12-25T10:00:00.000Z',
          nota: 'Misa de Navidad',
          cantos: [
            { partituraId: 'uuid-partitura-1', momento: 'Canto de Inicio' },
            { partituraId: 'uuid-partitura-2', momento: 'Comunión' },
            { partituraId: 'uuid-partitura-3', momento: 'Canto de Salida' },
          ],
        },
        properties: {
          tipo: { type: 'string', enum: contextoEnum },
          fecha: { type: 'string', format: 'date-time' },
          nota: { type: 'string' },
          cantos: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['partituraId', 'momento'],
              properties: {
                partituraId: { type: 'string', format: 'uuid' },
                momento: { type: 'string', description: 'Debe ser válido para el tipo de evento' },
              },
            },
          },
        },
      },
      response: { 201: eventoSchema },
    },
  }, async (req, reply) => {
    const dto = CrearEventoDto.parse(req.body)
    const result = await crearEvento.execute(dto)
    return reply.status(201).send(result)
  })

  fastify.get('/', {
    schema: {
      tags: ['Eventos'],
      summary: 'Historial de eventos (ordenado por fecha descendente)',
      response: { 200: { type: 'array', items: eventoSchema } },
    },
  }, async (_req, reply) => {
    const result = await listarEventos.execute()
    return reply.send(result)
  })

  fastify.get<{ Params: { id: string } }>('/:id', {
    schema: {
      tags: ['Eventos'],
      summary: 'Obtener evento con todos sus cantos',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } },
      },
      response: { 200: eventoSchema },
    },
  }, async (req, reply) => {
    const result = await obtenerEvento.execute(req.params.id)
    return reply.send(result)
  })

  fastify.delete<{ Params: { id: string } }>('/:id', {
    schema: {
      tags: ['Eventos'],
      summary: 'Eliminar evento',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } },
      response: { 204: { type: 'null' } },
    },
  }, async (req, reply) => {
    await eliminarEvento.execute(req.params.id)
    return reply.status(204).send()
  })
}

import { FastifyInstance } from 'fastify'
import { CrearOrdinario } from '../../../application/use-cases/ordinario/CrearOrdinario'
import { ListarOrdinarios } from '../../../application/use-cases/ordinario/ListarOrdinarios'
import { AsignarPiezaOrdinario } from '../../../application/use-cases/ordinario/AsignarPiezaOrdinario'
import { CrearOrdinarioDto, AsignarPiezaDto } from '../../../application/dtos/ordinario.dto'

const piezaEnum = ['Kyrie', 'Gloria', 'Santo', 'Cordero']

const ordinarioSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    nombre: { type: 'string' },
    compositor: { type: 'string' },
    piezas: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          parte: { type: 'string', enum: piezaEnum },
          partituraId: { type: 'string', format: 'uuid' },
        },
      },
    },
  },
}

export const ordinariosRoute = (
  crearOrdinario: CrearOrdinario,
  listarOrdinarios: ListarOrdinarios,
  asignarPieza: AsignarPiezaOrdinario
) => async (fastify: FastifyInstance) => {

  fastify.get('/', {
    schema: {
      tags: ['Ordinarios'],
      summary: 'Listar todos los ordinarios',
      response: { 200: { type: 'array', items: ordinarioSchema } },
    },
  }, async (_req, reply) => {
    const result = await listarOrdinarios.execute()
    return reply.send(result)
  })

  fastify.post('/', {
    schema: {
      tags: ['Ordinarios'],
      summary: 'Crear ordinario (colección de piezas: Kyrie, Gloria, Santo, Cordero)',
      body: {
        type: 'object',
        required: ['nombre'],
        example: { nombre: 'Misa de Frisina', compositor: 'Marco Frisina' },
        properties: {
          nombre: { type: 'string', minLength: 1 },
          compositor: { type: 'string' },
        },
      },
      response: { 201: ordinarioSchema },
    },
  }, async (req, reply) => {
    const dto = CrearOrdinarioDto.parse(req.body)
    const result = await crearOrdinario.execute(dto)
    return reply.status(201).send(result)
  })

  fastify.post<{ Params: { id: string } }>('/:id/piezas', {
    schema: {
      tags: ['Ordinarios'],
      summary: 'Asignar una partitura como pieza del ordinario',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid', description: 'ID del ordinario' } },
      },
      body: {
        type: 'object',
        required: ['partituraId', 'parte'],
        example: { partituraId: 'uuid-de-la-partitura', parte: 'Kyrie' },
        properties: {
          partituraId: { type: 'string', format: 'uuid' },
          parte: { type: 'string', enum: piezaEnum },
        },
      },
      response: { 200: ordinarioSchema },
    },
  }, async (req, reply) => {
    const dto = AsignarPiezaDto.parse(req.body)
    const result = await asignarPieza.execute(req.params.id, dto)
    return reply.send(result)
  })
}

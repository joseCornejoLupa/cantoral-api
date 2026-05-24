import { FastifyInstance } from 'fastify'
import { CrearPractica } from '../../../application/use-cases/practica/CrearPractica'
import { ListarPracticas } from '../../../application/use-cases/practica/ListarPracticas'
import { ListarNoImpresos } from '../../../application/use-cases/practica/ListarNoImpresos'
import { EliminarPractica } from '../../../application/use-cases/practica/EliminarPractica'
import { CrearPracticaDto } from '../../../application/dtos/practica.dto'

const partituraSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    titulo: { type: 'string' },
    autor: { type: 'string' },
    idioma: { type: 'string' },
    impresa: { type: 'boolean' },
    creadoEn: { type: 'string', format: 'date-time' },
    solemnidadIds: { type: 'array', items: { type: 'string' } },
    aptitudes: { type: 'array', items: { type: 'object' } },
  },
}

const practicaSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    fecha: { type: 'string', format: 'date-time' },
    nota: { type: 'string' },
    partituraIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
  },
}

export const practicasRoute = (
  crearPractica: CrearPractica,
  listarPracticas: ListarPracticas,
  listarNoImpresos: ListarNoImpresos,
  eliminarPractica: EliminarPractica
) => async (fastify: FastifyInstance) => {

  fastify.get('/', {
    schema: {
      tags: ['Prácticas'],
      summary: 'Listar todas las prácticas',
      response: { 200: { type: 'array', items: practicaSchema } },
    },
  }, async (_req, reply) => {
    const result = await listarPracticas.execute()
    return reply.send(result)
  })

  fastify.post('/', {
    schema: {
      tags: ['Prácticas'],
      summary: 'Crear sesión de práctica con cantos a ensayar',
      body: {
        type: 'object',
        required: ['fecha', 'partituraIds'],
        example: {
          fecha: '2024-12-20T19:00:00.000Z',
          nota: 'Ensayo para Navidad',
          partituraIds: ['uuid-partitura-1', 'uuid-partitura-2'],
        },
        properties: {
          fecha: { type: 'string', format: 'date-time' },
          nota: { type: 'string' },
          partituraIds: { type: 'array', minItems: 1, items: { type: 'string', format: 'uuid' } },
        },
      },
      response: { 201: practicaSchema },
    },
  }, async (req, reply) => {
    const dto = CrearPracticaDto.parse(req.body)
    const result = await crearPractica.execute(dto)
    return reply.status(201).send(result)
  })

  fastify.get<{ Params: { id: string } }>('/:id/no-impresos', {
    schema: {
      tags: ['Prácticas'],
      summary: 'Cantos de la práctica que aún no están impresos',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } },
      },
      response: { 200: { type: 'array', items: partituraSchema } },
    },
  }, async (req, reply) => {
    const result = await listarNoImpresos.execute(req.params.id)
    return reply.send(result)
  })

  fastify.delete<{ Params: { id: string } }>('/:id', {
    schema: {
      tags: ['Prácticas'],
      summary: 'Eliminar práctica',
      params: { type: 'object', required: ['id'], properties: { id: { type: 'string', format: 'uuid' } } },
      response: { 204: { type: 'null' } },
    },
  }, async (req, reply) => {
    await eliminarPractica.execute(req.params.id)
    return reply.status(204).send()
  })
}

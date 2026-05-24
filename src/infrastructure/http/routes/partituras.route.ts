import { FastifyInstance } from 'fastify'
import { CrearPartitura } from '../../../application/use-cases/partitura/CrearPartitura'
import { ObtenerPartitura } from '../../../application/use-cases/partitura/ObtenerPartitura'
import { ListarPartituras } from '../../../application/use-cases/partitura/ListarPartituras'
import { ActualizarPartitura } from '../../../application/use-cases/partitura/ActualizarPartitura'
import { ActualizarImpresa } from '../../../application/use-cases/partitura/ActualizarImpresa'
import { ObtenerRecomendaciones } from '../../../application/use-cases/partitura/ObtenerRecomendaciones'
import { EliminarPartitura } from '../../../application/use-cases/partitura/EliminarPartitura'
import {
  CrearPartituraDto,
  ActualizarPartituraDto,
  ActualizarImpresaDto,
  FiltrosPartituraDto,
} from '../../../application/dtos/partitura.dto'

const idiomaEnum = ['Español', 'Latín', 'Griego', 'Hebreo', 'Bilingüe']
const contextoEnum = ['Misa', 'Adoración', 'Vía Crucis', 'Rosario', 'Procesión', 'Otro']

const partituraSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    titulo: { type: 'string' },
    autor: { type: 'string' },
    descripcion: { type: 'string' },
    idioma: { type: 'string', enum: idiomaEnum },
    impresa: { type: 'boolean' },
    creadoEn: { type: 'string', format: 'date-time' },
    solemnidadIds: { type: 'array', items: { type: 'string' } },
    aptitudes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          momento: { type: 'string' },
          contexto: { type: 'string', enum: contextoEnum },
        },
      },
    },
  },
}

const aptitudExample = [{ momento: 'Comunión', contexto: 'Misa' }]

export const partiturасRoute = (
  crearPartitura: CrearPartitura,
  obtenerPartitura: ObtenerPartitura,
  listarPartituras: ListarPartituras,
  actualizarPartitura: ActualizarPartitura,
  actualizarImpresa: ActualizarImpresa,
  obtenerRecomendaciones: ObtenerRecomendaciones,
  eliminarPartitura: EliminarPartitura
) => async (fastify: FastifyInstance) => {

  fastify.post('/', {
    schema: {
      tags: ['Partituras'],
      summary: 'Crear partitura',
      body: {
        type: 'object',
        required: ['titulo', 'idioma'],
        example: {
          titulo: 'Ave María de Schubert',
          autor: 'Franz Schubert',
          descripcion: 'Ave María en Latín',
          idioma: 'Latín',
          impresa: false,
          solemnidadIds: [],
          aptitudes: aptitudExample,
        },
        properties: {
          titulo: { type: 'string', minLength: 1 },
          autor: { type: 'string' },
          descripcion: { type: 'string' },
          idioma: { type: 'string', enum: idiomaEnum },
          impresa: { type: 'boolean', default: false },
          solemnidadIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
          aptitudes: {
            type: 'array',
            items: {
              type: 'object',
              required: ['momento', 'contexto'],
              properties: {
                momento: { type: 'string', description: 'Ej: Comunión, Entrada, Estación 3' },
                contexto: { type: 'string', enum: contextoEnum },
              },
            },
          },
        },
      },
      response: { 201: partituraSchema },
    },
  }, async (req, reply) => {
    const dto = CrearPartituraDto.parse(req.body)
    const result = await crearPartitura.execute(dto)
    return reply.status(201).send(result)
  })

  fastify.get('/', {
    schema: {
      tags: ['Partituras'],
      summary: 'Listar partituras con filtros opcionales',
      querystring: {
        type: 'object',
        properties: {
          idioma: { type: 'string', enum: idiomaEnum },
          impresa: { type: 'string', enum: ['true', 'false'] },
          solemnidadId: { type: 'string', format: 'uuid' },
          contexto: { type: 'string', enum: contextoEnum },
          momento: { type: 'string', description: 'Ej: Comunión, Entrada' },
        },
      },
      response: { 200: { type: 'array', items: partituraSchema } },
    },
  }, async (req, reply) => {
    const filtros = FiltrosPartituraDto.parse(req.query)
    const result = await listarPartituras.execute(filtros)
    return reply.send(result)
  })

  fastify.get<{ Params: { id: string } }>('/:id', {
    schema: {
      tags: ['Partituras'],
      summary: 'Obtener partitura por ID',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } },
      },
      response: { 200: partituraSchema },
    },
  }, async (req, reply) => {
    const result = await obtenerPartitura.execute(req.params.id)
    return reply.send(result)
  })

  fastify.patch<{ Params: { id: string } }>('/:id', {
    schema: {
      tags: ['Partituras'],
      summary: 'Actualizar datos de una partitura',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } },
      },
      body: {
        type: 'object',
        example: { titulo: 'Ave María', autor: 'Franz Schubert', idioma: 'Latín' },
        properties: {
          titulo: { type: 'string', minLength: 1 },
          autor: { type: 'string' },
          descripcion: { type: 'string' },
          idioma: { type: 'string', enum: idiomaEnum },
        },
      },
      response: { 200: partituraSchema },
    },
  }, async (req, reply) => {
    const dto = ActualizarPartituraDto.parse(req.body)
    const result = await actualizarPartitura.execute(req.params.id, dto)
    return reply.send(result)
  })

  fastify.patch<{ Params: { id: string } }>('/:id/impresa', {
    schema: {
      tags: ['Partituras'],
      summary: 'Marcar partitura como impresa o no impresa',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } },
      },
      body: {
        type: 'object',
        required: ['impresa'],
        example: { impresa: true },
        properties: { impresa: { type: 'boolean' } },
      },
      response: { 200: partituraSchema },
    },
  }, async (req, reply) => {
    const dto = ActualizarImpresaDto.parse(req.body)
    const result = await actualizarImpresa.execute(req.params.id, dto.impresa)
    return reply.send(result)
  })

  fastify.get<{ Params: { id: string } }>('/:id/recomendaciones', {
    schema: {
      tags: ['Partituras'],
      summary: 'Cantos relacionados por solemnidad o momento compartido',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } },
      },
      response: { 200: { type: 'array', items: partituraSchema } },
    },
  }, async (req, reply) => {
    const result = await obtenerRecomendaciones.execute(req.params.id)
    return reply.send(result)
  })

  fastify.delete<{ Params: { id: string } }>('/:id', {
    schema: {
      tags: ['Partituras'],
      summary: 'Eliminar partitura',
      params: {
        type: 'object',
        required: ['id'],
        properties: { id: { type: 'string', format: 'uuid' } },
      },
      response: { 204: { type: 'null' } },
    },
  }, async (req, reply) => {
    await eliminarPartitura.execute(req.params.id)
    return reply.status(204).send()
  })
}

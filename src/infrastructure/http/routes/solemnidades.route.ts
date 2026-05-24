import { FastifyInstance } from 'fastify'
import { CrearSolemnidad } from '../../../application/use-cases/solemnidad/CrearSolemnidad'
import { ListarSolemnidades } from '../../../application/use-cases/solemnidad/ListarSolemnidades'
import { CrearSolemnidadDto } from '../../../application/dtos/solemnidad.dto'

const tiempoEnum = ['Adviento', 'Navidad', 'Cuaresma', 'Semana Santa', 'Pascua', 'Tiempo Ordinario']

const solemnidadSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    nombre: { type: 'string' },
    tipo: { type: 'string', enum: ['liturgica', 'mariana', 'propia'] },
    fecha: { type: 'string', description: 'Formato MM-DD' },
    descripcion: { type: 'string' },
    tiempoLiturgico: { type: 'string', enum: tiempoEnum },
  },
}

export const solemnidadesRoute = (
  crearSolemnidad: CrearSolemnidad,
  listarSolemnidades: ListarSolemnidades
) => async (fastify: FastifyInstance) => {

  fastify.post('/', {
    schema: {
      tags: ['Solemnidades'],
      summary: 'Crear solemnidad litúrgica, mariana o propia',
      body: {
        type: 'object',
        required: ['tipo', 'nombre'],
        oneOf: [
          {
            title: 'Litúrgica',
            example: {
              tipo: 'liturgica',
              nombre: 'Navidad',
              tiempoLiturgico: 'Navidad',
              fecha: '12-25',
            },
            properties: {
              tipo: { type: 'string', enum: ['liturgica'] },
              nombre: { type: 'string' },
              tiempoLiturgico: { type: 'string', enum: tiempoEnum },
              fecha: { type: 'string', pattern: '^\\d{2}-\\d{2}$' },
              descripcion: { type: 'string' },
            },
            required: ['tipo', 'nombre', 'tiempoLiturgico'],
          },
          {
            title: 'Mariana',
            example: { tipo: 'mariana', nombre: 'Virgen de Guadalupe', fecha: '12-12' },
            properties: {
              tipo: { type: 'string', enum: ['mariana'] },
              nombre: { type: 'string' },
              fecha: { type: 'string', pattern: '^\\d{2}-\\d{2}$' },
              descripcion: { type: 'string' },
            },
            required: ['tipo', 'nombre'],
          },
          {
            title: 'Propia',
            example: { tipo: 'propia', nombre: 'Bautismo' },
            properties: {
              tipo: { type: 'string', enum: ['propia'] },
              nombre: { type: 'string' },
              fecha: { type: 'string', pattern: '^\\d{2}-\\d{2}$' },
              descripcion: { type: 'string' },
            },
            required: ['tipo', 'nombre'],
          },
        ],
      },
      response: { 201: solemnidadSchema },
    },
  }, async (req, reply) => {
    const dto = CrearSolemnidadDto.parse(req.body)
    const result = await crearSolemnidad.execute(dto)
    return reply.status(201).send(result)
  })

  fastify.get('/', {
    schema: {
      tags: ['Solemnidades'],
      summary: 'Listar solemnidades',
      querystring: {
        type: 'object',
        properties: {
          tipo: { type: 'string', enum: ['liturgica', 'mariana', 'propia'] },
        },
      },
      response: { 200: { type: 'array', items: solemnidadSchema } },
    },
  }, async (req, reply) => {
    const { tipo } = req.query as { tipo?: 'liturgica' | 'mariana' | 'propia' }
    const result = await listarSolemnidades.execute(tipo)
    return reply.send(result)
  })
}

import Fastify from 'fastify'
import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { ZodError } from 'zod'
import { AppError } from '../../shared/errors/AppError'
import { partiturасRoute } from './routes/partituras.route'
import { ordinariosRoute } from './routes/ordinarios.route'
import { solemnidadesRoute } from './routes/solemnidades.route'
import { eventosRoute } from './routes/eventos.route'
import { practicasRoute } from './routes/practicas.route'
import { CrearPartitura } from '../../application/use-cases/partitura/CrearPartitura'
import { ObtenerPartitura } from '../../application/use-cases/partitura/ObtenerPartitura'
import { ListarPartituras } from '../../application/use-cases/partitura/ListarPartituras'
import { ActualizarPartitura } from '../../application/use-cases/partitura/ActualizarPartitura'
import { ActualizarImpresa } from '../../application/use-cases/partitura/ActualizarImpresa'
import { ObtenerRecomendaciones } from '../../application/use-cases/partitura/ObtenerRecomendaciones'
import { EliminarPartitura } from '../../application/use-cases/partitura/EliminarPartitura'
import { CrearOrdinario } from '../../application/use-cases/ordinario/CrearOrdinario'
import { ListarOrdinarios } from '../../application/use-cases/ordinario/ListarOrdinarios'
import { AsignarPiezaOrdinario } from '../../application/use-cases/ordinario/AsignarPiezaOrdinario'
import { CrearSolemnidad } from '../../application/use-cases/solemnidad/CrearSolemnidad'
import { ListarSolemnidades } from '../../application/use-cases/solemnidad/ListarSolemnidades'
import { CrearEvento } from '../../application/use-cases/evento/CrearEvento'
import { ObtenerEvento } from '../../application/use-cases/evento/ObtenerEvento'
import { ListarEventos } from '../../application/use-cases/evento/ListarEventos'
import { EliminarEvento } from '../../application/use-cases/evento/EliminarEvento'
import { CrearPractica } from '../../application/use-cases/practica/CrearPractica'
import { ListarPracticas } from '../../application/use-cases/practica/ListarPracticas'
import { ListarNoImpresos } from '../../application/use-cases/practica/ListarNoImpresos'
import { EliminarPractica } from '../../application/use-cases/practica/EliminarPractica'

interface ServerDeps {
  crearPartitura: CrearPartitura
  obtenerPartitura: ObtenerPartitura
  listarPartituras: ListarPartituras
  actualizarPartitura: ActualizarPartitura
  actualizarImpresa: ActualizarImpresa
  obtenerRecomendaciones: ObtenerRecomendaciones
  eliminarPartitura: EliminarPartitura
  crearOrdinario: CrearOrdinario
  listarOrdinarios: ListarOrdinarios
  asignarPieza: AsignarPiezaOrdinario
  crearSolemnidad: CrearSolemnidad
  listarSolemnidades: ListarSolemnidades
  crearEvento: CrearEvento
  obtenerEvento: ObtenerEvento
  listarEventos: ListarEventos
  eliminarEvento: EliminarEvento
  crearPractica: CrearPractica
  listarPracticas: ListarPracticas
  listarNoImpresos: ListarNoImpresos
  eliminarPractica: EliminarPractica
}

export const buildServer = async (deps: ServerDeps) => {
  const fastify = Fastify({
    logger: true,
    ajv: { customOptions: { keywords: ['example'] } },
  })

  await fastify.register(cors, {
    origin: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  await fastify.register(swagger, {
    openapi: {
      info: { title: 'Cantoral API', version: '1.0.0', description: 'API del repertorio del coro parroquial' },
    },
  })

  await fastify.register(swaggerUi, { routePrefix: '/docs' })

  fastify.setErrorHandler((error, _req, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({ error: 'Datos inválidos', detalles: error.issues })
    }
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({ error: error.message })
    }
    fastify.log.error(error)
    return reply.status(500).send({ error: 'Error interno del servidor' })
  })

  await fastify.register(
    partiturасRoute(
      deps.crearPartitura, deps.obtenerPartitura, deps.listarPartituras,
      deps.actualizarPartitura, deps.actualizarImpresa, deps.obtenerRecomendaciones, deps.eliminarPartitura
    ),
    { prefix: '/partituras' }
  )

  await fastify.register(ordinariosRoute(deps.crearOrdinario, deps.listarOrdinarios, deps.asignarPieza), { prefix: '/ordinarios' })
  await fastify.register(solemnidadesRoute(deps.crearSolemnidad, deps.listarSolemnidades), { prefix: '/solemnidades' })
  await fastify.register(eventosRoute(deps.crearEvento, deps.obtenerEvento, deps.listarEventos, deps.eliminarEvento), { prefix: '/eventos' })
  await fastify.register(practicasRoute(deps.crearPractica, deps.listarPracticas, deps.listarNoImpresos, deps.eliminarPractica), { prefix: '/practicas' })

  return fastify
}

import 'dotenv/config'
import { getDriver, closeDriver } from './infrastructure/neo4j/driver'
import { Neo4jPartituraRepository } from './infrastructure/neo4j/repositories/Neo4jPartituraRepository'
import { Neo4jOrdinarioRepository } from './infrastructure/neo4j/repositories/Neo4jOrdinarioRepository'
import { Neo4jSolemnidadRepository } from './infrastructure/neo4j/repositories/Neo4jSolemnidadRepository'
import { Neo4jEventoRepository } from './infrastructure/neo4j/repositories/Neo4jEventoRepository'
import { Neo4jPracticaRepository } from './infrastructure/neo4j/repositories/Neo4jPracticaRepository'
import { CrearPartitura } from './application/use-cases/partitura/CrearPartitura'
import { ObtenerPartitura } from './application/use-cases/partitura/ObtenerPartitura'
import { ListarPartituras } from './application/use-cases/partitura/ListarPartituras'
import { ActualizarPartitura } from './application/use-cases/partitura/ActualizarPartitura'
import { ActualizarImpresa } from './application/use-cases/partitura/ActualizarImpresa'
import { ObtenerRecomendaciones } from './application/use-cases/partitura/ObtenerRecomendaciones'
import { EliminarPartitura } from './application/use-cases/partitura/EliminarPartitura'
import { CrearOrdinario } from './application/use-cases/ordinario/CrearOrdinario'
import { ListarOrdinarios } from './application/use-cases/ordinario/ListarOrdinarios'
import { AsignarPiezaOrdinario } from './application/use-cases/ordinario/AsignarPiezaOrdinario'
import { CrearSolemnidad } from './application/use-cases/solemnidad/CrearSolemnidad'
import { ListarSolemnidades } from './application/use-cases/solemnidad/ListarSolemnidades'
import { CrearEvento } from './application/use-cases/evento/CrearEvento'
import { ObtenerEvento } from './application/use-cases/evento/ObtenerEvento'
import { ListarEventos } from './application/use-cases/evento/ListarEventos'
import { EliminarEvento } from './application/use-cases/evento/EliminarEvento'
import { CrearPractica } from './application/use-cases/practica/CrearPractica'
import { ListarPracticas } from './application/use-cases/practica/ListarPracticas'
import { ListarNoImpresos } from './application/use-cases/practica/ListarNoImpresos'
import { EliminarPractica } from './application/use-cases/practica/EliminarPractica'
import { buildServer } from './infrastructure/http/server'

const start = async () => {
  const driver = getDriver()

  const partituraRepo = new Neo4jPartituraRepository(driver)
  const ordinarioRepo = new Neo4jOrdinarioRepository(driver)
  const solemnidadRepo = new Neo4jSolemnidadRepository(driver)
  const eventoRepo = new Neo4jEventoRepository(driver)
  const practicaRepo = new Neo4jPracticaRepository(driver)

  const server = await buildServer({
    crearPartitura: new CrearPartitura(partituraRepo),
    obtenerPartitura: new ObtenerPartitura(partituraRepo),
    listarPartituras: new ListarPartituras(partituraRepo),
    actualizarPartitura: new ActualizarPartitura(partituraRepo),
    actualizarImpresa: new ActualizarImpresa(partituraRepo),
    obtenerRecomendaciones: new ObtenerRecomendaciones(partituraRepo),
    eliminarPartitura: new EliminarPartitura(partituraRepo),
    crearOrdinario: new CrearOrdinario(ordinarioRepo),
    listarOrdinarios: new ListarOrdinarios(ordinarioRepo),
    asignarPieza: new AsignarPiezaOrdinario(ordinarioRepo),
    crearSolemnidad: new CrearSolemnidad(solemnidadRepo),
    listarSolemnidades: new ListarSolemnidades(solemnidadRepo),
    crearEvento: new CrearEvento(eventoRepo),
    obtenerEvento: new ObtenerEvento(eventoRepo),
    listarEventos: new ListarEventos(eventoRepo),
    eliminarEvento: new EliminarEvento(eventoRepo),
    crearPractica: new CrearPractica(practicaRepo),
    listarPracticas: new ListarPracticas(practicaRepo),
    listarNoImpresos: new ListarNoImpresos(practicaRepo),
    eliminarPractica: new EliminarPractica(practicaRepo),
  })

  const port = parseInt(process.env.PORT ?? '3000', 10)

  try {
    await server.listen({ port, host: '0.0.0.0' })
  } catch (err) {
    server.log.error(err)
    await closeDriver()
    process.exit(1)
  }

  const shutdown = async () => {
    await server.close()
    await closeDriver()
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

start()

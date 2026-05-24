# cantoral-api

API REST para gestión del repertorio del coro parroquial. Permite registrar partituras, controlar cuáles están impresas en el folder personal, registrar eventos litúrgicos (misas, adoraciones, vía crucis, rosarios, procesiones) y explorar relaciones entre cantos mediante un grafo Neo4j.

## Stack

- **Node.js + TypeScript**
- **Fastify** — framework HTTP
- **Neo4j** — base de datos de grafos
- **Zod** — validación de datos
- **Jest** — testing
- **Docker** — Neo4j local

## Requisitos

- Node.js 20+
- Docker y Docker Compose
- npm 10+

## Instalación

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd cantoral-api

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env si se requiere cambiar credenciales

# 4. Levantar Neo4j con Docker
docker-compose up -d

# 5. Esperar ~10 segundos a que Neo4j inicie, luego correr el seed
npm run seed

# 6. Iniciar en modo desarrollo
npm run dev
```

La API estará disponible en `http://localhost:3000`
La UI de Neo4j estará disponible en `http://localhost:7474`

## Scripts

```bash
npm run dev          # Desarrollo con hot reload
npm run build        # Compilar TypeScript
npm run start        # Producción (requiere build previo)
npm run test         # Tests unitarios
npm run test:watch   # Tests en modo watch
npm run test:coverage # Cobertura
npm run lint         # ESLint
npm run seed         # Cargar datos iniciales (solemnidades, contextos, momentos)
```

## Variables de entorno

```env
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
PORT=3000
NODE_ENV=development
```

## Arquitectura

Hexagonal adaptada. El modelo de grafo vive en el dominio pero las queries Cypher se encapsulan en los adaptadores de repositorio.

```
src/
├── domain/
│   ├── entities/          # Interfaces de las entidades del dominio
│   ├── ports/
│   │   └── repositories/  # Interfaces de repositorios (puertos de salida)
│   └── value-objects/     # Enums y tipos del dominio
├── application/
│   ├── use-cases/         # Casos de uso por entidad
│   └── dtos/              # Schemas Zod de entrada/salida
├── infrastructure/
│   ├── neo4j/
│   │   ├── driver.ts      # Conexión singleton
│   │   ├── repositories/  # Implementaciones con Cypher
│   │   └── mappers/       # Neo4j record → entidad dominio
│   └── http/
│       ├── server.ts      # Setup Fastify
│       ├── routes/        # Rutas por entidad
│       └── schemas/       # Schemas Swagger
├── shared/
│   └── errors/            # AppError, NotFoundError, ConflictError
└── main.ts                # Composición y arranque (DI manual)
```

## Modelo de datos (Neo4j)

### Nodos principales

| Nodo | Descripción |
|------|-------------|
| `Partitura` | Canto con título, autor, idioma, estado impreso |
| `Ordinario` | Colección de piezas del ordinario (ej: Misa de Frisina) |
| `Solemnidad` | Celebración litúrgica — extensible en runtime |
| `Evento` | Celebración con fecha (Misa, Adoración, Vía Crucis, etc.) |
| `Practica` | Sesión de ensayo previa a un evento |

### Relaciones clave

```cypher
(Partitura)-[:PERTENECE_A]->(Solemnidad)
(Partitura)-[:PERTENECE_A_ORDINARIO]->(Ordinario)
(Partitura)-[:APTA_PARA]->(Momento)-[:DENTRO_DE]->(Contexto)
(Partitura)-[:CANTADA_EN {momento: string}]->(Evento)
(Partitura)-[:ENSAYADA_EN]->(Practica)
```

## Endpoints principales

```
POST   /partituras              Crear partitura
GET    /partituras              Listar partituras (con filtros)
GET    /partituras/:id          Obtener partitura
PATCH  /partituras/:id          Actualizar partitura
PATCH  /partituras/:id/impresa  Marcar como impresa/no impresa
GET    /partituras/:id/recomendaciones  Cantos relacionados

POST   /ordinarios              Crear ordinario
POST   /ordinarios/:id/piezas   Asignar pieza al ordinario

POST   /solemnidades            Crear solemnidad (liturgica/mariana/propia)
GET    /solemnidades            Listar solemnidades

POST   /eventos                 Registrar evento con cantos
GET    /eventos/:id             Obtener evento con cantos
GET    /eventos                 Historial de eventos

POST   /practicas               Crear práctica con cantos
GET    /practicas/:id/no-impresos  Cantos de la práctica sin imprimir
```

## Documentación interactiva

Con el servidor corriendo, visitar: `http://localhost:3000/docs`

---

# INSTRUCCIONES PARA AGENTE DE IA (Claude Code)

> Este bloque es para Claude Code u otro agente que continúe el desarrollo.

## Contexto del proyecto

Este es un proyecto de portafolio personal de un desarrollador fullstack. Es una API real y útil para gestionar el repertorio de un coro de parroquia católica. El dominio tiene reglas litúrgicas específicas que deben respetarse.

## Estado actual

Los value objects están implementados en `src/domain/value-objects/`:
- `TiempoLiturgico.vo.ts` ✓
- `Idioma.vo.ts` ✓
- `Contexto.vo.ts` ✓
- `Momento.vo.ts` ✓
- `Solemnidad.vo.ts` ✓

## Próximos pasos en orden

1. **Entidades del dominio** (`src/domain/entities/`)
   - `Partitura.ts`
   - `Ordinario.ts`
   - `Solemnidad.ts`
   - `Evento.ts`
   - `Practica.ts`

2. **Puertos** (`src/domain/ports/repositories/`)
   - `IPartituraRepository.ts`
   - `IOrdinarioRepository.ts`
   - `ISolemnidadRepository.ts`
   - `IEventoRepository.ts`
   - `IPracticaRepository.ts`

3. **Infraestructura Neo4j**
   - `src/infrastructure/neo4j/driver.ts` — singleton de conexión
   - Repositorios en `src/infrastructure/neo4j/repositories/`
   - Mappers en `src/infrastructure/neo4j/mappers/`

4. **Casos de uso** (`src/application/use-cases/`)
   - Por carpeta: `partitura/`, `ordinario/`, `solemnidad/`, `evento/`, `practica/`

5. **DTOs con Zod** (`src/application/dtos/`)

6. **HTTP con Fastify** (`src/infrastructure/http/`)
   - `server.ts`
   - `routes/`

7. **Errores compartidos** (`src/shared/errors/AppError.ts`)

8. **Composición** (`src/main.ts`)

9. **Seed de datos** (`src/infrastructure/neo4j/seed.ts`)

10. **Tests**

## Reglas de dominio importantes

- Una `Partitura` puede pertenecer a múltiples `Solemnidad` y ser apta para múltiples `Momento`
- Un `Momento` siempre pertenece a un `Contexto` — validar con `isMomentoValidoParaContexto()`
- Las `Solemnidad` tienen tipo discriminado: `liturgica` | `mariana` | `propia`
  - Solo las de tipo `liturgica` tienen `tiempoLiturgico` obligatorio
  - Las de tipo `mariana` y `propia` son transversales (sin tiempo litúrgico fijo)
- El campo `momento` va en la **relación** `CANTADA_EN`, no en el nodo `Evento`
- Las piezas de un `Ordinario` (Kyrie, Gloria, Santo, Cordero) van y se trackean en conjunto
- `impresa` en `Partitura` es personal del usuario, no del coro

## Convenciones de código

- Todas las interfaces de entidades en `domain/entities/` son **interfaces puras de TypeScript**, sin lógica
- Los repositorios son **interfaces** en `domain/ports/` e **implementaciones** en `infrastructure/neo4j/repositories/`
- Los casos de uso reciben sus dependencias por constructor (DI manual)
- Los IDs son UUID v4
- Las fechas se almacenan como ISO string en Neo4j y se convierten a `Date` en los mappers
- Usar `MERGE` en Neo4j para relaciones idempotentes
- Nunca exponer queries Cypher fuera de `infrastructure/neo4j/`

## Ejemplo de estructura de un caso de uso

```typescript
export class CrearPartitura {
  constructor(private readonly repo: IPartituraRepository) {}

  async execute(dto: CrearPartituraDtoType): Promise<Partitura> {
    // validar, crear, retornar
  }
}
```

## Ejemplo de estructura de un repositorio

```typescript
export class Neo4jPartituraRepository implements IPartituraRepository {
  constructor(private readonly driver: Driver) {}

  private session() {
    return this.driver.session()
  }

  async crear(data: ...): Promise<Partitura> {
    const session = this.session()
    try {
      const result = await session.run(`...cypher...`, params)
      return mapper(result.records[0])
    } finally {
      await session.close()  // siempre cerrar la sesión
    }
  }
}
```

## docker-compose.yml de referencia

```yaml
version: '3.8'
services:
  neo4j:
    image: neo4j:5.18
    container_name: cantoral-neo4j
    ports:
      - "7474:7474"
      - "7687:7687"
    environment:
      NEO4J_AUTH: neo4j/password
      NEO4J_PLUGINS: '["apoc"]'
    volumes:
      - neo4j_data:/data
      - neo4j_logs:/logs
volumes:
  neo4j_data:
  neo4j_logs:
```

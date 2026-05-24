# Proyecto: cantoral-api

## Contexto personal
Sistema de gestión de partituras del coro parroquial. El problema real: el folder físico se queda en la parroquia y no se sabe qué cantos están impresos en casa cuando llega una partitura nueva por WhatsApp o correo.

## Objetivos del sistema
- Saber si una partitura ya está impresa en el folder personal
- Saber qué cantos de una práctica faltan imprimir
- Registrar misas, adoraciones, vía crucis, rosarios y procesiones con sus cantos
- Consultar historial: cuándo se cantó por última vez, cuántas veces
- Explorar relaciones entre cantos: co-ocurrencias, patrones, recomendaciones

## Stack tecnológico
- **Runtime:** Node.js
- **Lenguaje:** TypeScript
- **Framework HTTP:** Fastify
- **Base de datos:** Neo4j
- **Driver Neo4j:** neo4j-driver (oficial)
- **Validación:** Zod
- **Testing:** Jest + ts-jest
- **Documentación:** @fastify/swagger + @fastify/swagger-ui
- **Infraestructura local:** Docker + Docker Compose

## Arquitectura
Hexagonal adaptada — el modelo de grafo vive en el dominio pero las queries Cypher se encapsulan en los adaptadores de repositorio.

```
domain/        → entidades + interfaces de repositorios (puertos)
application/   → casos de uso + DTOs (Zod)
infrastructure → adaptadores Neo4j + HTTP (Fastify)
shared/        → errores comunes
main.ts        → composición (DI manual)
```

## Modelo de grafo (Neo4j)

### Nodos
| Nodo | Propiedades |
|------|-------------|
| Partitura | id, titulo, autor, descripcion, impresa, idioma, creadoEn |
| Ordinario | id, nombre, autor (ej: "Misa de Frisina") |
| Solemnidad | id, nombre, tipo (liturgica/mariana/propia), fecha (MM-DD), descripcion, tiempoLiturgico? |
| Contexto | id, nombre |
| Momento | id, nombre, orden |
| Evento | id, fecha, tipo (Misa/Adoración/etc.), nota |
| Practica | id, fecha, nota |

### Relaciones
```cypher
(Solemnidad)-[:DENTRO_DE]->(TiempoLiturgico)        ← solo tipo 'liturgica'
(Partitura)-[:PERTENECE_A_ORDINARIO]->(Ordinario)   ← solo piezas del ordinario
(Partitura)-[:PERTENECE_A]->(Solemnidad)
(Partitura)-[:APTA_PARA]->(Momento)
(Momento)-[:DENTRO_DE]->(Contexto)
(Partitura)-[:ENSAYADA_EN]->(Practica)
(Partitura)-[:CANTADA_EN {momento: string}]->(Evento)
```

### Decisiones clave
- `momento` va en la relación `CANTADA_EN` porque es dato del evento, no del canto
- Todas las solemnidades son extensibles en runtime con tipo discriminado (liturgica/mariana/propia)
- `Ordinario` agrupa piezas por autor/colección — no se trackea cuáles se cantaron individualmente
- `idioma` es atributo de la partitura, no del evento
- TiempoLiturgico desaparece como nodo — vive en la Solemnidad como propiedad

## Value Objects (implementados)

### TiempoLiturgico.vo.ts — enum cerrado
Adviento, Navidad, Cuaresma, Semana Santa, Pascua, Tiempo Ordinario

### Idioma.vo.ts — enum cerrado
Español, Latín, Griego, Hebreo, Bilingüe

### Contexto.vo.ts — enum cerrado
Misa, Adoración, Vía Crucis, Rosario, Procesión, Otro

### Momento.vo.ts — enum cerrado con mapa por contexto
```
Misa:       Canto de Inicio, Misa, Aleluya, Ofertorio,
            Padrenuestro, Comunión, Antífona Mariana, Canto de Salida
Adoración:  Entrada, Pange Lingua, Tantum Ergo, Canto de Adoración, Bendición, Reserva
Vía Crucis: Estación 1 … Estación 14
Rosario:    Misterio
Procesión:  Canto de Procesión
Otro:       General
```
Incluye `isMomentoValidoParaContexto(momento, contexto)` para validación cruzada.
Incluye `OrdenMomentoMisa` y `OrdenMomentoAdoracion` para ordenar cantos en un evento.

### Solemnidad.vo.ts — tipo libre con discriminador
```typescript
TipoSolemnidad = 'liturgica' | 'mariana' | 'propia'
interface Solemnidad {
  nombre: string
  tipo: TipoSolemnidad
  fecha?: string           // MM-DD, opcional para fechas variables
  descripcion?: string
  tiempoLiturgico?: TiempoLiturgico  // obligatorio solo para tipo 'liturgica'
}
```

## Solemnidades seed (datos iniciales)
| Nombre | Tipo | Fecha | Tiempo |
|--------|------|-------|--------|
| Pentecostés | liturgica | variable | Pascua |
| Ascensión | liturgica | variable | Pascua |
| Bautizo del Señor | liturgica | variable | Navidad |
| Transfiguración | liturgica | 08-06 | Tiempo Ordinario |
| Inmaculada Concepción | liturgica | 12-08 | Adviento |
| Asunción | liturgica | 08-15 | Tiempo Ordinario |
| San Pedro y San Pablo | liturgica | 06-29 | Tiempo Ordinario |
| Ntra. Sra. de Guadalupe | mariana | 12-12 | — |
| Ntra. Sra. de Fátima | mariana | 05-13 | — |
| Ntra. Sra. de Lourdes | mariana | 02-11 | — |
| Ntra. Sra. del Encuentro con Dios | mariana | 02-02 | — |
| Aniversario Padre Molina | propia | 04-28 | — |

## Flujo de eventos
- **Práctica:** sesión de ensayo. Se conoce con anticipación → verifica qué falta imprimir
- **Evento:** cualquier celebración con fecha (Misa, Adoración, Vía Crucis, Rosario, Procesión). Se registra qué se cantó y en qué momento

## Casos de uso principales
### Partitura
- CrearPartitura
- ActualizarPartitura
- BuscarPartituras (filtros: tiempo litúrgico, solemnidad, contexto, momento, idioma, impresa)
- MarcarImpresa
- ObtenerRecomendaciones (co-ocurrencias)

### Ordinario
- CrearOrdinario
- AsignarPiezaAOrdinario

### Solemnidad
- CrearSolemnidad (liturgica/mariana/propia)
- ListarSolemnidades

### Evento
- RegistrarEvento (con tipo, cantos y momento de cada uno)
- ObtenerHistorialEvento

### Práctica
- CrearPractica
- ObtenerCantosNoImpresos

## Queries relevantes (Cypher)
```cypher
-- Cantos de Cuaresma no impresos
MATCH (p:Partitura)-[:PERTENECE_A]->(s:Solemnidad {tiempoLiturgico: "Cuaresma"})
WHERE p.impresa = false RETURN p.titulo

-- En qué momento se canta más un canto
MATCH (p:Partitura {titulo: "X"})-[r:CANTADA_EN]->(:Evento)
RETURN r.momento, count(*) as veces ORDER BY veces DESC

-- Cantos que nunca han coincidido en un evento
MATCH (p1:Partitura), (p2:Partitura)
WHERE NOT (p1)-[:CANTADA_EN]->(:Evento)<-[:CANTADA_EN]-(p2)
AND p1.id <> p2.id RETURN p1.titulo, p2.titulo

-- Cantos ensayados pero nunca cantados
MATCH (p:Partitura)-[:ENSAYADA_EN]->(:Practica)
WHERE NOT (p)-[:CANTADA_EN]->(:Evento)
RETURN p.titulo

-- Co-ocurrencias
MATCH (p1:Partitura)-[:CANTADA_EN]->(e:Evento)<-[:CANTADA_EN]-(p2:Partitura)
WHERE p1.id <> p2.id
RETURN p1.titulo, p2.titulo, count(e) as vecesJuntos
ORDER BY vecesJuntos DESC

-- Piezas de un ordinario
MATCH (p:Partitura)-[:PERTENECE_A_ORDINARIO]->(o:Ordinario {nombre: "Misa de Frisina"})
RETURN p.titulo

-- Qué ordinario usamos más en Cuaresma
MATCH (p:Partitura)-[:PERTENECE_A_ORDINARIO]->(o:Ordinario)
MATCH (p)-[:CANTADA_EN]->(e:Evento)
WHERE e.tiempoLiturgico = "Cuaresma"
RETURN o.nombre, count(e) as veces ORDER BY veces DESC
```

## Estructura de archivos
```
cantoral-api/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── Partitura.ts
│   │   │   ├── Ordinario.ts
│   │   │   ├── Solemnidad.ts
│   │   │   ├── Evento.ts
│   │   │   └── Practica.ts
│   │   ├── ports/repositories/
│   │   │   ├── IPartituraRepository.ts
│   │   │   ├── IOrdinarioRepository.ts
│   │   │   ├── ISolemnidadRepository.ts
│   │   │   ├── IEventoRepository.ts
│   │   │   └── IPracticaRepository.ts
│   │   └── value-objects/
│   │       ├── TiempoLiturgico.vo.ts  ✓
│   │       ├── Idioma.vo.ts           ✓
│   │       ├── Contexto.vo.ts         ✓
│   │       ├── Momento.vo.ts          ✓
│   │       └── Solemnidad.vo.ts       ✓
│   ├── application/
│   │   ├── use-cases/
│   │   │   ├── partitura/
│   │   │   ├── ordinario/
│   │   │   ├── solemnidad/
│   │   │   ├── evento/
│   │   │   └── practica/
│   │   └── dtos/
│   ├── infrastructure/
│   │   ├── neo4j/
│   │   │   ├── driver.ts
│   │   │   ├── repositories/
│   │   │   └── mappers/
│   │   └── http/
│   │       ├── server.ts
│   │       ├── routes/
│   │       └── schemas/
│   ├── shared/errors/
│   └── main.ts
├── tests/
│   ├── unit/
│   └── integration/
├── docker-compose.yml
├── .env
├── tsconfig.json
└── package.json
```

## Estado del proyecto
- [x] Diseño del dominio validado
- [x] Modelo de grafo definido
- [x] Casos de uso identificados
- [x] Stack tecnológico definido
- [x] Estructura de archivos definida
- [x] Value objects implementados (5/5)
- [ ] Entidades del dominio
- [ ] Puertos (interfaces de repositorios)
- [ ] Repositorios Neo4j
- [ ] Casos de uso
- [ ] DTOs con Zod
- [ ] Rutas HTTP con Fastify
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Documentación Swagger
- [ ] Seed de datos iniciales
- [ ] README del proyecto

## Notas de portafolio
- Proyecto #1 del portafolio backend
- Demuestra: arquitectura hexagonal adaptada, modelado de grafos, Neo4j, TypeScript, API REST
- Plan futuro: reimplementar en Spring Boot
- Proyecto siguiente: hexagonal + PostgreSQL (dominio diferente)

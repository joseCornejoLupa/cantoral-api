import neo4j, { Driver } from 'neo4j-driver'

let driver: Driver

export const getDriver = (): Driver => {
  if (!driver) {
    driver = neo4j.driver(
      process.env.NEO4J_URI ?? 'bolt://localhost:7687',
      neo4j.auth.basic(
        process.env.NEO4J_USER ?? 'neo4j',
        process.env.NEO4J_PASSWORD ?? 'password'
      )
    )
  }
  return driver
}

export const closeDriver = async (): Promise<void> => {
  if (driver) {
    await driver.close()
  }
}

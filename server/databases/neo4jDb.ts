import neo4j, { Driver } from "neo4j-driver";
import logger from "../utils/logger.ts";

let driver: Driver | null = null;

export function getDriver(): Driver {
  if (!driver) {
    const uri = process.env.NEO4J_URI || "bolt://localhost:7687";
    const user = process.env.NEO4J_USER || "neo4j";
    const password = process.env.NEO4J_PASSWORD || "";

    driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
    logger.info("Neo4j driver initialized", { uri });
  }
  return driver;
}

export async function closeDriver(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
    logger.info("Neo4j driver closed");
  }
}

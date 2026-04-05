import neo4j from "neo4j-driver";
import { getDriver } from "../databases/neo4jDb.ts";
import type { GraphNode, GraphEdge, GraphData, PlantRecommendation } from "../types/graph.d.ts";
import logger from "../utils/logger.ts";

export class GraphRepository {
  async getPlantGraph(plantId: number, hops: number): Promise<GraphData> {
    const safeHops = Math.max(1, Math.min(5, Math.floor(hops)));
    const driver = getDriver();
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH path = (start:Plant {id: $plantId})-[:COMPANION_OF|ANTAGONIST_OF*1..${safeHops}]-(connected:Plant)
                 WITH start, collect(distinct connected) AS connectedPlants, collect(distinct path) AS paths
                 WITH [start] + connectedPlants AS allPlants, paths
                 UNWIND allPlants AS plant
                 WITH collect(distinct plant) AS nodes, paths
                 UNWIND paths AS path
                 UNWIND relationships(path) AS rel
                 WITH nodes, collect(distinct rel) AS rels
                 RETURN nodes, rels`,
        { plantId: neo4jInt(plantId) },
      );

      const nodes: GraphNode[] = [];
      const edges: GraphEdge[] = [];

      if (result.records.length > 0) {
        const record = result.records[0];
        const rawNodes = record.get("nodes");
        const rawRels = record.get("rels");

        // Build map from Neo4j internal ID to plant ID, skipping nodes with no id
        const nodeIdMap = new Map<number, number>();
        for (const node of rawNodes) {
          const plantId = toNumber(node.properties.id);
          if (plantId == null || isNaN(plantId)) continue;
          nodeIdMap.set(toNumber(node.identity), plantId);
          nodes.push({
            id: plantId,
            name: node.properties.name,
            category: node.properties.category,
            growthForm: node.properties.growthForm,
          });
        }

        for (const rel of rawRels) {
          const source = nodeIdMap.get(toNumber(rel.start));
          const target = nodeIdMap.get(toNumber(rel.end));
          if (source == null || target == null) continue;
          edges.push({
            source,
            target,
            type: rel.type === "COMPANION_OF" ? "companion" : "antagonist",
          });
        }
      }

      return { nodes, edges };
    } catch (error) {
      logger.error("Failed to get plant graph", { plantId, hops, error });
      throw error;
    } finally {
      await session.close();
    }
  }

  async getCompanions(plantId: number): Promise<GraphNode[]> {
    const driver = getDriver();
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (p:Plant {id: $plantId})-[:COMPANION_OF]-(companion:Plant)
                 RETURN companion`,
        { plantId: neo4jInt(plantId) },
      );

      return result.records.map((record) => {
        const node = record.get("companion");
        return {
          id: toNumber(node.properties.id),
          name: node.properties.name,
          category: node.properties.category,
          growthForm: node.properties.growthForm,
        };
      });
    } catch (error) {
      logger.error("Failed to get companions", { plantId, error });
      throw error;
    } finally {
      await session.close();
    }
  }

  async getAntagonists(plantId: number): Promise<GraphNode[]> {
    const driver = getDriver();
    const session = driver.session();
    try {
      const result = await session.run(
        `MATCH (p:Plant {id: $plantId})-[:ANTAGONIST_OF]-(antagonist:Plant)
                 RETURN antagonist`,
        { plantId: neo4jInt(plantId) },
      );

      return result.records.map((record) => {
        const node = record.get("antagonist");
        return {
          id: toNumber(node.properties.id),
          name: node.properties.name,
          category: node.properties.category,
          growthForm: node.properties.growthForm,
        };
      });
    } catch (error) {
      logger.error("Failed to get antagonists", { plantId, error });
      throw error;
    } finally {
      await session.close();
    }
  }

  async getPlantRecommendations(gardenPlantIds: number[]): Promise<PlantRecommendation[]> {
    const driver = getDriver();
    const session = driver.session();
    try {
      // Find plants that are companions of ALL given plants and antagonists of NONE
      const result = await session.run(
        `WITH $gardenPlantIds AS gardenIds
                 MATCH (garden:Plant) WHERE garden.id IN gardenIds
                 WITH collect(garden) AS gardenPlants, size(gardenIds) AS gardenSize, gardenIds
                 UNWIND gardenPlants AS gp
                 MATCH (gp)-[:COMPANION_OF]-(candidate:Plant)
                 WHERE NOT candidate.id IN gardenIds
                 WITH candidate, count(distinct gp) AS companionCount, gardenSize, gardenIds
                 WHERE companionCount = gardenSize
                 WITH candidate, companionCount, gardenIds
                 OPTIONAL MATCH (candidate)-[:ANTAGONIST_OF]-(blocker:Plant)
                 WHERE blocker.id IN gardenIds
                 WITH candidate, companionCount, collect(blocker) AS blockers
                 WHERE size(blockers) = 0
                 RETURN candidate, companionCount
                 ORDER BY companionCount DESC`,
        { gardenPlantIds: gardenPlantIds.map(neo4jInt) },
      );

      return result.records.map((record) => {
        const node = record.get("candidate");
        return {
          id: toNumber(node.properties.id),
          name: node.properties.name,
          category: node.properties.category,
          growthForm: node.properties.growthForm,
          companionCount: toNumber(record.get("companionCount")),
        };
      });
    } catch (error) {
      logger.error("Failed to get plant recommendations", { gardenPlantIds, error });
      throw error;
    } finally {
      await session.close();
    }
  }

  async upsertPlant(
    id: number,
    name: string,
    category: string,
    growthForm: string,
    family?: string,
  ): Promise<void> {
    const driver = getDriver();
    const session = driver.session();
    try {
      await session.run(
        `MERGE (p:Plant {id: $id})
                 SET p.name = $name, p.category = $category, p.growthForm = $growthForm, p.family = $family`,
        { id: neo4jInt(id), name, category, growthForm, family: family || null },
      );
    } catch (error) {
      logger.error("Failed to upsert plant in Neo4j", { id, error });
    } finally {
      await session.close();
    }
  }

  async deletePlant(plantId: number): Promise<void> {
    const driver = getDriver();
    const session = driver.session();
    try {
      await session.run(`MATCH (p:Plant {id: $plantId}) DETACH DELETE p`, {
        plantId: neo4jInt(plantId),
      });
    } catch (error) {
      logger.error("Failed to delete plant from Neo4j", { plantId, error });
    } finally {
      await session.close();
    }
  }

  async addCompanion(plantId: number, companionId: number): Promise<void> {
    const driver = getDriver();
    const session = driver.session();
    try {
      const lowId = Math.min(plantId, companionId);
      const highId = Math.max(plantId, companionId);
      await session.run(
        `MATCH (a:Plant {id: $lowId}), (b:Plant {id: $highId})
                 MERGE (a)-[:COMPANION_OF]->(b)`,
        { lowId: neo4jInt(lowId), highId: neo4jInt(highId) },
      );
    } catch (error) {
      logger.error("Failed to add companion in Neo4j", { plantId, companionId, error });
    } finally {
      await session.close();
    }
  }

  async addAntagonist(plantId: number, antagonistId: number): Promise<void> {
    const driver = getDriver();
    const session = driver.session();
    try {
      const lowId = Math.min(plantId, antagonistId);
      const highId = Math.max(plantId, antagonistId);
      await session.run(
        `MATCH (a:Plant {id: $lowId}), (b:Plant {id: $highId})
                 MERGE (a)-[:ANTAGONIST_OF]->(b)`,
        { lowId: neo4jInt(lowId), highId: neo4jInt(highId) },
      );
    } catch (error) {
      logger.error("Failed to add antagonist in Neo4j", { plantId, antagonistId, error });
    } finally {
      await session.close();
    }
  }
}

// Convert Neo4j Integer to JS number
function toNumber(value: any): number {
  if (value && typeof value.toNumber === "function") {
    return value.toNumber();
  }
  return Number(value);
}

// Create Neo4j Integer from JS number
function neo4jInt(value: number) {
  return neo4j.int(value);
}

export const graphRepository = new GraphRepository();

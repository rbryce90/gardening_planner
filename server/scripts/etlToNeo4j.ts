import { DatabaseSync } from "node:sqlite";
import neo4j from "neo4j-driver";

const db = new DatabaseSync("plants.db");
db.exec("PRAGMA foreign_keys = ON;");

const uri = process.env.NEO4J_URI || "bolt://localhost:7687";
const user = process.env.NEO4J_USER || "neo4j";
const password = process.env.NEO4J_PASSWORD || "password";

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
const session = driver.session();

async function etl() {
  console.log("Starting ETL: SQLite → Neo4j...");

  // Create constraints
  await session.run(
    `CREATE CONSTRAINT plant_id_unique IF NOT EXISTS FOR (p:Plant) REQUIRE p.id IS UNIQUE`,
  );

  // Extract plants from SQLite
  const plants = db
    .prepare("SELECT id, name, category, growth_form, edible_part, family FROM plants")
    .all() as any[];

  console.log(`Found ${plants.length} plants in SQLite`);

  // Load plants into Neo4j
  let plantCount = 0;
  for (const plant of plants) {
    await session.run(
      `MERGE (p:Plant {id: $id})
             SET p.name = $name,
                 p.category = $category,
                 p.growthForm = $growthForm,
                 p.ediblePart = $ediblePart,
                 p.family = $family`,
      {
        id: neo4j.int(plant.id),
        name: plant.name,
        category: plant.category,
        growthForm: plant.growth_form,
        ediblePart: plant.edible_part,
        family: plant.family,
      },
    );
    plantCount++;
  }
  console.log(`Loaded ${plantCount} Plant nodes`);

  // Extract companions from SQLite
  const companions = db.prepare("SELECT plant_id, companion_id FROM companions").all() as any[];

  console.log(`Found ${companions.length} companion relationships in SQLite`);

  // Load companions into Neo4j
  let companionCount = 0;
  for (const c of companions) {
    await session.run(
      `MATCH (a:Plant {id: $plantId}), (b:Plant {id: $companionId})
             MERGE (a)-[:COMPANION_OF]->(b)`,
      {
        plantId: neo4j.int(c.plant_id),
        companionId: neo4j.int(c.companion_id),
      },
    );
    companionCount++;
  }
  console.log(`Loaded ${companionCount} COMPANION_OF relationships`);

  // Extract antagonists from SQLite
  const antagonists = db.prepare("SELECT plant_id, antagonist_id FROM antagonists").all() as any[];

  console.log(`Found ${antagonists.length} antagonist relationships in SQLite`);

  // Load antagonists into Neo4j
  let antagonistCount = 0;
  for (const a of antagonists) {
    await session.run(
      `MATCH (a:Plant {id: $plantId}), (b:Plant {id: $antagonistId})
             MERGE (a)-[:ANTAGONIST_OF]->(b)`,
      {
        plantId: neo4j.int(a.plant_id),
        antagonistId: neo4j.int(a.antagonist_id),
      },
    );
    antagonistCount++;
  }
  console.log(`Loaded ${antagonistCount} ANTAGONIST_OF relationships`);

  // Verify
  const nodeCount = await session.run("MATCH (p:Plant) RETURN count(p) AS count");
  const relCount = await session.run("MATCH ()-[r]-() RETURN count(r) AS count");
  console.log(`\nVerification:`);
  console.log(`  Neo4j nodes: ${nodeCount.records[0].get("count")}`);
  console.log(`  Neo4j relationships: ${relCount.records[0].get("count")}`);
  console.log("ETL complete.");
}

etl()
  .catch((error) => {
    console.error("ETL failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await session.close();
    await driver.close();
    db.close();
  });

import neo4j from "neo4j-driver";
import seedData from "./seed-data.json" with { type: "json" };

const uri = process.env.NEO4J_URI || "bolt://localhost:7687";
const user = process.env.NEO4J_USER || "neo4j";
const password = process.env.NEO4J_PASSWORD || "password";

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
const session = driver.session();

async function seed() {
  console.log("Seeding Neo4j...");

  // Create uniqueness constraint on Plant.id
  await session.run(
    `CREATE CONSTRAINT plant_id_unique IF NOT EXISTS FOR (p:Plant) REQUIRE p.id IS UNIQUE`,
  );

  // Build name-to-id map (mirrors SQLite auto-increment IDs: 1-indexed, insertion order)
  const nameToId = new Map<string, number>();
  seedData.plants.forEach((plant, index) => {
    nameToId.set(plant.name, index + 1);
  });

  // Create Plant nodes
  let plantCount = 0;
  for (const plant of seedData.plants) {
    const id = nameToId.get(plant.name)!;
    await session.run(
      `MERGE (p:Plant {id: $id})
             SET p.name = $name, p.category = $category, p.growthForm = $growthForm, p.family = $family`,
      {
        id: neo4j.int(id),
        name: plant.name,
        category: plant.category,
        growthForm: plant.growth_form,
        family: plant.family,
      },
    );
    plantCount++;
  }
  console.log(`Created ${plantCount} Plant nodes`);

  // Create COMPANION_OF relationships (bidirectional via undirected pattern)
  let companionCount = 0;
  for (const companion of seedData.companions) {
    const idA = nameToId.get(companion.plant_name);
    const idB = nameToId.get(companion.companion_name);
    if (!idA || !idB) {
      console.warn(
        `Warning: could not resolve companion pair "${companion.plant_name}" + "${companion.companion_name}"`,
      );
      continue;
    }
    // Store with lower ID as 'a' for consistent direction
    const lowId = Math.min(idA, idB);
    const highId = Math.max(idA, idB);
    await session.run(
      `MATCH (a:Plant {id: $lowId}), (b:Plant {id: $highId})
             MERGE (a)-[:COMPANION_OF]-(b)`,
      { lowId: neo4j.int(lowId), highId: neo4j.int(highId) },
    );
    companionCount++;
  }
  console.log(`Created ${companionCount} COMPANION_OF relationships`);

  // Create ANTAGONIST_OF relationships (bidirectional via undirected pattern)
  let antagonistCount = 0;
  for (const antagonist of seedData.antagonists) {
    const idA = nameToId.get(antagonist.plant_name);
    const idB = nameToId.get(antagonist.antagonist_name);
    if (!idA || !idB) {
      console.warn(
        `Warning: could not resolve antagonist pair "${antagonist.plant_name}" + "${antagonist.antagonist_name}"`,
      );
      continue;
    }
    const lowId = Math.min(idA, idB);
    const highId = Math.max(idA, idB);
    await session.run(
      `MATCH (a:Plant {id: $lowId}), (b:Plant {id: $highId})
             MERGE (a)-[:ANTAGONIST_OF]-(b)`,
      { lowId: neo4j.int(lowId), highId: neo4j.int(highId) },
    );
    antagonistCount++;
  }
  console.log(`Created ${antagonistCount} ANTAGONIST_OF relationships`);

  console.log("Neo4j seed complete.");
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await session.close();
    await driver.close();
  });

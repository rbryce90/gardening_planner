# Neo4j Graph Database — How It Works

This guide explains Neo4j, why it's used in this project, and how the Cypher query language works.

## Why a Graph Database?

Plant relationships are a **graph problem**. In SQLite, finding "all plants compatible with everything in my garden" requires multiple self-joins across the companions and antagonists tables. The query gets exponentially uglier as the garden grows.

In Neo4j, the same query is:

```cypher
MATCH (garden:Plant)-[:COMPANION_OF]-(recommendation:Plant)
WHERE garden.id IN [1, 2, 3]
AND NOT (recommendation)-[:ANTAGONIST_OF]-(:Plant {id: 1})
AND NOT (recommendation)-[:ANTAGONIST_OF]-(:Plant {id: 2})
AND NOT (recommendation)-[:ANTAGONIST_OF]-(:Plant {id: 3})
RETURN recommendation
```

Graph databases store relationships as first-class citizens, not as join tables. Traversing relationships is O(1) per hop, regardless of how much data is in the database.

## Core Concepts

### Nodes

Nodes are entities. In this project, every plant is a node:

```cypher
(:Plant {id: 1, name: "Tomato", category: "Vegetable", growthForm: "Vine"})
```

The `Plant` part is a **label** — it's like a table name. The `{id: 1, name: "Tomato"}` part contains **properties** — like columns.

### Relationships

Relationships connect nodes. They always have a **type** and a **direction**:

```
(Tomato)-[:COMPANION_OF]->(Basil)
```

In our schema, we have two relationship types:
- `COMPANION_OF` — these two plants grow well together
- `ANTAGONIST_OF` — these two plants harm each other

Relationships are stored **on the nodes themselves**, not in a separate table. This is why traversal is fast — Neo4j doesn't scan a join table, it follows pointers directly from one node to the next.

### Direction

Every relationship has a direction when created, but you can query **ignoring direction**. We create relationships from the lower ID to the higher ID (matching the SQLite convention), but query both directions:

```cypher
-- This matches regardless of which direction the relationship was created
MATCH (p:Plant {id: 1})-[:COMPANION_OF]-(other:Plant)
RETURN other
```

The `-[:COMPANION_OF]-` pattern (no arrow) means "either direction."

## Cypher Query Language

Cypher is Neo4j's query language. It uses ASCII art to describe graph patterns.

### Basic Patterns

```cypher
-- Find a node
MATCH (p:Plant {name: "Tomato"}) RETURN p

-- Find connected nodes (1 hop)
MATCH (p:Plant {id: 1})-[:COMPANION_OF]-(friend:Plant) RETURN friend

-- Find connected nodes (2 hops)
MATCH (p:Plant {id: 1})-[:COMPANION_OF*1..2]-(nearby:Plant) RETURN nearby
```

The `*1..2` syntax means "follow 1 to 2 COMPANION_OF relationships." This is called **variable-length path matching**.

### Creating Data

```cypher
-- Create a node (MERGE = create if not exists)
MERGE (p:Plant {id: 1})
SET p.name = "Tomato", p.category = "Vegetable"

-- Create a relationship
MATCH (a:Plant {id: 1}), (b:Plant {id: 2})
MERGE (a)-[:COMPANION_OF]->(b)
```

`MERGE` is idempotent — running it twice doesn't create duplicates. `CREATE` would.

### Filtering

```cypher
-- Find companions that are NOT antagonists of any plant in a list
MATCH (garden:Plant)-[:COMPANION_OF]-(rec:Plant)
WHERE garden.id IN [1, 2, 3]
  AND NOT rec.id IN [1, 2, 3]
  AND NOT EXISTS {
    MATCH (rec)-[:ANTAGONIST_OF]-(enemy:Plant)
    WHERE enemy.id IN [1, 2, 3]
  }
RETURN rec
```

### Aggregation

```cypher
-- Count how many companions each plant has
MATCH (p:Plant)-[:COMPANION_OF]-(c:Plant)
RETURN p.name, count(c) AS companionCount
ORDER BY companionCount DESC
```

## How It Fits In This Project

### Architecture (Hybrid)

```
SQLite (plants.db)          Neo4j (bolt://localhost:7687)
├── users                   ├── Plant nodes
├── gardens                 ├── COMPANION_OF edges
├── garden_cells            └── ANTAGONIST_OF edges
├── plants (master list)
├── plant_types
├── zones
└── planting_seasons
```

SQLite handles tabular data (users, grids, seasons). Neo4j handles relationship traversal (companions, antagonists, recommendations). Plant data exists in both — SQLite is the source of truth for CRUD, Neo4j is the source of truth for relationship queries.

### Data Flow

1. `seed.ts` populates SQLite from `seed-data.json`
2. `seedNeo4j.ts` populates Neo4j from the same `seed-data.json`
3. CRUD operations (add/edit/delete plants) go through SQLite via `plantRepository.ts`
4. Relationship queries (graph visualization, recommendations) go through Neo4j via `graphRepository.ts`

### API Endpoints

| Endpoint | Database | Purpose |
|----------|----------|---------|
| GET /api/plants | SQLite | List all plants |
| GET /api/plants/:name/types | SQLite | Plant details with companions/antagonists |
| GET /api/graph/plants/:id?hops=2 | Neo4j | Graph data for visualization (nodes + edges) |
| GET /api/graph/recommendations?plantIds=1,2,3 | Neo4j | Plants compatible with all given plants |

### Key Queries in This Project

**2-hop graph for visualization** (`graphRepository.ts`):
```cypher
MATCH (center:Plant {id: $plantId})
OPTIONAL MATCH path = (center)-[r:COMPANION_OF|ANTAGONIST_OF*1..2]-(connected:Plant)
RETURN center, connected, relationships(path) as rels
```

This returns the center plant, all plants within 2 relationship hops, and the relationships connecting them. The frontend renders this as a force-directed graph with green (companion) and red (antagonist) edges.

**Smart recommendations** (`graphRepository.ts`):
```cypher
MATCH (garden:Plant)-[:COMPANION_OF]-(rec:Plant)
WHERE garden.id IN $gardenPlantIds
  AND NOT rec.id IN $gardenPlantIds
WITH rec, count(garden) AS matchCount
WHERE matchCount = size($gardenPlantIds)
  AND NOT EXISTS {
    MATCH (rec)-[:ANTAGONIST_OF]-(enemy:Plant)
    WHERE enemy.id IN $gardenPlantIds
  }
RETURN rec
```

This finds plants that are companions of ALL plants in your garden and antagonists of NONE. Try writing that in SQL with self-joins — it's possible but painful.

## Running Neo4j Locally

```bash
# Start Neo4j via Podman
podman-compose up -d

# Open the browser UI
open http://localhost:7474
# Login: neo4j / password

# Seed the graph
cd server && npm run seed:neo4j

# Verify data
# In the Neo4j browser, run:
MATCH (p:Plant) RETURN p LIMIT 25
```

## Neo4j Browser Tips

The Neo4j browser at `http://localhost:7474` is a great way to explore the data visually:

- Type any Cypher query and hit play
- Nodes are displayed as circles, relationships as lines
- Click a node to see its properties
- Double-click a node to expand its relationships
- Try: `MATCH (p:Plant {name: "Tomato"})-[r]-(connected) RETURN p, r, connected`

## Comparison: SQL vs Cypher

| Task | SQL | Cypher |
|------|-----|--------|
| Find companions | `SELECT * FROM companions JOIN plants ON ...` | `MATCH (p)-[:COMPANION_OF]-(c) RETURN c` |
| 2-hop traversal | 2 self-joins + UNION | `MATCH (p)-[*1..2]-(c) RETURN c` |
| "Compatible with all" | N self-joins where N = garden size | `WITH rec, count(*) WHERE count = size(list)` |
| Add relationship | `INSERT INTO companions (plant_id, companion_id)` | `MERGE (a)-[:COMPANION_OF]->(b)` |

The SQL versions work. The Cypher versions read like English.

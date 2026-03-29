#!/bin/sh
set -e

echo "Installing dependencies..."
npm install

echo "Generating TSOA routes..."
npx tsoa spec-and-routes

echo "Seeding SQLite..."
npx tsx --experimental-sqlite scripts/seed.ts

echo "Syncing plant data to Neo4j..."
npx tsx --experimental-sqlite scripts/etlToNeo4j.ts || echo "Neo4j sync skipped (Neo4j may not be ready)"

echo "Starting server..."
exec npx tsx --experimental-sqlite index.ts

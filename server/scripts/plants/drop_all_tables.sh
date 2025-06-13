#!/bin/bash

DB_FILE="../../plants.db"

if [[ ! -f "$DB_FILE" ]]; then
  echo "❌ Database file '$DB_FILE' not found."
  exit 1
fi

echo "⚠️ Dropping all project tables from $DB_FILE..."

tables=(
  "planting_seasons"
  "companions"
  "antagonists"
  "plant_types"
  "zones"
  "plants"
)

for table in "${tables[@]}"; do
  echo "🔻 Dropping table: $table"
  sqlite3 "$DB_FILE" "DROP TABLE IF EXISTS $table;"
done

echo "✅ All specified tables dropped."

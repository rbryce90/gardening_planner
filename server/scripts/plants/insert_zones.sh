#!/bin/bash

DB_FILE="../../plants.db"

if [[ ! -f "$DB_FILE" ]]; then
  echo "❌ Database file '$DB_FILE' does not exist."
  exit 1
fi

# Format: name|min_temperature|max_temperature
zones=(
  "Zone 1|-60|-50"
  "Zone 2|-50|-40"
  "Zone 3|-40|-30"
  "Zone 4|-30|-20"
  "Zone 5|-20|-10"
  "Zone 6|-10|0"
  "Zone 7|0|10"
  "Zone 8|10|20"
  "Zone 9|20|30"
  "Zone 10|30|40"
  "Zone 11|40|50"
  "Zone 12|50|60"
  "Zone 13|60|70"
)

echo "📦 Inserting USDA zones into $DB_FILE..."

for zone in "${zones[@]}"; do
  IFS='|' read -r name min max <<< "$zone"

  sqlite3 "$DB_FILE" <<EOF
INSERT OR IGNORE INTO zones (name, min_temperature, max_temperature)
VALUES ('$name', $min, $max);
EOF

  echo "✅ Inserted: $name ($min°C to $max°C)"
done

echo "🎉 Zone insertion complete!"

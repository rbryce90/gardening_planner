#!/bin/bash

DB_FILE="../../plants.db"

if [[ ! -f "$DB_FILE" ]]; then
  echo "❌ Database file '$DB_FILE' does not exist."
  exit 1
fi

echo "⚠️  Deleting all existing records from plants table..."
sqlite3 "$DB_FILE" "DELETE FROM plants;"

# Format: name|category|growth_form|edible_part
plants=(
  "Tomato|vegetable|vine|fruit"
  "Carrot|vegetable|underground|root"
  "Apple|fruit|tree|fruit"
  "Strawberry|fruit|groundcover|fruit"
  "Basil|herb|herbaceous|leaves"
  "Mint|herb|herbaceous|leaves"
  "Sunflower|grain|herbaceous|seeds"
  "Peanut|nut|underground|seeds"
  "Potato|vegetable|underground|tuber"
  "Corn|grain|herbaceous|seeds"
  "Cucumber|vegetable|vine|fruit"
  "Lettuce|vegetable|herbaceous|leaves"
  "Blueberry|fruit|bush|fruit"
  "Blackberry|fruit|vine|fruit"
  "Garlic|vegetable|underground|bulb"
  "Onion|vegetable|underground|bulb"
  "Pumpkin|vegetable|vine|fruit"
  "Oregano|herb|herbaceous|leaves"
  "Almond|nut|tree|seeds"
  "Walnut|nut|tree|seeds"
)

echo "🌿 Inserting updated list of edible plants..."

for plant in "${plants[@]}"; do
  IFS='|' read -r name category growth_form edible_part <<< "$plant"

  sqlite3 "$DB_FILE" <<EOF
INSERT INTO plants (name, category, growth_form, edible_part)
VALUES ('$name', '$category', '$growth_form', '$edible_part');
EOF

  echo "✅ Inserted: $name"
done

echo "🎉 Plants table reset complete!"

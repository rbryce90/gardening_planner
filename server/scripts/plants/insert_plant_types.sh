#!/bin/bash

DB_FILE="../../plants.db"

sqlite3 "$DB_FILE" <<EOF
CREATE TABLE IF NOT EXISTS plant_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plant_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    scientific_name TEXT,
    description TEXT,
    planting_notes TEXT,
    FOREIGN KEY (plant_id) REFERENCES plants(id)
);

INSERT INTO plant_types (plant_id, name, scientific_name, description, planting_notes) VALUES
(1, 'Cherry Tomato', 'Solanum lycopersicum var. cerasiforme', 'Small, sweet, bite-sized tomatoes.', 'Great for snacking, grows well in containers.'),
(1, 'Grape Tomato', 'Solanum lycopersicum', 'Oblong, firm, and sweet, stores well.', 'Ideal for salads, resistant to cracking.'),
(1, 'Beefsteak Tomato', 'Solanum lycopersicum', 'Huge, meaty, juicy tomatoes.', 'Needs support, long growing season.'),
(1, 'Brandywine', 'Solanum lycopersicum', 'Large heirloom with rich, sweet flavor.', 'Prone to disease, needs staking.'),
(1, 'Roma Tomato', 'Solanum lycopersicum', 'Egg-shaped paste tomato with low moisture.', 'Excellent for sauces and canning.'),
(1, 'San Marzano', 'Solanum lycopersicum', 'Classic Italian paste tomato with deep flavor.', 'Grows well in full sun, needs support.'),
(1, 'Green Zebra', 'Solanum lycopersicum', 'Green-striped heirloom with tangy flavor.', 'Harvest when slightly soft.'),
(1, 'Yellow Pear', 'Solanum lycopersicum', 'Small, yellow pear-shaped fruit with mild taste.', 'Attractive in salads, grows prolifically.'),
(1, 'Black Krim', 'Solanum lycopersicum', 'Dark reddish-purple heirloom with smoky flavor.', 'Prefers heat, benefits from regular watering.'),
(1, 'Mortgage Lifter', 'Solanum lycopersicum', 'Large, sweet beefsteak heirloom variety.', 'Needs staking and spacing.'),
(1, 'Sungold', 'Solanum lycopersicum', 'Bright orange cherry tomato, extremely sweet.', 'Indeterminate, harvest regularly.'),
(1, 'Early Girl', 'Solanum lycopersicum', 'Medium-sized red tomato with early harvest.', 'Good for cooler climates and short seasons.'),
(1, 'Celebrity', 'Solanum lycopersicum', 'Disease-resistant hybrid with balanced flavor.', 'Determinate, good for slicing.');
EOF

echo "✅ All tomato types inserted into plant_types table in $DB_FILE"

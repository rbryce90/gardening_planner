import React from "react";
import Box from "@mui/material/Box";
import GardenCell from "./GardenCell";

export default function GardenGrid({ garden, cells, companions, antagonists, onCellClick }) {
  const cellGrid = {};
  (cells || []).forEach((c) => {
    cellGrid[`${c.row},${c.col}`] = c;
  });

  const companionSet = new Set(
    (companions || []).map(({ plantId, companionId }) =>
      `${Math.min(plantId, companionId)}-${Math.max(plantId, companionId)}`
    )
  );

  const antagonistSet = new Set(
    (antagonists || []).map(({ plantId, antagonistId }) =>
      `${Math.min(plantId, antagonistId)}-${Math.max(plantId, antagonistId)}`
    )
  );

  const pairKey = (a, b) => `${Math.min(a, b)}-${Math.max(a, b)}`;

  const getCellStatus = (row, col) => {
    const cell = cellGrid[`${row},${col}`];
    if (!cell) return "empty";

    const neighbors = [
      [row - 1, col],
      [row + 1, col],
      [row, col - 1],
      [row, col + 1],
    ];

    let hasCompanion = false;
    for (const [nr, nc] of neighbors) {
      if (nr < 0 || nr >= garden.rows || nc < 0 || nc >= garden.cols) continue;
      const neighbor = cellGrid[`${nr},${nc}`];
      if (!neighbor) continue;
      const key = pairKey(cell.plantId, neighbor.plantId);
      if (antagonistSet.has(key)) return "antagonist";
      if (companionSet.has(key)) hasCompanion = true;
    }

    return hasCompanion ? "companion" : "neutral";
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: `repeat(${garden.cols}, 64px)`,
        gap: 0.5,
      }}
    >
      {Array.from({ length: garden.rows }, (_, row) =>
        Array.from({ length: garden.cols }, (_, col) => {
          const cell = cellGrid[`${row},${col}`] || null;
          const status = getCellStatus(row, col);
          return (
            <GardenCell
              key={`${row}-${col}`}
              cell={cell}
              status={status}
              onClick={() => onCellClick(row, col, cell)}
            />
          );
        })
      )}
    </Box>
  );
}

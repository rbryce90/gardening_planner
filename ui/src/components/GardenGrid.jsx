import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import GardenCell from "./GardenCell";

export default function GardenGrid({
  garden,
  cells,
  companions,
  antagonists,
  onCellClick,
  onCellRightClick,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [focusedRow, setFocusedRow] = useState(0);
  const [focusedCol, setFocusedCol] = useState(0);
  const gridRef = useRef(null);

  const cellGrid = useMemo(() => {
    const grid = {};
    (cells || []).forEach((c) => {
      grid[`${c.row},${c.col}`] = c;
    });
    return grid;
  }, [cells]);

  const companionSet = useMemo(
    () =>
      new Set(
        (companions || []).map(
          ({ plantId, companionId }) =>
            `${Math.min(plantId, companionId)}-${Math.max(plantId, companionId)}`,
        ),
      ),
    [companions],
  );

  const antagonistSet = useMemo(
    () =>
      new Set(
        (antagonists || []).map(
          ({ plantId, antagonistId }) =>
            `${Math.min(plantId, antagonistId)}-${Math.max(plantId, antagonistId)}`,
        ),
      ),
    [antagonists],
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
      if (cell.plantId === neighbor.plantId) {
        hasCompanion = true;
        continue;
      }
      const key = pairKey(cell.plantId, neighbor.plantId);
      if (antagonistSet.has(key)) return "antagonist";
      if (companionSet.has(key)) hasCompanion = true;
    }

    return hasCompanion ? "companion" : "neutral";
  };

  const handleMouseDown = useCallback(
    (row, col, cell) => {
      setIsDragging(true);
      onCellClick(row, col, cell);
    },
    [onCellClick],
  );

  const handleMouseEnter = useCallback(
    (row, col, cell) => {
      if (isDragging) {
        onCellClick(row, col, cell);
      }
    },
    [isDragging, onCellClick],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleContextMenu = useCallback(
    (e, row, col) => {
      e.preventDefault();
      if (onCellRightClick) onCellRightClick(row, col);
    },
    [onCellRightClick],
  );

  const handleGridKeyDown = useCallback(
    (e) => {
      let newRow = focusedRow;
      let newCol = focusedCol;

      switch (e.key) {
        case "ArrowUp":
          newRow = Math.max(0, focusedRow - 1);
          break;
        case "ArrowDown":
          newRow = Math.min(garden.rows - 1, focusedRow + 1);
          break;
        case "ArrowLeft":
          newCol = Math.max(0, focusedCol - 1);
          break;
        case "ArrowRight":
          newCol = Math.min(garden.cols - 1, focusedCol + 1);
          break;
        default:
          return;
      }

      e.preventDefault();
      setFocusedRow(newRow);
      setFocusedCol(newCol);
    },
    [focusedRow, focusedCol, garden.rows, garden.cols],
  );

  useEffect(() => {
    if (!gridRef.current) return;
    const cellIndex = focusedRow * garden.cols + focusedCol;
    const focusableChildren = gridRef.current.querySelectorAll('[role="gridcell"]');
    if (focusableChildren[cellIndex]) {
      focusableChildren[cellIndex].focus();
    }
  }, [focusedRow, focusedCol, garden.cols]);

  return (
    <Box
      ref={gridRef}
      role="grid"
      aria-label="Garden grid"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onKeyDown={handleGridKeyDown}
      sx={{
        display: "grid",
        gridTemplateColumns: `repeat(${garden.cols}, minmax(48px, 1fr))`,
        maxWidth: garden.cols * 80,
        gap: 0.5,
        userSelect: "none",
      }}
    >
      {Array.from({ length: garden.rows }, (_, row) => (
        <Box key={row} role="row" sx={{ display: "contents" }}>
          {Array.from({ length: garden.cols }, (_, col) => {
            const cell = cellGrid[`${row},${col}`] || null;
            const status = getCellStatus(row, col);
            return (
              <GardenCell
                key={`${row}-${col}`}
                cell={cell}
                row={row}
                col={col}
                status={status}
                tabIndex={row === focusedRow && col === focusedCol ? 0 : -1}
                onMouseDown={() => handleMouseDown(row, col, cell)}
                onMouseEnter={() => handleMouseEnter(row, col, cell)}
                onContextMenu={(e) => handleContextMenu(e, row, col)}
                onClick={() => onCellClick(row, col, cell)}
                onClear={() => onCellRightClick && onCellRightClick(row, col)}
              />
            );
          })}
        </Box>
      ))}
    </Box>
  );
}

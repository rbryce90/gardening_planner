import React from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";

function plantHue(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return ((hash % 360) + 360) % 360;
}

export default function GardenCell({ cell, status, onMouseDown, onMouseEnter, onContextMenu }) {
  const theme = useTheme();

  const getPlantBg = () => {
    if (!cell?.plantName) return theme.palette.background.default;
    const hue = plantHue(cell.plantName);
    if (status === "antagonist") return theme.palette.error.dark;
    if (status === "companion") return `hsl(${hue}, 50%, 25%)`;
    return `hsl(${hue}, 30%, 20%)`;
  };

  const borderColor = {
    antagonist: theme.palette.error.main,
    companion: theme.palette.success.main,
    neutral: undefined,
    empty: undefined,
  };

  const bc = borderColor[status];

  return (
    <Box
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onContextMenu={onContextMenu}
      sx={{
        aspectRatio: "1",
        minWidth: 48,
        border: bc ? "2px solid" : "1px solid",
        borderColor: bc || "divider",
        borderRadius: 1,
        boxShadow: bc ? `0 0 8px ${bc}` : "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.75rem",
        fontWeight: 500,
        textAlign: "center",
        overflow: "hidden",
        p: 0.5,
        backgroundColor: getPlantBg(),
        transition: "all 0.15s ease-in-out",
        "&:hover": {
          transform: "scale(1.05)",
          zIndex: 1,
          opacity: 0.9,
        },
      }}
    >
      {cell?.plantName || ""}
    </Box>
  );
}

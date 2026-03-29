import React from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";

export default function GardenCell({ cell, status, onMouseDown, onMouseEnter, onContextMenu }) {
  const theme = useTheme();

  const bgColor = {
    antagonist: theme.palette.error.dark,
    companion: theme.palette.success.dark,
    neutral: theme.palette.background.paper,
    empty: theme.palette.background.default,
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
        aspectRatio: '1',
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
        backgroundColor: bgColor[status] || theme.palette.background.default,
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

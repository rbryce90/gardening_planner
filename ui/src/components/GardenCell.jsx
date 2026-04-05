import React from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";

export default function GardenCell({
  cell,
  row,
  col,
  status,
  tabIndex = 0,
  onMouseDown,
  onMouseEnter,
  onContextMenu,
  onClick,
  onClear,
}) {
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

  const statusIndicator =
    status === "companion" ? "\u2713" : status === "antagonist" ? "\u2715" : null;

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (onClick) onClick();
    } else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      if (onClear) onClear();
    }
  };

  return (
    <Box
      tabIndex={tabIndex}
      role="gridcell"
      aria-label={`Row ${row + 1}, Column ${col + 1}${cell?.plantName ? ": " + cell.plantName : ": empty"}`}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onContextMenu={onContextMenu}
      onKeyDown={handleKeyDown}
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
        position: "relative",
        backgroundColor: bgColor[status] || theme.palette.background.default,
        transition: "all 0.15s ease-in-out",
        "&:hover": {
          transform: "scale(1.05)",
          zIndex: 1,
          opacity: 0.9,
        },
        "&:focus": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: -2,
          zIndex: 1,
        },
      }}
    >
      {cell?.plantName || ""}
      {statusIndicator && (
        <Box
          component="span"
          aria-hidden="true"
          sx={{
            position: "absolute",
            top: 2,
            right: 2,
            fontSize: "0.55rem",
            lineHeight: 1,
            color: status === "companion" ? "success.main" : "error.main",
            fontWeight: 700,
          }}
        >
          {statusIndicator}
        </Box>
      )}
    </Box>
  );
}

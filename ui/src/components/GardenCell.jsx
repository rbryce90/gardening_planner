import React from "react";
import Box from "@mui/material/Box";

const bgColor = {
  antagonist: "error.dark",
  companion: "success.dark",
  neutral: "background.paper",
  empty: "background.default",
};

export default function GardenCell({ cell, status, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        width: 64,
        height: 64,
        border: "1px solid",
        borderColor: "divider",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.7rem",
        textAlign: "center",
        overflow: "hidden",
        p: 0.5,
        backgroundColor: bgColor[status] || "background.default",
        "&:hover": { opacity: 0.8 },
      }}
    >
      {cell?.plantName || ""}
    </Box>
  );
}

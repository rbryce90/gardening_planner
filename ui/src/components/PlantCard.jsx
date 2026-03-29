import React from "react";
import { Card, CardContent, Typography, Button } from "@mui/material";
import { capitalize } from "../utils/utils";
import { useNavigate } from "react-router-dom"; // Import useNavigate from React Router

export default function PlantCard({ plant, onEdit, onDelete }) {
  const navigate = useNavigate(); // Initialize the navigate function

  const handleCardClick = () => {
    navigate(`/plants/${plant.name}/types`); // Redirect to the desired route
  };

  return (
    <Card
      sx={{
        position: "relative",
        width: "100%",
        cursor: "pointer",
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
        },
      }}
      onClick={handleCardClick} // Add onClick handler for the card
    >
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {plant.name}
        </Typography>
        <Typography variant="body2" gutterBottom>
          <b>Category: </b> {capitalize(plant.category)}
        </Typography>
        <Typography variant="body2">
          <b>Growth Form:</b> {capitalize(plant.growthForm)}
        </Typography>
        <Typography variant="body2">
          <b>Edible Part: </b> {capitalize(plant.ediblePart) || "Not added yet"}
        </Typography>
      </CardContent>
      {(onEdit || onDelete) && (
        <CardContent sx={{ display: "flex", justifyContent: "space-between" }}>
          {onEdit && (
            <Button
              variant="contained"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              sx={{ marginRight: 1 }}
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="contained"
              color="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              Delete
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
}

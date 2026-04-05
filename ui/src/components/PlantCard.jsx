import { Card, CardContent, CardActionArea, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";
import { capitalize } from "../utils/utils";

export default function PlantCard({ plant, onEdit, onDelete }) {
  return (
    <Card
      sx={{
        position: "relative",
        width: "100%",
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
        },
      }}
    >
      <CardActionArea component={Link} to={`/plants/${plant.name}/types`} aria-label={plant.name}>
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
      </CardActionArea>
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

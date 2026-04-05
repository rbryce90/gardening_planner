import { Box, Typography, Alert, Card, CardContent } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import GridViewIcon from "@mui/icons-material/GridView";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import CreateGardenDialog from "../components/CreateGardenDialog";
import Notification from "../components/Notification";

export default function GardenPicker({
  gardens,
  error,
  setError,
  successMsg,
  setSuccessMsg,
  liveAnnouncement,
  showCreateDialog,
  setShowCreateDialog,
  onSelectGarden,
  onCreateGarden,
}) {
  return (
    <Box sx={{ minHeight: "calc(100vh - 64px)", p: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
        <LocalFloristIcon sx={{ fontSize: 36, color: "success.main" }} />
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          My Gardens
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {gardens.length > 0
          ? "Select a garden to start planning."
          : "Create your first garden to get started."}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
          gap: 3,
        }}
      >
        {gardens.map((g) => (
          <Card
            key={g.id}
            tabIndex={0}
            role="button"
            aria-label={g.name}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectGarden(g.id);
              }
            }}
            sx={{
              height: 160,
              cursor: "pointer",
              background:
                "linear-gradient(135deg, rgba(76,175,80,0.08) 0%, rgba(76,175,80,0.02) 100%)",
              border: "1px solid",
              borderColor: "divider",
              borderLeft: "4px solid",
              borderLeftColor: "success.main",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
              "&:focus": {
                outline: "2px solid",
                outlineColor: "primary.main",
                outlineOffset: 2,
              },
            }}
            onClick={() => onSelectGarden(g.id)}
          >
            <CardContent sx={{ textAlign: "center", pt: 4 }}>
              <GridViewIcon sx={{ fontSize: 32, color: "success.main", mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {g.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {g.rows} x {g.cols} grid
              </Typography>
            </CardContent>
          </Card>
        ))}
        <Card
          tabIndex={0}
          role="button"
          aria-label="New Garden"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setShowCreateDialog(true);
            }
          }}
          sx={{
            height: 160,
            cursor: "pointer",
            border: "2px dashed",
            borderColor: "divider",
            bgcolor: "transparent",
            transition: "border-color 0.2s, transform 0.2s",
            "&:hover": { borderColor: "success.main", transform: "translateY(-4px)" },
            "&:focus": {
              outline: "2px solid",
              outlineColor: "primary.main",
              outlineOffset: 2,
            },
          }}
          onClick={() => setShowCreateDialog(true)}
        >
          <CardContent sx={{ textAlign: "center", pt: 4 }}>
            <AddCircleOutlineIcon sx={{ fontSize: 36, color: "success.main", mb: 1 }} />
            <Typography variant="h6" color="text.secondary">
              New Garden
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <CreateGardenDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={onCreateGarden}
      />

      <Notification message={successMsg} open={!!successMsg} onClose={() => setSuccessMsg("")} />

      <Box
        aria-live="polite"
        aria-atomic="true"
        sx={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
          clipPath: "inset(50%)",
          whiteSpace: "nowrap",
        }}
      >
        {liveAnnouncement}
      </Box>
    </Box>
  );
}

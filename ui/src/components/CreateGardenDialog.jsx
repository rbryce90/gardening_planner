import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

export default function CreateGardenDialog({ open, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(4);

  const handleSubmit = () => {
    onSubmit(name, rows, cols);
  };

  const handleClose = () => {
    setName("");
    setRows(4);
    setCols(4);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>New Garden</DialogTitle>
      <DialogContent>
        <TextField
          label="Name"
          variant="outlined"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mt: 1, mb: 2 }}
        />
        <TextField
          label="Rows"
          type="number"
          variant="outlined"
          fullWidth
          value={rows}
          onChange={(e) => setRows(e.target.value)}
          slotProps={{ htmlInput: { min: 1, max: 20 } }}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Columns"
          type="number"
          variant="outlined"
          fullWidth
          value={cols}
          onChange={(e) => setCols(e.target.value)}
          slotProps={{ htmlInput: { min: 1, max: 20 } }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

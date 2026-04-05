import React from "react";
import { Container, Alert, AlertTitle, Button, Typography } from "@mui/material";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md" sx={{ mt: 8 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>Something went wrong</AlertTitle>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {this.state.error?.message || "Unknown error"}
            </Typography>
            <Typography
              variant="caption"
              component="pre"
              sx={{
                whiteSpace: "pre-wrap",
                maxHeight: 200,
                overflow: "auto",
                display: "block",
                mt: 1,
                p: 1,
                bgcolor: "action.hover",
                borderRadius: 1,
              }}
            >
              {this.state.errorInfo?.componentStack || ""}
            </Typography>
          </Alert>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </Container>
      );
    }
    return this.props.children;
  }
}

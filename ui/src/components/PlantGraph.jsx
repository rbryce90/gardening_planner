import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Paper, Skeleton, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ForceGraph2D from "react-force-graph-2d";
import { getPlantGraph } from "../services/graphService";

const COMPANION_COLOR = "#4caf50";
const ANTAGONIST_COLOR = "#f44336";

export default function PlantGraph({ plantId, compact = false }) {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const graphRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    if (!plantId) return;
    setLoading(true);
    setError(null);
    getPlantGraph(plantId)
      .then((res) => {
        const { nodes, edges } = res.data;
        setGraphData({
          nodes: nodes.map((n, i) => ({
            ...n,
            id: n.id,
            x: Math.cos((2 * Math.PI * i) / nodes.length) * 300,
            y: Math.sin((2 * Math.PI * i) / nodes.length) * 300,
          })),
          links: edges.map((e) => ({
            source: e.source,
            target: e.target,
            type: e.type,
          })),
        });
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load relationship graph");
        setLoading(false);
      });
  }, [plantId]);

  useEffect(() => {
    const updateWidth = () => {
      setDimensions({ width: window.innerWidth, height: compact ? 350 : 700 });
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Configure forces, disable wheel zoom, and re-center after data loads
  useEffect(() => {
    if (graphData && graphRef.current) {
      const fg = graphRef.current;
      fg.d3Force("charge")
        .strength(compact ? -150 : -250)
        .distanceMax(compact ? 300 : 500);
      fg.d3Force("link").distance(compact ? 50 : 80);
      fg.d3ReheatSimulation();

      // Prevent ForceGraph2D from capturing wheel events so page scrolls normally
      const canvas = containerRef.current?.querySelector("canvas");
      if (canvas) {
        const blockZoom = (e) => {
          e.stopImmediatePropagation();
        };
        canvas.addEventListener("wheel", blockZoom, { capture: true });
        return () => canvas.removeEventListener("wheel", blockZoom, { capture: true });
      }

      setTimeout(() => fg.zoomToFit(400, 60), 1200);
    }
  }, [graphData]);

  const handleNodeClick = useCallback(
    (node) => {
      if (node.name) {
        navigate(`/plants/${encodeURIComponent(node.name)}/types`);
      }
    },
    [navigate],
  );

  const nodeCanvasObject = useCallback(
    (node, ctx, globalScale) => {
      if (node.x == null || node.y == null) return;
      const isCenterNode = node.id === plantId;
      const radius = isCenterNode ? 8 : 5;
      const fontSize = Math.max(12 / globalScale, 2);

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = isCenterNode ? theme.palette.primary.main : theme.palette.text.secondary;
      ctx.fill();

      if (isCenterNode) {
        ctx.strokeStyle = theme.palette.primary.light;
        ctx.lineWidth = 2 / globalScale;
        ctx.stroke();
      }

      // Label
      ctx.font = `${isCenterNode ? "bold " : ""}${fontSize}px ${theme.typography.fontFamily}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = theme.palette.text.primary;
      ctx.fillText(node.name, node.x, node.y + radius + 2);
    },
    [plantId, theme],
  );

  const linkCanvasObject = useCallback((link, ctx) => {
    if (link.source.x == null || link.target.x == null) return;
    const isAntagonist = link.type === "antagonist";
    const color = isAntagonist ? ANTAGONIST_COLOR : COMPANION_COLOR;

    ctx.beginPath();
    if (isAntagonist) {
      ctx.setLineDash([4, 4]);
    } else {
      ctx.setLineDash([]);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.moveTo(link.source.x, link.source.y);
    ctx.lineTo(link.target.x, link.target.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }, []);

  if (loading) {
    return (
      <Box sx={{ mt: compact ? 0 : 4 }}>
        {!compact && <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />}
        <Skeleton variant="rectangular" height={compact ? 200 : 400} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  if (error) {
    return null;
  }

  if (!graphData || graphData.nodes.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: compact ? 0 : 4, mx: compact ? 0 : -4 }}>
      {!compact && (
        <Typography variant="h5" gutterBottom sx={{ px: 4 }}>
          Relationship Graph
        </Typography>
      )}
      <Paper
        ref={containerRef}
        sx={{
          p: 0,
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 0,
          width: "100%",
        }}
      >
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="rgba(0,0,0,0)"
          nodeCanvasObject={nodeCanvasObject}
          nodePointerAreaPaint={(node, color, ctx) => {
            if (node.x == null || node.y == null) return;
            const radius = node.id === plantId ? 8 : 5;
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius + 4, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
          }}
          linkCanvasObject={linkCanvasObject}
          enableZoom={false}
          onNodeClick={handleNodeClick}
          cooldownTicks={150}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          dagLevelDistance={80}
          nodeLabel=""
        />
        {/* Legend */}
        <Stack
          direction="row"
          spacing={3}
          sx={{
            position: "absolute",
            bottom: 12,
            left: 16,
            bgcolor: "rgba(0,0,0,0.6)",
            borderRadius: 2,
            px: 2,
            py: 0.75,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 24, height: 2, bgcolor: COMPANION_COLOR, borderRadius: 1 }} />
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Companion
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 24,
                height: 0,
                borderTop: `2px dashed ${ANTAGONIST_COLOR}`,
              }}
            />
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Antagonist
            </Typography>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}

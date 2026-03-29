export type GraphNode = {
    id: number;
    name: string;
    category: string;
    growthForm: string;
}

export type GraphEdge = {
    source: number;
    target: number;
    type: "companion" | "antagonist";
}

export type GraphData = {
    nodes: GraphNode[];
    edges: GraphEdge[];
}

export type PlantRecommendation = {
    id: number;
    name: string;
    category: string;
    growthForm: string;
    companionCount: number;
}

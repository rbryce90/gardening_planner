import neo4j from "neo4j-driver";

const mockSessionRun = jest.fn();
const mockSessionClose = jest.fn().mockResolvedValue(undefined);
const mockSession = { run: mockSessionRun, close: mockSessionClose };
const mockGetDriver = jest.fn(() => ({ session: () => mockSession }));

jest.mock("../databases/neo4jDb.ts", () => ({
  getDriver: () => mockGetDriver(),
}));

jest.mock("../utils/logger.ts", () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}));

import { graphRepository } from "../repositories/graphRepository.ts";

// Helpers to build neo4j-driver-shaped objects
type Props = { id?: number; name?: string; category?: string; growthForm?: string };
const makeNode = (identity: number, props: Props) => ({
  identity: neo4j.int(identity),
  properties: {
    ...props,
    ...(props.id !== undefined ? { id: neo4j.int(props.id) } : {}),
  },
});
const makeRel = (start: number, end: number, type: "COMPANION_OF" | "ANTAGONIST_OF") => ({
  start: neo4j.int(start),
  end: neo4j.int(end),
  type,
});
const makeRecord = (fields: Record<string, unknown>) => ({
  get: (key: string) => fields[key],
});

describe("graphRepository.getPlantGraph", () => {
  beforeEach(() => {
    mockSessionRun.mockReset();
    mockSessionClose.mockClear();
    mockGetDriver.mockClear();
  });

  it("builds nodes and edges from a successful traversal result", async () => {
    const nodes = [
      makeNode(100, { id: 1, name: "Tomato", category: "vegetable", growthForm: "vine" }),
      makeNode(101, { id: 2, name: "Basil", category: "herb", growthForm: "shrub" }),
      makeNode(102, { id: 3, name: "Fennel", category: "herb", growthForm: "shrub" }),
    ];
    const rels = [makeRel(100, 101, "COMPANION_OF"), makeRel(100, 102, "ANTAGONIST_OF")];
    mockSessionRun.mockResolvedValue({ records: [makeRecord({ nodes, rels })] });

    const result = await graphRepository.getPlantGraph(1, 2);

    expect(result.nodes).toEqual([
      { id: 1, name: "Tomato", category: "vegetable", growthForm: "vine" },
      { id: 2, name: "Basil", category: "herb", growthForm: "shrub" },
      { id: 3, name: "Fennel", category: "herb", growthForm: "shrub" },
    ]);
    expect(result.edges).toEqual([
      { source: 1, target: 2, type: "companion" },
      { source: 1, target: 3, type: "antagonist" },
    ]);
  });

  it("clamps the hops parameter to the 1-5 range and floors fractional values", async () => {
    mockSessionRun.mockResolvedValue({ records: [] });

    await graphRepository.getPlantGraph(1, 99);
    expect(mockSessionRun.mock.calls[0][0]).toMatch(/\*1\.\.5/);

    await graphRepository.getPlantGraph(1, -3);
    expect(mockSessionRun.mock.calls[1][0]).toMatch(/\*1\.\.1/);

    await graphRepository.getPlantGraph(1, 3.9);
    expect(mockSessionRun.mock.calls[2][0]).toMatch(/\*1\.\.3/);
  });

  it("passes hops through as a literal in the Cypher template, not a parameter (no injection surface)", async () => {
    mockSessionRun.mockResolvedValue({ records: [] });

    await graphRepository.getPlantGraph(1, 2);
    const [, params] = mockSessionRun.mock.calls[0];
    // Only plantId is parameterized; hops is sanitized then inlined as an integer literal
    expect(Object.keys(params)).toEqual(["plantId"]);
  });

  it("returns empty nodes and edges when the result set is empty", async () => {
    mockSessionRun.mockResolvedValue({ records: [] });

    const result = await graphRepository.getPlantGraph(42, 1);

    expect(result).toEqual({ nodes: [], edges: [] });
  });

  it("skips nodes whose properties.id is missing and drops edges that reference them", async () => {
    const nodes = [
      makeNode(100, { id: 1, name: "Tomato", category: "vegetable", growthForm: "vine" }),
      // No id property -> should be skipped
      makeNode(101, { name: "Phantom", category: "?", growthForm: "?" }),
      makeNode(102, { id: 3, name: "Fennel", category: "herb", growthForm: "shrub" }),
    ];
    const rels = [
      makeRel(100, 101, "COMPANION_OF"), // dropped: target unmapped
      makeRel(100, 102, "ANTAGONIST_OF"),
    ];
    mockSessionRun.mockResolvedValue({ records: [makeRecord({ nodes, rels })] });

    const result = await graphRepository.getPlantGraph(1, 1);

    expect(result.nodes).toHaveLength(2);
    expect(result.nodes.map((n) => n.id)).toEqual([1, 3]);
    expect(result.edges).toEqual([{ source: 1, target: 3, type: "antagonist" }]);
  });

  it("maps COMPANION_OF to 'companion' and ANTAGONIST_OF to 'antagonist'", async () => {
    const nodes = [
      makeNode(100, { id: 1, name: "A", category: "c", growthForm: "g" }),
      makeNode(101, { id: 2, name: "B", category: "c", growthForm: "g" }),
    ];
    const rels = [makeRel(100, 101, "COMPANION_OF"), makeRel(101, 100, "ANTAGONIST_OF")];
    mockSessionRun.mockResolvedValue({ records: [makeRecord({ nodes, rels })] });

    const result = await graphRepository.getPlantGraph(1, 1);

    expect(result.edges).toEqual([
      { source: 1, target: 2, type: "companion" },
      { source: 2, target: 1, type: "antagonist" },
    ]);
  });

  it("closes the driver session in the finally block when the query throws", async () => {
    mockSessionRun.mockRejectedValue(new Error("boom"));

    await expect(graphRepository.getPlantGraph(1, 1)).rejects.toThrow("boom");
    expect(mockSessionClose).toHaveBeenCalledTimes(1);
  });

  it("closes the driver session in the finally block on success", async () => {
    mockSessionRun.mockResolvedValue({ records: [] });

    await graphRepository.getPlantGraph(1, 1);

    expect(mockSessionClose).toHaveBeenCalledTimes(1);
  });
});

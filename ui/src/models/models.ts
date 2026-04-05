export type EdiblePart =
  | "leaves"
  | "stems"
  | "roots"
  | "tubers"
  | "bulbs"
  | "flowers"
  | "fruits"
  | "seeds"
  | "pods"
  | "sap"
  | "peel";

export type GrowthType =
  | "tree"
  | "vine"
  | "bush"
  | "shrub"
  | "herbaceous"
  | "groundcover"
  | "root"
  | "underground";

export type CategoryType = "vegetable" | "fruit" | "herb" | "nut" | "grain";

// Convert union types to arrays
export const ediblePartsArray: EdiblePart[] = [
  "leaves",
  "stems",
  "roots",
  "tubers",
  "bulbs",
  "flowers",
  "fruits",
  "seeds",
  "pods",
  "sap",
  "peel",
];

export const growthTypesArray: GrowthType[] = [
  "tree",
  "vine",
  "bush",
  "shrub",
  "herbaceous",
  "groundcover",
  "root",
  "underground",
];

export const categoryTypesArray: CategoryType[] = ["vegetable", "fruit", "herb", "nut", "grain"];

export const ediblePartsLookup: Record<EdiblePart, string> = {
  leaves: "Edible leaf parts such as lettuce, spinach, basil, and mint.",
  stems: "Edible stems or shoots such as asparagus, celery, and rhubarb.",
  roots: "Edible roots such as carrots, beets, radishes, and turnips.",
  tubers: "Underground storage organs like potatoes and yams.",
  bulbs: "Layered underground structures such as onions, garlic, and leeks.",
  flowers: "Edible flower heads like broccoli, cauliflower, squash blossoms.",
  fruits: "Seed-bearing parts like tomatoes, cucumbers, apples, and pumpkins.",
  seeds: "Individual seeds or grains such as peas, beans, sunflower seeds, quinoa.",
  pods: "Immature seed pods like green beans, okra, and snow peas.",
  sap: "Extracted plant fluids like maple sap or agave nectar.",
  peel: "Outer skins of fruits and vegetables such as apple skins or citrus zest.",
};

export const growthTypeLookup: Record<GrowthType, string> = {
  tree: "A woody perennial plant typically with a single main stem or trunk.",
  vine: "A plant with long, trailing or climbing stems like tomatoes or grapes.",
  bush: "A low-growing woody plant with multiple stems, like blueberries.",
  shrub: "A small to medium-sized perennial woody plant, usually decorative or fruiting.",
  herbaceous: "A non-woody plant that dies back at the end of the growing season.",
  groundcover:
    "Low-growing plants that spread over the ground, like creeping thyme or strawberries.",
  root: "Plants primarily grown for their underground root systems, like carrots or beets.",
  underground:
    "Plants that grow primarily below the soil surface, such as potatoes or sweet potatoes.",
};

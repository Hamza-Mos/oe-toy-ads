import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { categoryConfigs } from "@/lib/ads/config";

const embeddingModel = "text-embedding-3-small";
const DATA_DIR = path.join(process.cwd(), ".data");
const OUT_FILE = path.join(DATA_DIR, "ads-centroids.json");

type CentroidsFile = {
  model: string;
  dimension: number;
  centroids: Record<string, number[]>;
  generatedAt: string;
};

async function main(): Promise<void> {
  const client = new OpenAI({
    apiKey: process.env["OPENAI_API_KEY"],
  });
  const categories = Object.keys(categoryConfigs);
  const phrasesPerCategory = categories.map(
    (k) => categoryConfigs[k as keyof typeof categoryConfigs].seedPhrases
  );
  const allPhrases = phrasesPerCategory.flat();

  console.log(`Embedding ${allPhrases.length} seed phrases…`);
  const res = await client.embeddings.create({
    model: embeddingModel,
    input: allPhrases,
  });
  const vectors = res.data.map((d) => d.embedding as unknown as number[]);
  const dimension = vectors[0].length;

  const centroids: Record<string, number[]> = {};
  let idx = 0;
  for (let c = 0; c < categories.length; c++) {
    const key = categories[c];
    const count = phrasesPerCategory[c].length;
    const categoryVectors = vectors.slice(idx, idx + count);
    idx += count;
    const centroid = new Array(dimension).fill(0);
    for (const vector of categoryVectors) {
      for (let i = 0; i < dimension; i++) centroid[i] += vector[i];
    }
    for (let i = 0; i < dimension; i++) centroid[i] /= categoryVectors.length;
    centroids[key] = centroid;
  }

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const payload: CentroidsFile = {
    model: embeddingModel,
    dimension,
    centroids,
    generatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(OUT_FILE, JSON.stringify(payload), "utf-8");
  console.log(`Wrote ${OUT_FILE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

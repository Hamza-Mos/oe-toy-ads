import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { categoryConfigs, CLASSIFIER_THRESHOLDS, CategoryKey } from "./config";

export interface ClassificationResult {
  category?: CategoryKey;
  sponsor?: string;
  creativeId?: string;
  confidence: number;
  blocked: boolean;
  reason?: string;
}

const embeddingModel = "text-embedding-3-small";

const openaiClient = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

const DATA_DIR = path.join(process.cwd(), ".data");
const CENTROIDS_FILE = path.join(DATA_DIR, "ads-centroids.json");

function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
  let dotProduct = 0;
  let magnitudeSquaredA = 0;
  let magnitudeSquaredB = 0;
  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeSquaredA += vectorA[i] * vectorA[i];
    magnitudeSquaredB += vectorB[i] * vectorB[i];
  }
  return (
    dotProduct / (Math.sqrt(magnitudeSquaredA) * Math.sqrt(magnitudeSquaredB))
  );
}

async function embed(text: string): Promise<number[]> {
  const res = await openaiClient.embeddings.create({
    model: embeddingModel,
    input: text,
  });
  return res.data[0].embedding as number[];
}

function tryLoadPrecomputedCentroid(key: CategoryKey): number[] | undefined {
  try {
    if (!fs.existsSync(CENTROIDS_FILE)) return undefined;
    const file = JSON.parse(fs.readFileSync(CENTROIDS_FILE, "utf-8"));
    if (file?.model !== embeddingModel) return undefined;
    const arr = file?.centroids?.[key as string];
    if (!Array.isArray(arr)) return undefined;
    return arr as number[];
  } catch {
    return undefined;
  }
}

async function getCategoryCentroid(key: CategoryKey): Promise<number[]> {
  // Prefer precomputed centroid if available
  const pre = tryLoadPrecomputedCentroid(key);
  if (pre && pre.length) return pre;

  const cfg = categoryConfigs[key];
  const vectors = await Promise.all(cfg.seedPhrases.map((p) => embed(p)));
  const dim = vectors[0].length;
  const centroid = new Array(dim).fill(0);
  for (const v of vectors) {
    for (let i = 0; i < dim; i++) centroid[i] += v[i];
  }
  for (let i = 0; i < dim; i++) centroid[i] /= vectors.length;
  return centroid;
}

export async function classifyQuestion(
  question: string
): Promise<ClassificationResult> {
  const lowerQ = question.toLowerCase();

  const res = await openaiClient.embeddings.create({
    model: embeddingModel,
    input: lowerQ,
  });
  const qVec = res.data[0].embedding as number[];

  let bestKey: CategoryKey | undefined;
  let bestScore = -1;
  for (const key of Object.keys(categoryConfigs) as CategoryKey[]) {
    const centroid = await getCategoryCentroid(key);
    const score = cosineSimilarity(qVec, centroid);
    if (score > bestScore) {
      bestScore = score;
      bestKey = key;
    }
  }

  if (!bestKey)
    return { confidence: 0, blocked: false, reason: "No category match" };

  if (bestScore >= CLASSIFIER_THRESHOLDS.showAd) {
    const cat = categoryConfigs[bestKey];
    return {
      category: bestKey,
      sponsor: cat.sponsor,
      creativeId: cat.creativeId,
      confidence: bestScore,
      blocked: false,
    };
  }

  return { confidence: bestScore, blocked: false, reason: "Below threshold" };
}

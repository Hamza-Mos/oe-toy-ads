This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Setup

You will need the `OPENAI_API_KEY` environment variable.

## Run

Run the development server:

```bash
OPENAI_API_KEY=KEY npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## Ads MVP (Exclusive Sponsor + Fast Classification)

Timebox: 2 working days to MVP.

### How it works (simplified)

- User asks a question → app calls `/api/ask` and `/api/classify` in parallel.
- Embeddings KNN classifies question into one of: pancreatic cancer, breast cancer, arthritis, vaccines/infectious disease.
- If score ≥ 0.78, show the exclusive sponsor ad during loading.
- If 0.70–0.78, show PSA creative.
- Otherwise, show the default loading spinner (no ad).

### Files

- `lib/ads/config.ts`: categories→sponsor map, creatives, thresholds, blocklist
- `lib/ads/classifier.ts`: embeddings KNN classifier (text-embedding-3-small)
- `app/api/classify/route.ts`: classify endpoint (embeddings only)
- `components/AdSlot.tsx`: ad card component

### Safety

- Blocklist terms suppress ads and return no creative.
- PSA creative exists but is not auto-inserted when confidence is low (demo choice). Adjust as needed.

### Notes

- Blocklist terms suppress ads and return no creative.

### Why embeddings KNN vs LLM classifier

- Latency and cost: embeddings are a single small request (~60–200 ms) and very cheap; LLM classification adds a chat call (~200–600 ms+), higher variance, and token costs.
- Determinism and stability: cosine similarity to fixed centroids is stable across time; LLM outputs can drift with prompt changes/model updates.
- Cacheability and precompute: we precompute category centroids (`npm run precompute-ads`) and cache question embeddings, keeping decisions fast and consistent.
- UX: fast, deterministic decisions avoid ad flicker while the answer streams. LLM classification would compete with the main `/api/ask` call and can delay or swap the ad.
- Hybrid safety: we still invoke a background LLM validation for QA/auditing without affecting delivery. If desired, a tie-breaker LLM can be added only in a narrow score band.

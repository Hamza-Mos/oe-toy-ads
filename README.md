## OpenEvidence Ads Project

This toy app shows sponsor ads while an answer is loading, using a fast embeddings KNN classifier to categorize the user’s question into one of four categories purchased by sponsors. If a strong match is found, we replace the spinner with the corresponding sponsor’s ad; otherwise the spinner remains.

### Why I used KNN (embeddings) instead of an LLM classifier

- Latency and cost: one small embeddings call per question (text-embedding-3-small) vs an additional chat call. Quicker and cheaper under load.
- Determinism: similarity against fixed centroids is stable; LLM outputs can drift with prompt changes/model updates.
- Simplicity at runtime: no prompt engineering, no JSON parsing, no flicker from classification variability.
- Precomputation: category seed phrases are embedded once; centroids are precomputed and loaded at runtime.

Timeline note: Although an LLM classifier is faster to prototype, I chose KNN to optimize quality, accuracy, and latency. The extra time went into curating seed phrases and rigorously tuning the similarity threshold so that ads only appear on high-confidence matches.

---

## How it works

1. User submits a question in `app/page.tsx`.
2. The UI calls `/api/classify` (embeddings-only) and `/api/ask` (answer) so that we can render the ad during loading when there’s a confident match.
3. If classification confidence ≥ `showAd` threshold, the sponsor’s ad renders during the loading state. Otherwise, the default spinner remains.

Behavior with PSA: PSA has been removed; it’s either sponsor ad or spinner.

---

## Code structure

- `lib/ads/config.ts`
  - Category keys, exclusive sponsor mapping, creatives (logo/headline/body/links)
  - Thresholds: `CLASSIFIER_THRESHOLDS.showAd` controls whether an ad is shown
  - Seed phrases for centroid building
- `lib/ads/classifier.ts`
  - Embeds the question with OpenAI embeddings
  - Computes cosine similarity against centroids (precomputed file or on-the-fly from seeds)
  - Returns `{ category, sponsor, creativeId, confidence }`
- `app/api/classify/route.ts`
  - Thin API wrapper around the classifier; attaches the `creative` for the client
- `components/AdSlot.tsx`
  - Simple ad card (logo, headline, body, CTA, ISI link) with an “Ad” label
- `app/page.tsx`
  - Client page: collects the question, shows conversation, and swaps spinner→ad during loading on confident matches
- `scripts/precompute-ads.ts`
  - Pre-embeds seed phrases, produces `.data/ads-centroids.json` with `{ model, dimension, centroids, generatedAt }`

---

## Setup

1. Set the env var `OPENAI_API_KEY`.
2. Precompute centroids (mean embedding of a category’s seed phrases):
   - `npm run precompute-ads`
3. Start the app: `npm run dev`

If `.data/ads-centroids.json` is missing or uses a different model, the server will derive centroids from seed phrases at runtime.

---

## Tuning and extending

- Thresholds: edit `CLASSIFIER_THRESHOLDS.showAd` in `lib/ads/config.ts`.
  - Higher threshold → fewer but cleaner matches.
  - Lower threshold → more matches, higher risk of borderline ads.
- Seeds: Add or refine the seed phrases per category in `lib/ads/config.ts`, then rerun `npm run precompute-ads`.
- Adding a category: add a key with seeds and a creative; re-precompute.

Performance note: With precomputed centroids, classification is a single embeddings call + a few dot products. Typical added latency is ~100–200 ms.

---

## Example queries

### Genentech (Pancreatic cancer)

- What’s first‑line therapy for metastatic pancreatic adenocarcinoma—FOLFIRINOX vs gem/nab‑paclitaxel?
- When should I use PARP inhibitors for germline BRCA‑mutated pancreatic cancer?
- Neoadjuvant approach for borderline resectable pancreatic adenocarcinoma?
- Best second‑line option after FOLFIRINOX progression (e.g., nal‑IRI + 5‑FU/LV)?
- How do you manage locally advanced unresectable pancreatic cancer?

### Pfizer (Breast cancer)

- HR+/HER2− metastatic breast cancer: which CDK4/6 inhibitor with an aromatase inhibitor first line?
- When is alpelisib appropriate for PIK3CA‑mutated HR+/HER2− disease?
- Duration of adjuvant trastuzumab in early HER2+ breast cancer?
- Is trastuzumab deruxtecan effective in HER2‑low metastatic breast cancer?
- Neoadjuvant chemotherapy choice for triple‑negative breast cancer?

### Eli Lilly (Arthritis)

- Next step after methotrexate inadequate response in rheumatoid arthritis?
- How do you monitor and mitigate JAK inhibitor risks (VTE, lipids, infections) in RA?
- After TNF inhibitor failure in RA, should I switch class or cycle TNF?
- Psoriatic arthritis: when to use IL‑17 vs TNF inhibitors?
- First‑line biologic options for axial spondyloarthritis?

### GSK (Vaccines & Infectious disease)

- Who should receive the RSV vaccine among adults ≥60 years?
- Adult pneumococcal vaccine: PCV20 vs PCV15/PPSV23—how to choose?
- Shingrix schedule and coadministration with influenza vaccine?
- COVID‑19 booster timing for adults this season?
- When to give a Tdap booster and how to handle tetanus‑prone wounds?

### No‑ad (should not match any sponsor)

- How do you titrate basal insulin in type 2 diabetes?
- Acute migraine: triptan vs gepant selection?
- Initiating triple therapy in COPD—when and how?
- Anticoagulation choice for nonvalvular atrial fibrillation with CKD?
- Managing anemia of chronic kidney disease in stage 4 CKD?

---

## Decisions and timeline

- Decision: embeddings KNN over LLM classifier to keep runtime fast, predictable, and inexpensive while avoiding prompt drift.
- Effort: architecting and validating KNN took longer than a quick LLM classifier because we:
  - Curated and iterated seed phrase sets per category
  - Precomputed and verified centroids
  - Empirically tuned the similarity threshold to balance precision/recall and latency
  - Manually tested many real‑world physician queries to minimize false‑positive ads

Result: consistent, low‑latency ad targeting with a clear and adjustable quality/recall knob (`showAd`).

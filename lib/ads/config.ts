export type CategoryKey =
  | "pancreatic_cancer"
  | "breast_cancer"
  | "arthritis"
  | "vaccines_infectious_disease";

export type Sponsor = "Pfizer" | "Genentech" | "GSK" | "Eli Lilly";

export interface Creative {
  creativeId: string;
  sponsor: Sponsor;
  logoUrl: string; // public path under /public
  headline: string;
  body: string;
  ctaUrl: string;
  isiUrl: string;
  disclaimer?: string;
}

export interface CategoryConfig {
  key: CategoryKey;
  name: string;
  sponsor: Sponsor;
  creativeId: string;
  seedPhrases: string[];
}

export const CLASSIFIER_THRESHOLDS = {
  showAd: 0.6,
};

export const categoryConfigs: Record<CategoryKey, CategoryConfig> = {
  pancreatic_cancer: {
    key: "pancreatic_cancer",
    name: "Pancreatic cancer",
    sponsor: "Genentech",
    creativeId: "genentech-pancreatic",
    seedPhrases: [
      "pancreatic cancer treatment",
      "pancreatic adenocarcinoma therapy",
      "metastatic pancreatic cancer",
      "pancreas tumor chemotherapy",
      "FOLFIRINOX for pancreatic cancer",
      "gemcitabine nab-paclitaxel pancreatic",
      "neoadjuvant therapy pancreas carcinoma",
      "BRCA pancreatic cancer PARP inhibitor",
      "locally advanced pancreatic adenocarcinoma",
      "palliative care pancreatic malignancy",
    ],
  },
  breast_cancer: {
    key: "breast_cancer",
    name: "Breast cancer",
    sponsor: "Pfizer",
    creativeId: "pfizer-breast",
    seedPhrases: [
      "HER2 positive breast cancer",
      "ER+ PR+ breast carcinoma",
      "metastatic breast cancer therapy",
      "adjuvant therapy for breast cancer",
      "CDK4/6 inhibitor HR+ HER2-",
      "triple negative breast cancer treatment",
      "neoadjuvant therapy breast carcinoma",
      "aromatase inhibitor postmenopausal",
      "anti-HER2 therapy trastuzumab pertuzumab",
      "locoregional recurrence breast cancer",
    ],
  },
  arthritis: {
    key: "arthritis",
    name: "Arthritis",
    sponsor: "Eli Lilly",
    creativeId: "lilly-arthritis",
    seedPhrases: [
      "rheumatoid arthritis treatment",
      "psoriatic arthritis medication",
      "joint pain inflammation biologic",
      "DMARD therapy",
      "TNF inhibitor rheumatoid arthritis",
      "JAK inhibitor RA",
      "methotrexate inadequate response",
      "morning stiffness synovitis",
      "ankylosing spondylitis axial spondyloarthritis",
      "treat-to-target rheumatoid DAS28",
    ],
  },
  vaccines_infectious_disease: {
    key: "vaccines_infectious_disease",
    name: "Vaccines & Infectious Disease",
    sponsor: "GSK",
    creativeId: "gsk-vaccines",
    seedPhrases: [
      "shingles vaccine",
      "RSV vaccination",
      "influenza immunization",
      "infectious disease prevention vaccine",
      "adult immunization schedule",
      "pneumococcal vaccine PCV20",
      "COVID-19 booster mRNA",
      "Tdap adult booster",
      "hepatitis B vaccination",
      "travel vaccines yellow fever typhoid",
    ],
  },
};

export const creatives: Record<string, Creative> = {
  "genentech-pancreatic": {
    creativeId: "genentech-pancreatic",
    sponsor: "Genentech",
    logoUrl: "/ads/genentech.svg",
    headline: "Targeted options for pancreatic cancer",
    body: "Learn about therapy options for appropriate patients with pancreatic cancer.",
    ctaUrl: "https://www.gene.com",
    isiUrl: "https://www.gene.com/isi",
    disclaimer: "For US HCPs only. See Important Safety Information.",
  },
  "pfizer-breast": {
    creativeId: "pfizer-breast",
    sponsor: "Pfizer",
    logoUrl: "/ads/pfizer.svg",
    headline: "Advancing care in breast cancer",
    body: "Explore data and resources for HR+ / HER2- mBC.",
    ctaUrl: "https://www.pfizer.com",
    isiUrl: "https://www.pfizer.com/isi",
    disclaimer: "For US HCPs only. Please see full Prescribing Information.",
  },
  "lilly-arthritis": {
    creativeId: "lilly-arthritis",
    sponsor: "Eli Lilly",
    logoUrl: "/ads/lilly.svg",
    headline: "Relief for RA patients",
    body: "Learn about treatment options for moderate to severe RA.",
    ctaUrl: "https://www.lilly.com",
    isiUrl: "https://www.lilly.com/isi",
  },
  "gsk-vaccines": {
    creativeId: "gsk-vaccines",
    sponsor: "GSK",
    logoUrl: "/ads/gsk.svg",
    headline: "Vaccines that matter",
    body: "Information for HCPs on adult vaccines including RSV and shingles.",
    ctaUrl: "https://www.gsk.com",
    isiUrl: "https://www.gsk.com/isi",
  },
};

export function getCategoryByName(name: string): CategoryKey | undefined {
  const lower = name.toLowerCase();
  const entry = Object.values(categoryConfigs).find(
    (c) => c.name.toLowerCase() === lower
  );
  return entry?.key;
}

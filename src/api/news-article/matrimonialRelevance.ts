/**
 * Matrimonial / Indian family-law relevance for news articles.
 *
 * Matrimony Justice is an educational site about Indian matrimonial law.
 * Off-topic news (cars, stocks, real estate, US politics, etc.) dilutes SEO,
 * so create/update gates use this list. Keep it in sync conceptually with the
 * frontend allowlist when that list changes.
 */

/** Preferred robots value for off-topic articles that already exist. */
export const OFF_TOPIC_META_ROBOTS = 'noindex, follow';

/**
 * Phrases that mark an article as on-topic. Matching is case-insensitive
 * substring search on a normalized haystack (lowercased, collapsed spaces).
 */
export const MATRIMONIAL_KEYWORDS: string[] = [
  // Core matrimonial
  'marriage',
  'married',
  'matrimonial',
  'matrimony',
  'divorce',
  'divorced',
  'judicial separation',
  'restitution of conjugal',
  'conjugal rights',
  'hindu marriage act',
  'special marriage act',
  'nri marriage',
  'bigamy',
  'desertion',
  'stridhan',
  'nikah',
  'talaq',
  'khula',
  'muslim personal law',

  // Family courts / family law
  'family law',
  'family court',
  'family courts',
  'indian family',

  // Dowry / cruelty statutes
  'dowry',
  '498a',
  '498-a',
  '498 a',
  'section 498',
  'ipc 498',
  'bns 85',
  'bns 86',
  'section 85 bns',
  'section 86 bns',

  // Maintenance / alimony
  'maintenance',
  'alimony',
  'interim maintenance',
  'section 125',
  '125 crpc',
  'crpc 125',
  'section 144 bnss',
  '144 bnss',
  'bnss 144',

  // Custody / children / guardianship
  'custody',
  'child custody',
  'guardianship',
  'guardian and wards',
  'visitation',

  // Domestic violence
  'domestic violence',
  'domestic abuse',
  'pwdva',
  'protection of women from domestic',
  'dv act',

  // Closely related matrimonial procedure
  'cruelty in marriage',
  'matrimonial dispute',
  'matrimonial case',
  'marriage case',
  'divorce petition',
  'divorce case',
  'wife petition',
  'husband petition',
];

export type RelevanceArticleInput = {
  title?: unknown;
  excerpt?: unknown;
  body?: unknown;
  content?: unknown;
  seo?: {
    metaTitle?: unknown;
    metaDescription?: unknown;
    keywords?: unknown;
    metaRobots?: unknown;
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
};

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

/** Collect readable strings from nested Strapi fields (blocks, DZ, SEO). */
function collectStrings(value: unknown, out: string[]): void {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed) out.push(trimmed);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, out);
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (
        key === '__component' ||
        key === 'id' ||
        key === 'documentId' ||
        key === 'createdAt' ||
        key === 'updatedAt' ||
        key === 'publishedAt' ||
        key === 'locale'
      ) {
        continue;
      }
      collectStrings(child, out);
    }
  }
}

/**
 * Build the text bag used for relevance checks: title, excerpt, SEO copy,
 * and any nested body/content strings present on the write.
 */
export function articleRelevanceText(data: RelevanceArticleInput | null | undefined): string {
  if (!data || typeof data !== 'object') return '';
  const parts: string[] = [];
  collectStrings(data.title, parts);
  collectStrings(data.excerpt, parts);
  collectStrings(data.body, parts);
  collectStrings(data.content, parts);
  if (data.seo && typeof data.seo === 'object') {
    collectStrings(data.seo.metaTitle, parts);
    collectStrings(data.seo.metaDescription, parts);
    collectStrings(data.seo.keywords, parts);
  }
  return normalize(parts.join(' '));
}

/** True when the payload has enough text fields to judge on-topic vs off-topic. */
export function hasRelevanceSignals(data: RelevanceArticleInput | null | undefined): boolean {
  if (!data || typeof data !== 'object') return false;
  if (typeof data.title === 'string' && data.title.trim()) return true;
  if (typeof data.excerpt === 'string' && data.excerpt.trim()) return true;
  if (data.body != null) return true;
  if (Array.isArray(data.content) && data.content.length > 0) return true;
  const seo = data.seo;
  if (seo && typeof seo === 'object') {
    if (typeof seo.metaTitle === 'string' && seo.metaTitle.trim()) return true;
    if (typeof seo.metaDescription === 'string' && seo.metaDescription.trim()) return true;
    if (typeof seo.keywords === 'string' && seo.keywords.trim()) return true;
  }
  return false;
}

/** True when normalized text matches at least one matrimonial keyword. */
export function isMatrimonialRelevant(text: string): boolean {
  const haystack = normalize(text);
  if (!haystack) return false;
  return MATRIMONIAL_KEYWORDS.some((keyword) => haystack.includes(normalize(keyword)));
}

export function isArticleMatrimonialRelevant(
  data: RelevanceArticleInput | null | undefined,
): boolean {
  return isMatrimonialRelevant(articleRelevanceText(data));
}

/** Normalize robots for comparison (`NoIndex,Follow` → `noindex, follow`). */
export function normalizeMetaRobots(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value
    .toLowerCase()
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Ensure seo.metaRobots is `noindex, follow` on this write.
 * Creates a shallow seo object when the write omitted one.
 */
export function ensureOffTopicNoIndex(data: RelevanceArticleInput): void {
  if (!data.seo || typeof data.seo !== 'object') {
    data.seo = {};
  }
  if (normalizeMetaRobots(data.seo.metaRobots) !== OFF_TOPIC_META_ROBOTS) {
    data.seo.metaRobots = OFF_TOPIC_META_ROBOTS;
  }
}

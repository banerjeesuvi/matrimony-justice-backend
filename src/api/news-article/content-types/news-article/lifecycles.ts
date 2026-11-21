/**
 * news-article lifecycles — server-side derived fields and topic gate.
 *
 * 1. `body` mirror: the SEO plugin's analyzer cannot read article text stored
 *    inside the `content` dynamic zone, so `body` (top-level blocks field)
 *    mirrors the dynamic zone's rich-text component for word-count and
 *    keyword-density analysis. The frontend keeps rendering `content`;
 *    `body` is never rendered.
 *
 * 2. `seo.openGraph.ogImage` mirror: Strapi's content REST API silently drops
 *    media values nested two components deep (`seo.openGraph.ogImage`), so
 *    the server copies the cover/metaImage id here on write. The automation
 *    therefore only needs to set `cover` (and `seo.metaImage`).
 *
 * 3. Matrimonial relevance: new off-topic articles are rejected so ingestion
 *    skips them. Updates of off-topic copy get `seo.metaRobots = noindex,
 *    follow` instead of deletion. Document Service middleware in `src/index.ts`
 *    applies the same rules (lifecycles alone are not reliable in Strapi 5).
 */

import { errors } from '@strapi/utils';
import {
  ensureOffTopicNoIndex,
  hasRelevanceSignals,
  isArticleMatrimonialRelevant,
} from '../../matrimonialRelevance';

type SeoInput = {
  metaImage?: number | string | null;
  openGraph?: Record<string, unknown> | null;
  metaRobots?: string | null;
  [key: string]: unknown;
};

type ArticleInput = {
  content?: unknown;
  cover?: number | string | null;
  seo?: SeoInput | null;
  body?: unknown;
  title?: unknown;
  excerpt?: unknown;
  [key: string]: unknown;
};

function syncBody(data: ArticleInput) {
  const dz = data.content;
  if (!Array.isArray(dz)) return;
  const richText = dz.find(
    (c): c is { __component: string; body: unknown } =>
      typeof c === 'object' &&
      c !== null &&
      (c as { __component?: unknown }).__component === 'news.rich-text' &&
      Array.isArray((c as { body?: unknown }).body),
  );
  if (richText) {
    data.body = richText.body;
  }
}

function syncOgImage(data: ArticleInput) {
  const seo = data.seo;
  if (!seo || typeof seo !== 'object') return;
  // Only mirror when the image is explicitly part of this write, so partial
  // SEO updates never clobber the rest of the component.
  const img = seo.metaImage ?? data.cover ?? null;
  const imgExplicit = seo.metaImage != null || data.cover != null;
  if (!imgExplicit || img == null) return;
  const og =
    seo.openGraph && typeof seo.openGraph === 'object' ? seo.openGraph : {};
  og.ogImage = img;
  seo.openGraph = og;
}

function syncDerived(data: ArticleInput | undefined) {
  if (!data || typeof data !== 'object') return;
  if ('content' in data) syncBody(data);
  if ('seo' in data || 'cover' in data) syncOgImage(data);
}

/**
 * Create: reject off-topic so external ingestion can skip the item.
 * Update: when the write includes enough text to judge and already sends
 * `seo`, force noindex on off-topic articles (do not delete existing rows).
 * Document middleware handles publish / partial updates via a direct SEO patch.
 */
function applyMatrimonialGate(
  data: ArticleInput | undefined,
  mode: 'create' | 'update',
) {
  if (!data || typeof data !== 'object') return;
  if (mode === 'update' && !hasRelevanceSignals(data)) return;
  if (isArticleMatrimonialRelevant(data)) return;

  if (mode === 'create') {
    throw new errors.ApplicationError(
      'Off-topic news article rejected: Matrimony Justice only accepts Indian matrimonial and family-law topics (marriage, divorce, dowry, 498A/BNS 85-86, maintenance, custody, domestic violence, family courts, and similar).',
    );
  }

  if (data.seo && typeof data.seo === 'object') {
    ensureOffTopicNoIndex(data);
  }
}

export default {
  async beforeCreate(event: { params: { data?: ArticleInput } }) {
    syncDerived(event.params?.data);
    applyMatrimonialGate(event.params?.data, 'create');
  },
  async beforeUpdate(event: { params: { data?: ArticleInput } }) {
    syncDerived(event.params?.data);
    applyMatrimonialGate(event.params?.data, 'update');
  },
};

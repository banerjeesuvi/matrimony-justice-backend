/**
 * news-article lifecycles — server-side derived fields.
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
 */

type SeoInput = {
  metaImage?: number | string | null;
  openGraph?: Record<string, unknown> | null;
  [key: string]: unknown;
};

type ArticleInput = {
  content?: unknown;
  cover?: number | string | null;
  seo?: SeoInput | null;
  body?: unknown;
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

export default {
  async beforeCreate(event: { params: { data?: ArticleInput } }) {
    syncDerived(event.params?.data);
  },
  async beforeUpdate(event: { params: { data?: ArticleInput } }) {
    syncDerived(event.params?.data);
  },
};

/**
 * Create in-app notifications when a case is filed or its review/outcome changes.
 * When judgmentPassed is saved, rewrite the SEO title, description, and keywords
 * for the wife (the default) or the husband.
 */

const SITE_ORIGIN = 'https://www.matrimonyjustice.com';

type SeoImage = { id?: number } | number | null;

type CaseSeo = {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  metaRobots?: string;
  metaViewport?: string;
  canonicalURL?: string;
  structuredData?: Record<string, unknown> | null;
  metaImage?: SeoImage;
  openGraph?: {
    ogTitle?: string;
    ogDescription?: string;
    ogUrl?: string;
    ogType?: string;
    ogImage?: SeoImage;
  } | null;
};

type CaseRow = {
  documentId?: string;
  petitioner?: string | null;
  respondent?: string | null;
  judgmentPassed?: string | null;
  district?: string | null;
  state?: string | null;
  courtComplex?: string | null;
  seo?: CaseSeo | null;
};

function caseQuery() {
  return (
    globalThis as unknown as {
      strapi?: {
        db: {
          query: (uid: string) => {
            findOne: (args: {
              where: Record<string, unknown>;
              populate?: unknown;
            }) => Promise<CaseRow | null>;
          };
        };
      };
    }
  ).strapi?.db.query('api::case.case');
}

function clean(value: unknown) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

function partyOf(value: unknown): 'husband' | 'wife' {
  return clean(value).toLowerCase() === 'husband' ? 'husband' : 'wife';
}

function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 80);
}

function relationId(value: unknown): number | undefined {
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id;
    if (typeof id === 'number') return id;
  }
  return undefined;
}

const JUDGMENT_KEYWORD_PHRASES = [
  'marriage status',
  'matrimonial case',
  'matrimonial dispute',
  'marriage case',
  'court case',
  'case details',
  'case status',
  'court judgment',
  'court order',
  'legal details',
  'legal proceedings',
  'family court case',
  'divorce case',
];

function judgmentKeywords(name: string, district?: string | null, state?: string | null) {
  const places = [district, state].map((part) => clean(part)).filter(Boolean);
  return [
    name,
    ...JUDGMENT_KEYWORD_PHRASES.map((phrase) => `${name} ${phrase}`),
    ...places.map((place) => `${name} ${place}`),
  ].join(', ');
}

function judgmentCopy(entry: {
  petitioner?: string | null;
  respondent?: string | null;
  judgmentPassed?: unknown;
  district?: string | null;
  state?: string | null;
  courtComplex?: string | null;
}) {
  const husband = partyOf(entry.judgmentPassed) === 'husband';
  const name = clean(husband ? entry.respondent : entry.petitioner) || (husband ? 'Husband' : 'Wife');
  const location =
    [entry.district, entry.state].map((part) => clean(part)).filter(Boolean).join(', ') ||
    clean(entry.courtComplex) ||
    'India';
  return {
    metaTitle: `${name} Marriage Status & Matrimonial Case Details`,
    metaDescription: `Explore verified public information about ${name}, including relevant matrimonial case details, court records, legal proceedings, and case information from ${location}.`,
    keywords: judgmentKeywords(name, entry.district, entry.state),
    slugName: slugify(name) || (husband ? 'husband' : 'wife'),
  };
}

async function loadCase(where: Record<string, unknown> | undefined, data: Record<string, unknown>) {
  const query = caseQuery();
  if (!query) return null;
  const documentId = clean(where?.documentId) || clean(data.documentId);
  const id = where?.id;
  const populate = {
    seo: { populate: { metaImage: true, openGraph: { populate: { ogImage: true } } } },
  };
  if (documentId) return query.findOne({ where: { documentId }, populate });
  if (id != null) return query.findOne({ where: { id }, populate });
  return null;
}

async function applyJudgmentSeo(data: Record<string, unknown> | undefined, where?: Record<string, unknown>) {
  if (!data || !('judgmentPassed' in data)) return;
  const existing = await loadCase(where, data);
  const copy = judgmentCopy({
    petitioner: clean(data.petitioner) || existing?.petitioner,
    respondent: clean(data.respondent) || existing?.respondent,
    judgmentPassed: data.judgmentPassed,
    district: clean(data.district) || existing?.district,
    state: clean(data.state) || existing?.state,
    courtComplex: clean(data.courtComplex) || existing?.courtComplex,
  });
  const documentId = existing?.documentId || clean(data.documentId);
  const slug = documentId ? `${copy.slugName}-${documentId}` : '';
  const url = slug ? `${SITE_ORIGIN}/judgments/${slug}` : '';
  const incoming = data.seo && typeof data.seo === 'object' ? (data.seo as CaseSeo) : {};
  const stored = existing?.seo || {};
  const incomingGraph = incoming.openGraph || {};
  const storedGraph = stored.openGraph || {};
  const structured: Record<string, unknown> =
    incoming.structuredData && typeof incoming.structuredData === 'object'
      ? { ...incoming.structuredData }
      : stored.structuredData && typeof stored.structuredData === 'object'
        ? { ...stored.structuredData }
        : {};
  structured.headline = copy.metaTitle;
  structured.description = copy.metaDescription;
  if (url) {
    structured.url = url;
    structured.mainEntityOfPage = url;
  }
  const metaImage = relationId(incoming.metaImage) ?? relationId(stored.metaImage);
  const ogImage = relationId(incomingGraph.ogImage) ?? relationId(storedGraph.ogImage);
  data.seo = {
    metaTitle: copy.metaTitle,
    metaDescription: copy.metaDescription,
    keywords: copy.keywords,
    metaRobots: incoming.metaRobots || stored.metaRobots,
    metaViewport: incoming.metaViewport || stored.metaViewport,
    canonicalURL: url || incoming.canonicalURL || stored.canonicalURL,
    structuredData: structured,
    ...(metaImage ? { metaImage } : {}),
    openGraph: {
      ogTitle: copy.metaTitle,
      ogDescription: copy.metaDescription,
      ogType: incomingGraph.ogType || storedGraph.ogType || 'article',
      ogUrl: url || incomingGraph.ogUrl || storedGraph.ogUrl,
      ...(ogImage ? { ogImage } : {}),
    },
  };
  if (slug) data.slug = slug;
}

function caseHref(documentId?: string) {
  return documentId ? `/my-case/${documentId}` : '/my-cases';
}

function caseLabel(result: { caseNumber?: string }) {
  return String(result.caseNumber || '').trim() || 'your case';
}

function notificationService() {
  return (
    globalThis as unknown as {
      strapi?: {
        service: (uid: string) => {
          notify: (input: Record<string, unknown>) => Promise<unknown>;
        };
      };
    }
  ).strapi?.service('api::notification.notification');
}

export default {
  async beforeCreate(event: { params?: { data?: Record<string, unknown> } }) {
    await applyJudgmentSeo(event.params?.data);
  },

  async beforeUpdate(event: {
    params?: { data?: Record<string, unknown>; where?: Record<string, unknown> };
  }) {
    await applyJudgmentSeo(event.params?.data, event.params?.where);
  },

  async afterCreate(event: {
    result?: {
      user?: string;
      caseNumber?: string;
      documentId?: string;
    };
  }) {
    const result = event.result;
    const user = String(result?.user || '').trim();
    if (!user) return;

    const label = caseLabel(result || {});
    await notificationService()?.notify({
      user,
      title: 'Case registered',
      body: `Case ${label} has been filed.`,
      type: 'case',
      href: caseHref(result?.documentId),
      caseDocumentId: result?.documentId,
    });
  },

  async afterUpdate(event: {
    params?: { data?: Record<string, unknown> };
    result?: {
      user?: string;
      caseNumber?: string;
      documentId?: string;
    };
  }) {
    const result = event.result;
    const user = String(result?.user || '').trim();
    const data = event.params?.data || {};
    if (!user) return;

    const label = caseLabel(result || {});
    const href = caseHref(result?.documentId);
    const service = notificationService();
    if (!service) return;

    if (data.outcome != null && String(data.outcome).trim()) {
      await service.notify({
        user,
        title: 'Final judgement',
        body: `Final judgement is available for case ${label}.`,
        type: 'judgment',
        href,
        caseDocumentId: result?.documentId,
      });
      return;
    }

    if (data.reviewStatus != null && String(data.reviewStatus).trim()) {
      await service.notify({
        user,
        title: 'Review update',
        body: `Review status for case ${label} is now ${String(data.reviewStatus).trim()}.`,
        type: 'review',
        href,
        caseDocumentId: result?.documentId,
      });
    }
  },
};

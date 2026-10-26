/**
 * Document Service middleware helper. Content-type lifecycles do not run
 * reliably for Strapi 5 document writes, so case SEO is updated here when
 * judgmentPassed is wife or husband.
 */

const SITE_ORIGIN = "https://www.matrimonyjustice.com";

const KEYWORD_PHRASES = [
  "marriage status",
  "matrimonial case",
  "matrimonial dispute",
  "marriage case",
  "court case",
  "case details",
  "case status",
  "court judgment",
  "court order",
  "legal details",
  "legal proceedings",
  "family court case",
  "divorce case",
];

type SeoImage = { id?: number } | number | null;

type CaseSeo = {
  id?: number;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  metaRobots?: string;
  metaViewport?: string;
  canonicalURL?: string;
  structuredData?: Record<string, unknown> | null;
  metaImage?: SeoImage;
  openGraph?: {
    id?: number;
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

function clean(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function relationId(value: unknown): number | undefined {
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    if (typeof id === "number") return id;
  }
  return undefined;
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 80);
}

function partyOf(value: unknown) {
  return clean(value).toLowerCase() === "husband" ? "husband" : "wife";
}

export function judgmentSeoCopy(entry: {
  petitioner?: string | null;
  respondent?: string | null;
  judgmentPassed?: unknown;
  district?: string | null;
  state?: string | null;
  courtComplex?: string | null;
  documentId?: string | null;
}) {
  const husband = partyOf(entry.judgmentPassed) === "husband";
  const name = clean(husband ? entry.respondent : entry.petitioner) || (husband ? "Husband" : "Wife");
  const district = clean(entry.district);
  const state = clean(entry.state);
  const location = [district, state].filter(Boolean).join(", ") || clean(entry.courtComplex) || "India";
  const places = [district, state].filter(Boolean);
  const keywords = [
    name,
    ...KEYWORD_PHRASES.map((phrase) => `${name} ${phrase}`),
    ...places.map((place) => `${name} ${place}`),
  ].join(", ");
  const slugName = slugify(name) || (husband ? "husband" : "wife");
  const slug = entry.documentId ? `${slugName}-${entry.documentId}` : "";
  return {
    metaTitle: `${name} Marriage Status & Matrimonial Case Details`,
    metaDescription: `Explore verified public information about ${name}, including relevant matrimonial case details, court records, legal proceedings, and case information from ${location}.`,
    keywords,
    slug,
    url: slug ? `${SITE_ORIGIN}/judgments/${slug}` : "",
  };
}

async function loadCase(
  strapi,
  documentId: string,
  status?: string,
  fallback = true,
): Promise<CaseRow | null> {
  const statuses = status
    ? fallback
      ? [status, status === "published" ? "draft" : "published"]
      : [status]
    : ["draft", "published"];
  for (const nextStatus of statuses) {
    try {
      const entry = await strapi.documents("api::case.case").findOne({
        documentId,
        status: nextStatus,
        populate: { seo: { populate: { metaImage: true, openGraph: { populate: { ogImage: true } } } } },
      });
      if (entry) return entry as CaseRow;
    } catch {
      /* This status may not exist yet. */
    }
  }
  return null;
}

function selectedParty(value: unknown) {
  const party = clean(value).toLowerCase();
  return party === "husband" || party === "wife" ? party : "";
}

/** Merge the party SEO into the document write before Strapi saves it. */
export async function prepareCaseJudgmentSeo(strapi, params) {
  const data = params?.data;
  if (!data || typeof data !== "object") return;
  if (!Object.prototype.hasOwnProperty.call(data, "judgmentPassed")) return;
  if (!selectedParty(data.judgmentPassed)) return;

  const documentId = clean(params.documentId);
  const existing = documentId ? await loadCase(strapi, documentId, params.status) : null;
  const copy = judgmentSeoCopy({
    petitioner: clean(data.petitioner) || existing?.petitioner,
    respondent: clean(data.respondent) || existing?.respondent,
    judgmentPassed: data.judgmentPassed,
    district: clean(data.district) || existing?.district,
    state: clean(data.state) || existing?.state,
    courtComplex: clean(data.courtComplex) || existing?.courtComplex,
    documentId: documentId || existing?.documentId,
  });

  const incoming: CaseSeo = data.seo && typeof data.seo === "object" ? data.seo : {};
  const stored = existing?.seo || {};
  const incomingGraph = incoming.openGraph || {};
  const storedGraph = stored.openGraph || {};
  const structured: Record<string, unknown> =
    incoming.structuredData && typeof incoming.structuredData === "object"
      ? { ...incoming.structuredData }
      : stored.structuredData && typeof stored.structuredData === "object"
        ? { ...stored.structuredData }
        : {};
  structured.headline = copy.metaTitle;
  structured.description = copy.metaDescription;
  if (copy.url) {
    structured.url = copy.url;
    structured.mainEntityOfPage = copy.url;
  }
  const metaImage = relationId(incoming.metaImage) ?? relationId(stored.metaImage);
  const ogImage = relationId(incomingGraph.ogImage) ?? relationId(storedGraph.ogImage);

  data.seo = {
    metaTitle: copy.metaTitle,
    metaDescription: copy.metaDescription,
    keywords: copy.keywords,
    metaRobots: incoming.metaRobots || stored.metaRobots,
    metaViewport: incoming.metaViewport || stored.metaViewport,
    canonicalURL: copy.url || incoming.canonicalURL || stored.canonicalURL,
    structuredData: structured,
    ...(metaImage ? { metaImage } : {}),
    openGraph: {
      ogTitle: copy.metaTitle,
      ogDescription: copy.metaDescription,
      ogType: incomingGraph.ogType || storedGraph.ogType || "article",
      ogUrl: copy.url || incomingGraph.ogUrl || storedGraph.ogUrl,
      ...(ogImage ? { ogImage } : {}),
    },
  };
  if (copy.slug) data.slug = copy.slug;
}

/** Write the SEO text directly. Nested Open Graph fields are otherwise dropped. */
export async function persistCaseJudgmentSeo(strapi, documentId: string) {
  if (!documentId) return;
  for (const status of ["draft", "published"] as const) {
    const entry = await loadCase(strapi, documentId, status, false);
    if (!entry?.documentId || !selectedParty(entry.judgmentPassed)) continue;
    const copy = judgmentSeoCopy(entry);
    const seo = entry.seo;
    if (!seo?.id) continue;
    let changed = false;
    if (
      seo.metaTitle !== copy.metaTitle ||
      seo.metaDescription !== copy.metaDescription ||
      seo.keywords !== copy.keywords
    ) {
      await strapi.db.query("shared.seo").update({
        where: { id: seo.id },
        data: {
          metaTitle: copy.metaTitle,
          metaDescription: copy.metaDescription,
          keywords: copy.keywords,
        },
      });
      changed = true;
    }
    const og = seo.openGraph;
    if (og?.id && (og.ogTitle !== copy.metaTitle || og.ogDescription !== copy.metaDescription)) {
      await strapi.db.query("shared.open-graph").update({
        where: { id: og.id },
        data: {
          ogTitle: copy.metaTitle,
          ogDescription: copy.metaDescription,
        },
      });
      changed = true;
    }
    if (changed) {
      strapi.log.info(
        `[case] Judgement SEO set for ${documentId} (${clean(entry.judgmentPassed)}, ${status}).`,
      );
    }
  }
}

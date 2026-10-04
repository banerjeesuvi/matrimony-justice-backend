/**
 * Sample public judgment copy for case 345/24.
 * Only the wife's name is published. The other party is "Husband".
 */

const DOCUMENT_ID = 'p8tkp1fyhv59giyfdiv1bi97';
const SLUG = 'manasi-roy-vs-husband-345-24';
const META_TITLE = 'Manasi Roy vs Husband: false allegation';

function paragraph(text: string) {
  return {
    type: 'paragraph',
    children: [{ type: 'text', text }],
  };
}

function heading(text: string) {
  return {
    type: 'heading',
    level: 2,
    children: [{ type: 'text', text }],
  };
}

export async function seedSampleJudgement(strapi) {
  const existing = await strapi.documents('api::case.case').findOne({
    documentId: DOCUMENT_ID,
    populate: {
      petitionerPic: true,
      seo: {
        populate: {
          metaImage: true,
          openGraph: { populate: { ogImage: true } },
        },
      },
    },
    status: 'published',
  });

  if (!existing) {
    strapi.log.warn(`[seed] Case ${DOCUMENT_ID} not found; judgment sample skipped.`);
    return;
  }

  const wifePhoto = (existing.petitionerPic || [])[0];
  const wifePhotoId = wifePhoto?.id;
  if (!wifePhotoId) {
    strapi.log.warn('[seed] Wife primary image is missing on case 345/24.');
    return;
  }

  const imagesReady =
    existing.seo?.metaImage?.id === wifePhotoId &&
    existing.seo?.openGraph?.ogImage?.id === wifePhotoId;

  if (
    existing.seo?.metaTitle === META_TITLE &&
    existing.respondent === 'Husband' &&
    imagesReady
  ) {
    strapi.log.info('[seed] Judgment sample already uses the wife primary image.');
    return;
  }

  const frontend = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(
    /\/$/,
    '',
  );
  const canonicalURL = `${frontend}/judgements/${SLUG}`;
  const metaDescription =
    'Case 345/24 at Barrackpore: the court confirmed the dowry allegation by Manasi Roy against her husband was false. Read the marriage judgment.';

  const data = {
    caseTitle: 'Manasi Roy vs Husband',
    slug: SLUG,
    respondent: 'Husband',
    description:
      'Case 345/24: the court confirmed the dowry allegation by Manasi Roy against her husband was false.',
    findings: [
      heading('Manasi Roy vs Husband'),
      paragraph(
        'Case number 345/24 was before the Barrackpore Court Complex, North 24 Parganas, West Bengal. Manasi Roy was the petitioner. The respondent is referred to only as Husband. The petition alleged dowry harassment under IPC section 498, arising from their marriage.',
      ),
      heading('What the court held'),
      paragraph(
        'The court looked at the complaint and the material placed on record. It held that the dowry allegation was not established. The recorded result is False Allegation Confirmed. The operative order closed the allegation against the husband.',
      ),
      paragraph(
        'Judgment date: 2 October 2026. This page publishes the wife’s name, the case number, the court, the section, and the result, so the marriage judgment can be found by searching Manasi Roy or case number 345/24.',
      ),
    ],
    seo: {
      metaTitle: META_TITLE,
      metaDescription,
      metaImage: wifePhotoId,
      keywords:
        'Manasi Roy, husband, 345/24, marriage case, dowry allegation, false allegation, matrimonial judgment, Barrackpore, IPC 498',
      metaRobots: 'index, follow',
      metaViewport: 'width=device-width, initial-scale=1',
      canonicalURL,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: META_TITLE,
        description: metaDescription,
        datePublished: '2026-10-02',
        mainEntityOfPage: canonicalURL,
        author: {
          '@type': 'Organization',
          name: 'Matrimony Justice',
        },
        about: [{ '@type': 'Person', name: 'Manasi Roy' }],
      },
      openGraph: {
        ogTitle: 'Manasi Roy vs Husband: dowry allegation held false',
        ogImage: wifePhotoId,
        ogDescription:
          'Public judgment in Manasi Roy vs Husband, case 345/24. The Barrackpore court confirmed the dowry allegation was false. Marriage case details and the final order.',
        ogUrl: canonicalURL,
        ogType: 'article',
      },
    },
  };

  for (const status of ['draft', 'published'] as const) {
    await strapi.documents('api::case.case').update({
      documentId: DOCUMENT_ID,
      status,
      data,
    });
  }

  const versions = await strapi.db.query('api::case.case').findMany({
    where: { documentId: DOCUMENT_ID },
    populate: { seo: { populate: { openGraph: true } } },
  });

  for (const version of versions) {
    const openGraphId = version.seo?.openGraph?.id;
    if (!openGraphId) continue;
    await strapi.db.query('shared.open-graph').update({
      where: { id: openGraphId },
      data: { ogImage: wifePhotoId },
    });
  }

  strapi.log.info('[seed] Set the wife primary image on case 345/24.');
}

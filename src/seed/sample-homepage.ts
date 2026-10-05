/**
 * Fills Homepage, Service, and Testimonial from the current marketing homepage.
 * Skips any entry that already exists.
 */

const META_TITLE = 'Fair matrimonial resolution | Matrimony Justice';
const META_DESCRIPTION =
  'Mediation, legal counsel, and case tracking for matrimonial disputes. File a case or find legal help with Matrimony Justice.';

const SERVICES = [
  {
    title: 'Mediation',
    slug: 'mediation',
    description:
      'Professional neutral third-party assistance to help reach amicable settlements outside of court.',
    icon: 'groups',
    linkLabel: 'Learn More',
    linkUrl: '/services/mediation',
    order: 1,
  },
  {
    title: 'Legal Counsel',
    slug: 'legal-counsel',
    description:
      "Direct access to the nation's top matrimonial attorneys specializing in complex family law.",
    icon: 'gavel',
    linkLabel: 'Learn More',
    linkUrl: '/services/legal-counsel',
    order: 2,
  },
  {
    title: 'Case Tracking',
    slug: 'case-tracking',
    description:
      'Real-time digital dashboard to monitor your legal proceedings, documents, and updates securely.',
    icon: 'history',
    linkLabel: 'Learn More',
    linkUrl: '/my-cases',
    order: 3,
  },
];

const TESTIMONIALS = [
  {
    quote:
      'The mediation service helped us find a fair path forward without the stress of a public trial. Their expertise was invaluable.',
    name: 'Sarah Jenkins',
    role: 'Corporate Executive',
    rating: 5,
    order: 1,
  },
  {
    quote:
      'Transparent pricing and constant updates through the portal. I always knew exactly where my case stood.',
    name: 'Michael Chen',
    role: 'Software Architect',
    rating: 5,
    order: 2,
  },
  {
    quote:
      'Highly professional and discreet. They handled our family matter with the sensitivity it truly required.',
    name: 'Elena Rodriguez',
    role: 'Educator',
    rating: 5,
    order: 3,
  },
];

export async function seedHomepage(strapi) {
  if (META_TITLE.length > 60 || META_DESCRIPTION.length < 50 || META_DESCRIPTION.length > 160) {
    throw new Error(
      `Homepage SEO lengths are invalid (title ${META_TITLE.length}, description ${META_DESCRIPTION.length}).`,
    );
  }

  for (const service of SERVICES) {
    const existing = await strapi.db.query('api::service.service').findOne({
      where: { slug: service.slug },
    });
    if (existing) continue;
    await strapi.documents('api::service.service').create({
      data: service,
      status: 'published',
    });
    strapi.log.info(`[seed] Published service ${service.slug}`);
  }

  for (const story of TESTIMONIALS) {
    const existing = await strapi.db.query('api::testimonial.testimonial').findOne({
      where: { name: story.name },
    });
    if (existing) continue;
    await strapi.documents('api::testimonial.testimonial').create({
      data: { ...story, showOnHome: true },
      status: 'published',
    });
    strapi.log.info(`[seed] Published testimonial ${story.name}`);
  }

  const homepage = await strapi.db.query('api::homepage.homepage').findOne();
  if (homepage) {
    strapi.log.info('[seed] Homepage already exists.');
    return;
  }

  const frontend = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(
    /\/$/,
    '',
  );
  const canonicalURL = `${frontend}/`;

  await strapi.documents('api::homepage.homepage').create({
    status: 'published',
    data: {
      heroEyebrow: 'Premium Legal Assistance',
      heroTitleBefore: 'Fair Solutions for',
      heroTitleHighlight: 'Matrimonial',
      heroTitleAfter: 'Justice',
      heroDescription:
        'Navigate your legal journey with dignity and precision. We provide expert arbitration, mediation, and comprehensive support for sensitive family matters.',
      primaryButtonLabel: 'File a Case',
      primaryButtonUrl: '/new-case',
      secondaryButtonLabel: 'Find Legal Help',
      secondaryButtonUrl: '/#services',
      heroBadgeTitle: 'Case Success',
      heroBadgeText: '98% Resolution Rate',
      stats: [
        { value: '15k+', label: 'Cases Resolved' },
        { value: '25+', label: 'Legal Experts' },
        { value: '98%', label: 'Success Rate' },
        { value: '24/7', label: 'Legal Support' },
      ],
      servicesEyebrow: 'Our Services',
      servicesHeading: 'Expert Guidance for Family Harmony',
      storiesEyebrow: 'Client Stories',
      storiesHeading: 'Voices of Resolution',
      ctaTitle: 'Ready to find a resolution?',
      ctaDescription:
        'Connect with our legal experts today for a confidential consultation and take the first step towards a fair outcome.',
      ctaPrimaryLabel: 'Schedule Consultation',
      ctaPrimaryUrl: '/contact',
      ctaSecondaryLabel: 'Contact Support',
      ctaSecondaryUrl: 'mailto:support@matrimonyjustice.com',
      footerAbout:
        'Providing sophisticated legal solutions for matrimonial matters with empathy and excellence since 2026.',
      footerEmail: 'support@matrimonyjustice.com',
      footerPhone: '1-800-JUSTICE',
      footerAddress: 'Washington D.C., USA',
      copyright: '© 2024 Matrimony Justice System. All rights reserved.',
      platformLinks: [
        { label: 'Services', url: '/#services' },
        { label: 'Judgements', url: '/judgments' },
        { label: 'About Us', url: '/about' },
      ],
      supportLinks: [
        { label: 'Help Center', url: '/help' },
        { label: 'News', url: '/news' },
      ],
      legalLinks: [
        { label: 'Privacy Policy', url: '/privacy' },
        { label: 'Terms of Service', url: '/terms' },
      ],
      seo: {
        metaTitle: META_TITLE,
        metaDescription: META_DESCRIPTION,
        keywords:
          'matrimonial justice, mediation, family law, file a case, legal help, matrimonial disputes',
        metaRobots: 'index, follow',
        metaViewport: 'width=device-width, initial-scale=1',
        canonicalURL,
        structuredData: {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Matrimony Justice',
          url: canonicalURL,
          description: META_DESCRIPTION,
        },
        openGraph: {
          ogTitle: 'Fair Solutions for Matrimonial Justice',
          ogDescription:
            'Navigate your legal journey with dignity and precision. Expert mediation, legal counsel, and case tracking for sensitive family matters.',
          ogUrl: canonicalURL,
          ogType: 'website',
        },
      },
    },
  });
  strapi.log.info('[seed] Published homepage.');
}

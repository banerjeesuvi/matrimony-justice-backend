/**
 * Published news categories. Skips a slug that already exists, so editors
 * can rename or edit a category in Strapi without the seed undoing it.
 */

type SeedCategory = {
  name: string;
  slug: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
};

const CATEGORIES: SeedCategory[] = [
  {
    name: 'Finance',
    slug: 'finance',
    description:
      'Alimony, maintenance, asset division, joint accounts, and the money questions that come with separation and divorce.',
    metaTitle: 'Finance News | Matrimony Justice',
    metaDescription:
      'Alimony, maintenance, asset division, and money matters in matrimonial disputes, explained for spouses and families.',
    keywords: 'alimony, maintenance, asset division, divorce finance, joint accounts',
  },
  {
    name: 'Law & Government',
    slug: 'law-government',
    description:
      'New laws, court rules, and government policy that change how marriage, divorce, and family disputes are handled.',
    metaTitle: 'Law & Government News | Matrimony Justice',
    metaDescription:
      'New family laws, court rules, and government policy on marriage, divorce, and matrimonial disputes, explained clearly.',
    keywords: 'family law, matrimonial law, court rules, government policy, legislation',
  },
  {
    name: 'Business & Industrial',
    slug: 'business-industrial',
    description:
      'Family businesses, shareholdings, and company assets when a marriage ends, and how courts value and divide them.',
    metaTitle: 'Business & Industrial News | Matrimony Justice',
    metaDescription:
      'How family businesses, shareholdings, and company assets are valued and divided in divorce and matrimonial disputes.',
    keywords: 'family business, shareholding, business valuation, divorce assets',
  },
  {
    name: 'Real Estate',
    slug: 'real-estate',
    description:
      'The matrimonial home, jointly owned property, residence rights, and how real estate is shared after separation.',
    metaTitle: 'Real Estate News | Matrimony Justice',
    metaDescription:
      'Matrimonial home, joint property, residence rights, and how real estate is divided in divorce and separation cases.',
    keywords: 'matrimonial home, joint property, residence rights, property division',
  },
  {
    name: 'Jobs & Education',
    slug: 'jobs-education',
    description:
      'Earning capacity, career breaks, children’s schooling costs, and how work and education shape maintenance orders.',
    metaTitle: 'Jobs & Education News | Matrimony Justice',
    metaDescription:
      'Earning capacity, career breaks, and children’s education costs, and how they affect maintenance and custody decisions.',
    keywords: 'earning capacity, child education costs, maintenance, career break',
  },
  {
    name: 'Autos & Vehicles',
    slug: 'autos-vehicles',
    description:
      'Cars and other vehicles in a divorce: ownership, loans, insurance, and who keeps the vehicle after separation.',
    metaTitle: 'Autos & Vehicles News | Matrimony Justice',
    metaDescription:
      'Cars and vehicles in divorce: ownership, loans, insurance, and who keeps the vehicle after a matrimonial dispute.',
    keywords: 'vehicle ownership, car loan, divorce assets, vehicle insurance',
  },
  {
    name: 'Health',
    slug: 'health',
    description:
      'Mental and physical health in separation: counselling, medical evidence, health insurance, and the wellbeing of children.',
    metaTitle: 'Health News | Matrimony Justice',
    metaDescription:
      'Mental health, counselling, medical evidence, and health insurance in divorce and matrimonial disputes, explained clearly.',
    keywords: 'mental health, counselling, medical evidence, health insurance, child wellbeing',
  },
];

export async function seedNewsCategories(strapi) {
  for (const category of CATEGORIES) {
    const existing = await strapi.db
      .query('api::news-category.news-category')
      .findOne({ where: { slug: category.slug } });
    if (existing) continue;

    await strapi.documents('api::news-category.news-category').create({
      data: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        seo: {
          metaTitle: category.metaTitle,
          metaDescription: category.metaDescription,
          keywords: category.keywords,
          metaRobots: 'index, follow',
        },
      },
      status: 'published',
    });
    strapi.log.info(`[seed] Published news category ${category.name}`);
  }
}

/**
 * Help Center page copy. One published entry for /help-center.
 */

const META_TITLE = 'Help Center | Matrimony Justice';
const META_DESCRIPTION =
  'Step-by-step help for filing a matrimonial case: register parties and court, upload evidence, follow review, and read the final judgement.';

const FAQS = [
  {
    topic: 'filing',
    question: 'How do I register a case on Matrimony Justice?',
    answer:
      'Go to New Case. Enter the case number, case type, filing date, petitioner (Wife) and respondent (Husband) names, then select State, District, and Court Complex. You may add emails, phones, party photos, supporting documents, and notes. Submit to file the case to your account.',
  },
  {
    topic: 'checklists',
    question: 'What happens after I file, and how do I add more documents?',
    answer:
      'The case is stored against your login and listed on My Cases and the dashboard. Open the case to review parties, jurisdiction, and files. To add more documents or photos, use Edit Case from My Cases (Register Another is only for a fresh filing). Uploads are limited to 25MB per document and 5MB per photo.',
  },
  {
    topic: 'decrees',
    question: 'How will I know when review or judgement is complete?',
    answer:
      'Watch Case Review and the dashboard timeline (Case Register, Document Uploaded, Review, Final Judgement). The header bell and Notifications page also show unread alerts for your cases. Open a notification to go to that case. This portal is an administrative filing tool and does not replace independent legal advice.',
  },
];

const STEPS = [
  {
    number: '01',
    topic: 'filing',
    duration: 'Day 1',
    title: 'Filing & Docketing',
    body: 'Register the case with petitioner (Wife) and respondent (Husband) details, then assign State, District, and Court Complex.',
    points: [{ text: 'Case number and case type' }, { text: 'eCourts jurisdiction lookup' }],
  },
  {
    number: '02',
    topic: 'checklists',
    duration: 'Same day',
    title: 'Evidence & Documents',
    body: 'Attach petitions, affidavits, and optional party photos so the case file is complete.',
    points: [{ text: 'PDF, DOC, JPG, or PNG (25MB)' }, { text: 'Party photos up to 5MB' }],
  },
  {
    number: '03',
    topic: 'mediation',
    duration: 'In review',
    title: 'Audit & Review',
    body: 'Your filing moves to Case Review. Status updates appear on the dashboard timeline and in Notifications.',
    points: [{ text: 'Pending or in-review status' }, { text: 'Alerts when review changes' }],
  },
  {
    number: '04',
    topic: 'decrees',
    duration: 'On order',
    title: 'Final Judgement',
    body: 'When review is completed, the outcome is recorded on the case and shown as Final Judgement.',
    points: [{ text: 'Completed review status' }, { text: 'Judgement visible on the case' }],
  },
];

export async function seedHelpCenter(strapi) {
  if (META_TITLE.length > 60 || META_DESCRIPTION.length < 50 || META_DESCRIPTION.length > 160) {
    throw new Error(
      `Help Center SEO lengths are invalid (title ${META_TITLE.length}, description ${META_DESCRIPTION.length}).`,
    );
  }

  const existing = await strapi.db.query('api::help-center.help-center').findOne();
  if (existing) {
    strapi.log.info('[seed] Help Center already exists.');
    return;
  }

  const frontend = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
  const canonicalURL = `${frontend}/help-center`;

  await strapi.documents('api::help-center.help-center').create({
    status: 'published',
    data: {
      breadcrumbHomeLabel: 'Home',
      breadcrumbHomeUrl: '/',
      breadcrumbCurrent: 'Help Center',
      badge: 'Public Guide',
      title: 'Help Center & Legal Roadmap',
      introduction:
        'Step-by-step guide to filing a matrimonial case in this portal: register parties and court, upload evidence, follow review, and read the final judgement.',
      handbookLabel: 'Handbook (PDF)',
      deskLabel: 'Judicial Desk',
      deskUrl: '#help-support',
      searchPlaceholder: 'Search legal procedures, affidavits, review, or notifications…',
      filters: [
        { key: 'all', label: 'All' },
        { key: 'filing', label: 'Filing Flow' },
        { key: 'checklists', label: 'Checklists' },
        { key: 'mediation', label: 'Mediation' },
        { key: 'decrees', label: 'Decrees' },
      ],
      progressionTitle: 'Matrimonial Docket Progression',
      progressionIntro: 'Four-stage path in this portal: register, documents, review, and judgement.',
      progressionBadge: 'Portal workflow',
      steps: STEPS,
      progressionNote: 'Timing depends on the court, not the portal.',
      progressionEmphasis: 'file today, review when the bench takes it up',
      progressionLinkLabel: 'View dashboard timeline',
      progressionLinkUrl: '/dashboard',
      guidesEyebrow: 'Operational protocols',
      guidesTitle: 'Key procedural instructions',
      printLabel: 'Print guidebook',
      guides: [
        {
          slug: 'register-a-new-case',
          topic: 'filing',
          code: 'Guide 01',
          title: 'Register a new case',
          body: 'Open New Case, enter the case number and type, add both parties, then choose State, District, and Court Complex from the live court list.',
          meta: 'New Case form',
          href: '/new-case',
          detail:
            'Use a unique case number (for example MJS-2026-001). Filing date is required. Petitioner (Wife) and respondent (Husband) names are required; email and phone are optional. Jurisdiction is loaded from eCourts: pick the state first, then district, then court complex. Optional petitioner (Wife) and respondent (Husband) photos help identify the parties on the case record.',
        },
        {
          slug: 'upload-case-documents',
          topic: 'checklists',
          code: 'Guide 02',
          title: 'Upload case documents',
          body: 'Add petitions, affidavits, and evidence when you file, or later from case edit. Files are stored in your account folder.',
          meta: 'Max 25MB each',
          href: '/my-cases',
          detail:
            'Accepted files are PDF, DOC, DOCX, JPG, and PNG, up to 25MB each. Party photos must be JPG, PNG, or WebP and no larger than 5MB. Documents appear on My Cases, the case detail page, and the dashboard Case Documents list. You can remove an uploaded file from the case while it is still in your control.',
        },
        {
          slug: 'track-review-status',
          topic: 'mediation',
          code: 'Guide 03',
          title: 'Track review status',
          body: 'Case Review and the dashboard timeline show whether a matter is pending, in review, or completed.',
          meta: 'Dashboard + Case Review',
          href: '/case-review',
          detail:
            'After a case is registered it appears under My Cases. When review begins, status moves to In Review, Pending Initial Review, or Pending Documents. The dashboard Overall Case Progress and Case Timeline update automatically. You also receive a notification when review status or a final judgement is recorded.',
        },
        {
          slug: 'notifications-and-account',
          topic: 'decrees',
          code: 'Guide 04',
          title: 'Notifications & account',
          body: 'The bell shows unread alerts for filings, uploads, review, and judgement. Manage your profile and password in Settings.',
          meta: 'Bell + Settings',
          href: '/notifications',
          detail:
            'Notifications list case filings, document uploads, review updates, and final judgements for the signed-in user. Mark one item or all items as read. Settings lets you update your name, phone, address, profile photo, and password. After a password change you are asked to sign in again.',
        },
      ],
      faqEyebrow: 'Precedents & directives',
      faqTitle: 'Essential procedural questions',
      faqCountLabel: 'in this view',
      faqs: FAQS,
      emptyMessage: 'No help topics match that search. Try “filing”, “documents”, or “review”.',
      supportEyebrow: 'Immediate judicial support',
      supportTitle: 'Direct escalations & assistance',
      supportActions: [
        { label: 'Account & profile', url: '/settings' },
        { label: 'Open case review', url: '/case-review' },
        { label: 'File a new case', url: '/new-case' },
      ],
      noticeLabel: 'Notice',
      noticeBody:
        'This Help Center explains how to use Matrimony Justice to register cases, store documents, follow review, and read notifications. It is administrative guidance only and is not legal advice or representation. Court dates, fees, and outcomes are decided by the competent court, not by this website.',
      seo: {
        metaTitle: META_TITLE,
        metaDescription: META_DESCRIPTION,
        keywords:
          'matrimony justice help center, file a matrimonial case, upload case documents, case review, final judgement',
        metaRobots: 'index, follow',
        metaViewport: 'width=device-width, initial-scale=1',
        canonicalURL,
        structuredData: {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebPage',
              name: 'Help Center & Legal Roadmap',
              description: META_DESCRIPTION,
              url: canonicalURL,
            },
            {
              '@type': 'HowTo',
              name: 'Matrimonial Docket Progression',
              description: 'Four-stage path in this portal: register, documents, review, and judgement.',
              step: STEPS.map((step, index) => ({
                '@type': 'HowToStep',
                position: index + 1,
                name: step.title,
                text: step.body,
              })),
            },
            {
              '@type': 'FAQPage',
              mainEntity: FAQS.map((item) => ({
                '@type': 'Question',
                name: item.question,
                acceptedAnswer: { '@type': 'Answer', text: item.answer },
              })),
            },
          ],
        },
        openGraph: {
          ogTitle: META_TITLE,
          ogDescription: META_DESCRIPTION,
          ogUrl: canonicalURL,
          ogType: 'website',
        },
      },
    },
  });
  strapi.log.info('[seed] Published help center.');
}

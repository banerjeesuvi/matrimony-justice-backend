/**
 * Contact page copy. Form submissions are a separate collection and are not seeded.
 */

const META_TITLE = 'Contact our legal counsel | Matrimony Justice';
const META_DESCRIPTION =
  'Send a confidential matrimonial inquiry with your case stage and documents. Our advocates reply under attorney-client privilege.';

export async function seedContactPage(strapi) {
  if (META_TITLE.length > 60 || META_DESCRIPTION.length < 50 || META_DESCRIPTION.length > 160) {
    throw new Error(
      `Contact SEO lengths are invalid (title ${META_TITLE.length}, description ${META_DESCRIPTION.length}).`,
    );
  }

  const existing = await strapi.db.query('api::contact-page.contact-page').findOne();
  if (existing) {
    strapi.log.info('[seed] Contact page already exists.');
    return;
  }

  const frontend = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
  const canonicalURL = `${frontend}/contact`;

  await strapi.documents('api::contact-page.contact-page').create({
    status: 'published',
    data: {
      eyebrow: 'Confidential Legal Inquiry & Support',
      title: 'Get in Touch with Our Legal & Mediation Counsel',
      introduction:
        'Whether you are facing matrimonial litigation, seeking fair amicable mediation, or require urgent legal guidance, our dedicated advocates and family dispute specialists are here to protect your rights with absolute confidentiality.',
      standbyLabel: 'Duty Advocates on Standby',
      callbackValue: '24 min',
      callbackLabel: 'Avg. Callback Time',
      protocolNote: 'Encrypted intake protocol',
      trustItems: [
        { title: '100% Confidential', detail: 'Attorney-Client Privilege' },
        { title: 'Fast Turnaround', detail: 'Response within 24 Hours' },
        { title: 'Judicial Presence', detail: 'Pan-Jurisdiction Network' },
        { title: 'Senior Advocates', detail: 'Verified Matrimonial Specialists' },
      ],
      formTitle: 'Initiate Confidential Case Intake',
      formIntro:
        'Please provide accurate matter specifics. Your information is held under legal confidentiality safeguards.',
      disputeTypes: [
        { label: 'Mutual Consent Mediation & Amicable Separation' },
        { label: 'Contested Divorce / Maintenance & Alimony Defense' },
        { label: 'Child Custody, Guardianship & Visitation Rights' },
        { label: 'False Allegations / 498A / Domestic Violence Defense' },
        { label: 'High-Net-Worth Property & Financial Settlement' },
        { label: 'General Strategic Legal Consultation' },
      ],
      caseStages: [
        { label: 'Pre-litigation / Legal Notice Received' },
        { label: 'Pending in Family Court' },
        { label: 'Appellate Bench / High Court Stage' },
        { label: 'Exploring Mediation & Conciliation' },
        { label: 'No Legal Steps Taken Yet' },
      ],
      urgencyLevels: [
        { label: 'Urgent (<24h)' },
        { label: 'Standard' },
        { label: 'Inquiry' },
      ],
      summaryNote: 'Confidential & Encrypted',
      fileLabel: 'Supporting Notices or Court Petitions (Optional)',
      fileHelp: 'Click to browse or drop summons, agreement drafts, or petitions',
      fileHint: 'PDF, DOCX, or scanned images up to 25MB.',
      consentText:
        'I understand that submitting this inquiry does not automatically establish a formal attorney-client contract until retainer confirmation. However, all disclosed facts remain strictly protected under legal attorney-client privilege.',
      submitLabel: 'Request Confidential Case Consultation',
      successMessage:
        'Your case brief has been received under privileged cover. Our senior clerk will contact you within the requested window.',
      emergencyBadge: 'Emergency Assistance',
      emergencyTitle: '24/7 Urgent Matrimonial Helpline',
      emergencyBody:
        'Round-the-clock emergency legal response for interim child custody emergencies, restraining orders, warrantless summons, and urgent stay motions.',
      phoneLabel: 'Toll-Free Immediate Line',
      phoneDisplay: '+1 (800) 587-8423 / +1-800-JUSTICE',
      phoneUrl: 'tel:+18005878423',
      whatsappLabel: 'Direct WhatsApp Advocate Desk',
      whatsappDisplay: '+1 (800) 587-8424',
      whatsappUrl: 'https://wa.me/18005878424',
      chambersTitle: 'Registry & Chambers',
      chambersSubtitle: 'In-Person Legal Conferences by Prior Appointment',
      addressLabel: 'Primary Chambers',
      address: '1200 Judicial Enclave, Suite 500, Legal Core District, New York, NY 10007',
      hoursLabel: 'Working Chambers Hours',
      hours: 'Monday – Saturday: 9:00 AM – 7:30 PM (EST)',
      hoursNote: 'Emergency consultations available Sundays upon judicial urgency',
      mailLabel: 'Direct Registry Mail',
      emails: [
        { address: 'counsel@matrimonyjustice.com' },
        { address: 'registry@matrimonyjustice.com' },
      ],
      mapLabel: 'Chambers Location Map',
      mapBadge: 'Court Vicinity',
      faqTitle: 'Consultation FAQ',
      faqIntro: 'Key points on engagement & confidentiality',
      faqs: [
        {
          question: 'How is confidentiality strictly guaranteed?',
          answer:
            'Every transmission sent via our portal is routed through encrypted chambers servers. Communications are protected under standard attorney-client privilege doctrine from the point of receipt, irrespective of whether formal retainer follows.',
        },
        {
          question: 'Can mediation proceedings take place virtually?',
          answer:
            'Yes. We manage secure virtual alternative dispute resolution (ADR) benches, allowing estranged parties residing in separate cities or overseas jurisdictions to engage in legally ratified conciliation hearings.',
        },
        {
          question: 'What documents should I prepare in advance?',
          answer:
            'Having your marriage certificate, chronology of key separation dates, notices served by the opposing counsel, and any preliminary list of joint marital assets will allow our advocates to formulate an immediate strategic advisory during your first session.',
        },
      ],
      bandEyebrow: 'Senior Matrimonial Advocates',
      bandTitle: 'Empathetic Counsel with Formidable Courtroom Authority',
      bandBody:
        'Our dispute resolution group has handled over 3,200 complex matrimonial proceedings, shielding clients from disproportionate financial demands, defending against fabricated criminal charges, and securing rightful custody arrangements for minor children.',
      bandStats: [
        { value: '94%', label: 'Settlements Mediated Out of Court' },
        { value: '18+', label: 'Years Avg. Advocate Experience' },
        { value: '100%', label: 'Privileged Handling' },
      ],
      charterTitle: 'Matrimony Justice Charter',
      charterBody: 'Dedicated to fair settlements and protection against frivolous litigation.',
      closingTitle: 'Your Dignity, Stability & Rights Are Non-Negotiable',
      closingBody:
        'We operate with transparent fee schedules, clear strategic counsel, and no hidden retainer billing. Speak with our designated matrimonial registrar today for a reasoned path forward.',
      closingPrimaryLabel: 'Explore Services',
      closingPrimaryUrl: '/services',
      closingSecondaryLabel: 'Browse Landmark Judgments',
      closingSecondaryUrl: '/judgments',
      seo: {
        metaTitle: META_TITLE,
        metaDescription: META_DESCRIPTION,
        keywords:
          'contact matrimony justice, confidential legal inquiry, family court consultation, matrimonial helpline',
        metaRobots: 'index, follow',
        metaViewport: 'width=device-width, initial-scale=1',
        canonicalURL,
        openGraph: {
          ogTitle: 'Contact our legal counsel | Matrimony Justice',
          ogDescription: META_DESCRIPTION,
          ogUrl: canonicalURL,
          ogType: 'website',
        },
      },
    },
  });
  strapi.log.info('[seed] Published contact page.');
}

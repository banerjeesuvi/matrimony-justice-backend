/**
 * Shared logged-out header, plus the About and Services page entries.
 * Skips any entry that already exists.
 */

const ABOUT_TITLE = 'About Us | Matrimony Justice';
const ABOUT_DESCRIPTION =
  'Learn how Matrimony Justice restores balance, truth, and dignity in matrimonial jurisprudence through forensic legal clarity.';

const SERVICES_TITLE = 'Services | Matrimony Justice';
const SERVICES_DESCRIPTION =
  'Strategic legal support for matrimonial disputes: case filing, forensic audit, independent investigation, and judgment analysis.';

function assertSeo(label: string, title: string, description: string) {
  if (title.length > 60 || description.length < 50 || description.length > 160) {
    throw new Error(
      `${label} SEO lengths are invalid (title ${title.length}, description ${description.length}).`,
    );
  }
}

export async function seedPublicPages(strapi) {
  assertSeo('About', ABOUT_TITLE, ABOUT_DESCRIPTION);
  assertSeo('Services', SERVICES_TITLE, SERVICES_DESCRIPTION);

  const frontend = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(
    /\/$/,
    '',
  );

  const header = await strapi.db.query('api::header.header').findOne();
  if (!header) {
    await strapi.documents('api::header.header').create({
      status: 'published',
      data: {
        siteName: 'Matrimony Justice',
        loginLabel: 'Login',
        loginUrl: '/login',
        signUpLabel: 'Sign Up',
        signUpUrl: '/signup',
        navLinks: [
          { label: 'Home', url: '/' },
          { label: 'Services', url: '/services' },
          { label: 'Judgements', url: '/judgments' },
          { label: 'About Us', url: '/about' },
        ],
      },
    });
    strapi.log.info('[seed] Published shared header.');
  }

  const about = await strapi.db.query('api::about.about').findOne();
  if (!about) {
    await strapi.documents('api::about.about').create({
      status: 'published',
      data: {
        eyebrow: 'Our Mission & Story • Est. 2026',
        title: 'Restoring Balance, Truth, & Dignity in Matrimonial Jurisprudence',
        introduction:
          'Matrimony Justice was founded to bridge the critical chasm between emotionally inflamed matrimonial litigation and objective, forensic legal clarity. We exist to safeguard families, dismantle fabricated claims, and uphold due process through strict evidentiary substantiation.',
        quote:
          'Justice in domestic jurisprudence cannot survive on speculative accusations. Our duty is not merely legal representation—it is the forensic preservation of undeniable fact and constitutional parity.',
        quoteAttribution: 'Senior Managing Counsel • Matrimony Justice Directorate',
        imageCaptionTitle: 'Senior Advocacy Council & Forensic Directorate',
        imageCaption:
          'Convening over 120+ years of collective appellate and trial practice.',
        imageLabel: 'Chambers & Evidentiary Directorate',
        milestones: [
          {
            value: '2026',
            title: 'Specialist Legal Clinic Founded',
            body: 'Conceived by senior bar litigators to pioneer forensic standards in family proceedings.',
          },
          {
            value: '150+',
            title: 'Families Fairly Guided',
            body: 'Through structured bilateral conciliation, mutual accords, and rigorous courtroom trials.',
          },
          {
            value: '25+',
            title: 'Legal Specialists',
            body: 'High Court appellate advocates, forensic auditors, and accredited child-welfare counselors.',
          },
        ],
        principlesEyebrow: 'Core Principles',
        principlesHeading: 'Why We Exist: Pillars of Institutional Integrity',
        principlesIntro:
          'Our institutional charter rejects trial-by-emotion. Every matter undertaken by Matrimony Justice is structured upon strict constitutional guardrails and evidentiary substantiation.',
        principleNoteTitle: 'Certified Due Process',
        principleNoteBody:
          'Every defense protocol is cross-audited by independent appellate counsel prior to judicial filing.',
        principles: [
          {
            number: '01',
            title: 'Forensic Integrity Over Conjecture',
            body: 'Upholding strict evidentiary standards, uncorroborated allegations are systematically examined through digital and financial forensics. We mandate Section 65B electronic certifications, transactional reconciliation, and certified chain-of-custody protocols before entering evidence.',
          },
          {
            number: '02',
            title: 'Equitable & Neutral Due Process',
            body: 'Protecting parental dignity, constitutional rights under Article 21, and parity across all proceedings. We actively combat frivolous weaponization of matrimonial laws, establishing equitable shared parenting frameworks and transparent maintenance calculations.',
          },
          {
            number: '03',
            title: 'Confidentiality & Ethical Stewardship',
            body: 'Total privileged enclave protection with 256-bit encrypted evidentiary vaults and an explicit zero-hidden-retainer transparent practice. Cases are governed by capped fee agreements and inviolable attorney-client non-disclosure agreements.',
          },
        ],
        leadersEyebrow: 'Governance & Advocacy',
        leadersHeading: 'Senior Leadership & Directorate',
        leadersIntro:
          'Seasoned jurists, forensic technologists, and court-appointed mediators leading each practice area.',
        leaders: [
          {
            initials: 'AR',
            name: 'Adv. Arvind',
            role: 'Senior Managing Partner',
            credential: 'Bar Council of Delhi & High Court Bar',
            bio: '24+ years specializing in appellate family jurisprudence, writ petitions, and perjury cross-examination. Former special counsel for contested custody and constitutional parity matters.',
            tags: 'Appellate Practice, Cross-Examination, 24+ Yrs Exp',
          },
          {
            initials: 'MS',
            name: 'Dr. Meera',
            role: 'Head of Forensic Evidence',
            credential: 'Sec 65B Certified Forensic Specialist',
            bio: 'Pioneering forensic digital discovery in family court proceedings, financial trail audit, WhatsApp/CDR evidentiary extraction, and metadata verification for judicial scrutiny.',
            tags: 'Digital Forensics, Sec 65B Audit, Cyber Jurist',
          },
          {
            initials: 'VS',
            name: 'Vikramaditya',
            role: 'Chief Mediator & Conciliation',
            credential: 'National Mediation Accreditation',
            bio: 'Accredited family conciliator presiding over complex contested custodial and alimony settlements, dedicated to dignified non-adversarial resolution and child-centric agreements.',
            tags: 'Family Conciliation, Shared Custody, ADR Fellow',
          },
        ],
        ctaEyebrow: 'Privileged Attorney-Client Enclave',
        ctaTitle: 'Speak with our Senior Counsel in Complete Confidence.',
        ctaDescription:
          'Direct, privileged evaluation of case filings, forensic evidence, and constitutional defense avenues.',
        ctaPrimaryLabel: 'Schedule Case Review',
        ctaPrimaryUrl: '/signup',
        ctaSecondaryLabel: 'Contact Directorate',
        ctaSecondaryUrl: '/help-center',
        seo: {
          metaTitle: ABOUT_TITLE,
          metaDescription: ABOUT_DESCRIPTION,
          keywords:
            'about matrimony justice, family law, forensic evidence, matrimonial jurisprudence',
          metaRobots: 'index, follow',
          metaViewport: 'width=device-width, initial-scale=1',
          canonicalURL: `${frontend}/about`,
          openGraph: {
            ogTitle: 'About Us | Matrimony Justice',
            ogDescription: ABOUT_DESCRIPTION,
            ogUrl: `${frontend}/about`,
            ogType: 'website',
          },
        },
      },
    });
    strapi.log.info('[seed] Published about page.');
  }

  const servicesPage = await strapi.db.query('api::services-page.services-page').findOne();
  if (!servicesPage) {
    await strapi.documents('api::services-page.services-page').create({
      status: 'published',
      data: {
        heroKicker: 'Matrimonial Justice Group',
        heroSubtitle: 'Trusted advocacy for your future',
        eyebrow: 'Comprehensive legal services',
        title: 'Strategic Legal Support Built on Evidence & Diligence',
        introduction:
          'Empowering individuals navigating matrimonial disputes with robust defense strategies, thorough forensic evidence analysis, and certified pre-trial readiness.',
        highlights: [
          { value: '150+', label: 'Cases', detail: 'Matrimonial expertise guided' },
          { value: 'Certified', label: 'Auditors', detail: 'Forensics & cyber investigations' },
          { value: '25+', label: 'Advocates', detail: 'Gender-sensitive matrimonial counsel' },
        ],
        areasEyebrow: 'Core capabilities',
        areasHeading: 'Four Major Practice Areas',
        areasIntro:
          'Interconnected practice modules structured to secure verifiable courtroom evidence and process statutory rights.',
        practiceAreas: [
          {
            number: '01',
            badge: 'Pre-Trial',
            title: 'Case Filing & Statutory Drafts',
            body: 'Systemic petition structuring for specialized civil and matrimonial jurisdiction.',
            bullets: [
              { text: 'DV, IEA, and maintenance petition drafting' },
              { text: 'Provisional and interlocutory competence audits' },
              { text: 'Affidavits of assets and liabilities for family court' },
            ],
            meta: 'Certified docket & registry filing',
            ctaLabel: 'Engage Counsel',
            ctaUrl: '/new-case',
          },
          {
            number: '02',
            badge: 'Forensics',
            title: 'Evidence Review & Forensic Audit',
            body: 'Convert raw electronic interactions and financial ledgers into unassailable courtroom evidence.',
            bullets: [
              { text: 'Metadata-tampering audit of chats and message trails' },
              { text: 'Decrypted email and attachment reconstruction' },
              { text: 'Chain-of-custody and confidentiality integrity checks' },
            ],
            meta: 'Forensic dossier',
            ctaLabel: 'Request Audit',
            ctaUrl: '/help-center',
          },
          {
            number: '03',
            badge: 'Fact-finding',
            title: 'Independent Investigation',
            body: 'Neutral fact-finding protocols that expose fabricated statements and verify asset concealment.',
            bullets: [
              { text: 'Actual-income affidavit composition and verification' },
              { text: 'Circumstantial and physical evidence documentation' },
              { text: 'Off-ledger asset reporting for 498A and 125 proceedings' },
            ],
            meta: 'Fact-finding report',
            ctaLabel: 'Initiate Probe',
            ctaUrl: '/new-case',
          },
          {
            number: '04',
            badge: 'Litigation',
            title: 'Judgment Analysis & Precedents',
            body: 'Reciprocal analysis of Supreme Court rulings, perjury assessment, and tailored litigation strategy.',
            bullets: [
              { text: 'Authentic citation of High Court and Supreme Court doctrine' },
              { text: 'Perjury assessment of false declarations' },
              { text: 'Verifiable nexus mapping for family-member allegations' },
            ],
            meta: 'Judicial precedent compendium',
            ctaLabel: 'Access Precedents',
            ctaUrl: '/judgments',
          },
        ],
        standardsEyebrow: 'Institutional standards',
        standardsHeading: 'Courtroom Admissibility & Transparency',
        standardsIntro:
          'Compulsory statutory evidence-verification sessions and forensic-level operations under documented timelines and court-defined deliverables.',
        standards: [
          {
            title: 'Indian Evidence Act compliance',
            body: 'Court-admissible digital records with documented chain-of-custody endorsements.',
          },
          {
            title: 'Attorney-client privilege vault',
            body: 'Linked to a non-disclosure architecture with located client-over-governance.',
          },
          {
            title: 'Predictable fixed retainers',
            body: 'Milestone-bound billing with no unexpected legal escalation.',
          },
        ],
        ctaEyebrow: 'Confidential pre-litigation review',
        ctaTitle: 'Book a Confidential Case Evaluation',
        ctaDescription:
          'Gain immediate clarity with senior matrimonial advocates and evidence officers under strict non-disclosure safeguards.',
        ctaPrimaryLabel: 'Book Case Evaluation',
        ctaPrimaryUrl: '/signup',
        ctaSecondaryLabel: 'Speak to Counsel',
        ctaSecondaryUrl: '/help-center',
        ctaNote: '120+ verdicts · 28 precedents · No-judgment service',
        seo: {
          metaTitle: SERVICES_TITLE,
          metaDescription: SERVICES_DESCRIPTION,
          keywords:
            'matrimonial legal services, case filing, forensic audit, investigation, judgment analysis',
          metaRobots: 'index, follow',
          metaViewport: 'width=device-width, initial-scale=1',
          canonicalURL: `${frontend}/services`,
          openGraph: {
            ogTitle: 'Services | Matrimony Justice',
            ogDescription: SERVICES_DESCRIPTION,
            ogUrl: `${frontend}/services`,
            ogType: 'website',
          },
        },
      },
    });
    strapi.log.info('[seed] Published services page.');
  }
}

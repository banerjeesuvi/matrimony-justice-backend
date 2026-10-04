/**
 * Sample news: two published articles in every category, each with a cover
 * and a filled SEO component. Skips any slug that already exists.
 */

import fs from 'fs';
import path from 'path';

type SeedArticle = {
  categorySlug: string;
  image: string;
  alt: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedDate: string;
  featured: boolean;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  keywords: string;
  paragraphs: string[];
  quote: string;
  quoteBy: string;
  faqs: { question: string; answer: string }[];
};

const ARTICLES: SeedArticle[] = [
  {
    categorySlug: 'family-marriage',
    image: 'family-cruelty-claims.jpg',
    alt: 'A quiet consultation room with a closed legal file and two empty chairs',
    title: 'How courts look at cruelty in a marriage case',
    slug: 'how-courts-look-at-cruelty-in-a-marriage-case',
    excerpt:
      'Family courts weigh conduct, evidence and context before treating cruelty as a ground in a matrimonial dispute.',
    publishedDate: '2026-09-18T09:30:00.000Z',
    featured: true,
    tags: ['Family law', 'Marriage'],
    metaTitle: 'Cruelty claims in marriage cases | Matrimony Justice',
    metaDescription:
      'How family courts assess cruelty claims in a marriage case, including evidence, context and what a petition should record.',
    ogTitle: 'How courts look at cruelty in a marriage case',
    ogDescription:
      'A plain guide to how family courts assess cruelty claims, the evidence they expect, and what a petition should record.',
    keywords:
      'cruelty in marriage, family court, matrimonial dispute, marriage case, legal news',
    paragraphs: [
      'A cruelty allegation in a marriage case is not decided from one incident in isolation. Family courts look at the pattern of conduct, the evidence each side can produce, and whether the behaviour made it unreasonable to continue living together.',
      'Petitions usually set out dates, places and the effect on the person who filed. Messages, medical papers, neighbour accounts and earlier complaints can matter, but the court still tests them. A bare label, without particulars, is rarely enough.',
      'Readers should treat this as general information about how these cases are framed. The outcome in any petition depends on the facts proved in that court.',
    ],
    quote:
      'Particulars matter more than a label. The court wants to see what happened, when, and how it was proved.',
    quoteBy: 'Matrimony Justice desk',
    faqs: [
      {
        question: 'Is one argument enough to allege cruelty?',
        answer:
          'Usually not. Courts look for a pattern, or for conduct serious enough on its own, and they expect the petition to give particulars.',
      },
      {
        question: 'Do messages and medical papers help?',
        answer:
          'They can, if they are authentic and connected to the allegations. The other side can still challenge them.',
      },
    ],
  },
  {
    categorySlug: 'family-marriage',
    image: 'family-maintenance.jpg',
    alt: 'A kitchen table with a notebook, a pen and household bills',
    title: 'Maintenance after a couple starts living apart',
    slug: 'maintenance-after-a-couple-starts-living-apart',
    excerpt:
      'Maintenance claims look at income, needs and dependents. Here is what family courts commonly ask the parties to show.',
    publishedDate: '2026-09-22T11:00:00.000Z',
    featured: false,
    tags: ['Family law', 'Maintenance'],
    metaTitle: 'Maintenance after separation | Matrimony Justice',
    metaDescription:
      'What family courts look at in a maintenance claim after separation, including income, needs, dependents and the papers parties file.',
    ogTitle: 'Maintenance after a couple starts living apart',
    ogDescription:
      'Income, needs and dependents shape a maintenance claim. A short guide to the papers family courts commonly expect.',
    keywords:
      'maintenance after separation, family court maintenance, matrimonial maintenance, spouse support',
    paragraphs: [
      'When a couple starts living apart, a maintenance claim asks the court to look at who earns, who depends on that income, and what it reasonably costs to live. The figure is not a fixed percentage copied from another case.',
      'Parties are often asked for salary slips, bank statements, rent papers and a list of dependents. Hiding income, or inflating expenses without proof, weakens the claim. Interim maintenance can be ordered while the main case is still pending.',
      'This note explains the usual questions. It is not a calculation for any particular household.',
    ],
    quote:
      'The court compares means and needs. A round number without papers is difficult to defend.',
    quoteBy: 'Matrimony Justice desk',
    faqs: [
      {
        question: 'Can maintenance be asked while the case is pending?',
        answer:
          'Yes. Courts often consider interim maintenance so a dependent spouse or child is not left without support during the case.',
      },
      {
        question: 'Does the husband always pay?',
        answer:
          'No. The claim depends on who has the means and who has the need. Either spouse can be asked to disclose income.',
      },
    ],
  },
  {
    categorySlug: 'judgments',
    image: 'judgment-written-record.jpg',
    alt: 'A bound court file and a gavel on a wooden bench',
    title: 'What a written judgment records in a family dispute',
    slug: 'what-a-written-judgment-records-in-a-family-dispute',
    excerpt:
      'A judgment sets out the issues, the evidence the court accepted, and the order. Here is how to read one.',
    publishedDate: '2026-09-12T08:15:00.000Z',
    featured: true,
    tags: ['Judgments', 'Family law'],
    metaTitle: 'How to read a family court judgment | Matrimony Justice',
    metaDescription:
      'What a written family court judgment records: the issues, the evidence accepted, the reasons, and the operative order.',
    ogTitle: 'What a written judgment records in a family dispute',
    ogDescription:
      'Issues, evidence, reasons and the operative order: a plain guide to reading a family court judgment.',
    keywords:
      'family court judgment, how to read a judgment, court order, matrimonial judgment',
    paragraphs: [
      'A written judgment is the court’s reasoned decision. In a family dispute it usually names the parties, the relief each side asked for, the issues framed, and the evidence the judge accepted or rejected.',
      'The last pages are the operative order: divorce granted or refused, maintenance fixed, custody directions, or a case sent back. Headlines often quote only that order. The reasons above it explain why.',
      'Searching a party’s name can surface the judgment. The fair way to describe it is to stay with what the court actually held, including any finding that an allegation was not proved.',
    ],
    quote:
      'The order is the result. The reasons are why that result was reached.',
    quoteBy: 'Matrimony Justice desk',
    faqs: [
      {
        question: 'Is the last paragraph the whole judgment?',
        answer:
          'No. The operative order states the result. The earlier paragraphs record the issues and the evidence the court relied on.',
      },
      {
        question: 'Can a judgment be appealed?',
        answer:
          'Often yes, within the time and before the court the law allows. The judgment itself usually says nothing about whether an appeal was later filed.',
      },
    ],
  },
  {
    categorySlug: 'judgments',
    image: 'judgment-mutual-consent.jpg',
    alt: 'Two empty chairs and a folder in a family court mediation room',
    title: 'How courts treat a mutual consent divorce',
    slug: 'how-courts-treat-a-mutual-consent-divorce',
    excerpt:
      'Mutual consent divorce rests on a joint petition and a waiting period. Courts still check that consent is real.',
    publishedDate: '2026-09-25T10:45:00.000Z',
    featured: false,
    tags: ['Judgments', 'Marriage'],
    metaTitle: 'Mutual consent divorce in court | Matrimony Justice',
    metaDescription:
      'How courts handle a mutual consent divorce: the joint petition, the waiting period, and the check that consent is genuine.',
    ogTitle: 'How courts treat a mutual consent divorce',
    ogDescription:
      'A joint petition is not automatic. Courts look at the waiting period and whether both sides still consent.',
    keywords:
      'mutual consent divorce, joint petition, family court divorce, cooling off period',
    paragraphs: [
      'A mutual consent divorce begins when both spouses file together and say the marriage has broken down and they have settled the terms they care about, such as maintenance, property or children.',
      'The law builds in a gap between the first and second motion so either person can reconsider. Courts have, in some judgments, shortened that gap where the wait served no purpose, but that is not automatic. The judge still looks at whether consent is free and whether arrangements for children are workable.',
      'A reported judgment on this point applies to the facts before that court. Another couple still has to satisfy the judge hearing their petition.',
    ],
    quote:
      'Consent has to be real on the day the court is asked to pass the decree, not only on the day the petition was signed.',
    quoteBy: 'Matrimony Justice desk',
    faqs: [
      {
        question: 'Can one spouse withdraw consent later?',
        answer:
          'Yes. Mutual consent requires both parties to stay willing. If one withdraws before the decree, the court will not treat it as a consent divorce.',
      },
      {
        question: 'Does every case skip the waiting period?',
        answer:
          'No. A shorter wait is something the court may consider on the facts. It is not a right that applies to every petition.',
      },
    ],
  },
  {
    categorySlug: 'latest-news',
    image: 'news-mediation-slots.jpg',
    alt: 'A family court reception desk and empty corridor in morning light',
    title: 'Family courts are pushing mediation before trial',
    slug: 'family-courts-are-pushing-mediation-before-trial',
    excerpt:
      'More family courts are asking couples to try mediation before a full hearing, so disputes can settle with fewer dates.',
    publishedDate: '2026-09-28T07:00:00.000Z',
    featured: false,
    tags: ['Mediation', 'Family law'],
    metaTitle: 'Family courts push mediation first | Matrimony Justice',
    metaDescription:
      'Family courts are asking more couples to try mediation before a full trial, aiming for fewer dates and settlements on workable terms.',
    ogTitle: 'Family courts are pushing mediation before trial',
    ogDescription:
      'Mediation is being used earlier in family cases so couples can settle maintenance, custody or divorce terms with fewer hearings.',
    keywords:
      'family court mediation, mediation before trial, matrimonial mediation, latest legal news',
    paragraphs: [
      'Several family courts have been listing new petitions for mediation before they are taken up for evidence. The aim is practical: fewer adjournments, and a chance to settle maintenance, custody or the terms of a divorce without a long trial.',
      'Mediation is confidential and voluntary in the sense that a settlement is signed only if both sides agree. If it fails, the case returns to the court and the judge decides it on evidence. What was said in mediation is not meant to become a shortcut to judgment.',
      'Readers with a date already fixed should check the cause list or ask their lawyer whether that court has sent the matter to mediation.',
    ],
    quote:
      'A failed mediation does not decide the case. It only means the court will hear the evidence.',
    quoteBy: 'Matrimony Justice desk',
    faqs: [
      {
        question: 'Is mediation the same as a judgment?',
        answer:
          'No. A settlement is an agreement. A judgment is the court’s decision when the parties do not settle.',
      },
      {
        question: 'Do both sides have to attend?',
        answer:
          'Courts expect the parties, or someone who can take a decision, to be present. A lawyer alone often cannot close the terms.',
      },
    ],
  },
  {
    categorySlug: 'latest-news',
    image: 'news-helpline.jpg',
    alt: 'A counselling desk with a telephone, notepad and lamp',
    title: 'Counselling desks are extending evening hours',
    slug: 'counselling-desks-are-extending-evening-hours',
    excerpt:
      'Some court-linked counselling desks are staying open later so working spouses can attend without missing a weekday.',
    publishedDate: '2026-09-30T14:20:00.000Z',
    featured: false,
    tags: ['Mediation', 'Marriage'],
    metaTitle: 'Evening hours at counselling desks | Matrimony Justice',
    metaDescription:
      'Court-linked counselling desks are adding evening hours so working spouses can attend matrimonial counselling without losing a weekday.',
    ogTitle: 'Counselling desks are extending evening hours',
    ogDescription:
      'Later hours at court-linked counselling desks make it easier for working spouses to attend before a family case moves ahead.',
    keywords:
      'family counselling, court counselling desk, matrimonial counselling, evening legal aid',
    paragraphs: [
      'Court-linked counselling desks in several districts have started keeping one or two evenings a week so people who cannot leave work at noon can still attend. The session is meant to see whether a settlement, or at least a calmer interim arrangement, is possible.',
      'An evening slot does not replace a court date. If the petition is already listed, that listing stands unless the court says otherwise. Parties should carry the case number and a short note of the issues they want to discuss.',
      'Hours differ by district. The useful check is the notice at that court complex, not a general announcement.',
    ],
    quote:
      'An evening counselling slot is an extra door into the same process, not a new court.',
    quoteBy: 'Matrimony Justice desk',
    faqs: [
      {
        question: 'Does an evening visit cancel the next hearing?',
        answer:
          'No. The court date remains unless the judge passes an order changing it.',
      },
      {
        question: 'What should you carry?',
        answer:
          'The case number, identity proof, and a short list of the issues you want to talk about, such as interim residence or school arrangements.',
      },
    ],
  },
  {
    categorySlug: 'law-policy',
    image: 'policy-bns.jpg',
    alt: 'A law book and paperweight on a desk with columns beyond the window',
    title: 'What changes when matrimonial offences move to the new code',
    slug: 'matrimonial-offences-under-the-new-criminal-code',
    excerpt:
      'IPC sections used in matrimonial complaints now have counterparts in the Bharatiya Nyaya Sanhita. The case still needs facts.',
    publishedDate: '2026-09-08T06:40:00.000Z',
    featured: false,
    tags: ['Law and policy', 'Family law'],
    metaTitle: 'Matrimonial offences under the new code | Matrimony Justice',
    metaDescription:
      'How matrimonial complaints sit under the Bharatiya Nyaya Sanhita after the IPC, and why the facts of the case still decide the charge.',
    ogTitle: 'Matrimonial offences under the Bharatiya Nyaya Sanhita',
    ogDescription:
      'Section numbers have changed. A complaint still has to state what happened, when, and which offence those facts support.',
    keywords:
      'Bharatiya Nyaya Sanhita, IPC to BNS, matrimonial offences, criminal law reform, family law policy',
    paragraphs: [
      'Criminal complaints that once cited the Indian Penal Code now have to be framed under the Bharatiya Nyaya Sanhita where the new code applies. Cruelty in a marriage, criminal breach of trust over stridhan, and related allegations have successor provisions. The section number on the FIR is not the whole case.',
      'Police and magistrates still look at whether the written complaint gives dates, places and the role of each person named. A charge sheet that only swaps an old section for a new one, without facts, remains open to challenge.',
      'Pending cases filed under the IPC are not all rewritten overnight. Which code applies depends on when the alleged act took place and how the transitional provisions treat that proceeding.',
    ],
    quote:
      'A new section number does not create a new set of facts. The complaint still has to say what happened.',
    quoteBy: 'Matrimony Justice desk',
    faqs: [
      {
        question: 'Do old IPC cases automatically become BNS cases?',
        answer:
          'Not always. The code that applies depends on the date of the alleged act and the transition rules for pending proceedings.',
      },
      {
        question: 'Is a family court case the same as a criminal complaint?',
        answer:
          'No. A divorce or maintenance petition in the family court is separate from an FIR. They can run alongside each other, but they are different proceedings.',
      },
    ],
  },
  {
    categorySlug: 'law-policy',
    image: 'policy-maintenance-guidelines.jpg',
    alt: 'A court folder, calculator and glasses on a teak desk',
    title: 'Why maintenance guidelines are not a fixed formula',
    slug: 'why-maintenance-guidelines-are-not-a-fixed-formula',
    excerpt:
      'Guideline judgments suggest a method. Family courts still adjust maintenance for the income and needs proved in that case.',
    publishedDate: '2026-09-16T12:10:00.000Z',
    featured: false,
    tags: ['Law and policy', 'Maintenance'],
    metaTitle: 'Maintenance guidelines are not a formula | Matrimony Justice',
    metaDescription:
      'Supreme Court guidance on maintenance is a method, not a fixed sum. Family courts still adjust it to the income and needs that are proved.',
    ogTitle: 'Why maintenance guidelines are not a fixed formula',
    ogDescription:
      'Guideline judgments tell courts what to look at. They do not replace the income and expense proof in an individual case.',
    keywords:
      'maintenance guidelines, Supreme Court maintenance, family court policy, spouse maintenance',
    paragraphs: [
      'Higher-court guidelines on maintenance tell judges what to examine: the status of the parties, the reasonable needs of the claimant, the income of the payer, and any independent earnings. They discourage guesswork and delay.',
      'They do not publish a single monthly figure for every city. A percentage mentioned in one judgment is a starting point for cases with similar proof, not a rubber stamp. If the payer’s income is cash-based, or the claimant has a salary, the court is expected to say how it treated those facts.',
      'Policy in this area moves through judgments and, sometimes, rules of the court. A news brief should quote the guideline and the facts it was tied to, instead of turning it into a calculator.',
    ],
    quote:
      'A guideline is a method of reasoning. The amount still comes from the evidence in that household.',
    quoteBy: 'Matrimony Justice desk',
    faqs: [
      {
        question: 'Can I apply a percentage from a famous judgment to my salary?',
        answer:
          'Only as a rough sense of scale. The court hearing your case will look at your papers, dependents and the other side’s income.',
      },
      {
        question: 'Do guidelines bind every family court?',
        answer:
          'Courts follow binding precedent. They still apply it to the record in front of them, and they should explain the figure they fix.',
      },
    ],
  },
  {
    categorySlug: 'legal',
    image: 'legal-petition-documents.jpg',
    alt: 'Identity papers and a manila envelope laid out for a court filing',
    title: 'Papers to keep ready before a matrimonial petition',
    slug: 'papers-to-keep-ready-before-a-matrimonial-petition',
    excerpt:
      'Marriage proof, identity, address, income and any earlier case numbers are the papers most petitions ask for at the start.',
    publishedDate: '2026-09-05T09:00:00.000Z',
    featured: false,
    tags: ['Family law', 'Court procedure'],
    metaTitle: 'Papers for a matrimonial petition | Matrimony Justice',
    metaDescription:
      'The papers most matrimonial petitions need at the start: marriage proof, identity, address, income records and any earlier case numbers.',
    ogTitle: 'Papers to keep ready before a matrimonial petition',
    ogDescription:
      'A practical list of the documents family courts commonly expect when a matrimonial petition is filed.',
    keywords:
      'matrimonial petition documents, family court filing, marriage certificate, court procedure',
    paragraphs: [
      'The first filing is easier when the basic papers are already in one set. Courts commonly expect proof of marriage, identity and address of both spouses if you have them, and a clear statement of the relief you want: divorce, judicial separation, maintenance, custody or restitution.',
      'Income documents matter as soon as money is in issue. If there is already a case — a criminal complaint, an earlier maintenance petition, or a case in another district — the new petition should mention that case number so the court can see the full picture.',
      'Requirements vary slightly by state and by the form that court uses. The list here is a preparation guide, not a substitute for the checklist at the filing counter.',
    ],
    quote:
      'A complete set of papers does not win the case. It stops the first date being lost to missing annexures.',
    quoteBy: 'Matrimony Justice desk',
    faqs: [
      {
        question: 'What if the marriage certificate is not available?',
        answer:
          'Tell the court how the marriage can be proved, such as photographs, invitations or witness accounts, and ask what that registry accepts.',
      },
      {
        question: 'Should earlier cases be mentioned?',
        answer:
          'Yes. Hiding a connected case can delay the petition and damage credibility when the other side produces it.',
      },
    ],
  },
  {
    categorySlug: 'legal',
    image: 'legal-separation-divorce.jpg',
    alt: 'Two house keys and a ring placed apart on linen',
    title: 'Judicial separation and divorce are not the same relief',
    slug: 'judicial-separation-and-divorce-are-not-the-same',
    excerpt:
      'Judicial separation lets spouses live apart under a court order. Divorce ends the marriage. The grounds overlap, the result does not.',
    publishedDate: '2026-09-20T15:30:00.000Z',
    featured: false,
    tags: ['Marriage', 'Court procedure'],
    metaTitle: 'Judicial separation versus divorce | Matrimony Justice',
    metaDescription:
      'Judicial separation and divorce can rest on similar grounds, but one orders spouses to live apart and the other ends the marriage.',
    ogTitle: 'Judicial separation and divorce are not the same relief',
    ogDescription:
      'Similar grounds, different results: one decree orders spouses to live apart, the other dissolves the marriage.',
    keywords:
      'judicial separation, divorce difference, family court relief, matrimonial law',
    paragraphs: [
      'Both judicial separation and divorce can be asked for on grounds such as cruelty, desertion or adultery, depending on the statute that applies to the marriage. The difference is the order at the end.',
      'A decree of judicial separation authorises the spouses to live apart. The marriage continues, and neither is free to marry again. A decree of divorce dissolves the marriage. Maintenance and arrangements for children can be made in either proceeding.',
      'Some people choose separation first because they want a court order without ending the marriage. That choice should be made knowing the decree they will actually receive.',
    ],
    quote:
      'The ground may look similar. The decree decides whether the marriage still exists.',
    quoteBy: 'Matrimony Justice desk',
    faqs: [
      {
        question: 'Can spouses remarry after judicial separation?',
        answer:
          'No. The marriage continues. Remarriage becomes possible only after a valid divorce decree, subject to any appeal period.',
      },
      {
        question: 'Can a separation decree later lead to divorce?',
        answer:
          'It can be relevant in a later petition, but it is not itself a divorce. A fresh relief has to be asked for and granted.',
      },
    ],
  },
  {
    categorySlug: 'society',
    image: 'society-mediation.jpg',
    alt: 'A round table with empty chairs in a sunlit community hall',
    title: 'Why families try mediation before a full hearing',
    slug: 'why-families-try-mediation-before-a-full-hearing',
    excerpt:
      'Mediation gives relatives and spouses a private setting to settle children, money and living arrangements before a trial.',
    publishedDate: '2026-09-11T13:00:00.000Z',
    featured: false,
    tags: ['Mediation', 'Society'],
    metaTitle: 'Why families try mediation first | Matrimony Justice',
    metaDescription:
      'Families try mediation before a full hearing to settle children, money and living arrangements in private, without a public trial.',
    ogTitle: 'Why families try mediation before a full hearing',
    ogDescription:
      'A private table can settle school, rent and interim support before a family dispute becomes a long trial.',
    keywords:
      'family mediation, society and marriage, settling a matrimonial dispute, community mediation',
    paragraphs: [
      'A full hearing puts allegations on record and can take months of dates. Many families try mediation first because the questions that hurt day to day — where the children sleep, who pays the rent, whether someone can stay in the house this month — can be written down without a judgment on who was at fault.',
      'That only works when both sides can speak without threat. If there is violence, the safer step is to tell the mediator and the court, and to ask for protection before any joint sitting. Agreement is not more important than safety.',
      'Settlements that deal with children should be practical enough to follow on a school morning, not only dignified enough to sign.',
    ],
    quote:
      'Mediation is useful when it produces a plan people can actually live with next week.',
    quoteBy: 'Matrimony Justice desk',
    faqs: [
      {
        question: 'Should relatives sit in the mediation?',
        answer:
          'Only if both spouses agree and the relatives are there to help a decision, not to crowd it. The spouses still have to own the terms.',
      },
      {
        question: 'What if one person is afraid to attend?',
        answer:
          'Say so. Courts and mediators can change the format, including separate sittings, and protection orders are a separate request.',
      },
    ],
  },
  {
    categorySlug: 'society',
    image: 'society-family-support.jpg',
    alt: 'A living room at dusk with two cups of tea on a low table',
    title: 'How relatives can help without taking over the case',
    slug: 'how-relatives-can-help-without-taking-over-the-case',
    excerpt:
      'Family support is useful when it covers documents, childcare and a calm place to stay, and leaves the instructions to the parties.',
    publishedDate: '2026-09-27T16:45:00.000Z',
    featured: false,
    tags: ['Society', 'Marriage'],
    metaTitle: 'How relatives can support a family case | Matrimony Justice',
    metaDescription:
      'Relatives help a matrimonial case most by handling documents, childcare and housing, while the spouses keep control of instructions.',
    ogTitle: 'How relatives can help without taking over the case',
    ogDescription:
      'Practical support — papers, school runs, a place to stay — matters more than relatives arguing the case for the couple.',
    keywords:
      'family support in court cases, relatives and marriage disputes, matrimonial case help, society',
    paragraphs: [
      'Relatives are often the people who find the lawyer, keep the children for a hearing day, or offer a room when someone cannot stay at home. That support changes whether a person can actually attend court.',
      'It becomes a problem when the family starts giving instructions the spouse does not agree with, or when neighbours are told a version of the case that the court has not heard. Statements made outside can find their way into evidence.',
      'The more useful role is concrete: original documents in one folder, a list of dates, and a decision about who will speak to the lawyer. The person whose name is on the petition remains the person the court will hear.',
    ],
    quote:
      'Help with the school run and the file is support. A public story about the other side is a risk.',
    quoteBy: 'Matrimony Justice desk',
    faqs: [
      {
        question: 'Can a parent speak for an adult son or daughter in court?',
        answer:
          'Not instead of them, unless the court has a reason to hear that parent as a witness. The party still has to be present and instruct the lawyer.',
      },
      {
        question: 'Should the dispute be discussed in family groups?',
        answer:
          'Keep it narrow. Extra retellings create witnesses and screenshots the other side may produce later.',
      },
    ],
  },
  {
    categorySlug: 'latest-news',
    image: 'news-cause-list.jpg',
    alt: 'A court registry desk with a monitor showing a blurred weekly calendar',
    title: 'Family courts are posting weekly cause lists online',
    slug: 'family-courts-are-posting-weekly-cause-lists-online',
    excerpt:
      'More district family courts are uploading the week’s cause list so parties can confirm the date before they travel.',
    publishedDate: '2026-10-01T08:00:00.000Z',
    featured: false,
    tags: ['Latest news', 'Court procedure'],
    metaTitle: 'Weekly family court cause lists online | Matrimony Justice',
    metaDescription:
      'District family courts are uploading weekly cause lists so parties can confirm the hearing date before they travel to court.',
    ogTitle: 'Family courts are posting weekly cause lists online',
    ogDescription:
      'A weekly cause list on the court website lets parties check the date, courtroom and item number before they leave home.',
    keywords:
      'family court cause list, weekly cause list, court dates, latest legal news',
    paragraphs: [
      'Several district family courts have started putting the coming week’s cause list on the court website as well as on the notice board. The list shows the date, the courtroom and the item number, which is the detail people most often miss when they rely on an old note from the lawyer.',
      'An online list is a convenience, not a fresh order. If the court advances or drops a matter after the list is published, the board at the complex and the lawyer’s update still control the day. Parties should check again the evening before the hearing.',
      'Where a court has not gone online yet, the notice board in that complex remains the record. A general news item cannot replace the list for your own case number.',
    ],
    quote:
      'The cause list tells you when to attend. It does not change what the last order said.',
    quoteBy: 'Matrimony Justice desk',
    faqs: [
      {
        question: 'What if my case is missing from the weekly list?',
        answer:
          'Ask the registry or your lawyer the same day. A missing item can mean the matter was not listed, was moved, or was typed under a slightly different number.',
      },
      {
        question: 'Does an online list replace the court notice board?',
        answer:
          'No. Treat the website as an early copy. Confirm it against the board if the listing looks wrong.',
      },
    ],
  },
  {
    categorySlug: 'latest-news',
    image: 'news-legal-aid-saturday.jpg',
    alt: 'Empty wooden benches in a Saturday morning legal aid waiting room',
    title: 'Legal aid desks are opening Saturday slots',
    slug: 'legal-aid-desks-are-opening-saturday-slots',
    excerpt:
      'Some legal aid desks are keeping a Saturday morning slot so working spouses can ask about a matrimonial filing.',
    publishedDate: '2026-10-01T11:30:00.000Z',
    featured: false,
    tags: ['Latest news', 'Legal aid'],
    metaTitle: 'Saturday slots at legal aid desks | Matrimony Justice',
    metaDescription:
      'Legal aid desks are adding Saturday morning slots so working spouses can ask about matrimonial filings without missing a weekday.',
    ogTitle: 'Legal aid desks are opening Saturday slots',
    ogDescription:
      'A Saturday morning slot at the legal aid desk gives working spouses a chance to ask how a matrimonial petition is filed.',
    keywords:
      'legal aid Saturday, family court legal aid, matrimonial filing help, latest news',
    paragraphs: [
      'Legal services desks attached to a few court complexes are keeping one Saturday morning for people who cannot leave work between Monday and Friday. The slot is for a first explanation: which court, which form, and which papers to bring back.',
      'It is not a hearing, and it does not file the petition by itself. If the desk agrees you qualify for legal aid, a lawyer is assigned under that authority’s rules. Income limits and the documents they ask for differ by state.',
      'Call the desk or read the notice at that complex before you travel. A Saturday that is open in one district may be closed in the next.',
    ],
    quote:
      'A Saturday slot is a way to start the paperwork. The case still begins when the court receives the petition.',
    quoteBy: 'Matrimony Justice desk',
    faqs: [
      {
        question: 'Does everyone get a free lawyer?',
        answer:
          'No. Legal aid depends on the income and category rules of that legal services authority. The desk will say if you qualify.',
      },
      {
        question: 'Can the petition be filed the same Saturday?',
        answer:
          'Usually not. The first visit is for advice and a document list. Filing follows once the papers and the assigned lawyer are ready.',
      },
    ],
  },
  {
    categorySlug: 'latest-news',
    image: 'news-interim-maintenance.jpg',
    alt: 'An empty courtroom dais with a clock and a neat stack of files',
    title: 'Courts are being asked to decide interim maintenance early',
    slug: 'courts-asked-to-decide-interim-maintenance-early',
    excerpt:
      'Higher courts have again told trial courts not to leave an interim maintenance plea pending for hearing after hearing.',
    publishedDate: '2026-10-02T07:15:00.000Z',
    featured: false,
    tags: ['Latest news', 'Maintenance'],
    metaTitle: 'Decide interim maintenance early | Matrimony Justice',
    metaDescription:
      'Higher courts are telling family courts to decide interim maintenance early, instead of leaving the plea pending across many dates.',
    ogTitle: 'Courts are being asked to decide interim maintenance early',
    ogDescription:
      'A fresh reminder to trial courts: an interim maintenance plea should be decided on the papers, not carried for months.',
    keywords:
      'interim maintenance, family court dates, maintenance delay, latest court news',
    paragraphs: [
      'Interim maintenance is meant to cover the months while the main case is still on. Higher courts have repeatedly said that this plea should not travel with the suit for a year of adjournments. Fresh directions this season make the same point to trial courts: hear it early, on affidavits of income and expenses.',
      'That does not fix a number for every household. The judge still needs salary slips, bank statements and a credible account of rent, school fees and other dependents. A party who withholds those papers is the usual reason a date is lost.',
      'If your interim plea has already been pending across several listings, ask your lawyer whether an application for an early date is worth filing, and carry the income set the court asked for last time.',
    ],
    quote:
      'Interim maintenance is a bridge. It is not supposed to wait until the bridge is no longer needed.',
    quoteBy: 'Matrimony Justice desk',
    faqs: [
      {
        question: 'Does an early hearing decide the whole divorce?',
        answer:
          'No. It decides temporary support. The main petition continues on its own evidence.',
      },
      {
        question: 'What papers should be ready?',
        answer:
          'Recent income proof, rent or school receipts, and a short list of dependents. The other side will be asked for the same kind of disclosure.',
      },
    ],
  },
  {
    categorySlug: 'latest-news',
    image: 'news-help-desk.jpg',
    alt: 'A small help desk and visitor chair in a court complex corridor',
    title: 'Court complexes are adding a desk for first-time petitioners',
    slug: 'court-complexes-add-a-desk-for-first-time-petitioners',
    excerpt:
      'A few court complexes now have a help desk that tells first-time petitioners which counter and which form to use.',
    publishedDate: '2026-10-02T09:40:00.000Z',
    featured: false,
    tags: ['Latest news', 'Court procedure'],
    metaTitle: 'Help desks for first-time petitioners | Matrimony Justice',
    metaDescription:
      'Some court complexes now have a help desk that points first-time petitioners to the right counter, form and filing window.',
    ogTitle: 'Court complexes are adding a desk for first-time petitioners',
    ogDescription:
      'The new desk does not argue the case. It tells a first-time petitioner which window takes a matrimonial petition.',
    keywords:
      'court help desk, first time petitioner, family court filing, latest news',
    paragraphs: [
      'Walking into a court complex for the first time is where many matrimonial filings lose a morning. A handful of complexes have put a help desk near the entrance to answer the practical questions: which storey, which counter, and whether the petition needs a welfare stamp or a photocopy set before it will be received.',
      'The person at the desk is not your lawyer and cannot tell you whether the case will succeed. The useful answer is directional. If the desk is closed, the filing counter itself will still turn away a petition that is missing a page the checklist requires.',
      'Go with the marriage proof, identity, and the case numbers of any connected matter. Those three items are what the counter asks for before it looks at the rest.',
    ],
    quote:
      'The help desk saves a wrong queue. It does not replace advice on what relief to ask for.',
    quoteBy: 'Matrimony Justice desk',
    faqs: [
      {
        question: 'Can the help desk draft the petition?',
        answer:
          'No. Drafting is for your lawyer or, if you qualify, the legal aid lawyer. The desk explains the filing path.',
      },
      {
        question: 'Is the desk in every district?',
        answer:
          'No. It is being tried in some complexes. Check the notice at the entrance of the court you are actually filing in.',
      },
    ],
  },
  {
    categorySlug: 'latest-news',
    image: 'news-video-hearing.jpg',
    alt: 'A laptop and headphones on a dining table set up for a video hearing',
    title: 'Video hearings remain open for parties in another district',
    slug: 'video-hearings-remain-open-for-parties-in-another-district',
    excerpt:
      'Parties who live in another district can still ask for a video hearing, if that family court allows it for the kind of date listed.',
    publishedDate: '2026-10-02T13:10:00.000Z',
    featured: false,
    tags: ['Latest news', 'Court procedure'],
    metaTitle: 'Video hearings across districts | Matrimony Justice',
    metaDescription:
      'Parties living in another district can still request a video hearing when that family court allows it for the kind of date listed.',
    ogTitle: 'Video hearings remain open for parties in another district',
    ogDescription:
      'A video link is still available in many family courts for a party who would otherwise travel to another district for a short date.',
    keywords:
      'video hearing family court, virtual court date, another district, latest legal news',
    paragraphs: [
      'Family courts that opened video links during the last few years have mostly kept them for dates where travel is the real burden: a party working in another city, a short call-over, or a direction to file a reply. The link is requested, not assumed. The judge decides whether that date can be taken on video.',
      'Evidence dates are different. A witness whom the other side wants to cross-examine is often still asked to be present, unless the court has a reason to allow a remote deposition. Joining on a phone from a noisy street also gets matters adjourned.',
      'If you need a link, apply before the date and keep the case number, a quiet room, and a photo identity ready. The order granting video, if any, is what the reader on the dais will look for.',
    ],
    quote:
      'A video hearing is a way to attend. It is still a court date, and the order still binds.',
    quoteBy: 'Matrimony Justice desk',
    faqs: [
      {
        question: 'Can every date be joined on video?',
        answer:
          'No. The court allows it date by date. Evidence and a date fixed for personal appearance are the ones most often kept in person.',
      },
      {
        question: 'What if the link fails?',
        answer:
          'Tell your lawyer immediately and, if you can, the court staff. A failed link without a message looks like an absence.',
      },
    ],
  },
  {
    categorySlug: 'latest-news',
    image: 'news-indexed-annexures.jpg',
    alt: 'A stack of tabbed paper annexures on a marble filing counter',
    title: 'Registries want an index with every new petition',
    slug: 'registries-want-an-index-with-every-new-petition',
    excerpt:
      'Filing counters are sending back matrimonial petitions that arrive without an index of annexures and a page count.',
    publishedDate: '2026-09-29T08:20:00.000Z',
    featured: false,
    tags: ['Latest news', 'Court procedure'],
    metaTitle: 'Index your petition annexures | Matrimony Justice',
    metaDescription:
      'Filing counters are returning matrimonial petitions that have no index of annexures, no page numbers, and no complete set of copies.',
    ogTitle: 'Registries want an index with every new petition',
    ogDescription:
      'An index and page numbers are now the difference between a petition being received and being handed back at the counter.',
    keywords:
      'petition index, annexures, family court filing, court registry, latest news',
    paragraphs: [
      'Registries have put a fresh note on several filing counters: a matrimonial petition should open with an index that names each annexure, gives its page numbers, and matches the set of copies handed over. Petitions that arrive as a loose clip of photographs and chats are being returned the same day.',
      'The index is not a formality for the judge’s reading comfort alone. It is how the other side is served a complete set, and how a missing page can be spotted before the first date. Number the pages in one run, including the affidavit.',
      'Ask the counter for that court’s copy count before you bind the set. One complex wants three copies; the next wants the original plus two. The index should be on each copy.',
    ],
    quote:
      'A petition the counter cannot paginate is a petition the court has not received.',
    quoteBy: 'Matrimony Justice desk',
    faqs: [
      {
        question: 'Do photographs need to be in the index?',
        answer:
          'Yes, if you are relying on them. List them as an annexure with page numbers, or the other side can say they were never served.',
      },
      {
        question: 'What if a page is added later?',
        answer:
          'File it with a short application and a fresh page reference. Do not quietly replace the set the court already has.',
      },
    ],
  },
  {
    categorySlug: 'latest-news',
    image: 'news-child-arrangements.jpg',
    alt: 'A school bag and two empty chairs in a quiet mediation room',
    title: 'Mediation centres report more child-arrangement settlements',
    slug: 'mediation-centres-report-more-child-arrangement-settlements',
    excerpt:
      'Mediation centres say more parents are settling school, holidays and interim residence before the custody case is fully tried.',
    publishedDate: '2026-09-26T10:00:00.000Z',
    featured: false,
    tags: ['Latest news', 'Mediation'],
    metaTitle: 'Child arrangements settled in mediation | Matrimony Justice',
    metaDescription:
      'Mediation centres report more parents settling school, holidays and interim residence before a custody case is fully tried.',
    ogTitle: 'Mediation centres report more child-arrangement settlements',
    ogDescription:
      'Parents are writing down school days, holidays and interim residence in mediation, instead of waiting for a full custody trial.',
    keywords:
      'child custody mediation, parenting plan, family mediation, latest news',
    paragraphs: [
      'Mediation centres attached to family courts say a growing share of settlements this quarter are not about ending the marriage. They are about the week: who does the school run, where the child sleeps on Sundays, and how holidays are split while the petition is pending.',
      'A written plan is easier to follow than a spoken promise, and the court can take it on record if both parents still agree when the matter is called. It does not decide who is the better parent. It decides the calendar.',
      'Where there is a history of violence or of a child being kept back after a visit, mediators are being told to send the matter back to the judge rather than press for a joint sitting. Safety is not a term to be bargained away.',
    ],
    quote:
      'The useful settlement is a timetable a child can understand on a Monday morning.',
    quoteBy: 'Matrimony Justice desk',
    faqs: [
      {
        question: 'Does a mediation plan decide final custody?',
        answer:
          'Not by itself. It can become an interim arrangement, or the basis of a consent order, if the court accepts it. A later hearing can still change it.',
      },
      {
        question: 'Should the child attend mediation?',
        answer:
          'Only if the mediator and the court think it is appropriate. Many plans are written by the parents without the child in the room.',
      },
    ],
  },
  {
    categorySlug: 'latest-news',
    image: 'news-awareness-camp.jpg',
    alt: 'Empty chairs and a table under a canopy at a town-square legal camp',
    title: 'Legal services authorities are holding family law camps',
    slug: 'legal-services-authorities-are-holding-family-law-camps',
    excerpt:
      'State legal services authorities are running short camps on marriage, maintenance and where to file, aimed at people who have never seen a court.',
    publishedDate: '2026-09-24T15:00:00.000Z',
    featured: false,
    tags: ['Latest news', 'Legal aid'],
    metaTitle: 'Family law awareness camps this season | Matrimony Justice',
    metaDescription:
      'Legal services authorities are holding short camps on marriage, maintenance and where to file, for people who have never been to court.',
    ogTitle: 'Legal services authorities are holding family law camps',
    ogDescription:
      'Awareness camps explain maintenance, the right court, and legal aid. They do not file a petition on the spot for every visitor.',
    keywords:
      'legal awareness camp, family law camp, legal services authority, latest news',
    paragraphs: [
      'State legal services authorities have scheduled short outdoor and hall camps on family law this month. The session usually covers three things: which court hears a matrimonial petition in that district, what maintenance is, and how to ask for legal aid if the court fee and the lawyer’s cost are out of reach.',
      'A camp is an explanation, not a filing counter. Volunteers can point you to the right form and the right building. They should not take original documents away, and they should not promise a result. If someone at a stall asks for money to “move the file”, that is a reason to walk to the authority’s own office instead.',
      'Dates and places are published by the district legal services authority. A camp announced for one town is not being held in the neighbouring one unless the notice says so.',
    ],
    quote:
      'The camp is there to show the door into the court. The case starts after you walk through it.',
    quoteBy: 'Matrimony Justice desk',
    faqs: [
      {
        question: 'Will the camp file my divorce the same day?',
        answer:
          'Almost never. You may leave with a list of papers and the address of the legal aid desk. Filing is a separate step.',
      },
      {
        question: 'Are these camps free?',
        answer:
          'The authority’s own camp is free. Do not pay a person at the stall. Official help is given at the legal services office.',
      },
    ],
  },
];

function blocks(paragraphs: string[]) {
  const body: Record<string, unknown>[] = [];
  paragraphs.forEach((text, index) => {
    if (index === 1) {
      body.push({
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: 'What the court looks at' }],
      });
    }
    body.push({
      type: 'paragraph',
      children: [{ type: 'text', text }],
    });
  });
  return body;
}

function assertLengths(article: SeedArticle) {
  const limits: [string, string, number, number][] = [
    ['excerpt', article.excerpt, 1, 160],
    ['metaTitle', article.metaTitle, 1, 60],
    ['metaDescription', article.metaDescription, 50, 160],
    ['ogTitle', article.ogTitle, 1, 70],
    ['ogDescription', article.ogDescription, 1, 200],
  ];
  for (const [label, value, min, max] of limits) {
    if (value.length < min || value.length > max) {
      throw new Error(
        `${article.slug} ${label} is ${value.length} characters (allowed ${min}-${max})`,
      );
    }
  }
}

async function uploadCover(
  strapi,
  filename: string,
  alternativeText: string,
) {
  const filepath = path.join(process.cwd(), 'data', 'seed-news', filename);
  const stat = await fs.promises.stat(filepath);
  const uploaded = await strapi.plugin('upload').service('upload').upload({
    data: {
      fileInfo: {
        name: filename,
        alternativeText,
        caption: alternativeText,
      },
    },
    files: {
      filepath,
      originalFilename: filename,
      mimetype: 'image/jpeg',
      size: stat.size,
    },
  });
  const file = Array.isArray(uploaded) ? uploaded[0] : uploaded;
  if (!file?.id) {
    throw new Error(`Upload failed for ${filename}`);
  }
  return file.id as number;
}

async function ensureAuthor(strapi) {
  const existing = await strapi.db.query('api::author.author').findOne({
    where: { slug: 'matrimony-justice-desk' },
  });
  if (existing?.documentId) return existing.documentId as string;

  const created = await strapi.documents('api::author.author').create({
    data: {
      name: 'Matrimony Justice Desk',
      slug: 'matrimony-justice-desk',
      designation: 'News desk',
      bio: 'The Matrimony Justice desk writes plain-language explainers on family courts, matrimonial procedure and reported judgments.',
    },
    status: 'published',
  });
  return created.documentId as string;
}

async function ensureTag(strapi, name: string) {
  const slug = name
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const existing = await strapi.db.query('api::news-tag.news-tag').findOne({
    where: { slug },
  });
  if (existing?.documentId) return existing.documentId as string;

  const created = await strapi.documents('api::news-tag.news-tag').create({
    data: { name, slug },
  });
  return created.documentId as string;
}

export async function seedSampleNews(strapi) {
  for (const article of ARTICLES) assertLengths(article);

  const authorId = await ensureAuthor(strapi);
  const frontend = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(
    /\/$/,
    '',
  );

  for (const article of ARTICLES) {
    const already = await strapi.db.query('api::news-article.news-article').findOne({
      where: { slug: article.slug },
    });
    if (already) {
      strapi.log.info(`[seed] Skipping existing article ${article.slug}`);
      continue;
    }

    const category = await strapi.db
      .query('api::news-category.news-category')
      .findOne({ where: { slug: article.categorySlug } });
    if (!category?.documentId) {
      strapi.log.warn(
        `[seed] Category ${article.categorySlug} not found; skipped ${article.slug}`,
      );
      continue;
    }

    const imageId = await uploadCover(strapi, article.image, article.alt);
    const tagIds = [];
    for (const tag of article.tags) {
      tagIds.push(await ensureTag(strapi, tag));
    }

    const canonicalURL = `${frontend}/news/${article.slug}`;
    await strapi.documents('api::news-article.news-article').create({
      data: {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        cover: imageId,
        publishedDate: article.publishedDate,
        featured: article.featured,
        isBreaking: false,
        category: category.documentId,
        author: authorId,
        tags: tagIds,
        content: [
          {
            __component: 'news.rich-text',
            body: blocks(article.paragraphs),
          },
          {
            __component: 'news.media',
            file: imageId,
            caption: article.alt,
          },
          {
            __component: 'news.quote',
            quote: article.quote,
            attribution: article.quoteBy,
          },
          {
            __component: 'news.faq',
            items: article.faqs,
          },
        ],
        seo: {
          metaTitle: article.metaTitle,
          metaDescription: article.metaDescription,
          metaImage: imageId,
          keywords: article.keywords,
          metaRobots: 'index, follow',
          metaViewport: 'width=device-width, initial-scale=1',
          canonicalURL,
          structuredData: {
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: article.title,
            description: article.metaDescription,
            datePublished: article.publishedDate,
            mainEntityOfPage: canonicalURL,
            author: {
              '@type': 'Organization',
              name: 'Matrimony Justice',
            },
            publisher: {
              '@type': 'Organization',
              name: 'Matrimony Justice',
            },
          },
          openGraph: {
            ogTitle: article.ogTitle,
            ogDescription: article.ogDescription,
            ogImage: imageId,
            ogUrl: canonicalURL,
            ogType: 'article',
          },
        },
      },
      status: 'published',
    });
    strapi.log.info(`[seed] Published ${article.slug}`);
  }
}

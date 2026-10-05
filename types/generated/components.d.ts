import type { Schema, Struct } from '@strapi/strapi';

export interface AboutLeader extends Struct.ComponentSchema {
  collectionName: 'components_about_leaders';
  info: {
    displayName: 'Leader';
    icon: 'user';
  };
  attributes: {
    bio: Schema.Attribute.Text;
    credential: Schema.Attribute.String;
    initials: Schema.Attribute.String;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    photo: Schema.Attribute.Media<'images'>;
    role: Schema.Attribute.String;
    tags: Schema.Attribute.Text;
  };
}

export interface AboutMilestone extends Struct.ComponentSchema {
  collectionName: 'components_about_milestones';
  info: {
    displayName: 'Milestone';
    icon: 'flag';
  };
  attributes: {
    body: Schema.Attribute.Text & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface AboutPrinciple extends Struct.ComponentSchema {
  collectionName: 'components_about_principles';
  info: {
    displayName: 'Principle';
    icon: 'shield';
  };
  attributes: {
    body: Schema.Attribute.Text & Schema.Attribute.Required;
    number: Schema.Attribute.String & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ContactChoice extends Struct.ComponentSchema {
  collectionName: 'components_contact_choices';
  info: {
    displayName: 'Choice';
    icon: 'bulletList';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ContactEmail extends Struct.ComponentSchema {
  collectionName: 'components_contact_emails';
  info: {
    displayName: 'Email';
    icon: 'envelop';
  };
  attributes: {
    address: Schema.Attribute.Email & Schema.Attribute.Required;
  };
}

export interface ContactFaq extends Struct.ComponentSchema {
  collectionName: 'components_contact_faqs';
  info: {
    displayName: 'FAQ';
    icon: 'question';
  };
  attributes: {
    answer: Schema.Attribute.Text & Schema.Attribute.Required;
    question: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ContactStat extends Struct.ComponentSchema {
  collectionName: 'components_contact_stats';
  info: {
    displayName: 'Stat';
    icon: 'chartPie';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ContactTrustItem extends Struct.ComponentSchema {
  collectionName: 'components_contact_trust_items';
  info: {
    displayName: 'Trust item';
    icon: 'shield';
  };
  attributes: {
    detail: Schema.Attribute.String & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HelpCenterAction extends Struct.ComponentSchema {
  collectionName: 'components_help_center_actions';
  info: {
    displayName: 'Help action';
    icon: 'link';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HelpCenterFaq extends Struct.ComponentSchema {
  collectionName: 'components_help_center_faqs';
  info: {
    displayName: 'Help question';
    icon: 'question';
  };
  attributes: {
    answer: Schema.Attribute.Text & Schema.Attribute.Required;
    question: Schema.Attribute.String & Schema.Attribute.Required;
    topic: Schema.Attribute.Enumeration<
      ['filing', 'checklists', 'mediation', 'decrees']
    > &
      Schema.Attribute.Required;
  };
}

export interface HelpCenterFilter extends Struct.ComponentSchema {
  collectionName: 'components_help_center_filters';
  info: {
    displayName: 'Help filter';
    icon: 'filter';
  };
  attributes: {
    key: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HelpCenterGuide extends Struct.ComponentSchema {
  collectionName: 'components_help_center_guides';
  info: {
    displayName: 'Help guide';
    icon: 'book';
  };
  attributes: {
    body: Schema.Attribute.Text & Schema.Attribute.Required;
    code: Schema.Attribute.String & Schema.Attribute.Required;
    detail: Schema.Attribute.Text & Schema.Attribute.Required;
    href: Schema.Attribute.String & Schema.Attribute.Required;
    meta: Schema.Attribute.String;
    slug: Schema.Attribute.String & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    topic: Schema.Attribute.Enumeration<
      ['filing', 'checklists', 'mediation', 'decrees']
    > &
      Schema.Attribute.Required;
  };
}

export interface HelpCenterPoint extends Struct.ComponentSchema {
  collectionName: 'components_help_center_points';
  info: {
    displayName: 'Help point';
    icon: 'check';
  };
  attributes: {
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HelpCenterStep extends Struct.ComponentSchema {
  collectionName: 'components_help_center_steps';
  info: {
    displayName: 'Help step';
    icon: 'walk';
  };
  attributes: {
    body: Schema.Attribute.Text & Schema.Attribute.Required;
    duration: Schema.Attribute.String & Schema.Attribute.Required;
    number: Schema.Attribute.String & Schema.Attribute.Required;
    points: Schema.Attribute.Component<'help-center.point', true>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    topic: Schema.Attribute.Enumeration<
      ['filing', 'checklists', 'mediation', 'decrees']
    > &
      Schema.Attribute.Required;
  };
}

export interface HomeLink extends Struct.ComponentSchema {
  collectionName: 'components_home_links';
  info: {
    displayName: 'Link';
    icon: 'link';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HomeStat extends Struct.ComponentSchema {
  collectionName: 'components_home_stats';
  info: {
    displayName: 'Stat';
    icon: 'chartPie';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface NewsFaq extends Struct.ComponentSchema {
  collectionName: 'components_news_faqs';
  info: {
    displayName: 'FAQ';
    icon: 'bulletList';
  };
  attributes: {
    items: Schema.Attribute.Component<'news.faq-item', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
  };
}

export interface NewsFaqItem extends Struct.ComponentSchema {
  collectionName: 'components_news_faq_items';
  info: {
    displayName: 'FAQ item';
    icon: 'question';
  };
  attributes: {
    answer: Schema.Attribute.Text & Schema.Attribute.Required;
    question: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface NewsMedia extends Struct.ComponentSchema {
  collectionName: 'components_news_media';
  info: {
    displayName: 'Image';
    icon: 'picture';
  };
  attributes: {
    caption: Schema.Attribute.String;
    file: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

export interface NewsQuote extends Struct.ComponentSchema {
  collectionName: 'components_news_quotes';
  info: {
    displayName: 'Quote';
    icon: 'quote';
  };
  attributes: {
    attribution: Schema.Attribute.String;
    quote: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface NewsRichText extends Struct.ComponentSchema {
  collectionName: 'components_news_rich_texts';
  info: {
    displayName: 'Rich text';
    icon: 'align-left';
  };
  attributes: {
    body: Schema.Attribute.Blocks & Schema.Attribute.Required;
  };
}

export interface NewsVideo extends Struct.ComponentSchema {
  collectionName: 'components_news_videos';
  info: {
    displayName: 'Video';
    icon: 'play';
  };
  attributes: {
    caption: Schema.Attribute.String;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ServicesPageBullet extends Struct.ComponentSchema {
  collectionName: 'components_services_page_bullets';
  info: {
    displayName: 'Bullet';
    icon: 'bulletList';
  };
  attributes: {
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ServicesPageHighlight extends Struct.ComponentSchema {
  collectionName: 'components_services_page_highlights';
  info: {
    displayName: 'Highlight';
    icon: 'chartPie';
  };
  attributes: {
    detail: Schema.Attribute.String;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ServicesPagePracticeArea extends Struct.ComponentSchema {
  collectionName: 'components_services_page_areas';
  info: {
    displayName: 'Practice area';
    icon: 'briefcase';
  };
  attributes: {
    badge: Schema.Attribute.String;
    body: Schema.Attribute.Text & Schema.Attribute.Required;
    bullets: Schema.Attribute.Component<'services-page.bullet', true>;
    ctaLabel: Schema.Attribute.String;
    ctaUrl: Schema.Attribute.String;
    meta: Schema.Attribute.String;
    number: Schema.Attribute.String & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ServicesPageStandard extends Struct.ComponentSchema {
  collectionName: 'components_services_page_standards';
  info: {
    displayName: 'Standard';
    icon: 'check';
  };
  attributes: {
    body: Schema.Attribute.Text & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedNavLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_nav_links';
  info: {
    displayName: 'Nav link';
    icon: 'link';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedOpenGraph extends Struct.ComponentSchema {
  collectionName: 'components_shared_open_graphs';
  info: {
    displayName: 'openGraph';
    icon: 'project-diagram';
  };
  attributes: {
    ogDescription: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    ogImage: Schema.Attribute.Media<'images'>;
    ogTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
    ogType: Schema.Attribute.String;
    ogUrl: Schema.Attribute.String;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    displayName: 'seo';
    icon: 'search';
  };
  attributes: {
    canonicalURL: Schema.Attribute.String;
    keywords: Schema.Attribute.Text;
    metaDescription: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
        minLength: 50;
      }>;
    metaImage: Schema.Attribute.Media<'images'>;
    metaRobots: Schema.Attribute.String;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    metaViewport: Schema.Attribute.String;
    openGraph: Schema.Attribute.Component<'shared.open-graph', false>;
    structuredData: Schema.Attribute.JSON;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'about.leader': AboutLeader;
      'about.milestone': AboutMilestone;
      'about.principle': AboutPrinciple;
      'contact.choice': ContactChoice;
      'contact.email': ContactEmail;
      'contact.faq': ContactFaq;
      'contact.stat': ContactStat;
      'contact.trust-item': ContactTrustItem;
      'help-center.action': HelpCenterAction;
      'help-center.faq': HelpCenterFaq;
      'help-center.filter': HelpCenterFilter;
      'help-center.guide': HelpCenterGuide;
      'help-center.point': HelpCenterPoint;
      'help-center.step': HelpCenterStep;
      'home.link': HomeLink;
      'home.stat': HomeStat;
      'news.faq': NewsFaq;
      'news.faq-item': NewsFaqItem;
      'news.media': NewsMedia;
      'news.quote': NewsQuote;
      'news.rich-text': NewsRichText;
      'news.video': NewsVideo;
      'services-page.bullet': ServicesPageBullet;
      'services-page.highlight': ServicesPageHighlight;
      'services-page.practice-area': ServicesPagePracticeArea;
      'services-page.standard': ServicesPageStandard;
      'shared.nav-link': SharedNavLink;
      'shared.open-graph': SharedOpenGraph;
      'shared.seo': SharedSeo;
    }
  }
}

import type { Schema, Struct } from '@strapi/strapi';

export interface BlocksAllEvents extends Struct.ComponentSchema {
  collectionName: 'components_blocks_all_events';
  info: {
    displayName: 'Events';
    icon: 'write';
  };
  attributes: {
    header: Schema.Attribute.Component<'elements.section-header', false>;
  };
}

export interface BlocksCardsCarousel extends Struct.ComponentSchema {
  collectionName: 'components_blocks_cards_carousels';
  info: {
    displayName: 'Cards Carousel';
    icon: 'rotate';
  };
  attributes: {
    cards: Schema.Attribute.Component<'elements.feature-card', true> &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    header: Schema.Attribute.Component<'elements.section-header', false>;
  };
}

export interface BlocksCourseCarousel extends Struct.ComponentSchema {
  collectionName: 'components_blocks_course_carousels';
  info: {
    displayName: 'Courses Carousel';
    icon: 'write';
  };
  attributes: {
    courses: Schema.Attribute.Relation<'oneToMany', 'api::course.course'>;
    header: Schema.Attribute.Component<'elements.section-header', false>;
  };
}

export interface BlocksCtaBlock extends Struct.ComponentSchema {
  collectionName: 'components_blocks_cta_blocks';
  info: {
    displayName: 'CTA Block';
    icon: 'bell';
  };
  attributes: {
    buttons: Schema.Attribute.Component<'shared.button', true> &
      Schema.Attribute.SetMinMax<
        {
          max: 2;
        },
        number
      >;
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface BlocksDefault extends Struct.ComponentSchema {
  collectionName: 'components_blocks_defaults';
  info: {
    displayName: 'Default';
    icon: 'star';
  };
  attributes: {
    ctas: Schema.Attribute.Component<'shared.button', true> &
      Schema.Attribute.SetMinMax<
        {
          max: 2;
        },
        number
      >;
    header: Schema.Attribute.Component<'elements.section-header', false>;
    image: Schema.Attribute.Media<'images'>;
  };
}

export interface BlocksFeatures extends Struct.ComponentSchema {
  collectionName: 'components_blocks_features';
  info: {
    displayName: 'Features';
    icon: 'star';
  };
  attributes: {
    cards: Schema.Attribute.Component<'elements.feature-card', true>;
    header: Schema.Attribute.Component<'elements.section-header', true>;
  };
}

export interface BlocksHero extends Struct.ComponentSchema {
  collectionName: 'components_blocks_heroes';
  info: {
    displayName: 'Hero';
    icon: 'write';
  };
  attributes: {
    loop: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    slides: Schema.Attribute.Component<'shared.slide', true> &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
  };
}

export interface BlocksPricings extends Struct.ComponentSchema {
  collectionName: 'components_blocks_pricings';
  info: {
    displayName: 'Pricings';
    icon: 'write';
  };
  attributes: {
    header: Schema.Attribute.Component<'elements.section-header', false>;
    plans: Schema.Attribute.Component<'elements.pricing-plan', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 4;
          min: 1;
        },
        number
      >;
  };
}

export interface ElementsFeatureCard extends Struct.ComponentSchema {
  collectionName: 'components_elements_feature_cards';
  info: {
    displayName: 'Feature Card';
    icon: 'file';
  };
  attributes: {
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String;
  };
}

export interface ElementsPricingPlan extends Struct.ComponentSchema {
  collectionName: 'components_elements_pricing_plans';
  info: {
    displayName: 'Pricing Plan';
    icon: 'write';
  };
  attributes: {
    badge: Schema.Attribute.String;
    billing_details: Schema.Attribute.String;
    cta: Schema.Attribute.Component<'shared.button', false>;
    details: Schema.Attribute.RichText;
    price: Schema.Attribute.String & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsSectionHeader extends Struct.ComponentSchema {
  collectionName: 'components_elements_section_headers';
  info: {
    displayName: 'Section Header';
    icon: 'emotionHappy';
  };
  attributes: {
    description: Schema.Attribute.String;
    eyebrow: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface SharedButton extends Struct.ComponentSchema {
  collectionName: 'components_shared_buttons';
  info: {
    displayName: 'Button';
    icon: 'write';
  };
  attributes: {
    className: Schema.Attribute.String;
    disabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    Link: Schema.Attribute.Component<'shared.link', false>;
    variant: Schema.Attribute.Enumeration<
      ['primary', 'secondary', 'tertiary', 'destructive', 'ghost']
    > &
      Schema.Attribute.DefaultTo<'primary'>;
  };
}

export interface SharedDatepicker extends Struct.ComponentSchema {
  collectionName: 'components_shared_datepickers';
  info: {
    displayName: 'Datepicker';
    icon: 'calendar';
  };
  attributes: {
    date: Schema.Attribute.DateTime;
  };
}

export interface SharedLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_links';
  info: {
    displayName: 'Link';
    icon: 'link';
  };
  attributes: {
    href: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    target: Schema.Attribute.Enumeration<['_self', '_blank']> &
      Schema.Attribute.DefaultTo<'_blank'>;
  };
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    displayName: 'Media';
    icon: 'landscape';
  };
  attributes: {
    desktop: Schema.Attribute.Media<'images' | 'videos'>;
    mobile: Schema.Attribute.Media<'images' | 'videos'>;
    tablet: Schema.Attribute.Media<'images' | 'videos'>;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'Seo';
    icon: 'allergies';
    name: 'Seo';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedSlide extends Struct.ComponentSchema {
  collectionName: 'components_shared_slides';
  info: {
    displayName: 'Slide';
    icon: 'write';
  };
  attributes: {
    buttons: Schema.Attribute.Component<'shared.button', true> &
      Schema.Attribute.SetMinMax<
        {
          max: 2;
        },
        number
      >;
    media: Schema.Attribute.Component<'shared.media', false>;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'blocks.all-events': BlocksAllEvents;
      'blocks.cards-carousel': BlocksCardsCarousel;
      'blocks.course-carousel': BlocksCourseCarousel;
      'blocks.cta-block': BlocksCtaBlock;
      'blocks.default': BlocksDefault;
      'blocks.features': BlocksFeatures;
      'blocks.hero': BlocksHero;
      'blocks.pricings': BlocksPricings;
      'elements.feature-card': ElementsFeatureCard;
      'elements.pricing-plan': ElementsPricingPlan;
      'elements.section-header': ElementsSectionHeader;
      'shared.button': SharedButton;
      'shared.datepicker': SharedDatepicker;
      'shared.link': SharedLink;
      'shared.media': SharedMedia;
      'shared.seo': SharedSeo;
      'shared.slide': SharedSlide;
    }
  }
}

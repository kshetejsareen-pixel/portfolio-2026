export type PortfolioWork = {
  title: string
  subtitle: string
  accent: string
  gradient: string
}

export type PortfolioCategory = {
  slug: string
  label: string
  title: string
  description: string
  hero: {
    eyebrow: string
    headline: string
    lead: string
  }
  seoDescription: string
  works: PortfolioWork[]
}

export const categories: PortfolioCategory[] = [
  {
    slug: 'food',
    label: 'F&B x Lifestyle',
    title: 'F&B x Lifestyle',
    description:
      'Editorial dining and lifestyle imagery crafted for premium hospitality, chef-led brands, and luxury food experiences.',
    hero: {
      eyebrow: 'Category',
      headline: 'Where flavour meets atmosphere',
      lead:
        'A portfolio of refined food and lifestyle photography designed to make every plate, service moment and brand story feel cinematic.',
    },
    seoDescription:
      'Explore luxury F&B and lifestyle photography for restaurants, bars, hotels and premium culinary brands.',
    works: [
      {
        title: 'Candlelit dining narrative',
        subtitle: 'Atmospheric hospitality storytelling with warm light and texture.',
        accent: 'Editorial cuisine',
        gradient: '#D4A97E 0%, #1D1B18 45%, #0A0A0A 100%',
      },
      {
        title: 'Chef at work',
        subtitle: 'Signature imagery for culinary leaders and bespoke menus.',
        accent: 'Chef portrait',
        gradient: '#E3B18D 0%, #1D1B18 45%, #0A0A0A 100%',
      },
      {
        title: 'Lifestyle hospitality',
        subtitle: 'Curated moments that feel intimate yet aspirational.',
        accent: 'Luxury living',
        gradient: '#B19A81 0%, #1D1B18 45%, #0A0A0A 100%',
      },
    ],
  },
  {
    slug: 'interiors',
    label: 'Interiors & Architecture',
    title: 'Interiors & Architecture',
    description:
      'Interior and architectural photography for premium spaces, hotels, private residences and commercial landmarks.',
    hero: {
      eyebrow: 'Category',
      headline: 'Designed spaces, captured with intent',
      lead:
        'Imagery that reveals materiality and light across interiors and architecture, created for ambitious brands and visionary spaces.',
    },
    seoDescription:
      'Discover premium interiors and architecture photography for luxury hospitality and residential brands.',
    works: [
      {
        title: 'Modern hospitality room',
        subtitle: 'Soft natural light and refined spatial composition.',
        accent: 'Hotel interiors',
        gradient: '#7A6B55 0%, #1D1B18 45%, #0A0A0A 100%',
      },
      {
        title: 'Architectural detail',
        subtitle: 'Monumental geometry made intimate and tactile.',
        accent: 'Built form',
        gradient: '#927B64 0%, #1D1B18 45%, #0A0A0A 100%',
      },
      {
        title: 'Residential sanctuary',
        subtitle: 'Timeless calm for luxury living environments.',
        accent: 'Private residence',
        gradient: '#908670 0%, #1D1B18 45%, #0A0A0A 100%',
      },
    ],
  },
  {
    slug: 'portraits',
    label: 'Founder Portraits',
    title: 'Founder Portraits',
    description:
      'Powerful founder portraiture for brand leaders, visionaries and creative founders.',
    hero: {
      eyebrow: 'Category',
      headline: 'Portraits that feel authoritative and intimate',
      lead:
        'Fine-art portraiture that captures leadership, character and the brand story behind the lens.',
    },
    seoDescription:
      'Browse elegant founder and leadership portrait photography crafted for luxury brands.',
    works: [
      {
        title: 'Founder in situ',
        subtitle: 'A portrait that connects vision with environment.',
        accent: 'Executive identity',
        gradient: '#9F8B78 0%, #1D1B18 45%, #0A0A0A 100%',
      },
      {
        title: 'Studio intensity',
        subtitle: 'Classic portraiture with cinematic lighting.',
        accent: 'Creative leader',
        gradient: '#B7A38C 0%, #1D1B18 45%, #0A0A0A 100%',
      },
      {
        title: 'Editorial profile',
        subtitle: 'Elevated imagery for brand storytelling and investor-facing work.',
        accent: 'Brand narrative',
        gradient: '#AFA38C 0%, #1D1B18 45%, #0A0A0A 100%',
      },
    ],
  },
  {
    slug: 'products',
    label: 'Products',
    title: 'Products',
    description:
      'Product photography that delivers premium detail, texture and desirable brand presentation.',
    hero: {
      eyebrow: 'Category',
      headline: 'Products, elevated for premium shelf presence',
      lead:
        'Luxury product imagery for packaging, storefront, editorial and digital commerce experiences.',
    },
    seoDescription:
      'Explore premium product photography for high-end brands and luxury goods.',
    works: [
      {
        title: 'Fine detail study',
        subtitle: 'A tactile focus on craftsmanship and material.',
        accent: 'Artisan product',
        gradient: '#C6B7A4 0%, #1D1B18 45%, #0A0A0A 100%',
      },
      {
        title: 'Story-led packshot',
        subtitle: 'Product narratives built for branding and digital launches.',
        accent: 'Luxury packaging',
        gradient: '#BFAE98 0%, #1D1B18 45%, #0A0A0A 100%',
      },
      {
        title: 'Minimal editorial',
        subtitle: 'Aesthetic product presentation with premium restraint.',
        accent: 'Clean design',
        gradient: '#A89F8E 0%, #1D1B18 45%, #0A0A0A 100%',
      },
    ],
  },
]

export const categoryMap = categories.reduce<Record<string, PortfolioCategory>>(
  (map, category) => {
    map[category.slug] = category
    return map
  }, {}
)

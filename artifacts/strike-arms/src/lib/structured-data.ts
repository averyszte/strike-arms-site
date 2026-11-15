/**
 * Schema.org JSON-LD builders (pure functions returning plain objects).
 * Render the output with the <JsonLd> component.
 *
 * Rules: never fabricate data. No aggregateRating unless real review counts
 * exist; no geo coordinates until confirmed. Prices are real catalogue values.
 */
import type { GlossaryTerm } from '@/lib/glossary';
import { SITE_URL, SITE_NAME, SITE_LEGAL_NAME, BUSINESS, toAbsoluteUrl } from '@/lib/site-config';
import { READ_REVIEWS_URL } from '@/lib/google-review-links';

export { buildProductSchema } from '@/lib/product-schema';

export type JsonLdObject = Record<string, unknown>;

export type BreadcrumbEntry = {
  name: string;
  path: string;
};

/**
 * A raster logo: Google wants at least 112 px and does not take SVG. The
 * 180 px touch icon is the largest raster mark in public/ until a 512 px logo
 * exists (N-008).
 */
const LOGO_PATH = '/apple-touch-icon.png';

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const STORE_ID = `${SITE_URL}/#store`;

/**
 * A minimal, self-contained Organization node for pages that do not carry the
 * full one. A bare `{ "@id" }` only resolves on a page that also defines the
 * node, which only Home does, so validators reported it as unresolved (N-008).
 */
function organizationRef(): JsonLdObject {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_LEGAL_NAME,
    url: SITE_URL,
    logo: toAbsoluteUrl(LOGO_PATH),
  };
}

function postalAddress(): JsonLdObject {
  return {
    '@type': 'PostalAddress',
    streetAddress: BUSINESS.streetAddress,
    addressLocality: BUSINESS.addressLocality,
    addressRegion: BUSINESS.addressRegion,
    postalCode: BUSINESS.postalCode,
    addressCountry: BUSINESS.addressCountry,
  };
}

/** The same for the shop itself, as a Service's provider. */
function storeRef(): JsonLdObject {
  return {
    '@type': 'SportingGoodsStore',
    '@id': STORE_ID,
    name: BUSINESS.name,
    url: SITE_URL,
    telephone: BUSINESS.telephone,
  };
}

export function buildOrganizationSchema(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    ...organizationRef(),
    // Google's Rich Results Test reads an Organization with a phone number as a
    // local business, and flags it without an address and image.
    image: toAbsoluteUrl(LOGO_PATH),
    telephone: BUSINESS.telephone,
    address: postalAddress(),
  };
}

export function buildWebsiteSchema(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { '@id': ORGANIZATION_ID },
  };
}

export function buildLocalBusinessSchema(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    ...storeRef(),
    image: toAbsoluteUrl(LOGO_PATH),
    // The Google Maps listing for the shop's Place ID (review-bank.ts), or the
    // address search when no Place ID is set.
    hasMap: READ_REVIEWS_URL,
    address: postalAddress(),
    openingHoursSpecification: BUSINESS.openingHours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
  };
}

export function buildItemListSchema(items: { name: string; path: string }[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: toAbsoluteUrl(item.path),
    })),
  };
}

export function buildBreadcrumbSchema(items: BreadcrumbEntry[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.path),
    })),
  };
}

export function buildDefinedTermSetSchema(
  name: string,
  path: string,
  terms: GlossaryTerm[],
): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name,
    url: toAbsoluteUrl(path),
    hasDefinedTerm: terms.map((entry) => ({
      '@type': 'DefinedTerm',
      name: entry.term,
      description: entry.definition,
      url: `${toAbsoluteUrl(path)}#${entry.slug}`,
    })),
  };
}

export type FaqItem = {
  question: string;
  answer: string;
};

export function buildArticleSchema(opts: {
  title: string;
  description: string;
  path: string;
  isoDate: string;
  /** The guide's hero image, site-relative or absolute. Omitted when absent. */
  image?: string;
}): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    url: toAbsoluteUrl(opts.path),
    ...(opts.image ? { image: toAbsoluteUrl(opts.image) } : {}),
    datePublished: opts.isoDate,
    dateModified: opts.isoDate,
    author: { '@type': 'Organization', name: SITE_LEGAL_NAME },
    publisher: organizationRef(),
  };
}

export function buildServiceSchema(opts: {
  name: string;
  description: string;
  path: string;
  serviceType: string;
}): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    description: opts.description,
    serviceType: opts.serviceType,
    url: toAbsoluteUrl(opts.path),
    provider: storeRef(),
    areaServed: { '@type': 'Country', name: 'Ireland' },
  };
}

export function buildFaqSchema(items: FaqItem[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

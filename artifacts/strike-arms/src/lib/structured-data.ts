/**
 * Schema.org JSON-LD builders (pure functions returning plain objects).
 * Render the output with the <JsonLd> component.
 *
 * Rules: never fabricate data. No aggregateRating unless real review counts
 * exist; no geo coordinates until confirmed. Prices are real catalogue values.
 */
import type { Product } from '@/types/product';
import type { GlossaryTerm } from '@/lib/glossary';
import { SITE_URL, SITE_NAME, SITE_LEGAL_NAME, BUSINESS, toAbsoluteUrl } from '@/lib/site-config';
import { getBrandName } from '@/lib/brands';

export type JsonLdObject = Record<string, unknown>;

export type BreadcrumbEntry = {
  name: string;
  path: string;
};

export function buildOrganizationSchema(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_LEGAL_NAME,
    url: SITE_URL,
    logo: toAbsoluteUrl('/favicon.svg'),
    telephone: BUSINESS.telephone,
  };
}

export function buildWebsiteSchema(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}

export function buildLocalBusinessSchema(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportingGoodsStore',
    '@id': `${SITE_URL}/#store`,
    name: BUSINESS.name,
    url: SITE_URL,
    telephone: BUSINESS.telephone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS.streetAddress,
      addressLocality: BUSINESS.addressLocality,
      addressRegion: BUSINESS.addressRegion,
      postalCode: BUSINESS.postalCode,
      addressCountry: BUSINESS.addressCountry,
    },
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
}): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    url: toAbsoluteUrl(opts.path),
    datePublished: opts.isoDate,
    dateModified: opts.isoDate,
    author: { '@type': 'Organization', name: SITE_LEGAL_NAME },
    publisher: { '@id': `${SITE_URL}/#organization` },
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

export function buildProductSchema(product: Product): JsonLdObject {
  const priceCents = product.salePrice ?? product.price;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription,
    sku: product.id,
    brand: { '@type': 'Brand', name: getBrandName(product.brand) },
    image: product.images.map((image) => toAbsoluteUrl(image)),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price: (priceCents / 100).toFixed(2),
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      url: `${SITE_URL}/products/${product.slug}`,
    },
  };
}

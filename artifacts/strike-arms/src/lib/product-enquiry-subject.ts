/**
 * The contact form's subject when a product page sent the shopper there
 * (`/contact?product=<slug>`, N-058). Only a slug-shaped value is used, so a
 * hand-made link cannot put arbitrary text in the form.
 */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function productEnquirySubject(search: string): string {
  const slug = new URLSearchParams(search).get('product') ?? '';
  if (slug.length === 0 || slug.length > 120 || !SLUG_PATTERN.test(slug)) return '';
  return `Question about: ${slug.replace(/-/g, ' ')}`;
}

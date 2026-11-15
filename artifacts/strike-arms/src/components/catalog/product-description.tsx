import { descriptionParagraphs } from '@/lib/description-paragraphs';

/**
 * The product's full description under the gallery and buy box (N-052).
 * Single line breaks inside a paragraph are kept, so spec lists stay one item
 * per line. A plain section rather than an accordion: the shadcn trigger
 * already sits in an h3, so a real "Details" h2 could not live inside it.
 */
export function ProductDescription({ description }: { description: string | null | undefined }) {
  const paragraphs = descriptionParagraphs(description);
  if (paragraphs.length === 0) return null;

  return (
    <section aria-labelledby="product-details-heading" className="mt-12 border-t border-border/60 pt-8">
      <h2
        id="product-details-heading"
        className="text-lg font-black uppercase tracking-tight text-foreground"
      >
        Details
      </h2>
      <div className="mt-4 max-w-3xl space-y-4 text-sm md:text-base leading-relaxed text-muted-foreground">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="whitespace-pre-line break-words">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}

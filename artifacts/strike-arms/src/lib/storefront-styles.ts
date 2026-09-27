/**
 * The storefront's type and button vocabulary, lifted from the homepage
 * (Direction D, src/components/demo/combined). Every public page composes these
 * strings so a heading or a CTA reads the same wherever it appears. Plain class
 * strings, not components: they go on a Link, an <a>, or a shadcn Button's
 * className alike.
 */

/** Small tracked label above a heading ("The range", "Workshop service"). */
export const EYEBROW = 'text-xs font-black uppercase tracking-[0.3em] text-accent';

/** Page title in a PageHero. */
export const DISPLAY_TITLE =
  'font-black uppercase tracking-tight leading-[0.9] text-foreground text-4xl md:text-6xl';

/** Compact page title, for utility pages (cart, account, sign-in). */
export const DISPLAY_TITLE_COMPACT =
  'font-black uppercase tracking-tight leading-[0.9] text-foreground text-3xl md:text-5xl';

/** A band's heading, one step down from the homepage's section h2. */
export const SECTION_TITLE =
  'font-black uppercase tracking-tight leading-[0.9] text-foreground text-3xl md:text-5xl';

/** A heading inside long-form content (guides, service pages, legal). */
export const CONTENT_TITLE =
  'font-black uppercase tracking-tight leading-[0.95] text-foreground text-2xl md:text-3xl';

/** A card or panel heading. */
export const CARD_TITLE = 'font-black uppercase tracking-tight leading-tight text-foreground';

/** Solid accent CTA. Near-black text on the accent, inverts on hover. */
export const CTA_PRIMARY =
  'group inline-flex h-14 items-center justify-center gap-2 rounded-none bg-accent px-8 ' +
  'text-sm md:text-base font-black uppercase tracking-wider text-accent-foreground ' +
  'transition-colors hover:bg-foreground hover:text-background disabled:opacity-50';

/** Outlined companion to CTA_PRIMARY. */
export const CTA_SECONDARY =
  'inline-flex h-14 items-center justify-center gap-2 rounded-none border-2 border-border ' +
  'bg-transparent px-8 text-sm md:text-base font-black uppercase tracking-wider text-foreground ' +
  'transition-colors hover:border-accent hover:text-accent disabled:opacity-50';

/** Smaller CTA for inline rows, cards and forms. */
export const CTA_PRIMARY_SM =
  'group inline-flex h-11 items-center justify-center gap-2 rounded-none bg-accent px-6 ' +
  'text-xs md:text-sm font-black uppercase tracking-wider text-accent-foreground ' +
  'transition-colors hover:bg-foreground hover:text-background disabled:opacity-50';

export const CTA_SECONDARY_SM =
  'inline-flex h-11 items-center justify-center gap-2 rounded-none border-2 border-border ' +
  'bg-transparent px-6 text-xs md:text-sm font-black uppercase tracking-wider text-foreground ' +
  'transition-colors hover:border-accent hover:text-accent disabled:opacity-50';

/** Arrow that nudges right when its group-hover CTA is hovered. */
export const CTA_ARROW = 'h-5 w-5 transition-transform group-hover:translate-x-1';

/** Inline text link in body copy. */
export const TEXT_LINK = 'font-bold text-accent hover:underline';

/** Card / panel surface. */
export const PANEL = 'border border-border/60 bg-card';

/** Shared grid-paper texture for dark bands (the homepage's final CTA). */
export const GRID_TEXTURE =
  'bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),' +
  'linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:32px_32px]';

/** Content column widths, shared by a PageHero and the body below it. */
export const PAGE_WIDTHS = {
  narrow: 'max-w-3xl',
  medium: 'max-w-5xl',
  wide: 'max-w-[1400px]',
} as const;

export type PageWidth = keyof typeof PAGE_WIDTHS;

/** tel: link for the shop phone, from its display form. */
export function phoneHref(display: string): string {
  return `tel:${display.replace(/[^\d+]/g, '')}`;
}

/**
 * Child-selector typography for long-form bodies (guides, legal, info pages),
 * so the page files stay plain semantic HTML. Headings match CONTENT_TITLE.
 */
export const ARTICLE_PROSE =
  'text-foreground ' +
  '[&_h2]:mt-14 [&_h2]:text-2xl md:[&_h2]:text-3xl [&_h2]:font-black [&_h2]:uppercase ' +
  '[&_h2]:tracking-tight [&_h2]:leading-[0.95] [&_h2]:text-foreground ' +
  '[&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-black [&_h3]:uppercase [&_h3]:tracking-wide [&_h3]:text-foreground ' +
  '[&_p]:mt-4 [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_strong]:text-foreground ' +
  '[&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:text-muted-foreground ' +
  '[&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_ol]:text-muted-foreground ' +
  '[&_li::marker]:text-accent [&_a]:font-bold [&_a]:text-accent hover:[&_a]:underline ' +
  '[&_table]:mt-6 [&_table]:w-full [&_table]:border [&_table]:border-border/60 [&_table]:text-sm ' +
  '[&_th]:bg-card [&_th]:px-3 [&_th]:py-2.5 [&_th]:text-left [&_th]:text-xs [&_th]:font-black ' +
  '[&_th]:uppercase [&_th]:tracking-wider [&_th]:text-foreground ' +
  '[&_td]:border-t [&_td]:border-border/60 [&_td]:px-3 [&_td]:py-2.5 [&_td]:text-muted-foreground';

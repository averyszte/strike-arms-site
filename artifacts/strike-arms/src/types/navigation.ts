// Shapes for the site header's navigation data.

export type MegaColumn = { title: string; links: { label: string; href: string }[] };
/** `allLabel` is the "Shop all" link at the top of the item's menu, to `href`. */
export type NavItem = { name: string; href: string; allLabel?: string; mega?: MegaColumn[] };
/** One mobile drawer group; `href` and `allLabel` give it a "Shop all" link. */
export type NavLinkGroup = {
  title: string;
  href?: string;
  allLabel?: string;
  links: { label: string; href: string }[];
};

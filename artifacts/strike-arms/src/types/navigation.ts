// Shapes for the site header's navigation data.

export type MegaColumn = { title: string; links: { label: string; href: string }[] };
export type NavItem = { name: string; href: string; mega?: MegaColumn[] };

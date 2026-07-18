/**
 * Brand slug -> display name. Single source of truth for brand labels,
 * shared by the products repository (data) and UI (product pages, cards).
 */
export const BRAND_NAMES: Record<string, string> = {
  'specna-arms': 'Specna Arms',
  'gandg': 'G&G',
  'ics': 'ICS',
  'krytac': 'Krytac',
  'tokyo-marui': 'Tokyo Marui',
  'asg': 'ASG',
  'we': 'WE',
  'vfc': 'VFC',
  'nuprol': 'Nuprol',
  'vorsk': 'Vorsk',
  'valken': 'Valken',
  'zci': 'ZCI',
  'shs': 'SHS',
  'perun': 'Perun',
  'acetech': 'Acetech',
};

export function getBrandName(slug: string): string {
  return BRAND_NAMES[slug] ?? slug.replace(/-/g, ' ');
}

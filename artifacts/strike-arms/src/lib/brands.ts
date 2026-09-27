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
  'umarex': 'Umarex',
  'action-army': 'Action Army',
  'cyma': 'CYMA',
  'jg': 'JG',
  'abbey': 'Abbey',
  'bolle': 'Bolle',
  'unbranded': 'Unbranded',
  'bushnell': 'Bushnell',
  'double-bell': 'Double Bell',
  'evolution': 'Evolution',
  'gemtech': 'Gemtech',
  'invader-gear': 'Invader Gear',
  'viper-tactical': 'Viper Tactical',
  'well': 'Well',
};

export function getBrandName(slug: string): string {
  return BRAND_NAMES[slug] ?? slug.replace(/-/g, ' ');
}

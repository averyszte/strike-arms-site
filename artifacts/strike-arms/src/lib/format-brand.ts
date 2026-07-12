const BRAND_DISPLAY_NAMES: Record<string, string> = {
  'gandg': 'G&G',
  'specna-arms': 'Specna Arms',
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

export function formatBrand(slug: string): string {
  return BRAND_DISPLAY_NAMES[slug] ?? slug.replace(/-/g, ' ');
}

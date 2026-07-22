const WORD_MAP: Record<string, string> = {
  aeg: 'AEG', gbb: 'GBB', gbbr: 'GBBR',
  smgs: 'SMGs', co2: 'CO2', bbs: 'BBs', hpa: 'HPA',
};

export function formatSubcategoryName(slug: string): string {
  return slug
    .split('-')
    .map(w => WORD_MAP[w] ?? (w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
}

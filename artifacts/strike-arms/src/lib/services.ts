/**
 * Services registry — single source of truth for the /services hub, the header
 * nav and the sitemap. Add an entry here when a new service page ships.
 */
export type ServiceIcon = 'wrench' | 'zap' | 'crosshair' | 'cog' | 'hammer' | 'gauge';

export type ServiceSummary = {
  title: string;
  navLabel: string;
  path: string;
  summary: string;
  icon: ServiceIcon;
};

export const SERVICES: ServiceSummary[] = [
  {
    title: 'Airsoft Repairs',
    navLabel: 'Repairs',
    path: '/services/repairs',
    summary:
      'Diagnosis and repair for AEGs, gas and spring guns. We find the actual fault before quoting.',
    icon: 'wrench',
  },
  {
    title: 'Airsoft Upgrades',
    navLabel: 'Upgrades',
    path: '/services/upgrades',
    summary:
      'Upgrades that solve a measured problem, not a shopping list. Honest advice on what will not help.',
    icon: 'zap',
  },
  {
    title: 'Hop-Up Tuning',
    navLabel: 'Hop-Up Tuning',
    path: '/services/hop-up-tuning',
    summary:
      'Bench tuning for a flat, repeatable trajectory on the BB weight you actually play with.',
    icon: 'crosshair',
  },
  {
    title: 'Gearbox Rebuilds',
    navLabel: 'Gearbox Rebuilds',
    path: '/services/gearbox-rebuilds',
    summary:
      'Full strip, inspection and rebuild — replacing what is worn, not everything we can sell you.',
    icon: 'cog',
  },
  {
    title: 'Custom Builds',
    navLabel: 'Custom Builds',
    path: '/services/custom-builds',
    summary:
      'Built to a written spec with a stated goal, a documented parts list and test results.',
    icon: 'hammer',
  },
  {
    title: 'Chrono Service',
    navLabel: 'Chrono Service',
    path: '/services/chrono-service',
    summary:
      'Know your real numbers before game day — measured in joules, on your own BBs.',
    icon: 'gauge',
  },
];

/**
 * Guides registry — single source of truth for the /guides hub, internal
 * links and the sitemap. Add an entry here when a new guide page ships.
 */
export type GuideGroup = 'Getting started' | 'Buying decisions' | 'Care & maintenance';

export type GuideSummary = {
  title: string;
  navLabel: string;
  path: string;
  summary: string;
  group: GuideGroup;
};

export const GUIDES: GuideSummary[] = [
  {
    title: 'Airsoft for Beginners: A Complete Starter Guide',
    navLabel: "Beginner's Guide",
    path: '/guides/beginners-guide',
    summary:
      'Budget, renting vs buying, choosing a first gun and the kit people forget — how to start airsoft well.',
    group: 'Getting started',
  },
  {
    title: 'AEG vs GBB vs Spring: Which Airsoft Gun Should You Buy?',
    navLabel: 'AEG vs GBB vs Spring',
    path: '/guides/aeg-vs-gbb-vs-spring',
    summary: 'The three airsoft drive types compared, and which one suits a beginner in Ireland.',
    group: 'Buying decisions',
  },
  {
    title: 'Airsoft FPS and Joules Explained',
    navLabel: 'FPS and Joules Explained',
    path: '/guides/fps-and-joules-explained',
    summary: 'What airsoft power figures actually mean, and how site limits work.',
    group: 'Getting started',
  },
  {
    title: 'Airsoft BB Weight Guide: Which Weight to Use',
    navLabel: 'BB Weight Guide',
    path: '/guides/airsoft-bb-weight-guide',
    summary: 'Which BB weight to use for CQB, skirmish and sniper setups, and why quality matters.',
    group: 'Buying decisions',
  },
  {
    title: 'Airsoft Battery Guide: LiPo vs NiMH, Voltage and Care',
    navLabel: 'Battery Guide',
    path: '/guides/airsoft-battery-lipo-guide',
    summary: 'LiPo vs NiMH, voltage, connectors, and how to charge and store a battery safely.',
    group: 'Buying decisions',
  },
  {
    title: 'Airsoft Gas Types Explained: Green Gas vs CO2 vs HPA',
    navLabel: 'Gas Types Explained',
    path: '/guides/airsoft-gas-types',
    summary: 'Green gas, CO2 and HPA compared, including cold-weather performance in Ireland.',
    group: 'Buying decisions',
  },
  {
    title: 'How to Maintain Your Airsoft Gun',
    navLabel: 'Maintenance Guide',
    path: '/guides/airsoft-maintenance',
    summary: 'Simple upkeep that keeps a gun accurate and reliable, and what to leave to a tech.',
    group: 'Care & maintenance',
  },
];

export const GUIDE_GROUP_ORDER: GuideGroup[] = [
  'Getting started',
  'Buying decisions',
  'Care & maintenance',
];

export function groupGuides(): { group: GuideGroup; guides: GuideSummary[] }[] {
  return GUIDE_GROUP_ORDER.map((group) => ({
    group,
    guides: GUIDES.filter((guide) => guide.group === group),
  })).filter((entry) => entry.guides.length > 0);
}

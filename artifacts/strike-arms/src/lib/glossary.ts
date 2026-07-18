/**
 * Airsoft glossary — reference data (evergreen). One entry per term.
 * `seeAlso` links point at existing catalogue/legal routes only, so no
 * internal links dangle. Add guide links here as those pages ship.
 */
export type GlossaryLink = {
  label: string;
  href: string;
};

export type GlossaryTerm = {
  term: string;
  slug: string;
  definition: string;
  seeAlso?: GlossaryLink[];
};

export const GLOSSARY: GlossaryTerm[] = [
  {
    term: 'AEG',
    slug: 'aeg',
    definition:
      'Automatic Electric Gun. A battery-powered airsoft gun that uses a motor and gearbox to cycle a spring-driven piston, firing on semi- or full-auto. The most common type of skirmish rifle and the usual starting point for new players.',
    seeAlso: [{ label: 'Shop AEG rifles', href: '/store/rifles/aeg-rifles' }],
  },
  {
    term: 'AEP',
    slug: 'aep',
    definition:
      'Automatic Electric Pistol. A compact, battery-powered pistol using a small electric gearbox. Lower-powered than a GBB, popular as a beginner sidearm or for younger players.',
    seeAlso: [{ label: 'Shop electric pistols', href: '/store/pistols/electric-pistols' }],
  },
  {
    term: 'Angle of Engagement (AoE)',
    slug: 'angle-of-engagement',
    definition:
      'The angle at which the sector gear first contacts the piston pickup tooth inside a gearbox. Correcting AoE spreads load across more teeth and is a common durability upgrade during a rebuild.',
    seeAlso: [{ label: 'Gearboxes & internals', href: '/store/parts/gearboxes' }],
  },
  {
    term: 'BB',
    slug: 'bb',
    definition:
      'The 6mm plastic spherical projectile an airsoft gun fires, sold by weight (e.g. 0.20g, 0.25g, 0.28g). Quality and weight affect accuracy, range and how well a gun feeds.',
    seeAlso: [{ label: 'Shop BBs', href: '/store/consumables/bbs' }],
  },
  {
    term: 'Bio BB',
    slug: 'bio-bb',
    definition:
      'A biodegradable BB made to break down over time. Required by most outdoor sites in Ireland so that spent BBs do not persist in the environment.',
    seeAlso: [{ label: 'Shop bio BBs', href: '/store/consumables/bio-bbs' }],
  },
  {
    term: 'Blowback',
    slug: 'blowback',
    definition:
      'A system where firing drives the slide or bolt rearward to mimic recoil, as in a gas blowback (GBB) pistol. Adds realism at the cost of gas or battery efficiency.',
    seeAlso: [{ label: 'Shop GBB pistols', href: '/store/pistols/gbb-pistols' }],
  },
  {
    term: 'Bolt-action',
    slug: 'bolt-action',
    definition:
      'A rifle that is manually cocked between shots by cycling a bolt. Standard mechanism for airsoft sniper rifles, prized for a smooth, consistent single shot.',
    seeAlso: [{ label: 'Shop sniper rifles', href: '/store/rifles/sniper' }],
  },
  {
    term: 'Bucking (Hop rubber)',
    slug: 'bucking',
    definition:
      'The rubber sleeve inside the hop-up unit that grips the BB and applies backspin. Swapping the bucking is one of the cheapest, most effective accuracy upgrades.',
    seeAlso: [{ label: 'Hop-up units & buckings', href: '/store/parts/hop-up' }],
  },
  {
    term: 'Chronograph (Chrono)',
    slug: 'chronograph',
    definition:
      'A device that measures BB velocity in feet per second (FPS) or metres per second, used to confirm a gun shoots within a site limit. Sites chrono guns before play.',
    seeAlso: [{ label: 'Shop chronographs', href: '/store/more/chronographs' }],
  },
  {
    term: 'CO2',
    slug: 'co2',
    definition:
      'A propellant stored in small capsules, running at higher pressure than green gas. Performs better in cold weather but can stress seals in guns not designed for it.',
    seeAlso: [{ label: 'Shop CO2', href: '/store/consumables/co2' }],
  },
  {
    term: 'CQB',
    slug: 'cqb',
    definition:
      'Close Quarters Battle. Indoor or tight urban-style play at short range, favouring compact guns, lower FPS limits and fast handling over reach.',
  },
  {
    term: 'DMR',
    slug: 'dmr',
    definition:
      'Designated Marksman Rifle. A semi-auto-only rifle tuned for range and accuracy, sitting between a standard AEG and a bolt-action sniper. Usually held to a higher FPS limit with a semi-only lock.',
    seeAlso: [{ label: 'Shop rifles', href: '/store/rifles' }],
  },
  {
    term: 'ETU',
    slug: 'etu',
    definition:
      'Electronic Trigger Unit. Replaces mechanical trigger contacts with electronics for a crisper trigger, burst modes and trigger protection. Often paired with a MOSFET.',
    seeAlso: [{ label: 'MOSFETs & ETUs', href: '/store/parts/mosfets' }],
  },
  {
    term: 'FPS',
    slug: 'fps',
    definition:
      'Feet Per Second, the speed a BB leaves the barrel. FPS depends on the BB weight used to measure it, which is why sites also express limits in joules of energy.',
    seeAlso: [{ label: 'Shop chronographs', href: '/store/more/chronographs' }],
  },
  {
    term: 'Full-auto',
    slug: 'full-auto',
    definition:
      'A firing mode that keeps shooting while the trigger is held. Many indoor/CQB sites restrict or ban full-auto; check the site rules before you play.',
  },
  {
    term: 'GBB',
    slug: 'gbb',
    definition:
      'Gas Blowback. A gas-powered gun (usually a pistol) with a moving slide that recoils on each shot for realism. Popular as sidearms and for training realism.',
    seeAlso: [{ label: 'Shop GBB pistols', href: '/store/pistols/gbb-pistols' }],
  },
  {
    term: 'GBBR',
    slug: 'gbbr',
    definition:
      'Gas Blowback Rifle. A rifle-format gas blowback gun with strong recoil and realistic operation. More sensitive to cold and maintenance than an AEG.',
    seeAlso: [{ label: 'Shop gas rifles / GBBR', href: '/store/rifles/gbbr' }],
  },
  {
    term: 'Gearbox',
    slug: 'gearbox',
    definition:
      'The sealed mechanical core of an AEG containing the gears, piston, spring and cylinder. Versions (V2, V3, etc.) correspond to different gun platforms.',
    seeAlso: [{ label: 'Shop gearboxes', href: '/store/parts/gearboxes' }],
  },
  {
    term: 'Green gas',
    slug: 'green-gas',
    definition:
      'The most common airsoft propellant for gas guns, a silicone-lubricated pressurised gas. Convenient and gun-friendly, but loses power in cold conditions.',
    seeAlso: [{ label: 'Shop green gas', href: '/store/consumables/green-gas' }],
  },
  {
    term: 'Hop-up',
    slug: 'hop-up',
    definition:
      'A system that applies backspin to the BB to flatten its trajectory and extend range. Adjusting the hop-up correctly is essential to accuracy on any airsoft gun.',
    seeAlso: [{ label: 'Hop-up units & buckings', href: '/store/parts/hop-up' }],
  },
  {
    term: 'HPA',
    slug: 'hpa',
    definition:
      'High Pressure Air. A system running the gun from a regulated compressed-air tank, giving highly consistent, tunable performance. Favoured by some competitive and speedsoft players.',
  },
  {
    term: 'Imitation Firearm (IF) / RIF',
    slug: 'rif',
    definition:
      'Terms used for replica-styled guns. A Realistic Imitation Firearm looks like a real firearm; a two-tone finish is sometimes used to distinguish a replica. Irish rules on these are specific — verify the current position rather than assuming UK rules apply.',
    seeAlso: [{ label: 'Airsoft and the law', href: '/airsoft-law' }],
  },
  {
    term: 'Joule',
    slug: 'joule',
    definition:
      'The unit of muzzle energy, a weight-independent measure of a gun’s power. Because FPS changes with BB weight, joules give a fairer comparison and many limits are set this way.',
  },
  {
    term: 'Joule creep',
    slug: 'joule-creep',
    definition:
      'When a gun with a high air volume produces more energy with a heavier BB than a chrono reading on a light BB suggests. Relevant to DMR/sniper setups and site limits.',
  },
  {
    term: 'LiPo',
    slug: 'lipo',
    definition:
      'Lithium Polymer battery. Lightweight, high-output and the common choice for AEGs, but it must be charged, stored and handled correctly for safety and longevity.',
    seeAlso: [{ label: 'Shop batteries', href: '/store/consumables/batteries' }],
  },
  {
    term: 'Loadout',
    slug: 'loadout',
    definition:
      'A player’s complete kit for a game: gun, magazines, load-bearing gear, eye protection and clothing. Loadouts vary between CQB and woodland play.',
    seeAlso: [{ label: 'Shop tactical gear', href: '/store/gear' }],
  },
  {
    term: 'Mid-cap / Hi-cap / Low-cap',
    slug: 'magazine-capacities',
    definition:
      'Magazine types by capacity. Low-caps hold few rounds and need frequent reloads; mid-caps are the skirmish standard; hi-caps hold hundreds but rattle and must be wound.',
    seeAlso: [{ label: 'Shop rifle magazines', href: '/store/rifles/rifle-magazines' }],
  },
  {
    term: 'Milsim',
    slug: 'milsim',
    definition:
      'Military Simulation. A play style emphasising realistic kit, objectives, limited ammo and teamwork over fast-paced elimination. Contrast with speedsoft.',
  },
  {
    term: 'MOSFET',
    slug: 'mosfet',
    definition:
      'An electronic switch fitted to an AEG’s wiring that protects the trigger contacts from arcing, allows higher-output setups and can add features like active braking.',
    seeAlso: [{ label: 'MOSFETs & ETUs', href: '/store/parts/mosfets' }],
  },
  {
    term: 'NiMH',
    slug: 'nimh',
    definition:
      'Nickel-Metal Hydride battery. More forgiving and robust than LiPo but heavier and lower-output. A safe choice for beginners not yet confident with LiPo care.',
    seeAlso: [{ label: 'Shop batteries', href: '/store/consumables/batteries' }],
  },
  {
    term: 'Piston',
    slug: 'piston',
    definition:
      'The gearbox part driven back by the gears and forward by the spring to push air behind the BB. Piston teeth (full or half steel) are a common wear and upgrade point.',
    seeAlso: [{ label: 'Shop gearboxes & parts', href: '/store/parts/gearboxes' }],
  },
  {
    term: 'Picatinny / RIS rail',
    slug: 'picatinny-rail',
    definition:
      'A standardised slotted mounting rail on modern guns for attaching optics, lights, grips and other accessories. RIS means Rail Interface System.',
    seeAlso: [{ label: 'Shop optics & accessories', href: '/store/accessories/optics' }],
  },
  {
    term: 'Plate carrier',
    slug: 'plate-carrier',
    definition:
      'A vest that holds gear and pouches (and, in airsoft, usually foam rather than armour plates). Common in woodland loadouts for carrying mags and kit.',
    seeAlso: [{ label: 'Shop plate carriers', href: '/store/gear/plate-carriers' }],
  },
  {
    term: 'Red dot',
    slug: 'red-dot',
    definition:
      'A non-magnified optic projecting an illuminated aiming dot. Fast to acquire at short-to-medium range and a popular first optic for skirmish rifles.',
    seeAlso: [{ label: 'Shop optics', href: '/store/accessories/optics' }],
  },
  {
    term: 'Semi-auto',
    slug: 'semi-auto',
    definition:
      'A firing mode that fires one shot per trigger pull. DMRs are typically semi-only, and some sites restrict certain areas or guns to semi-auto.',
  },
  {
    term: 'Shimming',
    slug: 'shimming',
    definition:
      'Setting the correct spacing of gearbox gears with thin washers (shims) so they mesh smoothly. Good shimming reduces noise and wear; poor shimming causes both.',
    seeAlso: [{ label: 'Shop gearboxes & parts', href: '/store/parts/gearboxes' }],
  },
  {
    term: 'Skirmish',
    slug: 'skirmish',
    definition:
      'A regular organised airsoft game or event. "Skirmish-ready" describes a gun reliable and legal enough to take straight to a game.',
  },
  {
    term: 'Speedsoft',
    slug: 'speedsoft',
    definition:
      'A fast, competitive play style focused on speed and aggression, often with lightweight kit and high rates of fire. Contrast with milsim.',
  },
  {
    term: 'Spring (Springer)',
    slug: 'spring',
    definition:
      'A gun cocked by hand for each shot, with no battery or gas. Simple and cheap; common in entry-level guns and bolt-action snipers.',
    seeAlso: [{ label: 'Shop rifles', href: '/store/rifles' }],
  },
  {
    term: 'Tightbore barrel',
    slug: 'tightbore-barrel',
    definition:
      'An inner barrel with a slightly narrower bore (e.g. 6.03mm, 6.01mm) than stock, used to improve air seal and consistency. A common accuracy upgrade.',
    seeAlso: [{ label: 'Shop barrels', href: '/store/parts/barrels' }],
  },
  {
    term: 'Tracer',
    slug: 'tracer',
    definition:
      'A unit (often in a mock suppressor) that charges special BBs so they glow in low light, plus the glowing BBs themselves. Popular for night games.',
    seeAlso: [{ label: 'Shop consumables', href: '/store/consumables' }],
  },
  {
    term: 'Two-tone',
    slug: 'two-tone',
    definition:
      'A part-coloured (often bright) finish used in some jurisdictions to mark a replica as a toy or imitation. Whether and when it applies in Ireland is a legal question to verify, not assume.',
    seeAlso: [{ label: 'Airsoft and the law', href: '/airsoft-law' }],
  },
];

export function groupGlossaryByLetter(): { letter: string; terms: GlossaryTerm[] }[] {
  const groups = new Map<string, GlossaryTerm[]>();
  for (const entry of GLOSSARY) {
    const letter = entry.term[0].toUpperCase();
    const bucket = groups.get(letter) ?? [];
    bucket.push(entry);
    groups.set(letter, bucket);
  }
  return Array.from(groups.entries())
    .map(([letter, terms]) => ({ letter, terms }))
    .sort((a, b) => a.letter.localeCompare(b.letter));
}

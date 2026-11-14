/**
 * Airsoft glossary — reference data (evergreen). One entry per term.
 * `seeAlso` links point at existing catalogue/legal routes only, so no
 * internal links dangle. Add guide links here as those pages ship.
 *
 * The terms are data, split alphabetically across glossary-terms-a-l.ts and
 * glossary-terms-m-z.ts so neither file passes the 300-line limit.
 */
import { GLOSSARY_TERMS_A_L } from '@/lib/glossary-terms-a-l';
import { GLOSSARY_TERMS_M_Z } from '@/lib/glossary-terms-m-z';
import type { GlossaryTerm } from '@/types/glossary';

export type { GlossaryLink, GlossaryTerm } from '@/types/glossary';

export const GLOSSARY: GlossaryTerm[] = [...GLOSSARY_TERMS_A_L, ...GLOSSARY_TERMS_M_Z];

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

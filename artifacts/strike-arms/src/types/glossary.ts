/** One link under a glossary term, to an existing catalogue or legal route. */
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

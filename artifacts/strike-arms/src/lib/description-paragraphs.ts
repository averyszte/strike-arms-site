/**
 * A product's long description as paragraphs of plain text (N-052).
 *
 * Descriptions are stored as plain text, but some imported rows carry stray
 * markup (`<br>`, `<p>`). Line-break tags become line breaks and any other tag
 * is dropped, so the page never shows raw markup. React escapes what is left,
 * so nothing here is rendered as HTML.
 */
export function descriptionParagraphs(description: string | null | undefined): string[] {
  if (!description) return [];
  const text = description
    .replace(/\r\n?/g, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
  return text
    .split(/\n{2,}/)
    .map((block) => block.replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').trim())
    .filter(Boolean);
}

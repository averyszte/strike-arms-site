import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { FaqItem } from '@/lib/structured-data';

/**
 * Service FAQs as an accordion rather than a <dl>.
 *
 * The answers here are long — several are a full paragraph — and five stacked
 * paragraphs at the foot of an already long page is where people stop. Closed
 * by default, the questions become a scannable index of "is my problem in
 * here", which is what an FAQ is actually for. The FAQ schema is emitted from
 * the same array, so collapsing the answers costs nothing in search.
 */
export function ServiceFaqList({ items }: { items: FaqItem[] }) {
  return (
    <Accordion type="single" collapsible className="mt-6 border-t border-border/60">
      {items.map((item) => (
        <AccordionItem key={item.question} value={item.question}>
          <AccordionTrigger className="gap-4 text-left text-base font-bold text-foreground hover:text-accent hover:no-underline">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="pr-8 leading-relaxed text-muted-foreground">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

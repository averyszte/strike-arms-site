import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What kind of airsoft gear do you sell?",
    answer: "Full range: AEG and gas rifles, pistols, BBs, gas canisters, tactical vests, eye protection, and accessories from trusted brands."
  },
  {
    question: "Can you help me choose my first airsoft gun?",
    answer: "Absolutely. We walk every first-timer through the options and will not let you waste money on the wrong setup."
  },
  {
    question: "Do you stock BBs, gas, and accessories?",
    answer: "Yes, we carry a full range of ammunition, gas, and accessories to keep you game-ready."
  },
  {
    question: "Do you offer repairs?",
    answer: "Yes. Bring in your gun and we will diagnose and fix most issues in-store."
  },
  {
    question: "Can I visit the store in person?",
    answer: "Yes. We are based in Dublin and happy to see you in store. Call ahead on +353 87 273 6351 to confirm availability."
  },
  {
    question: "Do you help beginners?",
    answer: "It is one of our specialities. Whether you are brand new or buying for a teenager, we make it simple."
  },
  {
    question: "What should I buy to get started?",
    answer: "We recommend a quality starter AEG, 0.20g BBs, safety glasses, and a battery charger. We will help you build the right kit."
  },
  {
    question: "Do you sell gear suitable for younger players?",
    answer: "Yes. We can advise on age-appropriate, safe setups for younger players and parents buying as gifts."
  }
];

export function FAQSection() {
  return (
    <section className="py-24 bg-background border-b border-border/60">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-12 text-center">
          Common Questions
        </h2>
        
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-border">
              <AccordionTrigger className="text-left font-bold text-lg hover:text-accent transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

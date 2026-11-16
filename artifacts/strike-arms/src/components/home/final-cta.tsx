import { CtaBand } from "@/components/CtaBand";

/** The homepage's closing call to action: the site's shared CTA band. */
export function FinalCta() {
  return (
    <CtaBand
      title="The right setup, from people who actually play."
      text="Visit the Swords shop or give us a call. No pressure, just good advice."
      cta={{ label: "Shop gear", href: "/store" }}
    />
  );
}

import { Helmet } from "react-helmet-async";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ComingSoon() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-16">
      <Helmet>
        <title>Strike Arms Airsoft | New website coming soon</title>
        <meta
          name="description"
          content="Strike Arms, Dublin's specialist airsoft store in Swords. Our new website is coming soon. The shop is open as usual."
        />
      </Helmet>

      <div className="w-full max-w-xl text-center flex flex-col items-center gap-8">
        <div className="flex flex-col items-center leading-none">
          <span className="font-bold text-4xl md:text-5xl tracking-tighter uppercase">Strike Arms</span>
          <span className="text-sm text-muted-foreground tracking-widest font-semibold mt-1">Airsoft</span>
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-sm text-accent font-bold uppercase tracking-wider">Coming soon</p>
          <h1 className="text-2xl md:text-3xl font-bold">Our new website is nearly ready</h1>
          <p className="text-muted-foreground leading-relaxed">
            We are putting the finishing touches to the new Strike Arms site. In the meantime the shop
            is open as usual, so call in, ring or email us for anything you need.
          </p>
        </div>

        <div className="w-full flex flex-col gap-3 text-sm">
          <a
            href="tel:+353872736351"
            className="flex items-center justify-center gap-2 rounded-md bg-accent text-accent-foreground font-bold px-6 py-3 hover:opacity-90 transition-opacity"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            +353 87 273 6351
          </a>
          <a
            href="mailto:info@strikearms.ie"
            className="flex items-center justify-center gap-2 rounded-md border border-border px-6 py-3 hover:border-accent hover:text-accent transition-colors"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            info@strikearms.ie
          </a>
          <p className="flex items-center justify-center gap-2 text-muted-foreground pt-2">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            Swords, Co. Dublin
          </p>
        </div>
      </div>
    </main>
  );
}

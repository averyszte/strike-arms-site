import { Link } from "wouter";

export function SiteFooter() {
  return (
    <footer className="bg-background pt-16 pb-24 md:pb-8 border-t border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Col 1: Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex flex-col items-start leading-none group">
              <span className="font-bold text-2xl tracking-tighter uppercase group-hover:text-accent transition-colors">
                Strike Arms
              </span>
              <span className="text-xs text-muted-foreground tracking-widest font-semibold">
                Airsoft
              </span>
            </Link>
            <p className="text-sm text-accent font-bold uppercase tracking-wider mt-2">
              Dublin's specialist airsoft store
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2 max-w-xs">
              Expert advice, trusted brands, and the setup guidance beginners actually need. We do not let you waste money on the wrong setup.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-foreground mb-2">Quick Links</h4>
            <nav className="flex flex-col gap-3">
              <Link href="/" className="text-sm text-muted-foreground hover:text-accent transition-colors w-fit">Home</Link>
              <Link href="/shop" className="text-sm text-muted-foreground hover:text-accent transition-colors w-fit">Shop</Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-accent transition-colors w-fit">About</Link>
              <Link href="/repairs" className="text-sm text-muted-foreground hover:text-accent transition-colors w-fit">Repairs</Link>
              <Link href="/airsoft-law" className="text-sm text-muted-foreground hover:text-accent transition-colors w-fit">Airsoft Law</Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-accent transition-colors w-fit">Contact</Link>
            </nav>
          </div>

          {/* Col 3: Categories */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-foreground mb-2">Categories</h4>
            <nav className="flex flex-col gap-3">
              <Link href="/categories/rifles" className="text-sm text-muted-foreground hover:text-accent transition-colors w-fit">Rifles</Link>
              <Link href="/categories/pistols" className="text-sm text-muted-foreground hover:text-accent transition-colors w-fit">Pistols</Link>
              <Link href="/categories/ammo-bbs" className="text-sm text-muted-foreground hover:text-accent transition-colors w-fit">Ammo & BBs</Link>
              <Link href="/tactical-gear" className="text-sm text-muted-foreground hover:text-accent transition-colors w-fit">Tactical Gear</Link>
              <Link href="/accessories" className="text-sm text-muted-foreground hover:text-accent transition-colors w-fit">Accessories</Link>
            </nav>
          </div>

          {/* Col 4: Contact */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-foreground mb-2">Contact</h4>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground font-semibold">Phone:</strong>{" "}
                <a href="tel:+353872736351" className="hover:text-accent transition-colors">+353 87 273 6351</a>
              </p>
              <p>
                <strong className="text-foreground font-semibold">Location:</strong>{" "}
                Dublin, Ireland
              </p>
              <p>
                <strong className="text-foreground font-semibold">Email:</strong>{" "}
                <a href="mailto:info@strikearms.ie" className="hover:text-accent transition-colors">info@strikearms.ie</a>
              </p>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Strike Arms Airsoft. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

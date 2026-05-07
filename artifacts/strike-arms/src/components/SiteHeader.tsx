import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Search, User, ShoppingCart, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "Rifles", href: "/categories/rifles" },
  { name: "Pistols", href: "/categories/pistols" },
  { name: "Ammo & BBs", href: "/categories/ammo-bbs" },
  { name: "Tactical Gear", href: "/tactical-gear" },
  { name: "Accessories", href: "/accessories" },
  { name: "Repairs", href: "/repairs" },
  { name: "Airsoft Law", href: "/airsoft-law" },
];

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-foreground hover:text-accent transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link href="/" className="flex flex-col items-start leading-none group">
              <span className="font-bold text-lg md:text-xl tracking-tighter uppercase group-hover:text-accent transition-colors">
                Strike Arms
              </span>
              <span className="text-[0.65rem] md:text-xs text-muted-foreground tracking-widest font-semibold">
                Airsoft
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 text-foreground">
            <button className="hover:text-accent transition-colors" aria-label="Search">
              <Search className="w-5 h-5" />
            </button>
            <Link href="/account" className="hover:text-accent transition-colors hidden sm:block" aria-label="Account">
              <User className="w-5 h-5" />
            </Link>
            <Link href="/cart" className="relative hover:text-accent transition-colors group" aria-label="Cart">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-1.5 bg-accent text-accent-foreground text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                0
              </span>
            </Link>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <Link href="/" className="flex flex-col items-start leading-none" onClick={() => setMobileMenuOpen(false)}>
                  <span className="font-bold text-xl tracking-tighter uppercase text-accent">
                    Strike Arms
                  </span>
                  <span className="text-xs text-muted-foreground tracking-widest font-semibold">
                    Airsoft
                  </span>
                </Link>
                <button
                  className="text-foreground hover:text-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-8 px-6 flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-2xl font-bold text-foreground hover:text-accent transition-colors tracking-tight"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
              <div className="p-6 border-t border-border mt-auto bg-card">
                <div className="flex items-center gap-4 mb-4">
                  <Link href="/account" className="flex items-center gap-2 text-muted-foreground hover:text-accent" onClick={() => setMobileMenuOpen(false)}>
                    <User className="w-5 h-5" />
                    <span className="font-medium">My Account</span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

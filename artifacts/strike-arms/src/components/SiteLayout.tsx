import { useRef } from "react";
import { UtilityBar } from "@/components/UtilityBar";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useRouteFocus } from "@/hooks/use-route-focus";

interface SiteLayoutProps {
  children: React.ReactNode;
  /** Optional extra classes on the layout root — used to scope a preview theme. */
  className?: string;
}

const MAIN_ID = "main-content";

export function SiteLayout({ children, className = "" }: SiteLayoutProps) {
  const mainRef = useRef<HTMLElement>(null);
  useRouteFocus(mainRef);

  // The skip link focuses <main> itself rather than following the hash, so
  // the URL stays clean and the scroll-to-top on route change is unaffected.
  const skipToMain = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    mainRef.current?.focus();
    mainRef.current?.scrollIntoView();
  };

  return (
    <div className={`site-theme min-h-[100dvh] flex flex-col bg-background text-foreground ${className}`}>
      <a
        href={`#${MAIN_ID}`}
        onClick={skipToMain}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-accent focus:px-4 focus:py-3 focus:text-sm focus:font-black focus:uppercase focus:tracking-wider focus:text-accent-foreground"
      >
        Skip to content
      </a>

      {/* Sticky header block — utility bar + main header stick together */}
      <div className="sticky top-0 z-50">
        <UtilityBar />
        <SiteHeader />
      </div>

      <main id={MAIN_ID} ref={mainRef} tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}

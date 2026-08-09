import { UtilityBar } from "@/components/UtilityBar";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

interface SiteLayoutProps {
  children: React.ReactNode;
  /** Optional extra classes on the layout root — used to scope a preview theme. */
  className?: string;
}

export function SiteLayout({ children, className = "" }: SiteLayoutProps) {
  return (
    <div className={`min-h-[100dvh] flex flex-col bg-background text-foreground ${className}`}>
      {/* Sticky header block — utility bar + main header stick together */}
      <div className="sticky top-0 z-50">
        <UtilityBar />
        <SiteHeader />
      </div>

      <main className="flex-1">
        {children}
      </main>

      <SiteFooter />
    </div>
  );
}

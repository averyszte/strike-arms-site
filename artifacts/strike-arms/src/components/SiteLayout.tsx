import { UtilityBar } from "@/components/UtilityBar";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MobileStickyBar } from "@/components/MobileStickyBar";

interface SiteLayoutProps {
  children: React.ReactNode;
}

export function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      {/* Sticky header block — utility bar + main header stick together */}
      <div className="sticky top-0 z-50">
        <UtilityBar />
        <SiteHeader />
      </div>

      <main className="flex-1">
        {children}
      </main>

      <SiteFooter />
      <MobileStickyBar />
    </div>
  );
}

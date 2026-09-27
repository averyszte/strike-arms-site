import type { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';

interface Props {
  /** The tab title, before " | Strike Arms Admin". */
  pageTitle: string;
  heading: string;
  intro?: string;
  children: ReactNode;
}

/**
 * The narrow centred column the admin's signed-out screens share: sign in,
 * accept an invite, reset a password.
 */
export function AdminAuthScreen({ pageTitle, heading, intro, children }: Props) {
  return (
    <>
      <Helmet>
        <title>{`${pageTitle} | Strike Arms Admin`}</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <main className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[360px]">
          <h1 className="text-2xl font-bold text-foreground mb-1">{heading}</h1>
          {intro && <p className="text-sm text-muted-foreground mb-7">{intro}</p>}
          {children}
        </div>
      </main>
    </>
  );
}

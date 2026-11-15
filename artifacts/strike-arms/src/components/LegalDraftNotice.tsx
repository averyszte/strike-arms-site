import type { ReactNode } from 'react';

import { PANEL } from '@/lib/storefront-styles';

type LegalDraftNoticeProps = {
  /** What is still open on this page, shown as a list under the notice. */
  openPoints?: ReactNode[];
};

/**
 * The draft notice and each page's open points show in local development
 * only. The site is live, so visitors never see internal review notes (N-103).
 * The open points stay in each page's code until the solicitor's sign-off in
 * docs/audit/hosted-steps.md; remove the notice from a page once it is signed
 * off there.
 */
const SHOULD_SHOW_LEGAL_DRAFT_NOTICE = import.meta.env.DEV;

export function LegalDraftNotice({ openPoints = [] }: LegalDraftNoticeProps) {
  if (!SHOULD_SHOW_LEGAL_DRAFT_NOTICE) return null;
  return (
    <div className={`${PANEL} border-l-2 border-l-accent p-4 text-sm text-muted-foreground`}>
      <p>Draft. This page should be reviewed by a solicitor before the site goes live.</p>
      {openPoints.length > 0 && (
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {openPoints.map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

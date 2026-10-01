import type { ReactNode } from 'react';

import { PANEL } from '@/lib/storefront-styles';

type LegalDraftNoticeProps = {
  /** What is still open on this page, shown as a list under the notice. */
  openPoints?: ReactNode[];
};

/**
 * Shown on every legal page until a solicitor has read the final wording.
 * Remove it page by page as each one is signed off.
 */
export function LegalDraftNotice({ openPoints = [] }: LegalDraftNoticeProps) {
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

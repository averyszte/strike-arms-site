import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { Input } from '@/components/ui/input';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

/**
 * A password box with a "Show" button, so a new password can be checked by
 * eye instead of typed twice (N-060). Passes the react-hook-form ref through.
 */
export const PasswordInputWithToggle = forwardRef<HTMLInputElement, Props>(
  function PasswordInputWithToggle({ className = '', ...props }, ref) {
    const [isVisible, setIsVisible] = useState(false);
    const Icon = isVisible ? EyeOff : Eye;
    const toggleLabel = isVisible ? 'Hide' : 'Show';
    return (
      <div className="relative">
        <Input ref={ref} type={isVisible ? 'text' : 'password'} className={`pr-20 ${className}`} {...props} />
        <button
          type="button"
          onClick={() => setIsVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex min-w-11 items-center justify-center gap-1 px-3 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          {/* The visible word starts the accessible name ("Hide password"), so a
              voice-control user can say what they see (WCAG 2.5.3). */}
          {toggleLabel}
          <span className="sr-only"> password</span>
        </button>
      </div>
    );
  },
);

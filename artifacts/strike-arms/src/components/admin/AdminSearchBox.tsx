import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

import { Input } from '@/components/ui/input';

/**
 * A search field for an admin table that searches on the server.
 *
 * Holds what is being typed and hands it on once typing pauses, so each
 * keystroke is not a round trip. The committed term lives with the caller (the
 * URL, for orders); this follows it when it changes from outside, such as the
 * back button, but not when it is only our own text coming back trimmed --
 * that would eat the space someone just typed between two words.
 */

const SEARCH_DEBOUNCE_MS = 300;

type AdminSearchBoxProps = {
  value: string;
  placeholder: string;
  label: string;
  onSearch: (term: string) => void;
};

export function AdminSearchBox({ value, placeholder, label, onSearch }: AdminSearchBoxProps) {
  const [text, setText] = useState(value);
  const [committed, setCommitted] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  if (value !== committed) {
    setCommitted(value);
    if (value !== text.trim()) setText(value);
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  function handleChange(next: string) {
    setText(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onSearch(next.trim()), SEARCH_DEBOUNCE_MS);
  }

  return (
    <div className="relative w-full sm:w-72">
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="text"
        role="searchbox"
        aria-label={label}
        placeholder={placeholder}
        value={text}
        onChange={(event) => handleChange(event.target.value)}
        className="h-9 pl-8 pr-8 text-sm"
      />
      {text && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => handleChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';

import type { TurnstileAction, TurnstileApi } from '@/types/turnstile';

/**
 * Cloudflare Turnstile, the bot check on checkout, order lookup and the contact forms.
 *
 * The script loads only when a form that needs it is on screen, so the rest
 * of the site never talks to Cloudflare. Tokens are single-use: the form
 * calls reset() each time it sends one, and the widget fetches a fresh token
 * for any retry.
 *
 * With no VITE_TURNSTILE_SITE_KEY (local development) there is no widget and
 * the token stays null; the local functions skip the check with
 * ALLOW_INSECURE_NO_CAPTCHA. The hosted functions refuse a request without a
 * token, so the key must be set on Cloudflare Pages.
 */

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let scriptLoad: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);

  scriptLoad ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.onload = () =>
      window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile did not start'));
    script.onerror = () => {
      scriptLoad = null;
      script.remove();
      reject(new Error('Turnstile did not load'));
    };
    document.head.appendChild(script);
  });
  return scriptLoad;
}

export type TurnstileState = {
  ref: React.RefObject<HTMLDivElement | null>;
  token: string | null;
  isEnabled: boolean;
  hasFailed: boolean;
  reset: () => void;
};

export function useTurnstile(action: TurnstileAction): TurnstileState {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    if (!siteKey) return;
    let isCancelled = false;

    loadTurnstile()
      .then((api) => {
        if (isCancelled || !ref.current) return;
        widgetId.current =
          api.render(ref.current, {
            sitekey: siteKey,
            action,
            theme: 'dark',
            size: 'flexible',
            callback: (value) => {
              setHasFailed(false);
              setToken(value);
            },
            'expired-callback': () => setToken(null),
            'error-callback': () => {
              setToken(null);
              setHasFailed(true);
            },
          }) ?? null;
      })
      .catch(() => {
        if (!isCancelled) setHasFailed(true);
      });

    return () => {
      isCancelled = true;
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [siteKey, action]);

  const reset = useCallback(() => {
    setToken(null);
    if (widgetId.current) window.turnstile?.reset(widgetId.current);
  }, []);

  return { ref, token, isEnabled: Boolean(siteKey), hasFailed, reset };
}

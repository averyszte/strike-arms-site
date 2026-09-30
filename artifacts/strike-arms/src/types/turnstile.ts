/**
 * The parts of Cloudflare Turnstile's browser API the site uses. The script
 * (challenges.cloudflare.com/turnstile/v0/api.js) sets window.turnstile.
 */

/** Must match the action the Edge Function checks for. */
export type TurnstileAction = 'checkout' | 'order-lookup';

export type TurnstileRenderOptions = {
  sitekey: string;
  action: TurnstileAction;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'flexible' | 'compact';
  callback: (token: string) => void;
  'expired-callback': () => void;
  'error-callback': () => void;
};

export type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string | undefined;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

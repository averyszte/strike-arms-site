/**
 * Validates the Supabase client credentials before a client is built from them.
 *
 * Both values are inlined into the bundle at build time, so a missing, stale or
 * mismatched value surfaces much later as an opaque "Invalid API key" from an
 * unrelated request. Checking them at the point of use turns that into an
 * explicit failure that names the variable to fix.
 */

const PLACEHOLDER_FRAGMENTS = ['your-project-ref', 'your-anon-key-here'] as const;

const WHERE_TO_LOOK =
  'Both must come from the same Supabase project (Project Settings -> API). ' +
  'In production they are set in Cloudflare Pages -> Settings -> Variables and ' +
  'Secrets; locally in artifacts/strike-arms/.env.local.';

/** Reads the `ref` claim from an anon key without verifying its signature. */
function readProjectRefFromKey(anonKey: string): string | null {
  const payload = anonKey.split('.')[1];
  if (!payload) return null;

  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

  try {
    const claims: unknown = JSON.parse(atob(padded));
    if (typeof claims !== 'object' || claims === null) return null;
    const ref = (claims as Record<string, unknown>).ref;
    return typeof ref === 'string' ? ref : null;
  } catch {
    return null;
  }
}

/** Reads the project ref from the leftmost label of a Supabase project URL. */
function readProjectRefFromUrl(url: string): string | null {
  return /^https:\/\/([^./]+)\.supabase\.co\/?$/.exec(url.trim())?.[1] ?? null;
}

/**
 * Throws when the credentials are absent, still placeholders, or belong to two
 * different Supabase projects. Returns silently when they are usable.
 */
export function verifySupabaseConfig(url: string, anonKey: string): void {
  const missing = [
    !url && 'VITE_SUPABASE_URL',
    !anonKey && 'VITE_SUPABASE_ANON_KEY',
  ].filter((name): name is string => typeof name === 'string');

  if (missing.length > 0) {
    throw new Error(`Supabase config missing: ${missing.join(', ')}. ${WHERE_TO_LOOK}`);
  }

  const placeholder = PLACEHOLDER_FRAGMENTS.find(
    (fragment) => url.includes(fragment) || anonKey.includes(fragment),
  );

  if (placeholder) {
    throw new Error(
      `Supabase config is still the committed placeholder ("${placeholder}"), so ` +
        `no real credentials reached the build. ${WHERE_TO_LOOK}`,
    );
  }

  const urlRef = readProjectRefFromUrl(url);
  if (!urlRef) {
    throw new Error(
      `Supabase config invalid: VITE_SUPABASE_URL ("${url}") is not a project ` +
        `URL of the form https://<project-ref>.supabase.co. ${WHERE_TO_LOOK}`,
    );
  }

  const keyRef = readProjectRefFromKey(anonKey);
  if (!keyRef) {
    throw new Error(
      'Supabase config invalid: VITE_SUPABASE_ANON_KEY is not a readable ' +
        `Supabase key -- it may be truncated or quote-wrapped. ${WHERE_TO_LOOK}`,
    );
  }

  if (keyRef !== urlRef) {
    throw new Error(
      `Supabase config mismatch: VITE_SUPABASE_URL points at project "${urlRef}" ` +
        `but VITE_SUPABASE_ANON_KEY belongs to project "${keyRef}". ${WHERE_TO_LOOK}`,
    );
  }
}

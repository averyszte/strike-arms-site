/**
 * A write that matched nothing is not a success (M-034).
 *
 * RLS, a stale id or an AAL1 session all make PostgREST answer an update with
 * 200 and no rows. Every admin write asks for the ids back with
 * `.select('id')` and passes them through here, so "Saved" means saved.
 */
export class ZeroRowsError extends Error {
  constructor(message = 'Nothing was saved. Reload the page and try again; if it keeps happening, sign out and back in.') {
    super(message);
    this.name = 'ZeroRowsError';
  }
}

/**
 * The save was refused because Supabase had already ended this sign-in
 * (signed out everywhere, a password change, a session removed in the
 * dashboard) while this browser still held its token. supabase-js has cleared
 * the local session by the time this is thrown, so the admin lands on the
 * login page; signing in again makes saves work.
 */
export class SessionEndedError extends Error {
  constructor() {
    super('Nothing was saved: this sign-in had already ended on the server. Sign in again, then make the change again.');
    this.name = 'SessionEndedError';
  }
}

export function expectRows(data: { id: string }[] | null, expected = 1): void {
  const count = data?.length ?? 0;
  if (count === 0) throw new ZeroRowsError();
  if (count < expected) {
    throw new ZeroRowsError(`Only ${count} of ${expected} were saved. Reload and check them.`);
  }
}

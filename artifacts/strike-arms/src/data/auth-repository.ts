/**
 * Auth data layer — THE ONLY place that talks to the auth backend.
 *
 * DEV ADAPTER: currently backed by the browser (localStorage) so the account
 * flows work end-to-end without external services. Passwords are SHA-256 hashed
 * (never stored in plain text), but this is a placeholder, NOT production auth.
 *
 * TO GO LIVE (the single "fix later"): replace each function body with the
 * equivalent Supabase Auth call — supabase.auth.signUp / signInWithPassword /
 * signOut / getUser / updateUser — and move profile + consent fields to a
 * `profiles` table protected by RLS (user_id = auth.uid()). Erasure should
 * anonymise order rows and retain tax records; data export should include them.
 * The exported function signatures and return types must NOT change.
 */
import type { AuthUser, SignUpInput, ProfilePatch, AuthResult } from '@/types/auth';

interface StoredUser extends AuthUser {
  passwordHash: string;
}

const USERS_KEY = 'sa_auth_users';
const SESSION_KEY = 'sa_auth_session';
const NETWORK_DELAY = 200;

function wait() {
  return new Promise((r) => setTimeout(r, NETWORK_DELAY));
}

function readUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]') as StoredUser[];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function toPublic(user: StoredUser): AuthUser {
  const { passwordHash: _passwordHash, ...pub } = user;
  return pub;
}

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function newId(): string {
  return crypto.randomUUID();
}

export async function signUp(input: SignUpInput): Promise<AuthResult> {
  await wait();
  const email = input.email.trim().toLowerCase();
  const users = readUsers();
  if (users.some((u) => u.email === email)) {
    return { ok: false, error: 'An account with that email already exists.' };
  }
  const user: StoredUser = {
    id: newId(),
    email,
    fullName: input.fullName.trim(),
    marketingOptIn: input.marketingOptIn,
    createdAt: new Date().toISOString(),
    passwordHash: await hashPassword(input.password),
  };
  writeUsers([...users, user]);
  localStorage.setItem(SESSION_KEY, user.id);
  return { ok: true, user: toPublic(user) };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  await wait();
  const normalised = email.trim().toLowerCase();
  const user = readUsers().find((u) => u.email === normalised);
  if (!user || user.passwordHash !== (await hashPassword(password))) {
    return { ok: false, error: 'Incorrect email or password.' };
  }
  localStorage.setItem(SESSION_KEY, user.id);
  return { ok: true, user: toPublic(user) };
}

export async function signOut(): Promise<void> {
  await wait();
  localStorage.removeItem(SESSION_KEY);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const id = localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  const user = readUsers().find((u) => u.id === id);
  return user ? toPublic(user) : null;
}

export async function updateProfile(id: string, patch: ProfilePatch): Promise<AuthResult> {
  await wait();
  const users = readUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return { ok: false, error: 'Account not found.' };
  users[index] = { ...users[index], ...patch };
  writeUsers(users);
  return { ok: true, user: toPublic(users[index]) };
}

/** GDPR Art. 15/20 — a copy of everything held about the user. */
export async function exportUserData(id: string): Promise<Record<string, unknown> | null> {
  await wait();
  const user = readUsers().find((u) => u.id === id);
  if (!user) return null;
  return {
    account: toPublic(user),
    // Live version also includes: orders, addresses, saved items, consent history.
    exportedAt: new Date().toISOString(),
  };
}

/**
 * GDPR Art. 17 — erase personal data. Delete-or-ANONYMISE: personal identifiers
 * are removed, but in the live version the order/tax records are retained in an
 * anonymised form (Irish Companies Act ~6 years). Here there are no orders, so we
 * simply remove the account and end the session.
 */
export async function deleteAccount(id: string): Promise<void> {
  await wait();
  writeUsers(readUsers().filter((u) => u.id !== id));
  localStorage.removeItem(SESSION_KEY);
}

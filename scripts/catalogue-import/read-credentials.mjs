/**
 * Finds the Supabase project URL and the service role key, so that running the
 * upload is one command and not a shell lesson.
 *
 * The URL is read from the app's own .env.local, because it is already there
 * and is public anyway. The service role key is read from service-role-key.txt
 * in this folder, which is git-ignored: paste the key in, save, run. A file is
 * used rather than an environment variable because PowerShell writes the
 * command line to its history file, and the key would sit in it in plain text.
 *
 * Environment variables still win if they are set, for CI or for anyone who
 * prefers them.
 */

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const KEY_FILE = join(HERE, 'service-role-key.txt');
const ENV_LOCAL = join(HERE, '..', '..', 'artifacts', 'strike-arms', '.env.local');

function readProjectUrl() {
  if (process.env.SUPABASE_URL) return process.env.SUPABASE_URL;
  if (!existsSync(ENV_LOCAL)) return null;
  const match = readFileSync(ENV_LOCAL, 'utf8').match(/^VITE_SUPABASE_URL=(\S+)/m);
  return match ? match[1] : null;
}

function readServiceRoleKey() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) return process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!existsSync(KEY_FILE)) return null;
  const contents = readFileSync(KEY_FILE, 'utf8').trim();
  return contents || null;
}

/** Exits with a readable explanation rather than a stack trace. */
export function readCredentials() {
  const url = readProjectUrl();
  const key = readServiceRoleKey();

  if (!url) {
    process.stderr.write(
      `Could not find the project URL.\nExpected VITE_SUPABASE_URL in ${ENV_LOCAL}\n`,
    );
    process.exit(1);
  }
  if (!key) {
    process.stderr.write(
      `Could not find the service role key.\n\n` +
        `Open ${KEY_FILE}\n` +
        `paste the service role key into it, save, and run this again.\n\n` +
        `The key is in the Supabase dashboard under Project Settings, API.\n` +
        `It is the one marked service_role, not the anon key. That file is\n` +
        `git-ignored, so it stays on this machine.\n`,
    );
    process.exit(1);
  }

  return { url: url.replace(/\/+$/, ''), key };
}

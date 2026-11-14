#!/bin/bash
# Replit post-merge hook (named in .replit [postMerge]). Replit is no longer
# used; this file is kept only so that hook does not error if it ever runs.
#
# It used to run `pnpm --filter db push`, a drizzle-kit push of the unused
# lib/db scaffold (an empty schema) against whatever DATABASE_URL was set.
# Pointed at the Supabase database, that proposes dropping every table
# (audit A1-13, M-060). The database schema lives in supabase/migrations and
# is applied only by Phil with `supabase db push`. Do not add a push back.
set -e
pnpm install --frozen-lockfile

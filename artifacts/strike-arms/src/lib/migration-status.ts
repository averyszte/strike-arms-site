import { MIGRATION_MANIFEST, type MigrationFile } from '@/lib/migration-manifest';

/**
 * Compare the migrations in the repo against the ones the database says it has.
 *
 * The failure this exists to catch is not a loud one. A migration that was
 * committed and never pushed leaves a site that builds, deploys and serves
 * HTTP 200 while a function it needs is simply absent -- and nothing anywhere
 * says so until a customer hits the path that calls it.
 */

export type MigrationStatus = {
  applied: MigrationFile[];
  /** In the repo, not in the database. These are the ones that need pushing. */
  pending: MigrationFile[];
  /**
   * In the database, not in the repo. Usually means someone ran SQL by hand in
   * the Supabase dashboard, which is worth knowing: it will be lost the next
   * time the database is rebuilt from migrations.
   */
  unexpected: string[];
  isInSync: boolean;
};

/**
 * `appliedVersions` are the numeric prefixes recorded by the Supabase CLI.
 * Order is not compared, only membership: 015 applied while 014 is not is a
 * real state, and it shows up here as 014 pending rather than as everything
 * being fine because the highest number matches.
 */
export function compareMigrations(
  appliedVersions: readonly string[],
  repo: readonly MigrationFile[] = MIGRATION_MANIFEST,
): MigrationStatus {
  const inDatabase = new Set(appliedVersions.map((version) => version.trim()));
  const inRepo = new Set(repo.map((migration) => migration.version));

  const applied = repo.filter((migration) => inDatabase.has(migration.version));
  const pending = repo.filter((migration) => !inDatabase.has(migration.version));
  const unexpected = [...inDatabase].filter((version) => !inRepo.has(version)).sort();

  return {
    applied,
    pending,
    unexpected,
    isInSync: pending.length === 0 && unexpected.length === 0,
  };
}

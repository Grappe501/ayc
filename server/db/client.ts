/**
 * Database client shell — Phase 1C will wire Netlify PostgreSQL.
 * Browser code must never import this module.
 */
export function getDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL
}

export function assertServerOnly(): void {
  // Soft guard for accidental client bundling during later slices.
  if (typeof process === 'undefined' || !process.env) {
    throw new Error('Database access is server-only')
  }
}

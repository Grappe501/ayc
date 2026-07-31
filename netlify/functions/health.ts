import type { Handler } from '@netlify/functions'
import { getDatabaseUrl, pingDatabase } from '../../server/db/client.ts'

export const handler: Handler = async () => {
  const environment = process.env.AYC_ENVIRONMENT ?? process.env.CONTEXT ?? 'development'
  const databaseConfigured = Boolean(getDatabaseUrl())

  let database: { configured: boolean; ok: boolean | null; error?: string } = {
    configured: databaseConfigured,
    ok: null,
  }

  if (databaseConfigured) {
    const ping = await pingDatabase()
    database = {
      configured: true,
      ok: ping.ok,
      ...(ping.error ? { error: ping.error } : {}),
    }
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify({
      ok: true,
      service: 'ayc-workbench',
      environment,
      database,
    }),
  }
}

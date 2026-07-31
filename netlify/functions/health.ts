import type { Handler } from '@netlify/functions'

export const handler: Handler = async () => {
  const environment = process.env.AYC_ENVIRONMENT ?? process.env.CONTEXT ?? 'development'

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
    }),
  }
}

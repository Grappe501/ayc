import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'

export const handler: Handler = async (_event: HandlerEvent, _context: HandlerContext) => {
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

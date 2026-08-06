/** Public URL prefix on arkansasyouth (keeps workbench routes intact). */
export const MEETING_BASE = '/leadership-meeting'

export function meetingPath(path = '/'): string {
  if (!path || path === '/') return MEETING_BASE
  return `${MEETING_BASE}${path.startsWith('/') ? path : `/${path}`}`
}

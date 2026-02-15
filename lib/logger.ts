export function logInfo(event: string, payload: Record<string, unknown> = {}) {
  console.info(JSON.stringify({ level: 'info', event, ...payload, ts: new Date().toISOString() }));
}

export function logError(event: string, error: unknown, payload: Record<string, unknown> = {}) {
  console.error(JSON.stringify({ level: 'error', event, error: String(error), ...payload, ts: new Date().toISOString() }));
}

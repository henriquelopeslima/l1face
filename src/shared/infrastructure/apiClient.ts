let activeLicitanteId: string | null = null;

export function setActiveLicitanteId(id: string | null): void {
  activeLicitanteId = id;
}

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = options.body instanceof FormData
    ? { ...(options.headers as Record<string, string>) }
    : { 'Content-Type': 'application/json', ...(options.headers as Record<string, string>) };
  if (activeLicitanteId) {
    headers['x-licitante-id'] = activeLicitanteId;
  }
  return fetch(url, { ...options, credentials: 'include', headers });
}

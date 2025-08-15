export type ApiResult<T> = { data?: T; error?: string };

export async function api<T>(path: string, options: RequestInit = {}): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`/api${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
    const contentType = res.headers.get('content-type') || '';
    const body = contentType.includes('application/json') ? await res.json() : await res.text();
    if (!res.ok) {
      const error = (body && (body.error || body.message)) || res.statusText;
      if (error === 'db_unavailable') {
        window.dispatchEvent(new CustomEvent('db_unavailable'));
      }
      return { error } as ApiResult<T>;
    }
    return { data: body } as ApiResult<T>;
  } catch (e: any) {
    return { error: e?.message || 'network_error' } as ApiResult<T>;
  }
}
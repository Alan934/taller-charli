const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';
const TOKEN_KEY = 'taller-charli.token';

interface RequestOptions extends RequestInit {
  token?: string | null;
  body?: unknown;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, body, headers, ...rest } = options;

  const response = await fetch(`${API_URL}${path}`, {
    method: rest.method ?? (body ? 'POST' : 'GET'),
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const message = Array.isArray(payload?.message)
      ? payload.message.join(', ')
      : payload?.message ?? 'Error inesperado';

    if (response.status === 401) {
      // Don't global redirect if we are just trying to login
      if (!path.includes('/auth/login')) {
        localStorage.removeItem(TOKEN_KEY);
        // Use hash-based navigation for HashRouter
        window.location.hash = '/auth/login';
        throw new Error('Sesión expirada. Inicia sesión nuevamente.');
      }
    }

    throw new Error(message);
  }

  return payload as T;
}

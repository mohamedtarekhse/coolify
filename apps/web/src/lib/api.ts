const API_BASE = import.meta.env.VITE_API_URL || '';

function buildUrl(path: string) {
  return API_BASE ? `${API_BASE}${path}` : path;
}

export async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(buildUrl(path));
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

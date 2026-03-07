export async function fetchJson<T>(url: string, revalidate = 1200): Promise<T> {
  const response = await fetch(url, { next: { revalidate } });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

export function asArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

export async function http<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const firstValidationError = body?.errors ? Object.values(body.errors)[0] as string[] | undefined : undefined
    throw new Error(firstValidationError?.[0] ?? body?.message ?? `Request failed: ${response.status}`)
  }

  if (response.status === 204) return undefined as T

  return response.json()
}

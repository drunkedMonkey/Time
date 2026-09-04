import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { http } from '@/shared/http'
import { useAuthStore } from './auth.store'

vi.mock('@/shared/http', () => ({ http: vi.fn() }))

const mockedHttp = vi.mocked(http)

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  mockedHttp.mockReset()
})

describe('auth store', () => {
  it('stores the token and user on successful login', async () => {
    mockedHttp.mockResolvedValue({
      token: 'abc123',
      user: { id: 1, name: 'Admin Demo', email: 'admin@time.test', role: 'admin', business_id: null },
    })

    const auth = useAuthStore()
    await auth.login('admin@time.test', 'password')

    expect(auth.token).toBe('abc123')
    expect(auth.user?.name).toBe('Admin Demo')
    expect(auth.isAuthenticated).toBe(true)
    expect(localStorage.getItem('token')).toBe('abc123')
  })

  it('propagates the error and leaves state unauthenticated on failed login', async () => {
    mockedHttp.mockRejectedValue(new Error('Credenciales inválidas.'))

    const auth = useAuthStore()
    await expect(auth.login('admin@time.test', 'wrong')).rejects.toThrow('Credenciales inválidas.')

    expect(auth.isAuthenticated).toBe(false)
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('clears token and user on logout', async () => {
    mockedHttp.mockResolvedValueOnce({
      token: 'abc123',
      user: { id: 1, name: 'Admin Demo', email: 'admin@time.test', role: 'admin', business_id: null },
    })
    const auth = useAuthStore()
    await auth.login('admin@time.test', 'password')

    mockedHttp.mockResolvedValueOnce(undefined)
    await auth.logout()

    expect(auth.token).toBeNull()
    expect(auth.user).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()
  })
})

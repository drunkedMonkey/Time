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

  describe('restoreSession', () => {
    it('fetches the user when a token exists but the user was lost (e.g. page reload)', async () => {
      mockedHttp.mockResolvedValue({ id: 1, name: 'Admin Demo', email: 'admin@time.test', role: 'admin', business_id: null })

      const auth = useAuthStore()
      auth.token = 'abc123'

      await auth.restoreSession()

      expect(mockedHttp).toHaveBeenCalledWith('/user')
      expect(auth.user?.name).toBe('Admin Demo')
      expect(auth.isAuthenticated).toBe(true)
    })

    it('clears the stale token when it is no longer valid, instead of leaving a broken session', async () => {
      mockedHttp.mockRejectedValue(new Error('Unauthenticated.'))
      localStorage.setItem('token', 'stale-token')

      const auth = useAuthStore()
      auth.token = 'stale-token'

      await auth.restoreSession()

      expect(auth.token).toBeNull()
      expect(auth.user).toBeNull()
      expect(auth.isAuthenticated).toBe(false)
      expect(localStorage.getItem('token')).toBeNull()
    })

    it('does nothing when there is no token', async () => {
      const auth = useAuthStore()

      await auth.restoreSession()

      expect(mockedHttp).not.toHaveBeenCalled()
    })

    it('does nothing when the user is already loaded', async () => {
      const auth = useAuthStore()
      auth.token = 'abc123'
      auth.user = { id: 1, name: 'Admin Demo', email: 'admin@time.test', role: 'admin', business_id: null }

      await auth.restoreSession()

      expect(mockedHttp).not.toHaveBeenCalled()
    })
  })
})

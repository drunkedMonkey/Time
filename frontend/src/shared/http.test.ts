import { afterEach, describe, expect, it, vi } from 'vitest'
import { http } from './http'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('http', () => {
  it('throws the first validation error message when the API returns a 422', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        json: async () => ({
          message: 'The given data was invalid.',
          errors: { dni: ['El DNI ya está en uso.'], email: ['El email ya está en uso.'] },
        }),
      }),
    )

    await expect(http('/users', { method: 'POST' })).rejects.toThrow('El DNI ya está en uso.')
  })

  it('falls back to the generic message when there are no validation errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({ message: 'This action is unauthorized.' }),
      }),
    )

    await expect(http('/users')).rejects.toThrow('This action is unauthorized.')
  })
})

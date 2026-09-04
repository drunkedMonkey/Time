import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '@/features/auth/auth.store'
import router from './index'

beforeEach(async () => {
  setActivePinia(createPinia())
  localStorage.clear()
  const auth = useAuthStore()
  auth.token = null
  auth.user = null
  await router.push('/login')
})

describe('router', () => {
  it('redirects a non-admin away from /admin to their own business', async () => {
    const auth = useAuthStore()
    auth.token = 'token'
    auth.user = { id: 2, name: 'Empleada Sara', email: 'sara@time.test', role: 'employee', business_id: 1 }

    await router.push('/admin')

    expect(router.currentRoute.value.name).toBe('business-home')
    expect(router.currentRoute.value.params.id).toBe('1')
  })

  it('lets an admin reach /admin', async () => {
    const auth = useAuthStore()
    auth.token = 'token'
    auth.user = { id: 1, name: 'Admin Demo', email: 'admin@time.test', role: 'admin', business_id: null }

    await router.push('/admin')

    expect(router.currentRoute.value.name).toBe('admin-home')
  })

  it('redirects to login when not authenticated', async () => {
    await router.push('/admin')

    expect(router.currentRoute.value.name).toBe('login')
  })

  it('lets staff reach their own business', async () => {
    const auth = useAuthStore()
    auth.token = 'token'
    auth.user = { id: 2, name: 'Empleada Sara', email: 'sara@time.test', role: 'employee', business_id: 1 }

    await router.push('/businesses/1')

    expect(router.currentRoute.value.name).toBe('business-home')
  })

  it("redirects staff away from another business to their own", async () => {
    const auth = useAuthStore()
    auth.token = 'token'
    auth.user = { id: 2, name: 'Empleada Sara', email: 'sara@time.test', role: 'employee', business_id: 1 }

    await router.push('/businesses/2')

    expect(router.currentRoute.value.params.id).toBe('1')
  })

  it('lets an admin reach any business route', async () => {
    const auth = useAuthStore()
    auth.token = 'token'
    auth.user = { id: 1, name: 'Admin Demo', email: 'admin@time.test', role: 'admin', business_id: null }

    await router.push('/businesses/42')

    expect(router.currentRoute.value.name).toBe('business-home')
    expect(router.currentRoute.value.params.id).toBe('42')
  })
})

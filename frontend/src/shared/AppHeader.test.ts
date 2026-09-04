import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import { http } from '@/shared/http'
import { useAuthStore } from '@/features/auth/auth.store'
import AppHeader from './AppHeader.vue'

vi.mock('@/shared/http', () => ({ http: vi.fn() }))

const mockedHttp = vi.mocked(http)

beforeEach(() => {
  setActivePinia(createPinia())
  mockedHttp.mockReset()
})

describe('AppHeader', () => {
  it('logs out and redirects to /login when clicking "Cerrar sesión"', async () => {
    mockedHttp.mockResolvedValue(undefined)

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/login', component: { template: '<div>login</div>' } },
        { path: '/', component: AppHeader },
      ],
    })
    router.push('/')
    await router.isReady()

    const auth = useAuthStore()
    auth.token = 'abc123'
    auth.user = { id: 1, name: 'Admin Demo', email: 'admin@time.test', role: 'admin', business_id: null }

    const wrapper = mount(AppHeader, { global: { plugins: [router] } })
    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(auth.isAuthenticated).toBe(false)
    expect(router.currentRoute.value.path).toBe('/login')
  })
})

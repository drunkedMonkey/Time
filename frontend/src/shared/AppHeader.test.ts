import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import { http } from '@/shared/http'
import { useAuthStore } from '@/features/auth/auth.store'
import AppHeader from './AppHeader.vue'

vi.mock('@/shared/http', () => ({ http: vi.fn() }))

const mockedHttp = vi.mocked(http)

function buildRouter(initialPath: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/login', name: 'login', component: { template: '<div>login</div>' } },
      { path: '/admin', name: 'admin-home', component: AppHeader },
      { path: '/businesses/:id', name: 'business-home', component: AppHeader },
    ],
  })
  router.push(initialPath)
  return router
}

beforeEach(() => {
  setActivePinia(createPinia())
  mockedHttp.mockReset()
})

describe('AppHeader', () => {
  it('logs out and redirects to /login when clicking "Cerrar sesión"', async () => {
    mockedHttp.mockResolvedValue(undefined)
    const router = buildRouter('/admin')
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

  it('shows a link back to the admin panel when an admin is viewing a business', async () => {
    const router = buildRouter('/businesses/1')
    await router.isReady()

    const auth = useAuthStore()
    auth.token = 'abc123'
    auth.user = { id: 1, name: 'Admin Demo', email: 'admin@time.test', role: 'admin', business_id: null }

    const wrapper = mount(AppHeader, { global: { plugins: [router] } })

    expect(wrapper.text()).toContain('Volver al panel de administrador')
  })

  it('hides the link back to the admin panel while already on it', async () => {
    const router = buildRouter('/admin')
    await router.isReady()

    const auth = useAuthStore()
    auth.token = 'abc123'
    auth.user = { id: 1, name: 'Admin Demo', email: 'admin@time.test', role: 'admin', business_id: null }

    const wrapper = mount(AppHeader, { global: { plugins: [router] } })

    expect(wrapper.text()).not.toContain('Volver al panel de administrador')
  })

  it('hides the link back to the admin panel for non-admin roles', async () => {
    const router = buildRouter('/businesses/1')
    await router.isReady()

    const auth = useAuthStore()
    auth.token = 'abc123'
    auth.user = { id: 2, name: 'Empleada Sara', email: 'sara@time.test', role: 'employee', business_id: 1 }

    const wrapper = mount(AppHeader, { global: { plugins: [router] } })

    expect(wrapper.text()).not.toContain('Volver al panel de administrador')
  })
})

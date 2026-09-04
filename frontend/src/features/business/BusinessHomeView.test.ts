import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import { http } from '@/shared/http'
import { useAuthStore } from '@/features/auth/auth.store'
import BusinessHomeView from './BusinessHomeView.vue'

vi.mock('@/shared/http', () => ({ http: vi.fn() }))

const mockedHttp = vi.mocked(http)

async function renderAs(role: 'admin' | 'supervisor' | 'employee') {
  mockedHttp.mockResolvedValue({ id: 1, ownerId: 1, name: 'Peluquería Ana' })

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/businesses/:id', name: 'business-home', component: BusinessHomeView }],
  })
  router.push('/businesses/1')
  await router.isReady()

  const auth = useAuthStore()
  auth.token = 'token'
  auth.user = { id: 9, name: 'Quien sea', email: 'x@time.test', role, business_id: 1 }

  const wrapper = mount(BusinessHomeView, { global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

beforeEach(() => {
  setActivePinia(createPinia())
  mockedHttp.mockReset()
})

describe('BusinessHomeView', () => {
  it('loads and shows the business name', async () => {
    const wrapper = await renderAs('admin')

    expect(mockedHttp).toHaveBeenCalledWith('/businesses/1')
    expect(wrapper.text()).toContain('Peluquería Ana')
  })

  it('shows the "Resumen" menu item for every role', async () => {
    for (const role of ['admin', 'supervisor', 'employee'] as const) {
      const wrapper = await renderAs(role)
      expect(wrapper.text()).toContain('Resumen')
    }
  })
})

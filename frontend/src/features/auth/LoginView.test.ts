import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import { http } from '@/shared/http'
import LoginView from './LoginView.vue'

vi.mock('@/shared/http', () => ({ http: vi.fn() }))

const mockedHttp = vi.mocked(http)

function buildRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/login', name: 'login', component: LoginView },
      { path: '/admin', name: 'admin-home', component: { template: '<div>admin</div>' } },
      { path: '/businesses/:id', name: 'business-home', component: { template: '<div>business</div>' } },
    ],
  })
}

beforeEach(() => {
  setActivePinia(createPinia())
  mockedHttp.mockReset()
})

describe('LoginView', () => {
  it('redirects an admin to /admin on success', async () => {
    mockedHttp.mockResolvedValue({
      token: 'abc123',
      user: { id: 1, name: 'Admin Demo', email: 'admin@time.test', role: 'admin', business_id: null },
    })

    const router = buildRouter()
    router.push('/login')
    await router.isReady()

    const wrapper = mount(LoginView, { global: { plugins: [router] } })

    await wrapper.find('#email').setValue('admin@time.test')
    await wrapper.find('#password').setValue('password')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/admin')
  })

  it('redirects a non-admin to their business home on success', async () => {
    mockedHttp.mockResolvedValue({
      token: 'xyz789',
      user: { id: 2, name: 'Empleada Sara', email: 'sara@time.test', role: 'employee', business_id: 1 },
    })

    const router = buildRouter()
    router.push('/login')
    await router.isReady()

    const wrapper = mount(LoginView, { global: { plugins: [router] } })

    await wrapper.find('#email').setValue('sara@time.test')
    await wrapper.find('#password').setValue('password')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/businesses/1')
  })

  it('shows an error message on failed login', async () => {
    mockedHttp.mockRejectedValue(new Error('Credenciales inválidas.'))

    const router = buildRouter()
    router.push('/login')
    await router.isReady()

    const wrapper = mount(LoginView, { global: { plugins: [router] } })

    await wrapper.find('#email').setValue('admin@time.test')
    await wrapper.find('#password').setValue('wrong')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.text()).toContain('Credenciales inválidas.')
    expect(router.currentRoute.value.path).toBe('/login')
  })
})

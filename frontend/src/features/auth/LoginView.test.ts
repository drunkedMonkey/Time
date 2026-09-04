import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import { http } from '@/shared/http'
import LoginView from './LoginView.vue'

vi.mock('@/shared/http', () => ({ http: vi.fn() }))

const mockedHttp = vi.mocked(http)

beforeEach(() => {
  setActivePinia(createPinia())
  mockedHttp.mockReset()
})

describe('LoginView', () => {
  it('logs in and redirects to the dashboard on success', async () => {
    mockedHttp.mockResolvedValue({
      token: 'abc123',
      user: { id: 1, name: 'Admin Demo', email: 'admin@time.test', role: 'admin', business_id: null },
    })

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/login', component: LoginView },
        { path: '/', component: { template: '<div>home</div>' } },
      ],
    })
    router.push('/login')
    await router.isReady()

    const wrapper = mount(LoginView, { global: { plugins: [router] } })

    await wrapper.find('#email').setValue('admin@time.test')
    await wrapper.find('#password').setValue('password')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/')
  })

  it('shows an error message on failed login', async () => {
    mockedHttp.mockRejectedValue(new Error('Credenciales inválidas.'))

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/login', component: LoginView },
        { path: '/', component: { template: '<div>home</div>' } },
      ],
    })
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

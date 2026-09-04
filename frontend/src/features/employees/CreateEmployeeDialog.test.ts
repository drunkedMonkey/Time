import { mount, flushPromises, DOMWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { http } from '@/shared/http'
import CreateEmployeeDialog from './CreateEmployeeDialog.vue'

vi.mock('@/shared/http', () => ({ http: vi.fn() }))

const mockedHttp = vi.mocked(http)

const businesses = [
  { id: 1, ownerId: 1, name: 'Peluquería Ana' },
  { id: 2, ownerId: 1, name: 'Restaurante Luis' },
]

beforeEach(() => {
  mockedHttp.mockReset()
})

afterEach(() => {
  document.body.innerHTML = ''
})

async function fillAndSubmit(body: DOMWrapper<HTMLElement>) {
  await body.find('#emp-name').setValue('Sara Pérez')
  await body.find('#emp-dni').setValue('12345678A')
  await body.find('#emp-email').setValue('sara@time.test')
  await body.find('#emp-password').setValue('password123')
  await body.find('form').trigger('submit.prevent')
  await flushPromises()
}

describe('CreateEmployeeDialog', () => {
  it('creates a supervisor/employee with the selected business and emits the result', async () => {
    mockedHttp.mockResolvedValue({
      id: 10,
      name: 'Sara Pérez',
      email: 'sara@time.test',
      dni: '12345678A',
      employee_number: 'EMP-001',
      role: 'employee',
      business_id: 1,
    })

    const wrapper = mount(CreateEmployeeDialog, { props: { businesses }, attachTo: document.body })
    await wrapper.find('button').trigger('click')
    await flushPromises()

    await fillAndSubmit(new DOMWrapper(document.body))

    expect(mockedHttp).toHaveBeenCalledWith('/users', expect.objectContaining({ method: 'POST' }))
    const body = JSON.parse(mockedHttp.mock.calls[0][1]!.body as string)
    expect(body.name).toBe('Sara Pérez')
    expect(body.role).toBe('employee')

    expect(wrapper.emitted('created')?.[0][0]).toMatchObject({ name: 'Sara Pérez' })
  })

  it('shows the error returned by the API without closing the dialog', async () => {
    mockedHttp.mockRejectedValue(new Error('El DNI ya está en uso.'))

    const wrapper = mount(CreateEmployeeDialog, { props: { businesses }, attachTo: document.body })
    await wrapper.find('button').trigger('click')
    await flushPromises()

    await fillAndSubmit(new DOMWrapper(document.body))

    expect(document.body.textContent).toContain('El DNI ya está en uso.')
  })
})

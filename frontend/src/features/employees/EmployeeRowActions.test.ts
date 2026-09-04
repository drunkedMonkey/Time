import { mount, flushPromises, DOMWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { http } from '@/shared/http'
import EmployeeRowActions from './EmployeeRowActions.vue'

vi.mock('@/shared/http', () => ({ http: vi.fn() }))

const mockedHttp = vi.mocked(http)

const employee = {
  id: 7,
  name: 'Sara Pérez',
  email: 'sara@time.test',
  dni: '12345678A',
  employee_number: 'EMP-00007',
  role: 'employee' as const,
  business_id: 1,
}

const businesses = [{ id: 1, ownerId: 1, name: 'Peluquería Ana' }]

beforeEach(() => {
  mockedHttp.mockReset()
})

afterEach(() => {
  document.body.innerHTML = ''
})

async function openMenuAndClick(wrapper: ReturnType<typeof mount>, label: string) {
  await wrapper.find('button').trigger('click')
  await flushPromises()
  const body = new DOMWrapper(document.body)
  const item = body.findAll('[role="menuitem"]').find((el) => el.text() === label)!
  await item.trigger('click')
  await flushPromises()
}

describe('EmployeeRowActions', () => {
  it('shows a dissuasive confirmation (not real deletion) before unassigning', async () => {
    const wrapper = mount(EmployeeRowActions, { props: { employee, businesses }, attachTo: document.body })
    await openMenuAndClick(wrapper, 'Eliminar')

    expect(document.body.textContent).toContain('¿Eliminar a «Sara Pérez»?')
    expect(document.body.textContent).toContain('No se borrarán sus datos')
    expect(mockedHttp).not.toHaveBeenCalled()
  })

  it('unassigns the employee and emits "unassigned" on confirm', async () => {
    mockedHttp.mockResolvedValue({ ...employee, business_id: null })

    const wrapper = mount(EmployeeRowActions, { props: { employee, businesses }, attachTo: document.body })
    await openMenuAndClick(wrapper, 'Eliminar')

    const dialog = new DOMWrapper(document.body.querySelector('[data-slot="alert-dialog-content"]')!)
    await dialog.findAll('button').find((b) => b.text() === 'Eliminar')!.trigger('click')
    await flushPromises()

    expect(mockedHttp).toHaveBeenCalledWith('/users/7/unassign', { method: 'POST' })
    expect(wrapper.emitted('unassigned')?.[0]).toEqual([{ ...employee, business_id: null }])
  })

  it('opens the edit form pre-filled with the current data', async () => {
    const wrapper = mount(EmployeeRowActions, { props: { employee, businesses }, attachTo: document.body })
    await openMenuAndClick(wrapper, 'Editar')

    const nameInput = document.body.querySelector('#edit-name') as HTMLInputElement
    const dniInput = document.body.querySelector('#edit-dni') as HTMLInputElement
    expect(nameInput.value).toBe('Sara Pérez')
    expect(dniInput.value).toBe('12345678A')
  })

  it('saves changes and emits "updated"', async () => {
    const updatedEmployee = { ...employee, name: 'Sara P. Actualizada', role: 'supervisor' as const }
    mockedHttp.mockResolvedValue(updatedEmployee)

    const wrapper = mount(EmployeeRowActions, { props: { employee, businesses }, attachTo: document.body })
    await openMenuAndClick(wrapper, 'Editar')

    const body = new DOMWrapper(document.body)
    await body.find('#edit-name').setValue('Sara P. Actualizada')
    await body.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(mockedHttp).toHaveBeenCalledWith('/users/7', expect.objectContaining({ method: 'PUT' }))
    expect(wrapper.emitted('updated')?.[0]).toEqual([updatedEmployee])
  })
})

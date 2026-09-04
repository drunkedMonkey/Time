import { mount, flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { http } from '@/shared/http'
import EmployeesPanel from './EmployeesPanel.vue'

vi.mock('@/shared/http', () => ({ http: vi.fn() }))

const mockedHttp = vi.mocked(http)

const businesses = [{ id: 1, ownerId: 1, name: 'Peluquería Ana' }]

beforeEach(() => {
  vi.useFakeTimers()
  mockedHttp.mockReset()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('EmployeesPanel', () => {
  it('loads and lists employees with their business name', async () => {
    mockedHttp.mockResolvedValue([
      { id: 1, name: 'Sara Pérez', email: 's@t.test', dni: '111', employee_number: 'EMP-1', role: 'employee', business_id: 1 },
    ])

    const wrapper = mount(EmployeesPanel, { props: { businesses } })
    await flushPromises()

    expect(wrapper.text()).toContain('Sara Pérez')
    expect(wrapper.text()).toContain('Peluquería Ana')
  })

  it('debounces the search input before calling the API again', async () => {
    mockedHttp.mockResolvedValue([])

    const wrapper = mount(EmployeesPanel, { props: { businesses } })
    await flushPromises()
    expect(mockedHttp).toHaveBeenCalledTimes(1)

    await wrapper.find('#employee-search').setValue('Sara')
    expect(mockedHttp).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(300)
    await flushPromises()

    expect(mockedHttp).toHaveBeenCalledTimes(2)
    expect(mockedHttp).toHaveBeenLastCalledWith('/users?search=Sara')
  })
})

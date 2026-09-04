import { mount, flushPromises, DOMWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { http } from '@/shared/http'
import DeleteBusinessButton from './DeleteBusinessButton.vue'

vi.mock('@/shared/http', () => ({ http: vi.fn() }))

const mockedHttp = vi.mocked(http)

const business = { id: 1, ownerId: 1, name: 'Peluquería Ana' }

beforeEach(() => {
  mockedHttp.mockReset()
})

afterEach(() => {
  document.body.innerHTML = ''
})

describe('DeleteBusinessButton', () => {
  it('asks for confirmation before deleting', async () => {
    const wrapper = mount(DeleteBusinessButton, { props: { business }, attachTo: document.body })
    await wrapper.find('button').trigger('click')
    await flushPromises()

    const body = new DOMWrapper(document.body)
    expect(body.text()).toContain('¿Eliminar «Peluquería Ana»?')
    expect(mockedHttp).not.toHaveBeenCalled()
  })

  it('deletes and emits "deleted" when the user confirms', async () => {
    mockedHttp.mockResolvedValue(undefined)

    const wrapper = mount(DeleteBusinessButton, { props: { business }, attachTo: document.body })
    await wrapper.find('button').trigger('click')
    await flushPromises()

    const dialog = new DOMWrapper(document.body.querySelector('[data-slot="alert-dialog-content"]')!)
    const confirmButton = dialog.findAll('button').find((b) => b.text() === 'Eliminar')!
    await confirmButton.trigger('click')
    await flushPromises()

    expect(mockedHttp).toHaveBeenCalledWith('/businesses/1', { method: 'DELETE' })
    expect(wrapper.emitted('deleted')?.[0]).toEqual([1])
  })

  it('does not close the dialog and shows the error when deletion fails', async () => {
    mockedHttp.mockRejectedValue(new Error('No se pudo eliminar el negocio'))

    const wrapper = mount(DeleteBusinessButton, { props: { business }, attachTo: document.body })
    await wrapper.find('button').trigger('click')
    await flushPromises()

    const dialog = new DOMWrapper(document.body.querySelector('[data-slot="alert-dialog-content"]')!)
    const confirmButton = dialog.findAll('button').find((b) => b.text() === 'Eliminar')!
    await confirmButton.trigger('click')
    await flushPromises()

    expect(document.body.textContent).toContain('No se pudo eliminar el negocio')
    expect(wrapper.emitted('deleted')).toBeUndefined()
  })

  it("cancelling doesn't call the API", async () => {
    const wrapper = mount(DeleteBusinessButton, { props: { business }, attachTo: document.body })
    await wrapper.find('button').trigger('click')
    await flushPromises()

    const body = new DOMWrapper(document.body)
    const cancelButton = body.findAll('button').find((b) => b.text() === 'Cancelar')!
    await cancelButton.trigger('click')
    await flushPromises()

    expect(mockedHttp).not.toHaveBeenCalled()
  })
})

import { http } from '@/shared/http'

export interface Business {
  id: number
  ownerId: number
  name: string
}

export function listBusinesses() {
  return http<Business[]>('/businesses')
}

export function createBusiness(name: string) {
  return http<Business>('/businesses', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export function deleteBusiness(id: number) {
  return http<void>(`/businesses/${id}`, { method: 'DELETE' })
}

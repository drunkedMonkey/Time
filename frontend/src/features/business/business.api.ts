import { http } from '@/shared/http'
import type { Business } from '@/features/admin/businesses.api'

export function getBusiness(id: number | string) {
  return http<Business>(`/businesses/${id}`)
}

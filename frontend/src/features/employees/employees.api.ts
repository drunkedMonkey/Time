import { http } from '@/shared/http'

export interface Employee {
  id: number
  name: string
  email: string
  dni: string
  employee_number: string
  role: 'admin' | 'supervisor' | 'employee'
  business_id: number | null
}

export interface CreateEmployeePayload {
  name: string
  email: string
  password: string
  dni: string
  role: 'admin' | 'supervisor' | 'employee'
  business_id: number | null
}

export interface UpdateEmployeePayload {
  name: string
  dni: string
  role: 'admin' | 'supervisor' | 'employee'
  business_id: number | null
}

export function listEmployees(search: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : ''
  return http<Employee[]>(`/users${query}`)
}

export function createEmployee(payload: CreateEmployeePayload) {
  return http<Employee>('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateEmployee(id: number, payload: UpdateEmployeePayload) {
  return http<Employee>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function unassignEmployee(id: number) {
  return http<Employee>(`/users/${id}/unassign`, { method: 'POST' })
}

import { defineStore } from 'pinia'
import { http } from '@/shared/http'

interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'supervisor' | 'employee'
  business_id: number | null
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem('token'),
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async login(email: string, password: string) {
      const { token, user } = await http<{ token: string; user: User }>('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      this.token = token
      this.user = user
      localStorage.setItem('token', token)
    },

    async logout() {
      await http('/logout', { method: 'POST' })
      this.token = null
      this.user = null
      localStorage.removeItem('token')
    },
  },
})

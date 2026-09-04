import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/features/auth/auth.store'
import LoginView from '@/features/auth/LoginView.vue'
import AdminHomeView from '@/features/admin/AdminHomeView.vue'
import BusinessHomeView from '@/features/business/BusinessHomeView.vue'

export function homeRoute(user: { role: string; business_id: number | null } | null) {
  if (!user) return { name: 'login' }
  if (user.role === 'admin') return { name: 'admin-home' }
  if (user.business_id) return { name: 'business-home', params: { id: user.business_id } }
  return { name: 'login' }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: LoginView },
    { path: '/admin', name: 'admin-home', component: AdminHomeView, meta: { requiresAdmin: true } },
    { path: '/businesses/:id', name: 'business-home', component: BusinessHomeView },
    { path: '/', name: 'root', component: { render: () => null } },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (auth.token && !auth.user) {
    await auth.restoreSession()
  }

  if (to.name === 'root') {
    return homeRoute(auth.user)
  }

  if (to.name !== 'login' && !auth.isAuthenticated) {
    return { name: 'login' }
  }

  if (to.name === 'login' && auth.isAuthenticated) {
    return homeRoute(auth.user)
  }

  if (to.meta.requiresAdmin && auth.user?.role !== 'admin') {
    return homeRoute(auth.user)
  }

  if (
    to.name === 'business-home' &&
    auth.user?.role !== 'admin' &&
    String(auth.user?.business_id) !== String(to.params.id)
  ) {
    return homeRoute(auth.user)
  }
})

export default router

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/features/auth/auth.store'

const auth = useAuthStore()
const router = useRouter()

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  supervisor: 'Supervisor',
  employee: 'Empleado',
}

async function onLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <header class="border-b border-border px-6 py-5 lg:px-10">
    <div class="flex items-center justify-between">
      <div>
        <span class="font-display text-lg">Time</span>
        <p class="mt-0.5 text-sm text-muted-foreground">
          {{ roleLabels[auth.user?.role ?? 'employee'] }}
        </p>
      </div>
      <Button variant="outline" size="sm" @click="onLogout">Cerrar sesión</Button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AppHeader from '@/shared/AppHeader.vue'
import { useAuthStore } from '@/features/auth/auth.store'
import EmployeesPanel from '@/features/employees/EmployeesPanel.vue'
import { createBusiness, listBusinesses, type Business } from './businesses.api'

const auth = useAuthStore()
const businesses = ref<Business[]>([])
const loading = ref(true)
const newName = ref('')
const creating = ref(false)
const error = ref('')
const tab = ref<'businesses' | 'employees'>('businesses')

async function load() {
  loading.value = true
  try {
    businesses.value = await listBusinesses()
  } finally {
    loading.value = false
  }
}

async function onCreate() {
  error.value = ''
  creating.value = true
  try {
    const business = await createBusiness(newName.value)
    businesses.value.push(business)
    newName.value = ''
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se pudo crear el negocio'
  } finally {
    creating.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="min-h-[100dvh] bg-paper">
    <AppHeader />

    <main class="px-6 py-10 lg:px-10">
      <h1 class="font-display text-3xl text-foreground">Panel de administrador, {{ auth.user?.name }}</h1>

      <nav class="mt-6 flex gap-1 border-b border-border">
        <button
          type="button"
          class="border-b-2 px-3 py-2 text-sm"
          :class="tab === 'businesses' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'"
          @click="tab = 'businesses'"
        >
          Negocios
        </button>
        <button
          type="button"
          class="border-b-2 px-3 py-2 text-sm"
          :class="tab === 'employees' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'"
          @click="tab = 'employees'"
        >
          Empleados
        </button>
      </nav>

      <section v-if="tab === 'businesses'" class="mt-8">
        <p class="text-muted-foreground">Gestiona cada negocio que tienes dado de alta.</p>

        <form class="mt-6 flex max-w-md items-end gap-3" @submit.prevent="onCreate">
          <div class="flex-1 space-y-1.5">
            <Label for="business-name">Nuevo negocio</Label>
            <Input id="business-name" v-model="newName" placeholder="Peluquería Ana" required />
          </div>
          <Button type="submit" :disabled="creating">{{ creating ? 'Creando…' : 'Crear' }}</Button>
        </form>
        <p v-if="error" class="mt-2 max-w-md text-sm text-destructive">{{ error }}</p>

        <div class="mt-10">
          <p v-if="loading" class="text-muted-foreground">Cargando negocios…</p>
          <p v-else-if="businesses.length === 0" class="text-muted-foreground">
            Todavía no has dado de alta ningún negocio.
          </p>
          <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <RouterLink
              v-for="business in businesses"
              :key="business.id"
              :to="{ name: 'business-home', params: { id: business.id } }"
              class="block transition-opacity hover:opacity-80"
            >
              <Card>
                <CardHeader>
                  <CardTitle class="font-display text-xl font-normal">{{ business.name }}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p class="text-sm text-muted-foreground">Sin citas registradas todavía</p>
                </CardContent>
              </Card>
            </RouterLink>
          </div>
        </div>
      </section>

      <section v-else class="mt-8">
        <EmployeesPanel :businesses="businesses" />
      </section>
    </main>
  </div>
</template>

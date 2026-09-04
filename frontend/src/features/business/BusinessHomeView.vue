<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AppHeader from '@/shared/AppHeader.vue'
import { useAuthStore } from '@/features/auth/auth.store'
import { getBusiness } from './business.api'
import { menuForRole } from './menu'
import type { Business } from '@/features/admin/businesses.api'

const route = useRoute()
const auth = useAuthStore()
const business = ref<Business | null>(null)
const loading = ref(true)

const menuItems = computed(() => menuForRole(auth.user?.role))

async function load() {
  loading.value = true
  business.value = await getBusiness(route.params.id as string)
  loading.value = false
}

onMounted(load)
</script>

<template>
  <div class="min-h-[100dvh] bg-paper">
    <AppHeader />

    <div class="flex">
      <aside class="w-56 shrink-0 border-r border-border px-4 py-8">
        <nav class="space-y-1">
          <a
            v-for="item in menuItems"
            :key="item.label"
            href="#"
            class="block rounded-md px-3 py-2 text-sm text-foreground bg-accent"
          >
            {{ item.label }}
          </a>
        </nav>
      </aside>

      <main class="flex-1 px-6 py-10 lg:px-10">
        <p v-if="loading" class="text-muted-foreground">Cargando…</p>
        <template v-else-if="business">
          <h1 class="font-display text-3xl text-foreground">{{ business.name }}</h1>
          <p class="mt-1 text-muted-foreground">Esto es lo que tienes hoy.</p>

          <div class="mt-8 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle class="text-sm font-normal text-muted-foreground">Citas hoy</CardTitle>
              </CardHeader>
              <CardContent>
                <p class="font-display text-4xl text-foreground">0</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle class="text-sm font-normal text-muted-foreground">Vía WhatsApp</CardTitle>
              </CardHeader>
              <CardContent>
                <p class="font-display text-4xl text-foreground">0</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle class="text-sm font-normal text-muted-foreground">Vía llamada</CardTitle>
              </CardHeader>
              <CardContent>
                <p class="font-display text-4xl text-foreground">0</p>
              </CardContent>
            </Card>
          </div>
        </template>
      </main>
    </div>
  </div>
</template>

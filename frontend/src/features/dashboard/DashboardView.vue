<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AppHeader from '@/shared/AppHeader.vue'
import { useAuthStore } from '@/features/auth/auth.store'

const auth = useAuthStore()
</script>

<template>
  <div class="min-h-[100dvh] bg-paper">
    <AppHeader />

    <main class="px-6 py-10 lg:px-10">
      <h1 class="font-display text-3xl text-foreground">Hola, {{ auth.user?.name }}</h1>
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
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { homeRoute } from '@/router'
import { useAuthStore } from './auth.store'

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const auth = useAuthStore()
const router = useRouter()

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.push(homeRoute(auth.user))
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="grid min-h-[100dvh] lg:grid-cols-[1.1fr_1fr]">
    <div class="relative hidden overflow-hidden bg-ink px-16 py-14 text-paper lg:flex lg:flex-col lg:justify-between">
      <div
        class="pointer-events-none absolute inset-0 opacity-[0.07]"
        style="background-image: radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0); background-size: 22px 22px"
      />
      <span class="font-display text-2xl">Time</span>
      <div class="relative max-w-md">
        <p class="font-display text-[2.75rem] leading-[1.08] text-paper">
          La agenda que tus clientes gestionan solos.
        </p>
        <p class="mt-6 text-ink-soft">
          WhatsApp, llamadas o mano — cada cita llega al mismo sitio, sin que nadie tenga que perseguirla.
        </p>
      </div>
      <p class="relative text-sm text-ink-soft">Peluquerías · Restaurantes · Sastrerías</p>
    </div>

    <div class="flex items-center justify-center px-6 py-16">
      <form class="w-full max-w-sm" @submit.prevent="onSubmit">
        <span class="font-display text-xl lg:hidden">Time</span>
        <h1 class="mt-8 font-display text-3xl text-foreground lg:mt-0">Bienvenido de vuelta</h1>
        <p class="mt-2 text-sm text-muted-foreground">Entra con tu cuenta para ver la agenda de hoy.</p>

        <div class="mt-8 space-y-4">
          <div class="space-y-1.5">
            <Label for="email">Email</Label>
            <Input id="email" v-model="email" type="email" placeholder="tu@negocio.com" autocomplete="email" required />
          </div>
          <div class="space-y-1.5">
            <Label for="password">Contraseña</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              autocomplete="current-password"
              required
            />
          </div>
        </div>

        <p v-if="error" class="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {{ error }}
        </p>

        <Button type="submit" class="mt-6 w-full" :disabled="loading">
          {{ loading ? 'Entrando…' : 'Entrar' }}
        </Button>
      </form>
    </div>
  </div>
</template>

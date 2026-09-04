<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Business } from '@/features/admin/businesses.api'
import { createEmployee, type Employee } from './employees.api'

const props = defineProps<{ businesses: Business[] }>()
const emit = defineEmits<{ created: [employee: Employee] }>()

const open = ref(false)
const submitting = ref(false)
const error = ref('')

const form = reactive({
  name: '',
  email: '',
  password: '',
  dni: '',
  role: 'employee' as 'admin' | 'supervisor' | 'employee',
  business_id: undefined as number | undefined,
})

const needsBusiness = computed(() => form.role !== 'admin')

watch(
  () => form.role,
  (role) => {
    if (role === 'admin') form.business_id = undefined
  },
)

function resetForm() {
  form.name = ''
  form.email = ''
  form.password = ''
  form.dni = ''
  form.role = 'employee'
  form.business_id = undefined
  error.value = ''
}

watch(open, (isOpen) => {
  if (!isOpen) resetForm()
})

async function onSubmit() {
  error.value = ''
  submitting.value = true
  try {
    const employee = await createEmployee({
      ...form,
      business_id: needsBusiness.value ? (form.business_id ?? null) : null,
    })
    emit('created', employee)
    open.value = false
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se pudo crear el empleado'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button>Crear empleado</Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Crear empleado</DialogTitle>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <div class="space-y-1.5">
          <Label for="emp-name">Nombre y apellidos</Label>
          <Input id="emp-name" v-model="form.name" required />
        </div>

        <div class="space-y-1.5">
          <Label for="emp-dni">DNI</Label>
          <Input id="emp-dni" v-model="form.dni" required />
        </div>

        <div class="space-y-1.5">
          <Label for="emp-email">Email</Label>
          <Input id="emp-email" v-model="form.email" type="email" required />
        </div>
        <div class="space-y-1.5">
          <Label for="emp-password">Contraseña</Label>
          <Input id="emp-password" v-model="form.password" type="password" minlength="8" required />
        </div>

        <div class="space-y-1.5">
          <Label>Rol</Label>
          <Select v-model="form.role">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Selecciona un rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="supervisor">Supervisor</SelectItem>
              <SelectItem value="employee">Empleado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div v-if="needsBusiness" class="space-y-1.5">
          <Label>Negocio</Label>
          <Select v-model="form.business_id">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Selecciona un negocio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="business in props.businesses" :key="business.id" :value="business.id">
                {{ business.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p v-if="error" class="text-sm text-destructive">{{ error }}</p>

        <DialogFooter>
          <Button type="submit" :disabled="submitting">{{ submitting ? 'Creando…' : 'Crear empleado' }}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

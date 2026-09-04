<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { unassignEmployee, updateEmployee, type Employee } from './employees.api'

const props = defineProps<{ employee: Employee; businesses: Business[] }>()
const emit = defineEmits<{ updated: [employee: Employee]; unassigned: [employee: Employee] }>()

const editOpen = ref(false)
const editSubmitting = ref(false)
const editError = ref('')

const form = reactive({
  name: props.employee.name,
  dni: props.employee.dni,
  role: props.employee.role,
  business_id: props.employee.business_id ?? undefined,
})

const needsBusiness = computed(() => form.role !== 'admin')

watch(
  () => form.role,
  (role) => {
    if (role === 'admin') form.business_id = undefined
  },
)

watch(editOpen, (isOpen) => {
  if (isOpen) {
    form.name = props.employee.name
    form.dni = props.employee.dni
    form.role = props.employee.role
    form.business_id = props.employee.business_id ?? undefined
    editError.value = ''
  }
})

async function onEditSubmit() {
  editError.value = ''
  editSubmitting.value = true
  try {
    const updated = await updateEmployee(props.employee.id, {
      ...form,
      business_id: needsBusiness.value ? (form.business_id ?? null) : null,
    })
    emit('updated', updated)
    editOpen.value = false
  } catch (e) {
    editError.value = e instanceof Error ? e.message : 'No se pudo actualizar el empleado'
  } finally {
    editSubmitting.value = false
  }
}

const unassignOpen = ref(false)
const unassigning = ref(false)
const unassignError = ref('')

async function onConfirmUnassign() {
  unassignError.value = ''
  unassigning.value = true
  try {
    const updated = await unassignEmployee(props.employee.id)
    emit('unassigned', updated)
    unassignOpen.value = false
  } catch (e) {
    unassignError.value = e instanceof Error ? e.message : 'No se pudo desasignar al empleado'
  } finally {
    unassigning.value = false
  }
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon-sm" aria-label="Más opciones">⋯</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem @select="editOpen = true">Editar</DropdownMenuItem>
      <DropdownMenuItem variant="destructive" @select="unassignOpen = true">Eliminar</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>

  <Dialog v-model:open="editOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Editar empleado</DialogTitle>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="onEditSubmit">
        <div class="space-y-1.5">
          <Label for="edit-name">Nombre y apellidos</Label>
          <Input id="edit-name" v-model="form.name" required />
        </div>
        <div class="space-y-1.5">
          <Label for="edit-dni">DNI</Label>
          <Input id="edit-dni" v-model="form.dni" required />
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

        <p v-if="editError" class="text-sm text-destructive">{{ editError }}</p>

        <DialogFooter>
          <Button type="submit" :disabled="editSubmitting">
            {{ editSubmitting ? 'Guardando…' : 'Guardar cambios' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>

  <AlertDialog v-model:open="unassignOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>¿Eliminar a «{{ employee.name }}»?</AlertDialogTitle>
        <AlertDialogDescription>
          No se borrarán sus datos: se le desasignará del negocio actual, conservando su número de empleado, DNI
          y demás información, por si en el futuro vuelve a ser contratado.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <p v-if="unassignError" class="text-sm text-destructive">{{ unassignError }}</p>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <Button variant="destructive" :disabled="unassigning" @click="onConfirmUnassign">
          {{ unassigning ? 'Eliminando…' : 'Eliminar' }}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

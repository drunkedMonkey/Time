<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Input } from '@/components/ui/input'
import type { Business } from '@/features/admin/businesses.api'
import CreateEmployeeDialog from './CreateEmployeeDialog.vue'
import { listEmployees, type Employee } from './employees.api'

const props = defineProps<{ businesses: Business[] }>()

const employees = ref<Employee[]>([])
const loading = ref(true)
const search = ref('')

const roleLabels: Record<Employee['role'], string> = {
  admin: 'Administrador',
  supervisor: 'Supervisor',
  employee: 'Empleado',
}

const businessNameById = computed(() => new Map(props.businesses.map((b) => [b.id, b.name])))

async function load() {
  loading.value = true
  try {
    employees.value = await listEmployees(search.value)
  } finally {
    loading.value = false
  }
}

function onCreated(employee: Employee) {
  employees.value.unshift(employee)
}

let debounceTimer: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(load, 300)
})

onMounted(load)
</script>

<template>
  <div>
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div class="w-full max-w-xs space-y-1.5">
        <label for="employee-search" class="text-sm text-muted-foreground">Buscar</label>
        <Input id="employee-search" v-model="search" placeholder="Nombre, DNI o nº de empleado" />
      </div>
      <CreateEmployeeDialog :businesses="businesses" @created="onCreated" />
    </div>

    <div class="mt-8 overflow-x-auto">
      <p v-if="loading" class="text-muted-foreground">Cargando empleados…</p>
      <p v-else-if="employees.length === 0" class="text-muted-foreground">No se encontraron empleados.</p>
      <table v-else class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-border text-muted-foreground">
            <th class="py-2 pr-4 font-normal">Nombre</th>
            <th class="py-2 pr-4 font-normal">DNI</th>
            <th class="py-2 pr-4 font-normal">Nº empleado</th>
            <th class="py-2 pr-4 font-normal">Rol</th>
            <th class="py-2 pr-4 font-normal">Negocio</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="employee in employees" :key="employee.id" class="border-b border-border">
            <td class="py-2 pr-4 text-foreground">{{ employee.name }}</td>
            <td class="py-2 pr-4 text-muted-foreground">{{ employee.dni }}</td>
            <td class="py-2 pr-4 text-muted-foreground">{{ employee.employee_number }}</td>
            <td class="py-2 pr-4 text-muted-foreground">{{ roleLabels[employee.role] }}</td>
            <td class="py-2 pr-4 text-muted-foreground">
              {{ employee.business_id ? businessNameById.get(employee.business_id) : '—' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

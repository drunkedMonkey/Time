<script setup lang="ts">
import { ref } from 'vue'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { deleteBusiness, type Business } from './businesses.api'

const props = defineProps<{ business: Business }>()
const emit = defineEmits<{ deleted: [id: number] }>()

const open = ref(false)
const deleting = ref(false)
const error = ref('')

async function onConfirm() {
  error.value = ''
  deleting.value = true
  try {
    await deleteBusiness(props.business.id)
    emit('deleted', props.business.id)
    open.value = false
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se pudo eliminar el negocio'
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <AlertDialog v-model:open="open">
    <AlertDialogTrigger as-child>
      <Button variant="ghost" size="sm" class="text-destructive hover:text-destructive" @click.prevent.stop>
        Eliminar
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>¿Eliminar «{{ business.name }}»?</AlertDialogTitle>
        <AlertDialogDescription>
          Esta acción no se puede deshacer. Se eliminarán también sus citas, y el personal asignado quedará sin
          negocio.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <Button variant="destructive" :disabled="deleting" @click="onConfirm">
          {{ deleting ? 'Eliminando…' : 'Eliminar' }}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

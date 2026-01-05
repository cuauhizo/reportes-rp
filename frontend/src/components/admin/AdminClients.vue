<script setup>
import { ref } from 'vue'
const props = defineProps(['clients'])
const emit = defineEmits(['notify', 'refresh'])
const apiUrl = import.meta.env.VITE_API_URL
const newClientName = ref('')
const loading = ref(false)

const createClient = async () => {
  if (!newClientName.value.trim()) return
  loading.value = true
  try {
    const res = await fetch(`${apiUrl}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newClientName.value }),
    })
    if (res.ok) {
      emit('notify', 'Empresa creada', 'success')
      newClientName.value = ''
      emit('refresh')
    }
  } catch (e) {
    emit('notify', 'Error', 'error')
  } finally {
    loading.value = false
  }
}

const editClient = async (client) => {
  const newName = prompt('Nuevo nombre para la empresa:', client.name)
  if (!newName || newName === client.name) return // Si cancela o no cambia, no hacemos nada

  try {
    const res = await fetch(`${apiUrl}/clients/${client.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
    })
    if (res.ok) {
      emit('notify', 'Nombre actualizado', 'success')
      emit('refresh') // Recargamos la lista
    }
  } catch (e) {
    emit('notify', 'Error', 'error')
  }
}

const deleteClient = async (client) => {
  const confirmation = prompt(`Para confirmar, escribe el nombre: "${client.name}"`)
  if (confirmation !== client.name) return

  try {
    const res = await fetch(`${apiUrl}/clients/${client.id}`, { method: 'DELETE' })
    if (res.ok) {
      emit('notify', 'Empresa eliminada', 'success')
      emit('refresh')
    }
  } catch (e) {
    emit('notify', 'Error', 'error')
  }
}
</script>

<template>
  <div class="p-8 animate-fade-in">
    <div class="max-w-2xl mx-auto bg-zinc-50 p-8 rounded-xl border border-zinc-200">
      <h3 class="text-xl font-bold text-emerald-900 mb-6 border-b pb-4">Registrar Nueva Empresa</h3>
      <div class="flex gap-4">
        <input
          v-model="newClientName"
          type="text"
          placeholder="Nombre..."
          class="flex-1 border rounded-lg p-3 font-bold"
        />
        <button
          @click="createClient"
          :disabled="loading"
          class="bg-emerald-600 text-white font-bold px-6 rounded-lg uppercase text-xs"
        >
          {{ loading ? '...' : 'Crear' }}
        </button>
      </div>
      <div class="mt-8">
        <h4 class="font-bold text-zinc-600 mb-4 uppercase text-xs">Empresas Activas</h4>
        <ul class="space-y-2">
          <li
            v-for="c in clients"
            :key="c.id"
            class="bg-white p-3 rounded shadow-sm border border-zinc-200 flex justify-between items-center"
          >
            <span class="font-bold text-zinc-800">{{ c.name }}</span>

            <div class="flex items-center gap-2">
              <button
                @click="editClient(c)"
                class="text-blue-500 hover:text-blue-700 font-bold px-2"
                title="Renombrar"
              >
                ✎
              </button>

              <button
                @click="deleteClient(c)"
                class="text-zinc-400 hover:text-red-600 font-bold px-2"
                title="Eliminar"
              >
                ✕
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

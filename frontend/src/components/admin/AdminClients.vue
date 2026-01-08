<script setup>
import { ref } from 'vue'
import { Plus, Trash2, Building2, Edit2 } from 'lucide-vue-next' // Iconos nuevos

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
      emit('notify', 'Empresa creada exitosamente', 'success')
      newClientName.value = ''
      emit('refresh')
    }
  } catch (e) {
    emit('notify', 'Error de conexión', 'error')
  } finally {
    loading.value = false
  }
}

const deleteClient = async (client) => {
  const confirmation = prompt(
    `⚠️ PELIGRO ⚠️\n\nEscribe "${client.name}" para confirmar el borrado definitivo de la empresa y TODOS sus datos.`,
  )
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

const editClient = async (client) => {
  const newName = prompt('Nuevo nombre para la empresa:', client.name)
  if (!newName || newName === client.name) return

  try {
    const res = await fetch(`${apiUrl}/clients/${client.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
    })
    if (res.ok) {
      emit('notify', 'Nombre actualizado', 'success')
      emit('refresh')
    }
  } catch (e) {
    emit('notify', 'Error', 'error')
  }
}
</script>

<template>
  <div class="animate-fade-in max-w-4xl mx-auto">
    <div class="bg-white p-8 rounded-2xl shadow-lg border border-zinc-200 mb-8">
      <div class="flex items-center gap-3 mb-6">
        <div class="bg-red-100 p-2.5 rounded-xl"><Building2 class="w-6 h-6 text-red-600" /></div>
        <div>
          <h3 class="text-xl font-black text-zinc-900">Gestión de Empresas</h3>
          <p class="text-sm text-zinc-500">Añade o administra los clientes del sistema.</p>
        </div>
      </div>

      <div class="flex gap-4">
        <input
          v-model="newClientName"
          type="text"
          placeholder="Nombre de la nueva empresa..."
          class="flex-1 bg-zinc-50 border border-zinc-300 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-red-500 outline-none transition-all placeholder-zinc-400"
          @keyup.enter="createClient"
        />
        <button
          @click="createClient"
          :disabled="loading"
          class="bg-zinc-900 hover:bg-black text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus class="w-5 h-5" />
          {{ loading ? 'Creando...' : 'Crear Empresa' }}
        </button>
      </div>
    </div>

    <div class="space-y-3">
      <h4 class="font-bold text-zinc-400 text-xs uppercase tracking-widest px-2">
        Empresas Activas ({{ clients.length }})
      </h4>

      <ul class="space-y-3">
        <li
          v-for="c in clients"
          :key="c.id"
          class="group bg-white p-4 rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition-all flex justify-between items-center"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-black text-zinc-400 group-hover:bg-red-50 group-hover:text-red-500 transition-colors"
            >
              {{ c.name.charAt(0).toUpperCase() }}
            </div>
            <span class="font-bold text-zinc-800 text-lg">{{ c.name }}</span>
          </div>

          <div
            class="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
          >
            <button
              @click="editClient(c)"
              class="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Renombrar"
            >
              <Edit2 class="w-4 h-4" />
            </button>
            <button
              @click="deleteClient(c)"
              class="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar definitivamente"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

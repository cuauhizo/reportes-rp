<script setup>
import { ref, onMounted, watch } from 'vue'
import AdminHeader from '../components/admin/AdminHeader.vue'
import AdminNewsTable from '../components/admin/AdminNewsTable.vue'
import AdminNewsForm from '../components/admin/AdminNewsForm.vue'
import AdminStrategy from '../components/admin/AdminStrategy.vue'
import AdminClients from '../components/admin/AdminClients.vue'

const apiUrl = import.meta.env.VITE_API_URL
const activeTab = ref('list')
const clients = ref([])
const selectedClientId = ref(1)
const allNews = ref([])
const editingItem = ref(null)
const notification = ref({ show: false, message: '', type: 'success' })

// --- GESTIÓN DE DATOS GLOBALES ---

const fetchClients = async () => {
  try {
    const res = await fetch(`${apiUrl}/clients`)
    clients.value = await res.json()
  } catch (e) {
    console.error(e)
  }
}

const fetchNews = async () => {
  try {
    const res = await fetch(`${apiUrl}/report?clientId=${selectedClientId.value}`)
    const data = await res.json()
    allNews.value = data.news || []
  } catch (e) {
    allNews.value = []
  }
}

// --- ACCIONES ---

const handleEdit = (item) => {
  editingItem.value = item
  activeTab.value = 'news'
}

const handleDelete = async (id) => {
  if (!confirm('¿Eliminar registro?')) return
  try {
    await fetch(`${apiUrl}/news/${id}`, { method: 'DELETE' })
    showNotify('Registro eliminado', 'success')
    fetchNews()
  } catch (e) {
    showNotify('Error', 'error')
  }
}

const handleSaveSuccess = () => {
  fetchNews()
  editingItem.value = null // Reset edición
  activeTab.value = 'list' // Volver a la lista
}

const handleCancelEdit = () => {
  editingItem.value = null
  activeTab.value = 'list'
}

// --- UTILIDADES ---
const showNotify = (msg, type) => {
  notification.value = { show: true, message: msg, type }
  setTimeout(() => (notification.value.show = false), 3000)
}

// --- INIT ---
watch(selectedClientId, fetchNews)
onMounted(() => {
  fetchClients()
  fetchNews()
})
</script>

<template>
  <div class="min-h-screen bg-zinc-100 p-4 font-sans text-zinc-800 text-xs">
    <div class="max-w-[1400px] mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
      <AdminHeader :clients="clients" v-model:selectedClientId="selectedClientId" />

      <div class="flex border-b border-zinc-200 bg-zinc-50 overflow-x-auto">
        <button
          @click="activeTab = 'list'"
          :class="[
            'px-6 py-3 font-bold uppercase transition-colors',
            activeTab === 'list'
              ? 'bg-white text-emerald-800 border-t-4 border-t-emerald-600'
              : 'text-zinc-400 hover:bg-zinc-100',
          ]"
        >
          Base de Datos
        </button>
        <button
          @click="activeTab = 'news'"
          :class="[
            'px-6 py-3 font-bold uppercase transition-colors',
            activeTab === 'news'
              ? 'bg-white text-emerald-800 border-t-4 border-t-emerald-600'
              : 'text-zinc-400 hover:bg-zinc-100',
          ]"
        >
          {{ editingItem ? 'Editar' : 'Nuevo Registro' }}
        </button>
        <button
          @click="activeTab = 'strategy'"
          :class="[
            'px-6 py-3 font-bold uppercase transition-colors',
            activeTab === 'strategy'
              ? 'bg-white text-emerald-800 border-t-4 border-t-emerald-600'
              : 'text-zinc-400 hover:bg-zinc-100',
          ]"
        >
          Estrategia
        </button>
        <button
          @click="activeTab = 'clients'"
          :class="[
            'px-6 py-3 font-bold uppercase transition-colors',
            activeTab === 'clients'
              ? 'bg-white text-emerald-800 border-t-4 border-t-emerald-600'
              : 'text-zinc-400 hover:bg-zinc-100',
          ]"
        >
          Empresas
        </button>
      </div>

      <div v-if="activeTab === 'list'">
        <AdminNewsTable :news="allNews" @edit="handleEdit" @delete="handleDelete" />
      </div>

      <div v-if="activeTab === 'news'">
        <AdminNewsForm
          :editingItem="editingItem"
          :clientId="selectedClientId"
          @saved="handleSaveSuccess"
          @cancel="handleCancelEdit"
          @notify="showNotify"
        />
      </div>

      <div v-if="activeTab === 'strategy'">
        <AdminStrategy :clientId="selectedClientId" @notify="showNotify" />
      </div>

      <div v-if="activeTab === 'clients'">
        <AdminClients :clients="clients" @refresh="fetchClients" @notify="showNotify" />
      </div>
    </div>

    <div v-if="notification.show" class="fixed top-4 right-4 z-50 animate-bounce-in">
      <div
        :class="[
          'px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border-l-4 text-white font-bold',
          notification.type === 'success'
            ? 'bg-zinc-900 border-emerald-500'
            : 'bg-red-600 border-red-800',
        ]"
      >
        <span>{{ notification.type === 'success' ? '✅' : '⚠️' }}</span>
        <p>{{ notification.message }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-bounce-in {
  animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}
@keyframes bounceIn {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

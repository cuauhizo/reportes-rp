<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useReportStore } from '../stores/reportStore'
import { storeToRefs } from 'pinia'
import AdminHeader from '../components/admin/AdminHeader.vue'
import AdminNewsTable from '../components/admin/AdminNewsTable.vue'
import AdminNewsForm from '../components/admin/AdminNewsForm.vue'
import AdminStrategy from '../components/admin/AdminStrategy.vue'
import AdminClients from '../components/admin/AdminClients.vue'
import {
  Database,
  FilePlus,
  Target,
  Building,
  Users,
  CheckCircle,
  AlertTriangle,
} from 'lucide-vue-next'
import ConfirmationModal from '../components/ConfirmationModal.vue'
import Pagination from '../components/admin/Pagination.vue'
import debounce from 'lodash.debounce'

const router = useRouter()
const apiUrl = import.meta.env.VITE_API_URL
const activeTab = ref('list')
const clients = ref([])
const allNews = ref([])
const loading = ref(false)
const newsList = ref([])
const editingItem = ref(null)
const notification = ref({ show: false, message: '', type: 'success' })

// ESTADO DE FILTROS
const searchQuery = ref('')
const sortBy = ref('publication_date')
const sortOrder = ref('desc') // 'asc' o 'desc'

// ESTADO DE PAGINACIÓN
const currentPage = ref(1)
const totalPages = ref(1)
const itemsPerPage = 10

// --- GESTIÓN DE DATOS GLOBALES ---
const showDeleteModal = ref(false)
const newsIdToDelete = ref(null)

const store = useReportStore()
const { currentClientId: selectedClientId } = storeToRefs(store)

const fetchClients = async () => {
  try {
    const res = await fetch(`${apiUrl}/clients`)
    clients.value = await res.json()
  } catch (e) {
    console.error(e)
  }
}

const fetchNews = async (page = 1) => {
  loading.value = true
  try {
    const apiUrl = import.meta.env.VITE_API_URL

    const params = new URLSearchParams({
      clientId: selectedClientId.value,
      page: page,
      limit: itemsPerPage,
      search: searchQuery.value,
      sortBy: sortBy.value,
      order: sortOrder.value,
    })

    const res = await fetch(`${apiUrl}/news?${params}`)
    const result = await res.json()

    newsList.value = result.data
    currentPage.value = result.pagination.page
    totalPages.value = result.pagination.totalPages
  } catch (e) {
    showNotification('Error al cargar noticias', 'error')
  } finally {
    loading.value = false
  }
}

// MANEJO DE BÚSQUEDA (Con Debounce de 500ms)
const handleSearch = debounce((query) => {
  searchQuery.value = query
  fetchNews(1)
}, 500)

// MANEJO DE CAMBIO DE PÁGINA
const handlePageChange = (newPage) => {
  fetchNews(newPage)
}

// MANEJO DE ORDENAMIENTO (Lo llamará la tabla)
const handleSort = (column) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'desc'
  }
  fetchNews(1)
}

// --- ACCIONES ---

const handleEdit = (item) => {
  editingItem.value = item
  activeTab.value = 'news'
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

const handleDeleteRequest = (id) => {
  newsIdToDelete.value = id
  showDeleteModal.value = true
}

const confirmDeleteNews = async () => {
  if (!newsIdToDelete.value) return
  showDeleteModal.value = false

  try {
    const apiUrl = import.meta.env.VITE_API_URL
    const res = await fetch(`${apiUrl}/news/${newsIdToDelete.value}`, {
      method: 'DELETE',
    })

    if (res.ok) {
      showNotification('Noticia eliminada correctamente', 'success')
      fetchNews()
    } else {
      showNotification('No se pudo eliminar el registro', 'error')
    }
  } catch (error) {
    showNotification('Error de conexión', 'error')
  } finally {
    newsIdToDelete.value = null
  }
}

// --- UTILIDADES ---
const showNotify = (msg, type) => {
  notification.value = { show: true, message: msg, type }
  setTimeout(() => (notification.value.show = false), 3000)
}

// --- INIT ---
watch(selectedClientId, () => {
  searchQuery.value = ''
  fetchNews(1)
})

onMounted(() => {
  fetchClients()
  fetchNews(1)
})
</script>

<template>
  <div class="min-h-screen bg-zinc-100 font-sans text-zinc-800 text-xs">
    <div class="min-h-screen bg-[#f4f4f5] font-sans text-zinc-800">
      <AdminHeader :clients="clients" v-model:selectedClientId="selectedClientId" />

      <div class="bg-white border-b border-zinc-200 px-8 py-4 sticky top-0 z-10">
        <div class="max-w-7xl mx-auto flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar mb-4">
          <button
            @click="activeTab = 'list'"
            :class="[
              'flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase transition-all border',
              activeTab === 'list'
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-lg'
                : 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300',
            ]"
          >
            <Database class="w-4 h-4" /> Base de Datos
          </button>

          <button
            @click="activeTab = 'news'"
            :class="[
              'flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase transition-all border',
              activeTab === 'news'
                ? 'bg-red-600 text-white border-red-600 shadow-lg'
                : 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300',
            ]"
          >
            <FilePlus class="w-4 h-4" /> {{ editingItem ? 'Editar Registro' : 'Nuevo Registro' }}
          </button>

          <button
            @click="activeTab = 'strategy'"
            :class="[
              'flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase transition-all border',
              activeTab === 'strategy'
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-lg'
                : 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300',
            ]"
          >
            <Target class="w-4 h-4" /> Estrategia
          </button>

          <button
            @click="activeTab = 'clients'"
            :class="[
              'flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase transition-all border',
              activeTab === 'clients'
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-lg'
                : 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300',
            ]"
          >
            <Building class="w-4 h-4" /> Empresas
          </button>
        </div>

        <div v-if="activeTab === 'list'">
          <AdminNewsTable
            v-if="activeTab === 'list'"
            :news="newsList"
            :sort-by="sortBy"
            :sort-order="sortOrder"
            @search="handleSearch"
            @sort="handleSort"
            @edit="handleEdit"
            @delete="handleDeleteRequest"
          />

          <Pagination
            v-if="activeTab === 'list' && newsList.length > 0"
            :current-page="currentPage"
            :total-pages="totalPages"
            @change-page="handlePageChange"
          />
          <ConfirmationModal
            :show="showDeleteModal"
            title="¿Eliminar Noticia?"
            message="Estás a punto de eliminar este registro de la base de datos. Esta acción afectará los cálculos de las gráficas. ¿Deseas continuar?"
            confirmText="Sí, Eliminar"
            @close="showDeleteModal = false"
            @confirm="confirmDeleteNews"
          />
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

      <div v-if="notification.show" class="fixed top-6 right-6 z-50 animate-bounce-in">
        <div
          :class="[
            'pl-4 pr-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 border-l-4 backdrop-blur-md',
            notification.type === 'success'
              ? 'bg-zinc-900/95 border-emerald-500 text-white'
              : 'bg-zinc-900/95 border-red-500 text-white',
          ]"
        >
          <div v-if="notification.type === 'success'" class="bg-emerald-500/20 p-2 rounded-full">
            <CheckCircle class="w-6 h-6 text-emerald-500" />
          </div>

          <div v-else class="bg-red-500/20 p-2 rounded-full">
            <AlertTriangle class="w-6 h-6 text-red-500" />
          </div>

          <div>
            <h4 class="font-bold text-sm uppercase tracking-wide opacity-80">
              {{ notification.type === 'success' ? 'Éxito' : 'Error' }}
            </h4>
            <p class="font-medium text-sm">{{ notification.message }}</p>
          </div>

          <button
            @click="notification.show = false"
            class="ml-2 text-zinc-500 hover:text-white transition-colors"
          >
            <span class="text-xs font-bold">✕</span>
          </button>
        </div>
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

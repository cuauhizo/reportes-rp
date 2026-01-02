<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const activeTab = ref('list')
const allNews = ref([])
const editingId = ref(null)

// Estado de clientes
const clients = ref([])
const selectedClientId = ref(1)
const currentReportId = ref(null) // Para saber qué reporte (FODA) estamos editando

const apiUrl = import.meta.env.VITE_API_URL

// Estado para errores y notificaciones
const fieldErrors = ref({})
const notification = ref({ show: false, message: '', type: 'success' })

// --- 1. LÓGICA DE CARGA DE DATOS ---

const fetchClients = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/clients')
    clients.value = await res.json()
  } catch (e) {
    console.error(e)
  }
}

const fetchAllNews = async () => {
  try {
    // Obtenemos el reporte del cliente seleccionado para sacar sus noticias
    const res = await fetch(`${apiUrl}/report?clientId=${selectedClientId.value}`)
    if (!res.ok) {
      allNews.value = []
      return
    }
    const data = await res.json()
    allNews.value = data.news || []

    // Guardamos el ID del reporte actual para usarlo al guardar el FODA
    if (data.meta && data.meta.id) {
      currentReportId.value = data.meta.id
    }
  } catch (e) {
    console.error(e)
    allNews.value = []
  }
}

const formatCurrency = (val) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val)

// --- 2. LÓGICA DE NOTICIA ---
const newsForm = ref({
  publication_date: new Date().toISOString().split('T')[0],
  media_name: '',
  reporter: '',
  title: '',
  reach: 0,
  ave_value: 0,
  tier: 'Tier 1',
  sentiment: 'Positivo',
  media_type: 'Nota', // Valor por defecto ajustado a "Nota"
  key_message: 'Convención',
})

const editItem = (item) => {
  editingId.value = item.id
  newsForm.value = { ...item, publication_date: item.publication_date.split('T')[0] }
  activeTab.value = 'news'
}

const cancelEdit = () => {
  editingId.value = null
  newsForm.value = {
    publication_date: new Date().toISOString().split('T')[0],
    media_name: '',
    reporter: '',
    title: '',
    reach: 0,
    ave_value: 0,
    tier: 'Tier 1',
    sentiment: 'Positivo',
    media_type: 'Nota',
    key_message: '',
  }
  activeTab.value = 'list'
}

// Validación
const validateForm = () => {
  fieldErrors.value = {}
  let isValid = true
  if (!newsForm.value.media_name) {
    fieldErrors.value.media_name = 'Requerido'
    isValid = false
  }
  if (!newsForm.value.title) {
    fieldErrors.value.title = 'Requerido'
    isValid = false
  }
  if (!newsForm.value.key_message) {
    fieldErrors.value.key_message = 'Requerido'
    isValid = false
  }
  if (!newsForm.value.publication_date) {
    fieldErrors.value.publication_date = 'Requerido'
    isValid = false
  }
  return isValid
}

const showNotification = (msg, type = 'success') => {
  notification.value = { show: true, message: msg, type }
  setTimeout(() => (notification.value.show = false), 3000)
}

const submitNews = async () => {
  if (!validateForm()) {
    showNotification('Corrige los errores', 'error')
    return
  }
  loading.value = true
  try {
    const isEditing = editingId.value !== null
    const url = isEditing ? `${apiUrl}/news/${editingId.value}` : `${apiUrl}/news`
    const method = isEditing ? 'PUT' : 'POST'

    // PREPARAR DATOS: Incluimos el ID del cliente seleccionado
    const body = {
      ...newsForm.value,
      clientId: selectedClientId.value, // <--- IMPORTANTE: enviamos el cliente actual
    }

    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (res.ok) {
      showNotification(isEditing ? 'Actualizado' : 'Creado')
      if (isEditing) cancelEdit()
      else {
        // Limpiar formulario parcial
        newsForm.value.title = ''
        newsForm.value.reach = 0
        newsForm.value.ave_value = 0
        fetchAllNews()
        activeTab.value = 'list'
      }
    } else {
      showNotification(data.message || 'Error desconocido', 'error')
    }
  } catch (e) {
    showNotification('Error de conexión', 'error')
  } finally {
    loading.value = false
  }
}

// --- 3. LÓGICA DE ESTRATEGIA ---
const strategyForm = ref({
  swot_strengths: '',
  swot_opportunities: '',
  swot_weaknesses: '',
  swot_threats: '',
  milestones: '',
  roadmap: '',
})

const loadStrategy = async () => {
  try {
    // CORRECCIÓN: URL correcta y filtrando por cliente seleccionado
    const res = await fetch(`${apiUrl}/report?clientId=${selectedClientId.value}&label=Anual`)
    if (!res.ok) throw new Error('Error al cargar estrategia')

    const data = await res.json()

    // Guardamos ID para el submit
    if (data.meta) currentReportId.value = data.meta.id

    strategyForm.value = {
      swot_strengths: data.meta.swot_strengths || '',
      swot_opportunities: data.meta.swot_opportunities || '',
      swot_weaknesses: data.meta.swot_weaknesses || '',
      swot_threats: data.meta.swot_threats || '',
      milestones: data.meta.milestones || '',
      roadmap: data.meta.roadmap || '',
    }
  } catch (e) {
    console.error('Error estrategia:', e)
    // Limpiar formulario si falla (ej. cliente nuevo sin datos)
    strategyForm.value = {
      swot_strengths: '',
      swot_opportunities: '',
      swot_weaknesses: '',
      swot_threats: '',
      milestones: '',
      roadmap: '',
    }
  }
}

const submitStrategy = async () => {
  if (!currentReportId.value) {
    showNotification('No se encontró un reporte activo para este cliente', 'error')
    return
  }
  loading.value = true
  try {
    // Usamos el ID dinámico, no el "1" fijo
    const res = await fetch(`${apiUrl}/report/${currentReportId.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(strategyForm.value),
    })
    if (res.ok) showNotification('Estrategia actualizada')
    else showNotification('Error al guardar', 'error')
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

// Recargar datos cuando cambiamos de cliente
watch(selectedClientId, () => {
  fetchAllNews()
  loadStrategy()
})

onMounted(() => {
  fetchClients()
  fetchAllNews()
  loadStrategy()
})
</script>

<template>
  <div class="min-h-screen bg-zinc-100 p-4 font-sans text-zinc-800 text-xs">
    <div class="max-w-[1400px] mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
      <div class="bg-emerald-900 px-6 py-4 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <h2 class="text-lg font-bold text-white uppercase">Gestión</h2>
          <select
            v-model="selectedClientId"
            class="bg-emerald-800 text-white border border-emerald-700 rounded px-3 py-1 text-xs font-bold focus:outline-none cursor-pointer"
          >
            <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <button
          @click="router.push('/')"
          class="text-emerald-100 hover:text-white font-bold uppercase tracking-widest border border-emerald-700 px-3 py-1 rounded transition-colors"
        >
          Ver Reporte
        </button>
      </div>

      <div class="flex border-b border-zinc-200 bg-zinc-50">
        <button
          @click="activeTab = 'list'"
          :class="[
            'px-6 py-3 font-bold uppercase tracking-wide border-r border-zinc-200 transition-colors',
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
            'px-6 py-3 font-bold uppercase tracking-wide border-r border-zinc-200 transition-colors',
            activeTab === 'news'
              ? 'bg-white text-emerald-800 border-t-4 border-t-emerald-600'
              : 'text-zinc-400 hover:bg-zinc-100',
          ]"
        >
          {{ editingId ? 'Editar Registro' : 'Nuevo Registro' }}
        </button>
        <button
          @click="activeTab = 'strategy'"
          :class="[
            'px-6 py-3 font-bold uppercase tracking-wide border-r border-zinc-200 transition-colors',
            activeTab === 'strategy'
              ? 'bg-white text-emerald-800 border-t-4 border-t-emerald-600'
              : 'text-zinc-400 hover:bg-zinc-100',
          ]"
        >
          Estrategia
        </button>
      </div>

      <div v-if="activeTab === 'list'" class="overflow-x-auto animate-fade-in">
        <table class="w-full text-left border-collapse">
          <thead class="bg-emerald-700 text-white font-bold whitespace-nowrap">
            <tr>
              <th class="p-3 border-r border-emerald-600 w-10">#</th>
              <th class="p-3 border-r border-emerald-600 w-24">Fecha</th>
              <th class="p-3 border-r border-emerald-600">Tema</th>
              <th class="p-3 border-r border-emerald-600">Medio</th>
              <th class="p-3 border-r border-emerald-600 w-20 text-center">Género</th>
              <th class="p-3 border-r border-emerald-600">Reportero</th>
              <th class="p-3 border-r border-emerald-600 text-right">Alcance</th>
              <th class="p-3 border-r border-emerald-600 text-right">ROI (AVE)</th>
              <th class="p-3 border-r border-emerald-600 w-64">Testigo</th>
              <th class="p-3 border-r border-emerald-600 w-24 text-center">Valoración</th>
              <th class="p-3 text-center w-16">Acción</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-200 text-xs">
            <tr
              v-for="(item, index) in allNews"
              :key="item.id"
              class="hover:bg-yellow-50 transition-colors"
            >
              <td class="p-2 border-r border-zinc-200 text-zinc-500 text-center">
                {{ index + 1 }}
              </td>
              <td class="p-2 border-r border-zinc-200 whitespace-nowrap">
                {{ item.publication_date.split('T')[0] }}
              </td>
              <td class="p-2 border-r border-zinc-200 font-medium">{{ item.key_message }}</td>
              <td class="p-2 border-r border-zinc-200 font-bold text-emerald-900">
                {{ item.media_name }}
              </td>
              <td class="p-2 border-r border-zinc-200 text-center">
                <span
                  class="bg-green-100 text-green-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-green-200"
                >
                  {{ item.media_type }}
                </span>
              </td>
              <td class="p-2 border-r border-zinc-200 text-zinc-600">{{ item.reporter || '-' }}</td>
              <td class="p-2 border-r border-zinc-200 text-right font-mono">
                {{ item.reach.toLocaleString() }}
              </td>
              <td class="p-2 border-r border-zinc-200 text-right font-mono text-zinc-600 font-bold">
                {{ formatCurrency(item.ave_value) }}
              </td>
              <td class="p-2 border-r border-zinc-200 truncate max-w-xs">
                <a href="#" class="text-blue-600 hover:underline hover:text-blue-800 font-medium">{{
                  item.title
                }}</a>
              </td>
              <td class="p-2 border-r border-zinc-200 text-center">
                <span
                  :class="[
                    'px-2 py-0.5 rounded text-[10px] font-bold border',
                    item.sentiment === 'Positivo'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : item.sentiment === 'Negativo'
                        ? 'bg-red-100 text-red-800 border-red-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200',
                  ]"
                >
                  {{ item.sentiment }}
                </span>
              </td>
              <td class="p-2 text-center">
                <button
                  @click="editItem(item)"
                  class="text-blue-600 hover:text-blue-900 font-bold p-1 hover:bg-blue-50 rounded"
                >
                  ✏️
                </button>
              </td>
            </tr>
            <tr v-if="allNews.length === 0">
              <td colspan="11" class="p-8 text-center text-zinc-400 italic">
                No hay registros para este cliente.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="activeTab === 'news'" class="p-8 animate-fade-in bg-zinc-50">
        <div
          v-if="editingId"
          class="bg-blue-50 border-l-4 border-blue-500 p-3 mb-6 flex justify-between items-center rounded shadow-sm"
        >
          <div>
            <p class="text-blue-800 font-bold">✏️ Editando registro #{{ editingId }}</p>
          </div>
          <button
            @click="cancelEdit"
            class="text-xs font-bold bg-white text-blue-600 hover:bg-blue-100 px-3 py-1 rounded border border-blue-200"
          >
            Cancelar
          </button>
        </div>

        <form
          @submit.prevent="submitNews"
          class="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 space-y-6 max-w-5xl mx-auto"
        >
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block font-bold mb-1 text-zinc-500 uppercase text-[10px]">Fecha</label>
              <input
                v-model="newsForm.publication_date"
                type="date"
                :class="[
                  'w-full border rounded p-2 focus:ring-2 focus:ring-emerald-500 outline-none',
                  fieldErrors.publication_date ? 'border-red-500 bg-red-50' : 'border-zinc-300',
                ]"
              />
            </div>
            <div>
              <label class="block font-bold mb-1 text-zinc-500 uppercase text-[10px]"
                >Tema (Key Message)</label
              >
              <input
                v-model="newsForm.key_message"
                type="text"
                :class="[
                  'w-full border rounded p-2 focus:ring-2 focus:ring-emerald-500 outline-none',
                  fieldErrors.key_message ? 'border-red-500 bg-red-50' : 'border-zinc-300',
                ]"
              />
            </div>
            <div>
              <label class="block font-bold mb-1 text-zinc-500 uppercase text-[10px]">Medio</label>
              <input
                v-model="newsForm.media_name"
                type="text"
                :class="[
                  'w-full border rounded p-2 focus:ring-2 focus:ring-emerald-500 outline-none',
                  fieldErrors.media_name ? 'border-red-500 bg-red-50' : 'border-zinc-300',
                ]"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block font-bold mb-1 text-zinc-500 uppercase text-[10px]"
                >Género (Media Type)</label
              >
              <select
                v-model="newsForm.media_type"
                class="w-full border border-zinc-300 rounded p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option>Nota</option>
                <option>Columna</option>
                <option>Entrevista</option>
                <option>Artículo</option>
                <option>Mención</option>
              </select>
            </div>
            <div>
              <label class="block font-bold mb-1 text-zinc-500 uppercase text-[10px]"
                >Reportero</label
              >
              <input
                v-model="newsForm.reporter"
                type="text"
                class="w-full border border-zinc-300 rounded p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label class="block font-bold mb-1 text-zinc-500 uppercase text-[10px]"
                >Sentimiento</label
              >
              <select
                v-model="newsForm.sentiment"
                class="w-full border border-zinc-300 rounded p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option>Positivo</option>
                <option>Neutro</option>
                <option>Negativo</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block font-bold mb-1 text-zinc-500 uppercase text-[10px]"
              >Testigo (Título / Link)</label
            >
            <input
              v-model="newsForm.title"
              type="text"
              placeholder="Título completo de la nota..."
              :class="[
                'w-full border rounded p-2 font-bold text-zinc-800 focus:ring-2 focus:ring-emerald-500 outline-none',
                fieldErrors.title ? 'border-red-500 bg-red-50' : 'border-zinc-300',
              ]"
            />
          </div>

          <div class="grid grid-cols-3 gap-6 bg-zinc-50 p-4 rounded-lg border border-zinc-100">
            <div>
              <label class="block font-bold mb-1 text-zinc-400 uppercase text-[10px]"
                >Alcance</label
              >
              <input
                v-model="newsForm.reach"
                type="number"
                class="w-full border border-zinc-300 rounded p-2 text-right font-mono"
              />
            </div>
            <div>
              <label class="block font-bold mb-1 text-zinc-400 uppercase text-[10px]"
                >ROI (AVE)</label
              >
              <input
                v-model="newsForm.ave_value"
                type="number"
                class="w-full border border-zinc-300 rounded p-2 text-right font-mono text-emerald-700 font-bold"
              />
            </div>
            <div>
              <label class="block font-bold mb-1 text-zinc-400 uppercase text-[10px]">Tier</label>
              <select v-model="newsForm.tier" class="w-full border border-zinc-300 rounded p-2">
                <option>Tier 1</option>
                <option>Tier 2</option>
                <option>Tier 3</option>
              </select>
            </div>
          </div>

          <div class="pt-4 border-t border-zinc-100 flex justify-end gap-3">
            <button
              v-if="editingId"
              type="button"
              @click="cancelEdit"
              class="px-6 py-3 rounded-lg border border-zinc-300 font-bold text-zinc-600 hover:bg-zinc-50 uppercase tracking-widest text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-8 py-3 rounded-lg bg-emerald-700 text-white font-bold hover:bg-emerald-800 shadow-lg transition-all uppercase tracking-widest text-xs flex items-center gap-2"
            >
              <span>{{
                loading ? 'Guardando...' : editingId ? 'Actualizar Registro' : 'Guardar Registro'
              }}</span>
            </button>
          </div>
        </form>
      </div>

      <div v-if="activeTab === 'strategy'" class="p-8 animate-fade-in">
        <form @submit.prevent="submitStrategy">
          <h3
            class="font-black text-lg mb-4 border-l-4 border-emerald-600 pl-3 uppercase tracking-tighter"
          >
            Matriz FODA
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label class="text-xs font-bold text-emerald-600 uppercase block mb-1"
                >Fortalezas</label
              ><textarea
                v-model="strategyForm.swot_strengths"
                rows="3"
                class="w-full bg-zinc-50 border border-zinc-200 p-3 rounded text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              ></textarea>
            </div>
            <div>
              <label class="text-xs font-bold text-blue-600 uppercase block mb-1"
                >Oportunidades</label
              ><textarea
                v-model="strategyForm.swot_opportunities"
                rows="3"
                class="w-full bg-zinc-50 border border-zinc-200 p-3 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              ></textarea>
            </div>
            <div>
              <label class="text-xs font-bold text-amber-600 uppercase block mb-1"
                >Debilidades</label
              ><textarea
                v-model="strategyForm.swot_weaknesses"
                rows="3"
                class="w-full bg-zinc-50 border border-zinc-200 p-3 rounded text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              ></textarea>
            </div>
            <div>
              <label class="text-xs font-bold text-red-600 uppercase block mb-1">Amenazas</label
              ><textarea
                v-model="strategyForm.swot_threats"
                rows="3"
                class="w-full bg-zinc-50 border border-zinc-200 p-3 rounded text-sm focus:ring-2 focus:ring-red-500 outline-none"
              ></textarea>
            </div>
          </div>

          <h3
            class="font-black text-lg mb-4 border-l-4 border-zinc-800 pl-3 uppercase tracking-tighter"
          >
            Contexto
          </h3>
          <div class="space-y-6">
            <div>
              <label class="text-xs font-bold text-zinc-500 uppercase block mb-1"
                >Hito Principal</label
              ><textarea
                v-model="strategyForm.milestones"
                rows="2"
                class="w-full bg-zinc-50 border border-zinc-200 p-3 rounded text-sm outline-none focus:ring-2 focus:ring-zinc-400"
              ></textarea>
            </div>
            <div>
              <label class="text-xs font-bold text-zinc-500 uppercase block mb-1"
                >Próximos Pasos</label
              ><textarea
                v-model="strategyForm.roadmap"
                rows="4"
                class="w-full bg-zinc-50 border border-zinc-200 p-3 rounded text-sm outline-none focus:ring-2 focus:ring-zinc-400"
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            class="mt-8 w-full bg-zinc-900 text-white font-bold py-4 rounded-xl hover:bg-black shadow-xl transition-transform active:scale-[0.99] uppercase tracking-widest text-xs"
          >
            Actualizar Estrategia
          </button>
        </form>
      </div>
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
      <p class="text-sm">{{ notification.message }}</p>
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

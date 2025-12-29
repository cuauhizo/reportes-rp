<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const activeTab = ref('list')
const allNews = ref([])
const editingId = ref(null) // ID de la noticia que se está editando
// `${apiUrl}
const apiUrl = import.meta.env.VITE_API_URL
// const response = await fetch(`${apiUrl}/report/anual`)

// --- 1. LÓGICA DE LISTADO ---
const fetchAllNews = async () => {
  try {
    const res = await fetch(`${apiUrl}/news`)
    allNews.value = await res.json()
  } catch (e) {
    console.error(e)
  }
}

const formatCurrency = (val) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val)

// --- 2. LÓGICA DE NOTICIA (CREAR / EDITAR) ---
const newsForm = ref({
  publication_date: new Date().toISOString().split('T')[0],
  media_name: '',
  reporter: '',
  title: '',
  reach: 0,
  ave_value: 0,
  tier: 'Tier 1',
  sentiment: 'Positivo',
  media_type: 'Digital',
  key_message: 'Inversión',
})

const editItem = (item) => {
  editingId.value = item.id
  // Copiamos los datos y formateamos la fecha para el input type="date"
  newsForm.value = { ...item, publication_date: item.publication_date.split('T')[0] }
  activeTab.value = 'news' // Cambiamos a la pestaña de edición
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
    media_type: 'Digital',
    key_message: 'Inversión',
  }
  activeTab.value = 'list'
}

const submitNews = async () => {
  loading.value = true
  try {
    const isEditing = editingId.value !== null
    const url = isEditing ? `${apiUrl}/news/${editingId.value}` : `${apiUrl}/news`

    const method = isEditing ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newsForm.value),
    })

    if (res.ok) {
      alert(isEditing ? '¡Noticia actualizada!' : '¡Noticia creada!')
      if (isEditing)
        cancelEdit() // Si editábamos, volvemos a la lista
      else {
        // Si creamos, limpiamos y recargamos la lista
        newsForm.value.title = ''
        newsForm.value.reach = 0
        newsForm.value.ave_value = 0
        fetchAllNews()
        activeTab.value = 'list'
      }
    } else {
      alert('Hubo un error.')
    }
  } catch (e) {
    console.error(e)
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
    // CORRECCIÓN: Usamos query params (?label=anual) en lugar de la ruta antigua (/anual)
    const res = await fetch(`${apiUrl}/report?label=anual`)

    if (!res.ok) throw new Error('Error al conectar con el servidor') // Protección extra

    const data = await res.json()

    strategyForm.value = {
      swot_strengths: data.meta.swot_strengths || '',
      swot_opportunities: data.meta.swot_opportunities || '',
      swot_weaknesses: data.meta.swot_weaknesses || '',
      swot_threats: data.meta.swot_threats || '',
      milestones: data.meta.milestones || '',
      roadmap: data.meta.roadmap || '',
    }
  } catch (e) {
    console.error('Error cargando estrategia:', e)
  }
}

const submitStrategy = async () => {
  loading.value = true
  try {
    const res = await fetch(`${apiUrl}/report/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(strategyForm.value),
    })
    if (res.ok) alert('Estrategia actualizada')
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAllNews()
  loadStrategy()
})
</script>

<template>
  <div class="min-h-screen bg-zinc-100 p-4 md:p-8 font-sans text-zinc-800">
    <div class="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
      <div class="bg-zinc-900 px-8 py-6 flex justify-between items-center">
        <h2 class="text-xl font-black text-white uppercase tracking-tighter">
          Panel de <span class="text-red-600">Gestión</span>
        </h2>
        <button
          @click="router.push('/')"
          class="text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-widest border border-zinc-700 px-3 py-1 rounded transition-colors"
        >
          &larr; Dashboard
        </button>
      </div>

      <div class="flex border-b border-zinc-200 overflow-x-auto">
        <button
          @click="activeTab = 'list'"
          :class="[
            'flex-1 py-4 px-6 text-sm font-bold uppercase tracking-widest whitespace-nowrap transition-colors',
            activeTab === 'list'
              ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
              : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50',
          ]"
        >
          📋 Base de Datos
        </button>
        <button
          @click="activeTab = 'news'"
          :class="[
            'flex-1 py-4 px-6 text-sm font-bold uppercase tracking-widest whitespace-nowrap transition-colors',
            activeTab === 'news'
              ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
              : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50',
          ]"
        >
          {{ editingId ? '✏️ Editando Noticia' : '➕ Agregar Noticia' }}
        </button>
        <button
          @click="activeTab = 'strategy'"
          :class="[
            'flex-1 py-4 px-6 text-sm font-bold uppercase tracking-widest whitespace-nowrap transition-colors',
            activeTab === 'strategy'
              ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
              : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50',
          ]"
        >
          📊 Estrategia
        </button>
      </div>

      <div v-if="activeTab === 'list'" class="p-0 animate-fade-in">
        <div class="overflow-x-auto max-h-[600px]">
          <table class="w-full text-left text-xs">
            <thead
              class="bg-emerald-700 text-white uppercase tracking-wider font-bold sticky top-0 z-10 shadow-sm"
            >
              <tr>
                <th class="p-4 w-10">#</th>
                <th class="p-4 w-24">Fecha</th>
                <th class="p-4">Tema</th>
                <th class="p-4">Medio</th>
                <th class="p-4">Reportero</th>
                <th class="p-4 text-right">Alcance</th>
                <th class="p-4 text-right">Valor (AVE)</th>
                <th class="p-4 w-64">Título</th>
                <th class="p-4 text-center">Valoración</th>
                <th class="p-4 text-center w-20">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100">
              <tr
                v-for="item in allNews"
                :key="item.id"
                class="hover:bg-zinc-50 transition-colors group"
              >
                <td class="p-4 font-bold text-zinc-400">{{ item.id }}</td>
                <td class="p-4 whitespace-nowrap font-medium">
                  {{ item.publication_date.split('T')[0] }}
                </td>
                <td class="p-4 font-bold text-zinc-600">{{ item.key_message }}</td>
                <td class="p-4">
                  <span class="font-bold text-zinc-800 block">{{ item.media_name }}</span>
                  <span class="text-[9px] text-zinc-400 uppercase tracking-wider">{{
                    item.media_type
                  }}</span>
                </td>
                <td class="p-4 text-zinc-500">{{ item.reporter || '-' }}</td>
                <td class="p-4 text-right font-mono text-zinc-600">
                  {{ item.reach.toLocaleString() }}
                </td>
                <td class="p-4 text-right font-mono text-emerald-600 font-bold">
                  {{ formatCurrency(item.ave_value) }}
                </td>
                <td class="p-4 max-w-xs truncate text-zinc-500 italic" :title="item.title">
                  "{{ item.title }}"
                </td>
                <td class="p-4 text-center">
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-[10px] font-bold uppercase',
                      item.sentiment === 'Positivo'
                        ? 'bg-emerald-100 text-emerald-700'
                        : item.sentiment === 'Negativo'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-zinc-100 text-zinc-600',
                    ]"
                  >
                    {{ item.sentiment }}
                  </span>
                </td>
                <td class="p-4 text-center">
                  <button
                    @click="editItem(item)"
                    class="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg transition-colors border border-blue-200"
                    title="Editar"
                  >
                    ✏️
                  </button>
                </td>
              </tr>
              <tr v-if="allNews.length === 0">
                <td colspan="10" class="p-10 text-center text-zinc-400 italic bg-zinc-50">
                  No hay noticias registradas. Ve a la pestaña "Agregar Noticia".
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="activeTab === 'news'" class="p-8 animate-fade-in">
        <div
          v-if="editingId"
          class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 flex justify-between items-center rounded-r-lg"
        >
          <div>
            <p class="text-blue-800 font-bold text-sm">✏️ Modo Edición</p>
            <p class="text-blue-600 text-xs mt-1">
              Estás modificando la noticia ID #{{ editingId }}
            </p>
          </div>
          <button
            @click="cancelEdit"
            class="text-xs font-bold bg-white text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg border border-blue-200 uppercase transition-colors"
          >
            Cancelar y Volver
          </button>
        </div>

        <form @submit.prevent="submitNews" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="text-xs font-bold text-zinc-500 uppercase block mb-1">Fecha</label
              ><input
                v-model="newsForm.publication_date"
                type="date"
                class="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 font-bold text-zinc-800 outline-none focus:ring-2 focus:ring-red-600"
                required
              />
            </div>
            <div>
              <label class="text-xs font-bold text-zinc-500 uppercase block mb-1">Medio</label
              ><input
                v-model="newsForm.media_name"
                type="text"
                class="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 font-bold text-zinc-800 outline-none focus:ring-2 focus:ring-red-600"
                required
              />
            </div>
            <div>
              <label class="text-xs font-bold text-zinc-500 uppercase block mb-1">Reportero</label
              ><input
                v-model="newsForm.reporter"
                type="text"
                class="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 font-bold text-zinc-800 outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>
          <div>
            <label class="text-xs font-bold text-zinc-500 uppercase block mb-1">Titular</label
            ><input
              v-model="newsForm.title"
              type="text"
              class="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-3 font-bold text-lg text-zinc-900 outline-none focus:ring-2 focus:ring-red-600"
              required
            />
          </div>

          <div
            class="grid grid-cols-2 md:grid-cols-4 gap-6 bg-zinc-50 p-6 rounded-xl border border-zinc-200"
          >
            <div>
              <label class="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Alcance</label
              ><input
                v-model="newsForm.reach"
                type="number"
                class="w-full bg-white border border-zinc-200 rounded p-2 text-sm font-bold text-zinc-800"
              />
            </div>
            <div>
              <label class="text-[10px] font-bold text-zinc-400 uppercase block mb-1"
                >Valor (AVE)</label
              ><input
                v-model="newsForm.ave_value"
                type="number"
                class="w-full bg-white border border-zinc-200 rounded p-2 text-sm font-bold text-zinc-800"
              />
            </div>
            <div>
              <label class="text-[10px] font-bold text-zinc-400 uppercase block mb-1"
                >Sentimiento</label
              ><select
                v-model="newsForm.sentiment"
                class="w-full bg-white border border-zinc-200 rounded p-2 text-sm font-bold text-zinc-800"
              >
                <option>Positivo</option>
                <option>Neutro</option>
                <option>Negativo</option>
              </select>
            </div>
            <div>
              <label class="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Tier</label
              ><select
                v-model="newsForm.tier"
                class="w-full bg-white border border-zinc-200 rounded p-2 text-sm font-bold text-zinc-800"
              >
                <option>Tier 1</option>
                <option>Tier 2</option>
                <option>Tier 3</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="text-xs font-bold text-zinc-500 uppercase block mb-1">Tipo</label
              ><select
                v-model="newsForm.media_type"
                class="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 font-bold text-zinc-800"
              >
                <option>Digital</option>
                <option>Impreso</option>
                <option>Radio/TV</option>
              </select>
            </div>
            <div>
              <label class="text-xs font-bold text-zinc-500 uppercase block mb-1"
                >Mensaje Clave</label
              ><input
                v-model="newsForm.key_message"
                type="text"
                class="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 font-bold text-zinc-800"
              />
            </div>
          </div>

          <div class="pt-6 border-t border-zinc-100 flex gap-4">
            <button
              v-if="editingId"
              type="button"
              @click="cancelEdit"
              class="flex-1 bg-white border-2 border-zinc-200 text-zinc-600 font-bold py-3 rounded-xl hover:bg-zinc-50 hover:text-zinc-800 transition-colors uppercase tracking-widest text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="flex-[2] bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all uppercase tracking-widest text-xs flex justify-center items-center gap-2"
            >
              <span>{{
                loading
                  ? 'Guardando...'
                  : editingId
                    ? 'Actualizar Noticia'
                    : 'Guardar Nueva Noticia'
              }}</span>
            </button>
          </div>
        </form>
      </div>

      <div v-if="activeTab === 'strategy'" class="p-8 space-y-8 animate-fade-in">
        <form @submit.prevent="submitStrategy">
          <h3
            class="font-black text-lg mb-4 border-l-4 border-red-600 pl-3 uppercase tracking-tighter"
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
                class="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              ></textarea>
            </div>
            <div>
              <label class="text-xs font-bold text-blue-600 uppercase block mb-1"
                >Oportunidades</label
              ><textarea
                v-model="strategyForm.swot_opportunities"
                rows="3"
                class="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              ></textarea>
            </div>
            <div>
              <label class="text-xs font-bold text-amber-600 uppercase block mb-1"
                >Debilidades</label
              ><textarea
                v-model="strategyForm.swot_weaknesses"
                rows="3"
                class="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              ></textarea>
            </div>
            <div>
              <label class="text-xs font-bold text-red-600 uppercase block mb-1">Amenazas</label
              ><textarea
                v-model="strategyForm.swot_threats"
                rows="3"
                class="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
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
                class="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-zinc-400"
              ></textarea>
            </div>
            <div>
              <label class="text-xs font-bold text-zinc-500 uppercase block mb-1"
                >Próximos Pasos</label
              ><textarea
                v-model="strategyForm.roadmap"
                rows="4"
                class="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-zinc-400"
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
</template>

<style scoped>
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

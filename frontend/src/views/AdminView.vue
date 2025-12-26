<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const activeTab = ref('news') // Controla qué pestaña se ve: 'news' o 'strategy'

// --- LÓGICA DE NOTICIAS ---
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

const submitNews = async () => {
  loading.value = true
  try {
    const res = await fetch('http://localhost:3000/api/news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newsForm.value),
    })

    if (res.ok) {
      alert('¡Noticia guardada con éxito!')
      // Limpiamos solo los campos clave para facilitar la siguiente carga
      newsForm.value.title = ''
      newsForm.value.reach = 0
      newsForm.value.ave_value = 0
    } else {
      alert('Error al guardar la noticia.')
    }
  } catch (e) {
    console.error(e)
    alert('Error de conexión con el servidor.')
  } finally {
    loading.value = false
  }
}

// --- LÓGICA DE ESTRATEGIA (FODA) ---
const strategyForm = ref({
  swot_strengths: '',
  swot_opportunities: '',
  swot_weaknesses: '',
  swot_threats: '',
  milestones: '',
  roadmap: '',
})

// Cargar datos actuales al abrir la página
const loadStrategy = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/report/anual')
    const data = await res.json()

    // Rellenamos el formulario con lo que venga de la base de datos
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
    const res = await fetch('http://localhost:3000/api/report/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(strategyForm.value),
    })

    if (res.ok) alert('Estrategia actualizada correctamente')
    else alert('Error al actualizar.')
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

// Al montar el componente, cargamos los datos de la estrategia
onMounted(() => loadStrategy())
</script>

<template>
  <div class="min-h-screen bg-zinc-100 p-8 font-sans text-zinc-800">
    <div class="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
      <div class="bg-zinc-900 px-8 py-6 flex justify-between items-center">
        <h2 class="text-xl font-black text-white uppercase tracking-tighter">
          Panel de <span class="text-red-600">Gestión</span>
        </h2>
        <button
          @click="router.push('/')"
          class="text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-widest border border-zinc-700 px-3 py-1 rounded transition-colors"
        >
          &larr; Volver al Dashboard
        </button>
      </div>

      <div class="flex border-b border-zinc-200">
        <button
          @click="activeTab = 'news'"
          :class="[
            'flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-colors',
            activeTab === 'news'
              ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
              : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50',
          ]"
        >
          📝 Nueva Noticia
        </button>
        <button
          @click="activeTab = 'strategy'"
          :class="[
            'flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-colors',
            activeTab === 'strategy'
              ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
              : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50',
          ]"
        >
          📊 Estrategia (FODA)
        </button>
      </div>

      <div v-if="activeTab === 'news'" class="p-8 animate-fade-in">
        <form @submit.prevent="submitNews" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-xs font-bold text-zinc-500 uppercase mb-1">Fecha</label>
              <input
                v-model="newsForm.publication_date"
                type="date"
                required
                class="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 font-bold text-zinc-800 focus:ring-2 focus:ring-red-600 outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-zinc-500 uppercase mb-1">Medio</label>
              <input
                v-model="newsForm.media_name"
                type="text"
                required
                placeholder="Ej: Reforma"
                class="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 font-bold text-zinc-800 focus:ring-2 focus:ring-red-600 outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-zinc-500 uppercase mb-1">Reportero</label>
              <input
                v-model="newsForm.reporter"
                type="text"
                placeholder="Nombre"
                class="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 font-bold text-zinc-800 focus:ring-2 focus:ring-red-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-zinc-500 uppercase mb-1"
              >Titular de la Nota</label
            >
            <input
              v-model="newsForm.title"
              type="text"
              required
              placeholder="Escribe el título completo..."
              class="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-3 font-bold text-lg text-zinc-900 focus:ring-2 focus:ring-red-600 outline-none"
            />
          </div>

          <div
            class="grid grid-cols-2 md:grid-cols-4 gap-6 bg-zinc-50 p-4 rounded-xl border border-zinc-200"
          >
            <div>
              <label class="block text-[10px] font-black text-zinc-400 uppercase mb-1"
                >Alcance</label
              >
              <input
                v-model="newsForm.reach"
                type="number"
                class="w-full bg-white border border-zinc-200 rounded p-2 text-sm font-bold text-zinc-800"
              />
            </div>
            <div>
              <label class="block text-[10px] font-black text-zinc-400 uppercase mb-1"
                >Valor (AVE $)</label
              >
              <input
                v-model="newsForm.ave_value"
                type="number"
                step="0.01"
                class="w-full bg-white border border-zinc-200 rounded p-2 text-sm font-bold text-zinc-800"
              />
            </div>
            <div>
              <label class="block text-[10px] font-black text-zinc-400 uppercase mb-1"
                >Sentimiento</label
              >
              <select
                v-model="newsForm.sentiment"
                class="w-full bg-white border border-zinc-200 rounded p-2 text-sm font-bold text-zinc-800"
              >
                <option>Positivo</option>
                <option>Neutro</option>
                <option>Negativo</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-black text-zinc-400 uppercase mb-1">Tier</label>
              <select
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
              <label class="block text-xs font-bold text-zinc-500 uppercase mb-1"
                >Tipo de Medio</label
              >
              <select
                v-model="newsForm.media_type"
                class="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 font-bold text-zinc-800"
              >
                <option>Digital</option>
                <option>Impreso</option>
                <option>Radio/TV</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-zinc-500 uppercase mb-1"
                >Mensaje Clave</label
              >
              <input
                v-model="newsForm.key_message"
                type="text"
                placeholder="Ej: Sostenibilidad"
                class="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 font-bold text-zinc-800"
              />
            </div>
          </div>

          <div class="pt-4 border-t border-zinc-100">
            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-widest text-sm flex justify-center items-center gap-2"
            >
              <span v-if="loading">Guardando...</span>
              <span v-else>Guardar Noticia</span>
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
              <label class="text-xs font-bold text-emerald-600 uppercase block mb-2"
                >Fortalezas</label
              >
              <textarea
                v-model="strategyForm.swot_strengths"
                rows="3"
                class="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-lg text-sm text-zinc-700 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
              ></textarea>
            </div>
            <div>
              <label class="text-xs font-bold text-blue-600 uppercase block mb-2"
                >Oportunidades</label
              >
              <textarea
                v-model="strategyForm.swot_opportunities"
                rows="3"
                class="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-lg text-sm text-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              ></textarea>
            </div>
            <div>
              <label class="text-xs font-bold text-amber-600 uppercase block mb-2"
                >Debilidades</label
              >
              <textarea
                v-model="strategyForm.swot_weaknesses"
                rows="3"
                class="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-lg text-sm text-zinc-700 focus:ring-2 focus:ring-amber-500 outline-none resize-none"
              ></textarea>
            </div>
            <div>
              <label class="text-xs font-bold text-red-600 uppercase block mb-2">Amenazas</label>
              <textarea
                v-model="strategyForm.swot_threats"
                rows="3"
                class="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-lg text-sm text-zinc-700 focus:ring-2 focus:ring-red-500 outline-none resize-none"
              ></textarea>
            </div>
          </div>

          <h3
            class="font-black text-lg mb-4 border-l-4 border-zinc-800 pl-3 uppercase tracking-tighter"
          >
            Contexto y Pasos
          </h3>

          <div class="space-y-6">
            <div>
              <label class="text-xs font-bold text-zinc-500 uppercase block mb-2"
                >Hito Principal del Periodo</label
              >
              <textarea
                v-model="strategyForm.milestones"
                rows="2"
                class="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-lg text-sm text-zinc-700 focus:ring-2 focus:ring-zinc-500 outline-none resize-none"
              ></textarea>
            </div>
            <div>
              <label class="text-xs font-bold text-zinc-500 uppercase block mb-2"
                >Próximos Pasos (Escribe uno por línea)</label
              >
              <textarea
                v-model="strategyForm.roadmap"
                rows="5"
                class="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-lg text-sm text-zinc-700 focus:ring-2 focus:ring-zinc-500 outline-none resize-none"
                placeholder="● Paso 1&#10;● Paso 2..."
              ></textarea>
            </div>
          </div>

          <div class="mt-8 pt-6 border-t border-zinc-100">
            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-zinc-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg transition-all uppercase tracking-widest text-sm"
            >
              {{ loading ? 'Guardando...' : 'Actualizar Estrategia' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animación suave al cambiar de pestaña */
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

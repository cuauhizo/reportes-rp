<script setup>
import { ref, computed } from 'vue'
import { Search, Edit2, Trash2, Calendar, Hash, ExternalLink } from 'lucide-vue-next'

const props = defineProps(['news'])
const emit = defineEmits(['edit', 'delete'])
const searchQuery = ref('')

// Función colores (Actualizada a colores más sobrios/profesionales)
// const getMediaTypeClass = (type) => {
//   const styles = {
//     'Nota': 'bg-emerald-50 text-emerald-700 border-emerald-200',
//     'Columna': 'bg-blue-50 text-blue-700 border-blue-200',
//     'Entrevista': 'bg-purple-50 text-purple-700 border-purple-200',
//     'Artículo': 'bg-amber-50 text-amber-700 border-amber-200',
//     'Mención': 'bg-zinc-50 text-zinc-600 border-zinc-200',
//   };
//   return styles[type] || 'bg-gray-50 text-gray-600 border-gray-200';
// };

// Función colores (Actualizada a colores más sobrios/profesionales)
const getMediaTypeClass = (type) => {
  const styles = {
    Digital: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Impreso: 'bg-blue-50 text-blue-700 border-blue-200',
    'Radio/TV': 'bg-amber-50 text-amber-700 border-amber-200',
  }
  return styles[type] || 'bg-gray-50 text-gray-600 border-gray-200'
}

const filteredNews = computed(() => {
  if (!searchQuery.value) return props.news // Si está vacío, devuelve todo

  const query = searchQuery.value.toLowerCase()

  return props.news.filter(
    (item) =>
      item.title.toLowerCase().includes(query) ||
      item.media_name.toLowerCase().includes(query) ||
      item.media_type.toLowerCase().includes(query) ||
      item.key_message.toLowerCase().includes(query) ||
      (item.reporter && item.reporter.toLowerCase().includes(query)),
  )
})

// Función para formatear fecha (dd/mm/aaaa)
const formatDate = (dateString) => {
  if (!dateString) return '-'
  // Dividimos la fecha que viene como "2025-02-01T..."
  const [year, month, day] = dateString.split('T')[0].split('-')

  // Retornamos en el orden que quieres
  return `${day}/${month}/${year}`
}

const formatCurrency = (val) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val)
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
    <div class="p-4 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
      <div class="relative w-full md:w-96">
        <Search class="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar noticia, medio, tema..."
          class="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
        />
      </div>
      <div class="text-xs font-bold text-zinc-400 uppercase tracking-wider">
        {{ filteredNews.length }} Registros
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead class="bg-zinc-50 text-zinc-500 font-bold text-[10px] uppercase tracking-wider">
          <tr>
            <th class="p-4 w-10 text-center">#</th>
            <th class="p-4 w-32">Fecha</th>
            <th class="p-4">Titular / Tema</th>
            <th class="p-4">Medio</th>
            <th class="p-4">Reportero</th>
            <th class="p-4 text-center">Tipo</th>
            <th class="p-4 text-right">Alcance</th>
            <th class="p-4 text-right">AVE</th>
            <th class="p-4 text-center">Sentimiento</th>
            <th class="p-4 text-center w-24">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-100 text-xs text-zinc-700">
          <tr
            v-for="(item, index) in filteredNews"
            :key="item.id"
            class="hover:bg-zinc-50 transition-colors group"
          >
            <td class="p-4 text-center text-zinc-400 font-mono">{{ index + 1 }}</td>
            <td class="p-4 font-medium text-zinc-500 whitespace-nowrap">
              {{ formatDate(item.publication_date) }}
            </td>

            <td class="p-4 max-w-xs">
              <div class="font-bold text-zinc-900 truncate mb-1" :title="item.title">
                {{ item.title }}
              </div>
              <div
                class="inline-flex items-center text-[10px] text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded"
              >
                <Hash class="w-3 h-3" />{{ item.key_message }}
              </div>
            </td>

            <td class="p-4 font-bold text-zinc-800">{{ item.media_name }}</td>
            <td class="p-4 text-zinc-800">{{ item.reporter || '-' }}</td>

            <td class="p-4 text-center">
              <span
                :class="[
                  'px-2.5 py-1 rounded-full text-[10px] font-bold border',
                  getMediaTypeClass(item.media_type),
                ]"
              >
                {{ item.media_type }}
              </span>
            </td>

            <td class="p-4 text-right font-mono">{{ item.reach.toLocaleString() }}</td>
            <td class="p-4 text-right font-mono font-bold text-zinc-600">
              {{ formatCurrency(item.ave_value) }}
            </td>

            <td class="p-4 text-center">
              <div class="flex justify-center">
                <span
                  :class="[
                    'w-2 h-2 rounded-full mr-2',
                    item.sentiment === 'Positivo'
                      ? 'bg-emerald-500'
                      : item.sentiment === 'Negativo'
                        ? 'bg-red-500'
                        : 'bg-zinc-400',
                  ]"
                ></span>
                {{ item.sentiment }}
              </div>
            </td>

            <td class="p-4">
              <div
                class="flex justify-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
              >
                <button
                  @click="emit('edit', item)"
                  class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit2 class="w-4 h-4" />
                </button>
                <button
                  @click="emit('delete', item.id)"
                  class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredNews.length === 0">
            <td colspan="11" class="p-8 text-center text-zinc-400 italic">
              {{
                searchQuery ? 'No se encontraron resultados para tu búsqueda.' : 'No hay registros.'
              }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps(['news'])
const emit = defineEmits(['edit', 'delete'])

// 1. VARIABLE PARA LA BÚSQUEDA
const searchQuery = ref('')

// 2. FILTRO COMPUTADO (Mágia en tiempo real)
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

// Función para asignar colores según el género
// const getMediaTypeClass = (type) => {
//   switch (type) {
//     case 'Nota':
//       return 'bg-emerald-100 text-emerald-800 border-emerald-200' // Verde (Estándar)
//     case 'Columna':
//       return 'bg-blue-100 text-blue-800 border-blue-200' // Azul (Opinión)
//     case 'Entrevista':
//       return 'bg-purple-100 text-purple-800 border-purple-200' // Morado (Destacado)
//     case 'Artículo':
//       return 'bg-amber-100 text-amber-800 border-amber-200' // Naranja (Análisis)
//     case 'Mención':
//       return 'bg-zinc-100 text-zinc-600 border-zinc-200' // Gris (Menor impacto)
//     case 'Reportaje':
//       return 'bg-pink-100 text-pink-800 border-pink-200' // Rosa (Especial)
//     case 'Comunicado':
//       return 'bg-cyan-100 text-cyan-800 border-cyan-200' // Cyan (Corporativo)
//     default:
//       return 'bg-gray-100 text-gray-800 border-gray-200'
//   }
// }

const getMediaTypeClass = (type) => {
  switch (type) {
    case 'Digital':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200' // Verde (Estándar)
    case 'Impreso':
      return 'bg-blue-100 text-blue-800 border-blue-200' // Azul (Opinión)
    case 'Radio/TV':
      return 'bg-amber-100 text-amber-800 border-amber-200' // Naranja (Análisis)
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

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
  <div class="overflow-x-auto animate-fade-in p-1">
    <div
      class="mb-4 flex items-center md:items-end bg-white border border-zinc-200 rounded-lg px-3 py-2 w-full md:w-1/3 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500"
    >
      <span class="text-zinc-400 mr-2">🔍</span>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar por título, medio, tema..."
        class="w-full outline-none text-xs font-bold text-zinc-700 bg-transparent placeholder-zinc-400"
      />
      <button
        v-if="searchQuery"
        @click="searchQuery = ''"
        class="text-zinc-300 hover:text-zinc-500 font-bold ml-2"
      >
        ✕
      </button>
    </div>
    <table class="w-full text-left border-collapse">
      <thead class="bg-emerald-700 text-white font-bold whitespace-nowrap">
        <tr>
          <th class="p-3 border-r border-emerald-600 w-10">#</th>
          <th class="p-3 border-r border-emerald-600 w-24">
            Fecha <span class="text-xs opacity-70">▼</span>
          </th>
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
          v-for="(item, index) in filteredNews"
          :key="item.id"
          class="hover:bg-yellow-50 transition-colors"
        >
          <td class="p-2 border-r border-zinc-200 text-zinc-500 text-center">{{ index + 1 }}</td>
          <td class="p-2 border-r border-zinc-200 whitespace-nowrap">
            {{ formatDate(item.publication_date) }}
          </td>
          <td class="p-2 border-r border-zinc-200 font-medium">{{ item.key_message }}</td>
          <td class="p-2 border-r border-zinc-200 font-bold text-emerald-900">
            {{ item.media_name }}
          </td>
          <td class="p-2 border-r border-zinc-200 text-center">
            <span
              :class="[
                'px-2 py-0.5 rounded text-[10px] font-bold uppercase border',
                getMediaTypeClass(item.media_type),
              ]"
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
            <span class="text-blue-600 font-medium">{{ item.title }}</span>
          </td>
          <td class="p-2 border-r border-zinc-200 text-center">
            <span
              :class="[
                'px-2 py-0.5 rounded text-[10px] font-bold border',
                item.sentiment === 'Positivo'
                  ? 'bg-emerald-100 text-emerald-800'
                  : item.sentiment === 'Negativo'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-zinc-100',
              ]"
              >{{ item.sentiment }}</span
            >
          </td>
          <td class="p-2 text-center flex justify-center gap-2">
            <button
              @click="emit('edit', item)"
              class="text-blue-600 font-bold hover:bg-blue-50 p-1 rounded"
            >
              ✏️
            </button>
            <button
              @click="emit('delete', item.id)"
              class="text-red-600 font-bold hover:bg-red-50 p-1 rounded"
            >
              🗑️
            </button>
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
</template>

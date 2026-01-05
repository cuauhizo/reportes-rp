<script setup>
const props = defineProps(['news'])
const emit = defineEmits(['edit', 'delete'])

const formatCurrency = (val) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val)
</script>

<template>
  <div class="overflow-x-auto animate-fade-in">
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
          v-for="(item, index) in news"
          :key="item.id"
          class="hover:bg-yellow-50 transition-colors"
        >
          <td class="p-2 border-r border-zinc-200 text-zinc-500 text-center">{{ index + 1 }}</td>
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
              >{{ item.media_type }}</span
            >
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
        <tr v-if="news.length === 0">
          <td colspan="11" class="p-8 text-center text-zinc-400 italic">No hay registros.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

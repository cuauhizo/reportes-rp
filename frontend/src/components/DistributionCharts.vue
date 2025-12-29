<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'
import { Pie, Bar } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps(['news'])

// --- 1. Lógica para Tier (Gráfico Pastel) ---
const tierData = computed(() => {
  const counts = { 'Tier 1': 0, 'Tier 2': 0, 'Tier 3': 0 }
  props.news.forEach((n) => {
    if (counts[n.tier] !== undefined) counts[n.tier]++
  })
  return {
    labels: ['Tier 1', 'Tier 2', 'Tier 3'],
    datasets: [
      {
        data: [counts['Tier 1'], counts['Tier 2'], counts['Tier 3']],
        backgroundColor: ['#000000', '#dc2626', '#a1a1aa'],
      },
    ],
  }
})

// --- 2. Lógica para Tipo de Medio (Barras Simples) ---
const mediaTypeData = computed(() => {
  const total = props.news.length || 1
  const counts = { Digital: 0, Impreso: 0, 'Radio/TV': 0 }
  props.news.forEach((n) => {
    if (counts[n.media_type] !== undefined) counts[n.media_type]++
  })

  return {
    digital: Math.round((counts['Digital'] / total) * 100),
    print: Math.round((counts['Impreso'] / total) * 100),
    broadcast: Math.round((counts['Radio/TV'] / total) * 100),
  }
})

// --- 3. Lógica para Mensajes (Bar Chart Horizontal) ---
const messageData = computed(() => {
  const counts = {}
  props.news.forEach((n) => {
    counts[n.key_message] = (counts[n.key_message] || 0) + 1
  })
  // Ordenar y tomar top 5
  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return {
    labels: sorted.map((i) => i[0]),
    datasets: [
      {
        label: 'Menciones',
        data: sorted.map((i) => i[1]),
        backgroundColor: '#dc2626',
        barThickness: 20,
      },
    ],
  }
})

const barOptions = { indexAxis: 'y', responsive: true, plugins: { legend: { display: false } } }
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
    <div class="space-y-8">
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
        <h3 class="text-sm font-bold uppercase mb-4 text-zinc-800">Distribución por Tier</h3>
        <div class="h-48 relative">
          <Pie :data="tierData" :options="{ responsive: true, maintainAspectRatio: false }" />
        </div>
      </div>

      <div class="bg-zinc-900 p-6 rounded-2xl shadow-lg text-white">
        <h3 class="text-sm font-bold uppercase mb-6 text-red-500">Tipo de Medio (%)</h3>
        <div class="space-y-4">
          <div>
            <div class="flex justify-between text-xs font-bold mb-1">
              <span>Digital</span><span>{{ mediaTypeData.digital }}%</span>
            </div>
            <div class="w-full bg-zinc-800 h-2 rounded-full">
              <div
                class="bg-white h-full rounded-full"
                :style="{ width: mediaTypeData.digital + '%' }"
              ></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-xs font-bold mb-1">
              <span>Impreso</span><span>{{ mediaTypeData.print }}%</span>
            </div>
            <div class="w-full bg-zinc-800 h-2 rounded-full">
              <div
                class="bg-zinc-500 h-full rounded-full"
                :style="{ width: mediaTypeData.print + '%' }"
              ></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-xs font-bold mb-1">
              <span>Radio/TV</span><span>{{ mediaTypeData.broadcast }}%</span>
            </div>
            <div class="w-full bg-zinc-800 h-2 rounded-full">
              <div
                class="bg-red-600 h-full rounded-full"
                :style="{ width: mediaTypeData.broadcast + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200 h-full">
      <h3 class="text-sm font-bold uppercase mb-4 text-zinc-800">Mensajes Clave</h3>
      <div class="h-64">
        <Bar :data="messageData" :options="barOptions" />
      </div>
    </div>
  </div>
</template>

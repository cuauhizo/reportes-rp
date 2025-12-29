<script setup>
import { ref } from 'vue'

const emit = defineEmits(['filter'])

const startDate = ref('')
const endDate = ref('')
const activeTab = ref('anual') // 'mensual', 'trimestral', 'anual', 'custom'

// Función para botones predefinidos
const setPeriod = (period) => {
  activeTab.value = period

  const today = new Date('2025-12-31') // Simulamos estar en fin de año 2025
  let start = ''
  let end = '2025-12-31'

  if (period === 'anual') start = '2025-01-01'
  if (period === 'trimestral') start = '2025-10-01' // Q4
  if (period === 'mensual') start = '2025-12-01' // Diciembre

  // Emitimos el evento al padre para que recargue los datos
  emit('filter', { start, end, label: period })
}

// Función para fechas personalizadas
const applyCustomDates = () => {
  if (startDate.value && endDate.value) {
    activeTab.value = 'custom'
    emit('filter', { start: startDate.value, end: endDate.value, label: 'Personalizado' })
  }
}
</script>

<template>
  <nav class="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
    <div class="bg-white p-1.5 rounded-2xl shadow-md border border-zinc-200 flex gap-1">
      <button
        @click="setPeriod('mensual')"
        :class="[
          'px-4 py-2 rounded-xl text-sm font-bold transition-all',
          activeTab === 'mensual'
            ? 'bg-red-600 text-white shadow-md'
            : 'text-zinc-600 hover:bg-zinc-100',
        ]"
      >
        Mensual
      </button>
      <button
        @click="setPeriod('trimestral')"
        :class="[
          'px-4 py-2 rounded-xl text-sm font-bold transition-all',
          activeTab === 'trimestral'
            ? 'bg-red-600 text-white shadow-md'
            : 'text-zinc-600 hover:bg-zinc-100',
        ]"
      >
        Trimestral
      </button>
      <button
        @click="setPeriod('anual')"
        :class="[
          'px-4 py-2 rounded-xl text-sm font-bold transition-all',
          activeTab === 'anual'
            ? 'bg-red-600 text-white shadow-md'
            : 'text-zinc-600 hover:bg-zinc-100',
        ]"
      >
        Anual
      </button>
    </div>

    <div
      class="bg-white p-1.5 rounded-2xl shadow-md border border-zinc-200 flex items-center gap-2 px-4"
    >
      <input
        type="date"
        v-model="startDate"
        class="text-xs border-none font-bold text-zinc-600 p-1 rounded focus:ring-0 outline-none"
      />
      <span class="text-zinc-300">/</span>
      <input
        type="date"
        v-model="endDate"
        class="text-xs border-none font-bold text-zinc-600 p-1 rounded focus:ring-0 outline-none"
      />
      <button
        @click="applyCustomDates"
        class="bg-zinc-100 hover:bg-zinc-200 p-2 rounded-lg text-[10px] font-black uppercase text-zinc-800 tracking-widest transition-colors"
      >
        Filtrar
      </button>
    </div>
  </nav>
</template>

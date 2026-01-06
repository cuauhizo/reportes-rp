<script setup>
import { ref, onMounted, watch } from 'vue'
import { useReportStore } from '../stores/reportStore'
import { storeToRefs } from 'pinia'

// 1. STORE Y EMITS
const store = useReportStore()
const { clients, currentClientId } = storeToRefs(store)
const { fetchClients, setClient } = store
const emit = defineEmits(['filter'])

// 2. CONSTANTES PARA LOS SELECTORES
const MONTHS = [
  { val: '01', label: 'Enero' },
  { val: '02', label: 'Febrero' },
  { val: '03', label: 'Marzo' },
  { val: '04', label: 'Abril' },
  { val: '05', label: 'Mayo' },
  { val: '06', label: 'Junio' },
  { val: '07', label: 'Julio' },
  { val: '08', label: 'Agosto' },
  { val: '09', label: 'Septiembre' },
  { val: '10', label: 'Octubre' },
  { val: '11', label: 'Noviembre' },
  { val: '12', label: 'Diciembre' },
]

const QUARTERS = [
  { val: 'Q1', label: '1° Trimestre (Ene-Mar)', start: '01-01', end: '03-31' },
  { val: 'Q2', label: '2° Trimestre (Abr-Jun)', start: '04-01', end: '06-30' },
  { val: 'Q3', label: '3° Trimestre (Jul-Sep)', start: '07-01', end: '09-30' },
  { val: 'Q4', label: '4° Trimestre (Oct-Dic)', start: '10-01', end: '12-31' },
]

// Generamos años dinámicamente (ej: del año pasado al próximo)
const currentYearNum = new Date().getFullYear()
const YEARS = [currentYearNum - 1, currentYearNum, currentYearNum + 1]

// 3. ESTADO
const activeTab = ref('mensual') // 'mensual', 'trimestral', 'anual', 'custom'

const selectedMonth = ref('')
const selectedQuarter = ref(QUARTERS[0])
const selectedYear = ref(currentYearNum)
const customStart = ref('')
const customEnd = ref('')

// 4. LÓGICA DE FILTRADO INTELIGENTE
const getLastDayOfMonth = (year, monthStr) => {
  return new Date(year, parseInt(monthStr), 0).getDate()
}

const applyFilter = () => {
  let start = ''
  let end = ''
  let label = ''

  if (activeTab.value === 'mensual') {
    const lastDay = getLastDayOfMonth(selectedYear.value, selectedMonth.value)
    start = `${selectedYear.value}-${selectedMonth.value}-01`
    end = `${selectedYear.value}-${selectedMonth.value}-${lastDay}`

    const mName = MONTHS.find((m) => m.val === selectedMonth.value)?.label
    label = `Reporte Mensual - ${mName} ${selectedYear.value}`
  } else if (activeTab.value === 'trimestral') {
    start = `${selectedYear.value}-${selectedQuarter.value.start}`
    end = `${selectedYear.value}-${selectedQuarter.value.end}`
    label = `Reporte Trimestral - ${selectedQuarter.value.val} ${selectedYear.value}`
  } else if (activeTab.value === 'anual') {
    start = `${selectedYear.value}-01-01`
    end = `${selectedYear.value}-12-31`
    label = `Reporte Anual ${selectedYear.value}`
  } else {
    // Custom
    if (!customStart.value || !customEnd.value) return
    start = customStart.value
    end = customEnd.value
    label = `Periodo: ${start} a ${end}`
  }

  // Enviamos al padre
  emit('filter', { start, end, label })
}

// 5. INICIALIZACIÓN
onMounted(() => {
  fetchClients() // Cargar clientes

  // Configurar fecha actual por defecto
  const today = new Date()
  const m = (today.getMonth() + 1).toString().padStart(2, '0')
  selectedMonth.value = m
  selectedYear.value = today.getFullYear()

  // Calcular trimestre actual
  const qIndex = Math.floor(today.getMonth() / 3)
  selectedQuarter.value = QUARTERS[qIndex]

  // Aplicar filtro inicial
  applyFilter()
})

// Observar cambios para aplicar filtro automáticamente (excepto en custom)
watch([selectedMonth, selectedQuarter, selectedYear], () => {
  if (activeTab.value !== 'custom') applyFilter()
})
</script>

<template>
  <nav class="flex flex-col xl:flex-row items-center justify-center gap-4 mb-8">
    <div class="bg-zinc-900 p-1.5 rounded-2xl shadow-md border border-zinc-800">
      <select
        :value="currentClientId"
        @change="setClient($event.target.value)"
        class="bg-transparent text-white text-sm font-bold border-none outline-none px-2 py-2 cursor-pointer"
      >
        <option v-for="c in clients" :key="c.id" :value="c.id" class="text-black">
          {{ c.name }}
        </option>
      </select>
    </div>

    <div class="bg-white p-1.5 rounded-2xl shadow-md border border-zinc-200 flex gap-1">
      <button
        @click="
          activeTab = 'mensual';
          applyFilter()
        "
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
        @click="
          activeTab = 'trimestral';
          applyFilter()
        "
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
        @click="
          activeTab = 'anual';
          applyFilter()
        "
        :class="[
          'px-4 py-2 rounded-xl text-sm font-bold transition-all',
          activeTab === 'anual'
            ? 'bg-red-600 text-white shadow-md'
            : 'text-zinc-600 hover:bg-zinc-100',
        ]"
      >
        Anual
      </button>
      <button
        @click="activeTab = 'custom'"
        :class="[
          'px-4 py-2 rounded-xl text-sm font-bold transition-all',
          activeTab === 'custom'
            ? 'bg-red-600 text-white shadow-md'
            : 'text-zinc-600 hover:bg-zinc-100',
        ]"
      >
        Rango
      </button>
    </div>

    <div
      class="bg-white p-1.5 rounded-2xl shadow-md border border-zinc-200 flex items-center gap-2 px-2 animate-fade-in min-h-[50px]"
    >
      <div v-if="activeTab === 'mensual'" class="flex gap-2">
        <select
          v-model="selectedMonth"
          class="text-sm font-bold text-zinc-700 bg-zinc-100 rounded-lg px-2 py-2 outline-none border-r-8 border-transparent"
        >
          <option v-for="m in MONTHS" :key="m.val" :value="m.val">{{ m.label }}</option>
        </select>
        <select
          v-model="selectedYear"
          class="text-sm font-bold text-zinc-700 bg-zinc-100 rounded-lg px-2 py-2 outline-none border-r-8 border-transparent"
        >
          <option v-for="y in YEARS" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>

      <div v-if="activeTab === 'trimestral'" class="flex gap-2">
        <select
          v-model="selectedQuarter"
          class="text-sm font-bold text-zinc-700 bg-zinc-100 rounded-lg px-2 py-2 outline-none border-r-8 border-transparent"
        >
          <option v-for="q in QUARTERS" :key="q.val" :value="q">{{ q.label }}</option>
        </select>
        <select
          v-model="selectedYear"
          class="text-sm font-bold text-zinc-700 bg-zinc-100 rounded-lg px-2 py-2 outline-none border-r-8 border-transparent"
        >
          <option v-for="y in YEARS" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>

      <div v-if="activeTab === 'anual'">
        <select
          v-model="selectedYear"
          class="text-sm font-bold text-zinc-700 bg-zinc-100 rounded-lg px-2 py-2 outline-none border-r-8 border-transparent w-full"
        >
          <option v-for="y in YEARS" :key="y" :value="y">Año {{ y }}</option>
        </select>
      </div>

      <div v-if="activeTab === 'custom'" class="flex items-center gap-2 px-2">
        <input
          type="date"
          v-model="customStart"
          class="text-xs border-none font-bold text-zinc-600 bg-zinc-50 p-1.5 rounded focus:ring-0 outline-none"
        />
        <span class="text-zinc-300 font-bold">/</span>
        <input
          type="date"
          v-model="customEnd"
          class="text-xs border-none font-bold text-zinc-600 bg-zinc-50 p-1.5 rounded focus:ring-0 outline-none"
        />
        <button
          @click="applyFilter"
          class="bg-zinc-900 hover:bg-black text-white p-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
        >
          Filtrar
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* Pequeña animación para cuando cambian los controles */
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

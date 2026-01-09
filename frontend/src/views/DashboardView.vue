<script setup>
import { onMounted } from 'vue'
import { useReportStore } from '../stores/reportStore'
import { storeToRefs } from 'pinia'
import { useExport } from '../composables/useExport'
import { Settings, FileSpreadsheet, FileText, FileSearch, Plus } from 'lucide-vue-next'

// Componentes
import KpiCards from '../components/KpiCards.vue'
import SentimentChart from '../components/SentimentChart.vue'
import TrendChart from '../components/TrendChart.vue'
import NewsTimeline from '../components/NewsTimeline.vue'
import FodaSection from '../components/FodaSection.vue'
import ContextSection from '../components/ContextSection.vue'
import NavBar from '../components/NavBar.vue'
import DistributionCharts from '../components/DistributionCharts.vue'

const store = useReportStore()
const {
  reportData,
  loading,
  currentClientId,
  formattedReach,
  formattedAve,
  tier1Percentage,
  trendData,
  topNotes,
} = storeToRefs(store)

const { fetchReport } = store
const { exportToExcel, exportToPDF } = useExport()

const handleDownloadExcel = () => {
  if (reportData.value && reportData.value.news) {
    exportToExcel(reportData.value.news, `Reporte_${reportData.value.period}.xlsx`)
  }
}

const handleDownloadPDF = () => {
  exportToPDF('dashboard-content', `Reporte_Ejecutivo.pdf`)
}

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num
}

// Función para el encabezado (Formato largo y elegante)
const formatDateHeader = (dateStr) => {
  if (!dateStr) return ''
  // Dividimos la fecha para evitar problemas de zona horaria
  const [year, month, day] = dateStr.split('T')[0].split('-')
  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ]

  return `${day} de ${months[parseInt(month) - 1]} de ${year}`
}

onMounted(() => {
  if (!reportData.value || reportData.value.clientId !== currentClientId.value) {
    fetchReport()
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#f4f4f5] font-sans text-zinc-800">
    <div id="dashboard-content" class="bg-[#f4f4f5] print:bg-white h-auto w-full relative overflow-hidden">
      <header
        class="bg-gradient-to-r from-black via-zinc-900 to-red-900 text-white shadow-none mb-0 relative overflow-hidden no-break h-[228px] flex flex-col justify-end pb-12 px-6"
      >
        <div
          data-html2canvas-ignore="true"
          class="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full -mr-48 -mt-48 blur-3xl pointer-events-none"
        ></div>
        <div class="max-w-7xl mx-auto relative z-10 flex flex-row justify-between items-end w-full">
          <div>
            <p class="text-red-500 font-bold tracking-widest uppercase text-xs mb-2">
              Análisis Estratégico
            </p>
            <h1 class="text-4xl md:text-5xl font-extrabold mb-2">
              {{ reportData ? reportData.clientName : 'Cargando...' }}
            </h1>
            <p v-if="reportData" class="text-zinc-300 text-lg opacity-90">
              <span v-if="reportData.period && !reportData.period.includes('Periodo:')">
                {{ reportData.period }}
              </span>

              <span v-else>
                Del {{ formatDateHeader(reportData.startDate) }} al
                {{ formatDateHeader(reportData.endDate) }}
              </span>
            </p>
          </div>

          <div class="mt-6 md:mt-0 flex gap-3 no-print">
            <router-link
              to="/admin"
              class="bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded text-xs font-bold uppercase backdrop-blur-sm border border-white/10 flex items-center gap-2 transition-colors"
            >
              <Settings class="w-4 h-4" />
              Gestión
            </router-link>

            <button
              @click="handleDownloadExcel"
              class="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded text-xs font-bold uppercase shadow-lg flex items-center gap-2 transition-colors"
            >
              <FileSpreadsheet class="w-4 h-4" />
              Excel
            </button>

            <button
              @click="handleDownloadPDF"
              class="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded text-xs font-bold uppercase shadow-lg flex items-center gap-2 transition-colors"
            >
              <FileText class="w-4 h-4" />
              PDF
            </button>
          </div>
        </div>
      </header>
      <div class="max-w-7xl mx-auto px-4 mt-6 relative z-20 no-print">
        <NavBar @filter="fetchReport" />
      </div>

      <div v-if="loading" class="text-center py-20">
        <p class="text-zinc-500 animate-pulse font-bold">Cargando datos...</p>
      </div>

      <div
        v-else-if="reportData && reportData.news && reportData.news.length > 0"
        class="max-w-7xl mx-auto px-4 mt-8 md:px-8 space-y-16 mb-5"
      >
        <KpiCards
          :impacts="reportData.impacts"
          :reach="formattedReach"
          :ave="formattedAve"
          :tier1-percentage="tier1Percentage"
        />

        <section v-if="topNotes.length > 0" class="">
          <div class="mb-6 print:mb-10">
            <h2
              class="text-2xl font-bold border-l-4 border-red-600 pl-4 uppercase tracking-tighter text-white bg-black inline-block px-4 py-1"
            >
              Notas Destacadas
            </h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              v-for="note in topNotes"
              :key="note.id"
              class="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-600"
            >
              <p class="font-black text-[10px] text-zinc-400 mb-1 tracking-widest uppercase">
                {{ note.media_name }}
              </p>
              <h4 class="text-sm font-bold text-zinc-900 mb-4 leading-tight line-clamp-2 h-10">
                "{{ note.title }}"
              </h4>
              <div class="flex justify-between items-end border-t pt-3">
                <div>
                  <p class="text-2xl font-black text-red-600">{{ formatNumber(note.reach) }}</p>
                  <p class="text-[9px] uppercase font-bold text-zinc-400">Alcance</p>
                </div>
                <span class="text-[10px] font-bold bg-zinc-100 px-2 py-1 rounded text-zinc-600">{{
                  note.tier
                }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-zinc-200">
            <h3 class="text-lg font-bold mb-6 text-zinc-900 border-l-4 border-black pl-3">
              Evolución Histórica
            </h3>
            <TrendChart :labels="trendData.labels" :values="trendData.values" />
          </div>
          <div class="bg-white p-8 rounded-2xl shadow-sm border border-zinc-200">
            <h3 class="text-lg font-bold mb-6 text-zinc-900 border-l-4 border-red-600 pl-3">
              Salud de Marca
            </h3>
            <SentimentChart
              :positive="reportData.sentiment.positive"
              :neutral="reportData.sentiment.neutral"
              :negative="reportData.sentiment.negative"
            />
          </div>
        </section>

        <DistributionCharts :news="reportData.news" />

        <section class="no-break">
          <div class="text-center mb-10">
            <h2
              class="text-2xl font-black uppercase tracking-tighter text-white bg-black inline-block px-6 py-2 transform -skew-x-12"
            >
              <span class="transform skew-x-12 block">Detalle de Impactos</span>
            </h2>
          </div>
          <NewsTimeline :items="reportData.news" />
        </section>

        <section
          class="bg-black rounded-[2.5rem] p-8 md:p-16 relative border-t-8 border-red-600 overflow-hidden shadow-2xl no-break"
        >
          <div
            class="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-red-900/20 to-transparent pointer-events-none"
          ></div>

          <div class="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
            <div>
              <h2 class="text-3xl font-black mb-8 uppercase tracking-tighter text-white">
                FODA <span class="text-red-600">Mediático</span>
              </h2>
              <FodaSection
                :strengths="reportData.foda.strengths"
                :opportunities="reportData.foda.opportunities"
                :weaknesses="reportData.foda.weaknesses"
                :threats="reportData.foda.threats"
              />
            </div>

            <ContextSection
              :milestones="reportData.context.milestones"
              :roadmap="reportData.context.roadmap"
            />
          </div>
        </section>
      </div>

      <div
        v-else
        class="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-zinc-200 rounded-[2.5rem] bg-zinc-50/50 mx-4 md:mx-auto max-w-5xl"
      >
        <div class="bg-white p-6 rounded-full shadow-sm mb-6">
          <FileSearch class="w-16 h-16 text-zinc-300" stroke-width="1.5" />
        </div>

        <h3 class="text-2xl font-black text-zinc-900 mb-3 tracking-tight">
          No hay datos registrados
        </h3>

        <p class="text-zinc-500 max-w-md mb-8 text-sm leading-relaxed">
          No encontramos noticias para
          <span class="font-bold text-zinc-800"
            >"{{ reportData?.clientName || 'esta empresa' }}"</span
          >
          en el periodo seleccionado.
        </p>

        <router-link
          to="/admin"
          class="group bg-zinc-900 hover:bg-black text-white font-bold py-4 px-8 rounded-xl shadow-xl shadow-zinc-200 transition-all active:translate-y-0 flex items-center gap-3"
        >
          <div class="bg-white/20 p-1 rounded-lg group-hover:bg-white/30 transition-colors">
            <Plus class="w-5 h-5" />
          </div>
          <span>Ir a Gestión y Cargar Noticias</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style>
/* Forzamos que al generar el PDF, el header no intente expandirse */
#dashboard-content header {
  box-shadow: none !important; /* Elimina cualquier sombra residual */
  background-size: cover !important; /* Evita repeticiones extrañas del degradado */
  page-break-after: avoid !important; /* Intenta pegar el contenido siguiente */
}
</style>

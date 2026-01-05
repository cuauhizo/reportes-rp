<script setup>
import { onMounted } from 'vue'
import { useReportStore } from '../stores/reportStore' // <--- Importamos la store
import { storeToRefs } from 'pinia' // Para mantener reactividad al desestructurar
import { useExport } from '../composables/useExport'

// Componentes
import KpiCards from '../components/KpiCards.vue'
import SentimentChart from '../components/SentimentChart.vue'
import TrendChart from '../components/TrendChart.vue'
import NewsTimeline from '../components/NewsTimeline.vue'
import FodaSection from '../components/FodaSection.vue'
import ContextSection from '../components/ContextSection.vue'
import NavBar from '../components/NavBar.vue'
import DistributionCharts from '../components/DistributionCharts.vue'

// Usar la Store
const store = useReportStore()

// Extraemos las propiedades reactivas (State y Getters)
// storeToRefs es importante para no perder la reactividad
const { reportData, loading, formattedReach, formattedAve, tier1Percentage, trendData, topNotes } =
  storeToRefs(store)

// La acción (método) se extrae directamente
const { fetchReport } = store

const { exportToExcel, exportToPDF } = useExport()

// Funciones para los botones
const handleDownloadExcel = () => {
  if (reportData.value && reportData.value.news) {
    exportToExcel(reportData.value.news, `Reporte_${reportData.value.period}.xlsx`)
  }
}

const handleDownloadPDF = () => {
  exportToPDF('dashboard-content', `Reporte_Ejecutivo.pdf`)
}

// Helper simple para la vista (Top Notas)
const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num
}

// Cargar datos al iniciar
onMounted(() => {
  // Solo cargamos si no hay datos previos (opcional, para caché)
  if (!reportData.value) {
    fetchReport()
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#f4f4f5] pb-20 font-sans text-zinc-800">
    <div id="dashboard-content">
      <header
        class="bg-gradient-to-r from-black via-zinc-900 to-red-900 text-white py-12 px-6 shadow-2xl mb-8 relative overflow-hidden"
      >
        <div
          class="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full -mr-48 -mt-48 blur-3xl pointer-events-none"
        ></div>
        <div
          class="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-end"
        >
          <div>
            <p class="text-red-500 font-bold tracking-widest uppercase text-xs mb-2">
              Análisis Estratégico
            </p>
            <h1 class="text-4xl md:text-5xl font-extrabold mb-2">
              {{ reportData ? reportData.clientName : 'Cargando...' }}
            </h1>
            <p v-if="reportData" class="text-zinc-300 text-lg opacity-90">
              {{ reportData.period }}
            </p>
          </div>

          <div class="mt-6 md:mt-0 flex gap-3 no-print">
            <router-link
              to="/admin"
              class="bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded text-xs font-bold uppercase backdrop-blur-sm border border-white/10"
            >
              ⚙️ Gestión
            </router-link>

            <button
              @click="handleDownloadExcel"
              class="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded text-xs font-bold uppercase shadow-lg flex items-center gap-2"
            >
              📥 Excel
            </button>

            <button
              @click="handleDownloadPDF"
              class="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded text-xs font-bold uppercase shadow-lg flex items-center gap-2"
            >
              📄 PDF
            </button>
          </div>
        </div>
      </header>
      <div class="max-w-7xl mx-auto px-4 -mt-6 mb-8 relative z-20 no-print">
        <NavBar @filter="fetchReport" />
      </div>

      <div v-if="loading" class="text-center py-20">
        <p class="text-zinc-500 animate-pulse font-bold">Cargando datos...</p>
      </div>

      <div v-else-if="reportData" class="max-w-7xl mx-auto px-4 md:px-8 space-y-16">
        <KpiCards
          :impacts="reportData.impacts"
          :reach="formattedReach"
          :ave="formattedAve"
          :tier1-percentage="tier1Percentage"
        />

        <section v-if="topNotes.length > 0">
          <div class="mb-6">
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
              class="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-600 hover:-translate-y-1 transition-transform"
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

        <section>
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
          class="bg-black rounded-[2.5rem] p-8 md:p-16 relative border-t-8 border-red-600 overflow-hidden shadow-2xl"
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

      <div v-else class="text-center py-20 text-red-600 font-bold">No se encontraron datos</div>
    </div>
  </div>
</template>

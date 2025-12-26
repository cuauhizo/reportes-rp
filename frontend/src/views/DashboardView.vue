<script setup>
import { ref, onMounted, computed } from 'vue'
import KpiCards from '../components/KpiCards.vue'
import SentimentChart from '../components/SentimentChart.vue'
import TrendChart from '../components/TrendChart.vue'
import NewsTimeline from '../components/NewsTimeline.vue'
import FodaSection from '../components/FodaSection.vue'
import ContextSection from '../components/ContextSection.vue'
import NavBar from '../components/NavBar.vue'

const reportData = ref(null)
const loading = ref(true)

// Modificamos para recibir un objeto de filtros (con valores por defecto)
const fetchReportData = async (
  filters = { start: '2025-01-01', end: '2025-12-31', label: 'Anual' },
) => {
  try {
    loading.value = true

    // Construimos la URL con query params
    const params = new URLSearchParams({
      start: filters.start,
      end: filters.end,
      type: filters.label,
    })

    const response = await fetch(`http://localhost:3000/api/report?${params}`)

    if (!response.ok) throw new Error('Error de conexión')
    const data = await response.json()

    reportData.value = {
      period:
        filters.label === 'Anual'
          ? 'Reporte Anual 2025'
          : `Periodo: ${filters.start} a ${filters.end}`,
      impacts: data.kpis.total_impacts,
      reach_raw: data.kpis.total_reach,
      ave_raw: data.kpis.total_ave,
      tier1_count: data.kpis.tier1_count,
      total_notes: data.kpis.total_impacts,
      sentiment: {
        positive: data.sentimentCounts.positive,
        neutral: data.sentimentCounts.neutral,
        negative: data.sentimentCounts.negative,
      },
      news: data.news,
      // Mapeamos los datos cualitativos
      foda: {
        strengths: data.meta.swot_strengths || 'Sin definir',
        opportunities: data.meta.swot_opportunities || 'Sin definir',
        weaknesses: data.meta.swot_weaknesses || 'Sin definir',
        threats: data.meta.swot_threats || 'Sin definir',
      },
      context: {
        milestones: data.meta.milestones || 'Sin hitos registrados.',
        roadmap: data.meta.roadmap || '',
      },
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const formattedReach = computed(() =>
  !reportData.value ? '0' : (reportData.value.reach_raw / 1000000).toFixed(1) + 'M',
)
const formattedAve = computed(() =>
  !reportData.value ? '$0' : '$' + (reportData.value.ave_raw / 1000000).toFixed(1) + 'M',
)
const tier1Percentage = computed(() =>
  !reportData.value || reportData.value.total_notes === 0
    ? 0
    : Math.round((reportData.value.tier1_count / reportData.value.total_notes) * 100),
)
const trendData = computed(() => {
  if (!reportData.value || !reportData.value.news) return { labels: [], values: [] }
  const grouped = {}
  reportData.value.news.forEach((item) => {
    const monthKey = item.publication_date.substring(0, 7)
    grouped[monthKey] = (grouped[monthKey] || 0) + 1
  })
  const sortedKeys = Object.keys(grouped).sort()
  return { labels: sortedKeys, values: sortedKeys.map((key) => grouped[key]) }
})

onMounted(() => fetchReportData())
</script>

<template>
  <div class="min-h-screen bg-[#f4f4f5] pb-20 font-sans text-zinc-800">
    <!-- <header
      class="bg-gradient-to-r from-black via-zinc-900 to-red-900 text-white py-12 px-6 shadow-2xl mb-8 relative overflow-hidden"
    >
      <div
        class="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full -mr-48 -mt-48 blur-3xl pointer-events-none"
      ></div>
      <div class="max-w-7xl mx-auto relative z-10">
        <p class="text-red-500 font-bold tracking-widest uppercase text-xs mb-2">
          Análisis Estratégico
        </p>
        <h1 class="text-4xl md:text-5xl font-extrabold mb-2">Harbour Energy</h1>
        <p v-if="reportData" class="text-zinc-300 text-lg opacity-90">{{ reportData.period }}</p>
      </div>
    </header> -->

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
          <h1 class="text-4xl md:text-5xl font-extrabold mb-2">Harbour Energy</h1>
          <p v-if="reportData" class="text-zinc-300 text-lg opacity-90">{{ reportData.period }}</p>
        </div>

        <div class="mt-6 md:mt-0">
          <router-link
            to="/admin"
            class="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-lg text-xs uppercase tracking-widest transition-all backdrop-blur-sm border border-white/10 flex items-center gap-2"
          >
            ⚙️ Gestionar Reporte
          </router-link>
        </div>
      </div>
    </header>
    <div class="max-w-7xl mx-auto px-4 -mt-6 mb-8 relative z-20">
      <NavBar @filter="fetchReportData" />
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

      <section class="bg-black rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden shadow-2xl">
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
</template>

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useReportStore = defineStore('report', () => {
  // --- 1. ESTADO (State) ---
  const reportData = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const clients = ref([])
  const currentClientId = ref(1) // Por defecto Harbour Energy

  // --- 2. ACCIONES (Actions) ---
  const fetchClients = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
      const res = await fetch(`${apiUrl}/clients`)
      clients.value = await res.json()
    } catch (e) {
      console.error(e)
    }
  }

  const fetchReport = async (
    filters = { start: '2025-01-01', end: '2025-12-31', label: 'Reporte Anual 2025' },
  ) => {
    loading.value = true
    error.value = null

    try {
      // Usamos variables de entorno si existen, o fallback a localhost
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

      const params = new URLSearchParams({
        clientId: currentClientId.value,
        start: filters.start,
        end: filters.end,
        label: filters.label,
      })

      const response = await fetch(`${apiUrl}/report?${params}`)

      if (response.status === 404) {
        throw new Error('Este cliente no tiene datos reportados.')
      }
      if (!response.ok) throw new Error('Error al conectar con el servidor')

      const data = await response.json()

      // CORRECCIÓN 1: Usar el label del filtro si existe
      const tituloReporte = filters.label || `Periodo: ${filters.start} a ${filters.end}`

      // Mapeo de datos (Igual que tenías en la vista)
      reportData.value = {
        clientId: currentClientId.value,
        clientName: data.meta.client_name || 'Empresa',
        logo: data.meta.logo_url,
        period: tituloReporte,
        // CORRECCIÓN 2: Priorizar las fechas del filtro seleccionado.
        // Si usamos data.meta.start_date, siempre mostrará "Enero a Diciembre" aunque filtres "Febrero".
        startDate: filters.start || data.meta.start_date,
        endDate: filters.end || data.meta.end_date,
        impacts: data.kpis.total_impacts,
        reach_raw: data.kpis.total_reach,
        ave_raw: data.kpis.total_ave,
        tier1_count: data.kpis.tier1_count,
        total_notes: data.kpis.total_impacts,
        // CORRECCIÓN 3: Guardamos la data de tendencia que YA calculó el Backend
        apiTrendData: data.trendData,
        sentiment: {
          positive: data.sentimentCounts.positive,
          neutral: data.sentimentCounts.neutral,
          negative: data.sentimentCounts.negative,
        },
        news: data.news,
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
    } catch (e) {
      console.error(e)
      error.value = e.message
      reportData.value = null
    } finally {
      loading.value = false
    }
  }

  // 3. Acción para cambiar cliente
  const setClient = (id) => {
    currentClientId.value = id
    fetchReport() // Recargar datos automáticamente
  }

  // --- 3. GETTERS (Computed) ---
  // Movemos aquí la lógica de formateo para limpiar la vista
  const formattedReach = computed(() => {
    if (!reportData.value) return '0'
    return (reportData.value.reach_raw / 1000000).toFixed(1) + 'M'
  })

  const formattedAve = computed(() => {
    if (!reportData.value) return '$0'
    return '$' + (reportData.value.ave_raw / 1000000).toFixed(1) + 'M'
  })

  const tier1Percentage = computed(() => {
    if (!reportData.value || reportData.value.total_notes === 0) return 0
    return Math.round((reportData.value.tier1_count / reportData.value.total_notes) * 100)
  })

  // CORRECCIÓN 4: Eliminamos la lógica de agrupación manual.
  // Usamos directamente lo que el Backend calculó (Día vs Mes)
  const trendData = computed(() => {
    if (!reportData.value || !reportData.value.apiTrendData) return { labels: [], values: [] }
    return reportData.value.apiTrendData
  })

  const topNotes = computed(() => {
    if (!reportData.value || !reportData.value.news) return []
    return [...reportData.value.news].sort((a, b) => b.reach - a.reach).slice(0, 3)
  })

  return {
    // State
    reportData,
    loading,
    error,
    clients,
    currentClientId,
    // Actions
    fetchReport,
    fetchClients,
    setClient,
    // Getters
    formattedReach,
    formattedAve,
    tier1Percentage,
    trendData,
    topNotes,
  }
})

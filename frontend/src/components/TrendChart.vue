<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps(['labels', 'values'])
const chartCanvas = ref(null)
let myChart = null

// MESES EN ESPAÑOL
const MONTH_NAMES = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
]
const FULL_MONTHS = [
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

// LÓGICA DE FORMATEO
const formatLabel = (originalLabel) => {
  // Caso 1: Viene vacio o nulo
  if (!originalLabel) return ''

  // Dividimos la fecha por guiones (YYYY-MM-DD o YYYY-MM)
  const parts = originalLabel.split('-')

  // Caso 2: Es DIARIO (Tiene 3 partes: Año, Mes, Día) -> Ej: 2025-02-01
  if (parts.length === 3) {
    const day = parts[2]
    const monthIndex = parseInt(parts[1]) - 1
    return `${day} ${MONTH_NAMES[monthIndex]}` // Retorna: "01 Feb"
  }

  // Caso 3: Es MENSUAL (Tiene 2 partes: Año, Mes) -> Ej: 2025-02
  if (parts.length === 2) {
    const year = parts[0]
    const monthIndex = parseInt(parts[1]) - 1
    return `${FULL_MONTHS[monthIndex]} ${year}` // Retorna: "Febrero 2025"
  }

  // Caso 4: No es fecha estándar, devolvemos tal cual
  return originalLabel
}

const renderChart = () => {
  if (myChart) myChart.destroy()

  myChart = new Chart(chartCanvas.value, {
    type: 'line',
    data: {
      labels: props.labels,
      datasets: [
        {
          label: 'Impactos',
          data: props.values,
          borderColor: '#dc2626', // Rojo Harbour
          backgroundColor: (context) => {
            // Degradado bonito rojo
            const ctx = context.chart.ctx
            const gradient = ctx.createLinearGradient(0, 0, 0, 300)
            gradient.addColorStop(0, 'rgba(220, 38, 38, 0.5)')
            gradient.addColorStop(1, 'rgba(220, 38, 38, 0.0)')
            return gradient
          },
          fill: true,
          tension: 0.4, // Curva suave
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (tooltipItems) => {
              // Aplicar el mismo formato al Tooltip (el cuadrito flotante)
              return formatLabel(tooltipItems[0].label)
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false }, // Ocultar grilla vertical para limpieza
          ticks: {
            maxRotation: 0, // Evitar que se inclinen demasiado
            autoSkip: true, // Saltar fechas si hay muchas
            maxTicksLimit: 10, // Máximo 10 etiquetas visibles
            // --- AQUÍ OCURRE LA MAGIA ---
            callback: function (value, index, values) {
              // Obtenemos la etiqueta original (ej: "2025-02-01")
              const label = this.getLabelForValue(value)
              // La formateamos
              return formatLabel(label)
            },
          },
        },
        y: {
          beginAtZero: true,
          border: { dash: [5, 5] }, // Líneas punteadas horizontales
          grid: { color: '#e5e7eb' },
        },
      },
    },
  })
}

onMounted(() => {
  if (props.labels && props.values) renderChart()
})

watch(() => props.values, renderChart, { deep: true })
</script>

<template>
  <div class="h-[300px] w-full">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

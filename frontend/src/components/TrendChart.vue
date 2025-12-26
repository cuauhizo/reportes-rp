<script setup>
import { ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps(['labels', 'values'])
const chartCanvas = ref(null)
let myChart = null

const renderChart = () => {
  if (myChart) myChart.destroy()

  myChart = new Chart(chartCanvas.value, {
    type: 'line',
    data: {
      labels: props.labels, // Ej: ['Enero', 'Febrero', 'Marzo']
      datasets: [
        {
          label: 'Impactos por Mes',
          data: props.values, // Ej: [10, 5, 8]
          borderColor: '#dc2626', // Rojo
          backgroundColor: 'rgba(220, 38, 38, 0.1)',
          fill: true,
          tension: 0.4, // Curva suave
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
    },
  })
}

onMounted(() => {
  if (props.labels && props.values) renderChart()
})

// Redibujar si cambian los datos
watch(() => props.values, renderChart, { deep: true })
</script>

<template>
  <div class="h-[300px] w-full">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

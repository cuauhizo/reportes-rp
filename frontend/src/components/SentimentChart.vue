<script setup>
import { ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'

// Props recibidos del padre
const props = defineProps(['positive', 'neutral', 'negative'])
const chartCanvas = ref(null)
let myChart = null

const renderChart = () => {
  if (myChart) myChart.destroy() // Destruir anterior si existe

  myChart = new Chart(chartCanvas.value, {
    type: 'doughnut',
    data: {
      labels: ['Positivo', 'Informativo', 'Negativo'],
      datasets: [
        {
          data: [props.positive, props.neutral, props.negative],
          backgroundColor: ['#dc2626', '#71717a', '#000000'],
        },
      ],
    },
  })
}

onMounted(() => renderChart())

// Si los datos cambian, redibujar
watch(() => props.positive, renderChart)
</script>

<template>
  <div class="h-[300px]">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

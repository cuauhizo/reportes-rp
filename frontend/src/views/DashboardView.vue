<script setup>
import { ref, onMounted, computed } from 'vue';
import KpiCards from '../components/KpiCards.vue'; // Importamos el componente

// 1. Estado reactivo para guardar los datos del reporte
const reportData = ref(null);
const loading = ref(true);

// 2. Simulación de llamada a tu API (Backend Express)
const fetchReportData = async () => {
  try {
    // En el futuro esto será: await fetch('http://localhost:3000/api/report/annual');
    // Por ahora simulamos una respuesta de la base de datos:
    const responseFake = {
      impacts: 625,
      reach_raw: 9200000,   // El número crudo como viene de SQL
      ave_raw: 2900000,     // El valor crudo
      tier1_count: 281,     // Cantidad de notas Tier 1
      total_notes: 625
    };

    // Simulamos un pequeño retraso de red
    await new Promise(resolve => setTimeout(resolve, 800));
    
    reportData.value = responseFake;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 3. Computed Properties (Para formatear los datos antes de enviarlos al componente)
// Es mejor hacer la lógica de presentación aquí que dentro del HTML
const formattedReach = computed(() => {
  if (!reportData.value) return '0';
  // Convierte 9200000 en "9.2M"
  return (reportData.value.reach_raw / 1000000).toFixed(1) + 'M';
});

const formattedAve = computed(() => {
  if (!reportData.value) return '$0';
  // Convierte 2900000 en "$2.9M"
  return '$' + (reportData.value.ave_raw / 1000000).toFixed(1) + 'M';
});

const tier1Percentage = computed(() => {
  if (!reportData.value || reportData.value.total_notes === 0) return 0;
  // Calcula el porcentaje: (281 / 625) * 100 = 44.96 -> 45
  return Math.round((reportData.value.tier1_count / reportData.value.total_notes) * 100);
});

// 4. Ejecutar al montar la página
onMounted(() => {
  fetchReportData();
});
</script>

<template>
  <div class="p-8 bg-gray-100 min-h-screen">
    
    <div v-if="loading" class="text-center py-10">
      <p class="text-zinc-500 animate-pulse">Cargando métricas...</p>
    </div>

    <div v-else>
      <h2 class="text-2xl font-bold mb-6">Dashboard 2026</h2>
      
      <KpiCards 
        :impacts="reportData.impacts"
        :reach="formattedReach"
        :ave="formattedAve"
        :tier1-percentage="tier1Percentage"
      />
      
    </div>
  </div>
</template>
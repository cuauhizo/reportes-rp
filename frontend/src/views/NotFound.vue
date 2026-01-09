<script setup>
import { FileQuestion, ArrowLeft } from 'lucide-vue-next'; // Usamos los mismos iconos
</script>

<template>
  <div class="min-h-screen bg-[#f4f4f5] flex items-center justify-center p-4 font-sans text-zinc-800">
    
    <div class="text-center max-w-lg mx-auto relative">
      
      <h1 class="text-[12rem] font-black text-zinc-200/60 leading-none select-none absolute left-1/2 -translate-x-1/2 -top-32 blur-sm z-0">
        404
      </h1>

      <div class="relative z-10">
        
        <div class="bg-white p-6 rounded-full shadow-xl w-24 h-24 mx-auto flex items-center justify-center border-4 border-zinc-100 mb-6 animate-bounce-slow">
            <FileQuestion class="w-10 h-10 text-red-600" stroke-width="2" />
        </div>

        <h2 class="text-3xl md:text-4xl font-black text-zinc-900 mb-4 tracking-tight">
          ¡Ups! Página no encontrada
        </h2>
        
        <p class="text-zinc-500 text-lg mb-8 leading-relaxed">
          Lo sentimos, parece que la página que buscas no existe, 
          fue movida o nunca debió estar ahí.
        </p>

        <router-link
          to="/"
          class="inline-flex items-center gap-2 bg-zinc-900 hover:bg-black text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-zinc-300 transition-all hover:-translate-y-1 active:translate-y-0"
        >
          <ArrowLeft class="w-5 h-5" />
          Volver al Inicio
        </router-link>

      </div>
    </div>

    <div class="fixed bottom-0 left-0 w-full h-2 bg-gradient-to-r from-black via-red-900 to-black"></div>
  </div>
</template>

<style scoped>
/* Animación suave para el icono */
.animate-bounce-slow {
  animation: bounce 3s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(-5%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}
</style>
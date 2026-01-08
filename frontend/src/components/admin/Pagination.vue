<script setup>
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  currentPage: Number,
  totalPages: Number,
})

const emit = defineEmits(['changePage'])

// Lógica para no mostrar páginas negativas o mayores al total
const change = (newPage) => {
  if (newPage >= 1 && newPage <= props.totalPages) {
    emit('changePage', newPage)
  }
}
</script>

<template>
  <div class="flex items-center justify-between px-4 py-3 border-t border-zinc-200 bg-zinc-50">
    <div class="flex flex-1 justify-between sm:hidden">
      <button
        @click="change(currentPage - 1)"
        :disabled="currentPage === 1"
        class="relative inline-flex items-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
      >
        Anterior
      </button>
      <button
        @click="change(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="relative ml-3 inline-flex items-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
      >
        Siguiente
      </button>
    </div>

    <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-zinc-700">
          Página <span class="font-bold">{{ currentPage }}</span> de
          <span class="font-bold">{{ totalPages }}</span>
        </p>
      </div>

      <div>
        <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
          <button
            @click="change(currentPage - 1)"
            :disabled="currentPage === 1"
            class="relative inline-flex items-center rounded-l-md px-2 py-2 text-zinc-400 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 transition-colors"
          >
            <span class="sr-only">Anterior</span>
            <ChevronLeft class="h-5 w-5" aria-hidden="true" />
          </button>

          <button
            class="relative z-10 inline-flex items-center bg-zinc-900 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600"
          >
            {{ currentPage }}
          </button>

          <button
            @click="change(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="relative inline-flex items-center rounded-r-md px-2 py-2 text-zinc-400 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 transition-colors"
          >
            <span class="sr-only">Siguiente</span>
            <ChevronRight class="h-5 w-5" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

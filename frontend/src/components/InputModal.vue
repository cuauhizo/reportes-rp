<script setup>
import { ref, watch, nextTick } from 'vue'
import { Edit3, X } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean,
  title: { type: String, default: 'Editar' },
  initialValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  confirmText: { type: String, default: 'Guardar' },
  cancelText: { type: String, default: 'Cancelar' },
})

const emit = defineEmits(['close', 'confirm'])

const inputValue = ref('')
const inputRef = ref(null)

// Cuando el modal se abre, cargamos el valor inicial y ponemos el foco
watch(
  () => props.show,
  async (newVal) => {
    if (newVal) {
      inputValue.value = props.initialValue
      // Esperamos a que se renderice el DOM para enfocar el input
      await nextTick()
      inputRef.value?.focus()
    }
  },
)

const handleConfirm = () => {
  if (!inputValue.value.trim()) return
  emit('confirm', inputValue.value)
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="show" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="emit('close')"></div>

        <div
          class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all"
        >
          <button
            @click="emit('close')"
            class="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <X class="w-5 h-5" />
          </button>

          <div class="p-8">
            <div
              class="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-6"
            >
              <Edit3 class="w-8 h-8 text-blue-600" />
            </div>

            <h3 class="text-xl font-black text-center text-zinc-900 mb-6">{{ title }}</h3>

            <div class="mb-8">
              <input
                ref="inputRef"
                v-model="inputValue"
                type="text"
                :placeholder="placeholder"
                class="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-center"
                @keyup.enter="handleConfirm"
              />
            </div>

            <div class="flex gap-3 justify-center">
              <button
                @click="emit('close')"
                class="px-6 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 font-bold text-sm hover:bg-zinc-50 transition-colors"
              >
                {{ cancelText }}
              </button>

              <button
                @click="handleConfirm"
                class="px-6 py-2.5 rounded-xl bg-zinc-900 text-white font-bold text-sm hover:bg-black shadow-lg transition-transform active:scale-95"
              >
                {{ confirmText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

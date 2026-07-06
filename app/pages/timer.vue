<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const MAX_DURATION = 3600
const BEEP_SECONDS = [10, 5, 4, 3, 2, 1]

type RunState = 'idle' | 'running' | 'paused' | 'finished'

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

const configuredDuration = ref(300)
const remaining = ref(300)
const runState = ref<RunState>('idle')
const roundNumber = ref(1)
const isMenuOpen = ref(false)
const silentMode = ref(false)

let targetEndTime = 0
let intervalId: ReturnType<typeof setInterval> | null = null

const { init: initAudio, playTick, playAlarm } = useBeep()

const isRunning = computed(() => runState.value === 'running')
const showRestart = computed(() => runState.value === 'paused' || runState.value === 'finished')

const configuredMinutes = computed({
  get: () => Math.floor(configuredDuration.value / 60),
  set: (value: number) => {
    const seconds = clamp(Math.round(value) * 60, 60, MAX_DURATION)
    configuredDuration.value = seconds
    if (runState.value === 'idle') {
      remaining.value = seconds
    }
  }
})

const display = computed(() => {
  const minutes = Math.floor(remaining.value / 60).toString().padStart(2, '0')
  const seconds = Math.floor(remaining.value % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
})

function clearTick() {
  if (intervalId !== null) {
    clearInterval(intervalId)
    intervalId = null
  }
}

function tick() {
  const secondsLeft = Math.max(0, Math.round((targetEndTime - Date.now()) / 1000))
  if (secondsLeft === remaining.value) return

  const previous = remaining.value
  remaining.value = secondsLeft

  if (remaining.value < previous) {
    if (!silentMode.value) {
      if (remaining.value === 10) {
        playTick(3)
      } else if (BEEP_SECONDS.includes(remaining.value)) {
        playTick()
      }
    }
    if (remaining.value === 0) {
      if (!silentMode.value) playAlarm()
      clearTick()
      runState.value = 'finished'
    }
  }
}

function play() {
  if (remaining.value <= 0) return
  initAudio()
  targetEndTime = Date.now() + remaining.value * 1000
  runState.value = 'running'
  clearTick()
  intervalId = setInterval(tick, 250)
}

function pause() {
  clearTick()
  runState.value = 'paused'
}

function togglePlay() {
  if (isRunning.value) {
    pause()
  } else {
    play()
  }
}

function adjust(deltaSeconds: number) {
  remaining.value = clamp(remaining.value + deltaSeconds, 0, MAX_DURATION)

  if (runState.value === 'running') {
    if (remaining.value === 0) {
      clearTick()
      runState.value = 'finished'
    } else {
      targetEndTime = Date.now() + remaining.value * 1000
    }
  } else if (runState.value === 'finished' && remaining.value > 0) {
    runState.value = 'paused'
  }
}

function restart() {
  clearTick()
  remaining.value = configuredDuration.value
  runState.value = 'idle'
  roundNumber.value += 1
}

function resetRoundCounter() {
  if (confirm('Reiniciar a contagem de rounds?')) {
    roundNumber.value = 1
  }
}

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}

onUnmounted(() => {
  clearTick()
})
</script>

<template>
  <div class="flex min-h-dvh min-h-screen flex-col items-center justify-between px-6 py-10 text-white">
    <div class="flex w-full max-w-sm items-center justify-between gap-2">
      <button
        type="button"
        class="text-2xl text-left font-semibold active:scale-95 py-3"
        @click="resetRoundCounter"
      >
        Round {{ roundNumber }} - ({{ configuredMinutes }}min)
      </button>
      <button
        type="button"
        class="active:scale-95 p-4 -mr-4"
        aria-label="Menu"
        @click="toggleMenu"
      >
        <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </button>
    </div>

    <div class="flex w-full max-w-sm flex-col items-center gap-6">
      <div class="grid w-full grid-cols-2 gap-4">
        <button
          type="button"
          class="flex flex-col items-center rounded-xl bg-purple-800 py-4 active:scale-95"
          @click="adjust(60)"
        >
          <span class="text-3xl font-bold leading-none">+</span>
        </button>
        <button
          type="button"
          class="flex flex-col items-center rounded-xl bg-purple-900 py-4 active:scale-95"
          @click="adjust(10)"
        >
          <span class="text-3xl font-bold leading-none">+</span>
        </button>
      </div>

      <div
        class="font-bold tabular-nums text-8xl sm:text-9xl"
        :class="remaining === 0 ? 'text-purple-500' : remaining <= 10 ? 'text-purple-300' : 'text-white'"
      >
        {{ display }}
      </div>

      <div class="grid w-full grid-cols-2 gap-4">
        <button
          type="button"
          class="flex flex-col items-center rounded-xl bg-purple-800 py-4 active:scale-95"
          @click="adjust(-60)"
        >
          <span class="text-3xl font-bold leading-none">-</span>
        </button>
        <button
          type="button"
          class="flex flex-col items-center rounded-xl bg-purple-900 py-4 active:scale-95"
          @click="adjust(-10)"
        >
          <span class="text-3xl font-bold leading-none">-</span>
        </button>
      </div>
    </div>

    <div class="flex w-full max-w-sm flex-col gap-3">
      <button
        type="button"
        class="w-full rounded-xl px-8 py-5 text-2xl font-bold active:scale-95 disabled:opacity-40"
        :class="isRunning ? 'bg-purple-700' : 'bg-purple-500'"
        :disabled="!isRunning && remaining <= 0"
        @click="togglePlay"
      >
        {{ isRunning ? 'Stop' : 'Play' }}
      </button>

      <button
        v-if="showRestart"
        type="button"
        class="w-full rounded-xl bg-purple-700 px-6 py-3 text-lg font-semibold active:scale-95"
        @click="restart"
      >
        Próximo round
      </button>
    </div>

    <div
      v-if="isMenuOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6"
      @click="closeMenu"
    >
      <div
        class="w-full max-w-sm rounded-2xl bg-purple-900 p-6 text-white"
        @click.stop
      >
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold">
            Configurações
          </h2>
          <button
            type="button"
            class="p-2 active:scale-95 -mr-2"
            aria-label="Fechar"
            @click="closeMenu"
          >
            <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>

        <div class="mt-6 flex items-center justify-between gap-4">
          <label for="initial-minutes" class="text-lg">Tempo inicial (min)</label>
          <input
            id="initial-minutes"
            v-model.number="configuredMinutes"
            type="number"
            min="1"
            max="60"
            step="1"
            class="w-14 rounded-lg bg-purple-800 px-3 py-2 text-center text-lg"
          >
        </div>

        <div class="mt-4 flex items-center justify-between gap-4">
          <label for="silent-mode" class="text-lg">Modo silencioso</label>
          <span class="bg-purple-800 px-4 py-2 rounded-lg flex items-center">
            <input
              id="silent-mode"
              v-model="silentMode"
              type="checkbox"
              class="h-6 w-6 accent-purple-500"
            >
          </span>
        </div>

        <div class="mt-6 flex items-center justify-between gap-4">
          <button
            type="button"
            class="w-full rounded-xl bg-purple-700 px-6 py-3 text-lg font-semibold active:scale-95"
            @click="closeMenu"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

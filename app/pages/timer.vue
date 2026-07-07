<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const { data: profile } = useAsyncData('profile', () => queryCollection('profile').first())

useHead({
  title: () => profile.value ? `Timer - ${profile.value.name}` : 'Timer'
})

const MAX_DURATION = 3600
const BEEP_SECONDS = [10, 5, 4, 3, 2, 1]

type RunState = 'idle' | 'running' | 'paused' | 'finished'
type ColorMode = 'white' | 'blue' | 'purple' | 'brown' | 'black'

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

const BELT_CLASSES: Record<ColorMode, {
  bg300: string
  bg500: string
  bg700: string
  bg800: string
  bg900: string
  bg950: string
  text300: string
  text500: string
  peerChecked500: string
  baseText: string
}> = {
  white: {
    bg300: 'bg-white-700',
    bg500: 'bg-white-500',
    bg700: 'bg-white-300',
    bg800: 'bg-white-300',
    bg900: 'bg-white-100',
    bg950: 'bg-white-50',
    text300: 'text-white-700',
    text500: 'text-white-500',
    peerChecked500: 'peer-checked:bg-white-500',
    baseText: 'text-black-900'
  },
  blue: {
    bg300: 'bg-blue-300',
    bg500: 'bg-blue-500',
    bg700: 'bg-blue-700',
    bg800: 'bg-blue-800',
    bg900: 'bg-blue-900',
    bg950: 'bg-blue-950',
    text300: 'text-blue-300',
    text500: 'text-blue-500',
    peerChecked500: 'peer-checked:bg-blue-500',
    baseText: 'text-white'
  },
  purple: {
    bg300: 'bg-purple-300',
    bg500: 'bg-purple-500',
    bg700: 'bg-purple-700',
    bg800: 'bg-purple-800',
    bg900: 'bg-purple-900',
    bg950: 'bg-purple-950',
    text300: 'text-purple-300',
    text500: 'text-purple-500',
    peerChecked500: 'peer-checked:bg-purple-500',
    baseText: 'text-white'
  },
  brown: {
    bg300: 'bg-brown-300',
    bg500: 'bg-brown-500',
    bg700: 'bg-brown-700',
    bg800: 'bg-brown-800',
    bg900: 'bg-brown-900',
    bg950: 'bg-brown-950',
    text300: 'text-brown-300',
    text500: 'text-brown-500',
    peerChecked500: 'peer-checked:bg-brown-500',
    baseText: 'text-white'
  },
  black: {
    bg300: 'bg-black-300',
    bg500: 'bg-black-500',
    bg700: 'bg-black-700',
    bg800: 'bg-black-800',
    bg900: 'bg-black-900',
    bg950: 'bg-black-950',
    text300: 'text-black-300',
    text500: 'text-black-500',
    peerChecked500: 'peer-checked:bg-black-500',
    baseText: 'text-white'
  }
}

const SETTINGS_KEY = 'bjj-timer-settings'

const COLOR_OPTIONS: { mode: ColorMode, label: string }[] = [
  { mode: 'white', label: 'Branca' },
  { mode: 'blue', label: 'Azul' },
  { mode: 'purple', label: 'Roxa' },
  { mode: 'brown', label: 'Marrom' },
  { mode: 'black', label: 'Preta' }
]

function loadSettings() {
  const defaults = { configuredDuration: 300, silentMode: false, colorMode: 'purple' as ColorMode, roundNumber: 1 }
  const saved = localStorage.getItem(SETTINGS_KEY)
  if (!saved) return defaults

  try {
    const parsed = JSON.parse(saved)
    return {
      configuredDuration: typeof parsed.configuredDuration === 'number' ? parsed.configuredDuration : defaults.configuredDuration,
      silentMode: typeof parsed.silentMode === 'boolean' ? parsed.silentMode : defaults.silentMode,
      colorMode: typeof parsed.colorMode === 'string' && parsed.colorMode in BELT_CLASSES ? parsed.colorMode as ColorMode : defaults.colorMode,
      roundNumber: typeof parsed.roundNumber === 'number' ? parsed.roundNumber : defaults.roundNumber
    }
  } catch {
    localStorage.removeItem(SETTINGS_KEY)
    return defaults
  }
}

const initialSettings = loadSettings()

const configuredDuration = ref(initialSettings.configuredDuration)
const remaining = ref(initialSettings.configuredDuration)
const runState = ref<RunState>('idle')
const roundNumber = ref(initialSettings.roundNumber)
const isMenuOpen = ref(false)
const silentMode = ref(initialSettings.silentMode)
const colorMode = ref<ColorMode>(initialSettings.colorMode)

const belt = computed(() => BELT_CLASSES[colorMode.value])

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

watch([configuredDuration, silentMode, colorMode, roundNumber], () => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({
    configuredDuration: configuredDuration.value,
    silentMode: silentMode.value,
    colorMode: colorMode.value,
    roundNumber: roundNumber.value
  }))
})

onMounted(() => {
  document.getElementById('bjj-preload-skeleton')?.remove()
})

onUnmounted(() => {
  clearTick()
})
</script>

<template>
  <div
    class="flex min-h-dvh min-h-screen flex-col items-center justify-between px-6 py-10"
    :class="[belt.bg950, belt.baseText]"
  >
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
          class="flex flex-col items-center rounded-xl py-1 active:scale-95"
          :class="belt.bg800"
          @click="adjust(60)"
        >
          <span class="text-3xl font-bold leading-none">+</span>
        </button>
        <button
          type="button"
          class="flex flex-col items-center rounded-xl py-1 active:scale-95"
          :class="belt.bg900"
          @click="adjust(10)"
        >
          <span class="text-3xl font-bold leading-none">+</span>
        </button>
      </div>

      <div
        class="font-bold tabular-nums text-8xl sm:text-9xl"
        :class="remaining === 0 ? belt.text500 : remaining <= 10 ? belt.text300 : belt.baseText"
      >
        {{ display }}
      </div>

      <div class="grid w-full grid-cols-2 gap-4">
        <button
          type="button"
          class="flex flex-col items-center rounded-xl py-1 active:scale-95"
          :class="belt.bg800"
          @click="adjust(-60)"
        >
          <span class="text-3xl font-bold leading-none">-</span>
        </button>
        <button
          type="button"
          class="flex flex-col items-center rounded-xl py-1 active:scale-95"
          :class="belt.bg900"
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
        :class="isRunning ? belt.bg700 : belt.bg500"
        :disabled="!isRunning && remaining <= 0"
        @click="togglePlay"
      >
        {{ isRunning ? 'Stop' : 'Play' }}
      </button>

      <button
        v-if="showRestart"
        type="button"
        class="w-full rounded-xl px-6 py-3 text-lg font-semibold active:scale-95"
        :class="belt.bg700"
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
        class="w-full max-w-sm rounded-2xl p-6"
        :class="[belt.bg900, belt.baseText]"
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
            class="w-12 rounded-lg px-3 py-2 text-center text-lg"
            :class="belt.bg800"
          >
        </div>

        <div class="mt-4 flex items-center justify-between gap-4">
          <span class="text-lg">Modo silencioso</span>
          <label class="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center">
            <input
              id="silent-mode"
              v-model="silentMode"
              type="checkbox"
              class="peer sr-only"
            >
            <span class="absolute inset-0 rounded-full transition-colors" :class="[belt.bg700, belt.peerChecked500]" />
            <span class="absolute left-1 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
          </label>
        </div>

        <div class="mt-4 flex items-center justify-between gap-4">
          <label for="color-mode" class="text-lg">Faixa</label>
          <select
            id="color-mode"
            v-model="colorMode"
            class="rounded-lg px-3 py-2 text-lg"
            :class="belt.bg800"
          >
            <option v-for="option in COLOR_OPTIONS" :key="option.mode" :value="option.mode">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="mt-6 flex items-center justify-between gap-4">
          <button
            type="button"
            class="w-full rounded-xl px-6 py-3 text-lg font-semibold active:scale-95"
            :class="belt.bg700"
            @click="closeMenu"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

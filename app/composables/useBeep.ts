let audioContext: AudioContext | null = null

function getContext() {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }
  return audioContext
}

function playTone(context: AudioContext, frequency: number, startTime: number, durationMs: number) {
  const oscillator = context.createOscillator()
  const gain = context.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.value = frequency

  const duration = durationMs / 1000
  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(0.3, startTime + 0.005)
  gain.gain.linearRampToValueAtTime(0.3, startTime + duration - 0.03)
  gain.gain.linearRampToValueAtTime(0, startTime + duration)

  oscillator.connect(gain)
  gain.connect(context.destination)

  oscillator.start(startTime)
  oscillator.stop(startTime + duration)
}

export function useBeep() {
  function init() {
    getContext()
  }

  function playTick(times = 1) {
    const context = getContext()
    const spacing = 0.18

    for (let i = 0; i < times; i++) {
      playTone(context, 880, context.currentTime + i * spacing, 120)
    }
  }

  function playAlarm() {
    const context = getContext()
    const beepDuration = 200
    const interval = 350
    const totalDurationMs = 3000
    const count = Math.floor(totalDurationMs / interval)

    for (let i = 0; i < count; i++) {
      playTone(context, 1046, context.currentTime + i * (interval / 1000), beepDuration)
    }
  }

  return { init, playTick, playAlarm }
}

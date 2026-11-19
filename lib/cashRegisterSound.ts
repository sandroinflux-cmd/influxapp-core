type AudioCtor = typeof AudioContext

let shared: AudioContext | null = null
let lastPlayedAt = 0

function audioCtor(): AudioCtor | null {
  if (typeof window === 'undefined') return null
  const scoped = window as unknown as { AudioContext?: AudioCtor; webkitAudioContext?: AudioCtor }
  return scoped.AudioContext || scoped.webkitAudioContext || null
}

function audioContext(): AudioContext | null {
  const Ctor = audioCtor()
  if (!Ctor) return null
  if (!shared || shared.state === 'closed') shared = new Ctor()
  return shared
}

function peakGain(audio: AudioContext, peak: number, when: number, attack: number, release: number) {
  const gain = audio.createGain()
  const top = Math.max(peak, 0.0002)
  gain.gain.setValueAtTime(0.0001, when)
  gain.gain.exponentialRampToValueAtTime(top, when + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, when + attack + release)
  return gain
}

function latchNoise(audio: AudioContext, destination: AudioNode, when: number) {
  const duration = 0.05
  const length = Math.max(1, Math.floor(audio.sampleRate * duration))
  const buffer = audio.createBuffer(1, length, audio.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1

  const source = audio.createBufferSource()
  source.buffer = buffer
  const filter = audio.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(4200, when)
  filter.Q.setValueAtTime(2.5, when)
  const gain = peakGain(audio, 0.34, when, 0.003, 0.045)
  source.connect(filter)
  filter.connect(gain)
  gain.connect(destination)
  source.start(when)
  source.stop(when + duration)
}

function coinClink(audio: AudioContext, destination: AudioNode, when: number, freq: number) {
  const sine = audio.createOscillator()
  const triangle = audio.createOscillator()
  sine.type = 'sine'
  triangle.type = 'triangle'
  sine.frequency.setValueAtTime(freq, when)
  triangle.frequency.setValueAtTime(freq, when)
  sine.frequency.exponentialRampToValueAtTime(freq * 0.94, when + 0.035)
  triangle.frequency.exponentialRampToValueAtTime(freq * 0.94, when + 0.035)

  const filter = audio.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(freq, when)
  filter.Q.setValueAtTime(6, when)

  const sineGain = peakGain(audio, 0.16, when, 0.002, 0.035)
  const triangleGain = peakGain(audio, 0.07, when, 0.002, 0.035)
  sine.connect(sineGain)
  triangle.connect(triangleGain)
  sineGain.connect(filter)
  triangleGain.connect(filter)
  filter.connect(destination)
  sine.start(when)
  triangle.start(when)
  sine.stop(when + 0.04)
  triangle.stop(when + 0.04)
}

function bellPartial(audio: AudioContext, destination: AudioNode, when: number, freq: number, peak: number, release: number) {
  const osc = audio.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq, when)
  const gain = peakGain(audio, peak, when, 0.004, release)
  osc.connect(gain)
  gain.connect(destination)
  osc.start(when)
  osc.stop(when + 0.004 + release + 0.02)
}

function scheduleChaChing(audio: AudioContext) {
  const compressor = audio.createDynamicsCompressor()
  compressor.threshold.setValueAtTime(-14, audio.currentTime)
  compressor.knee.setValueAtTime(8, audio.currentTime)
  compressor.ratio.setValueAtTime(3, audio.currentTime)
  compressor.attack.setValueAtTime(0.003, audio.currentTime)
  compressor.release.setValueAtTime(0.2, audio.currentTime)

  const master = audio.createGain()
  master.gain.setValueAtTime(0.55, audio.currentTime)
  compressor.connect(master)
  master.connect(audio.destination)

  const start = audio.currentTime + 0.02
  latchNoise(audio, compressor, start)
  ;[2960, 3729, 4698].forEach((freq, index) => {
    coinClink(audio, compressor, start + [0, 0.028, 0.058][index], freq)
  })

  const bell = start + 0.095
  ;[
    [2093, 0.22],
    [2637, 0.14],
    [3136, 0.1],
    [4186, 0.06],
    [5274, 0.028],
  ].forEach(([freq, peak]) => {
    bellPartial(audio, compressor, bell, freq, peak, 0.8)
  })
}

export async function unlockAudio(): Promise<void> {
  const audio = audioContext()
  if (!audio) return
  if (audio.state === 'suspended') {
    try {
      await audio.resume()
    } catch {
      return
    }
  }
  const buffer = audio.createBuffer(1, 1, audio.sampleRate)
  const source = audio.createBufferSource()
  source.buffer = buffer
  source.connect(audio.destination)
  try {
    source.start(0)
  } catch {
    // A repeated unlock in the same gesture can start an already-used buffer.
  }
}

export async function playChaChingSound(): Promise<void> {
  const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
  if (now - lastPlayedAt < 350) return
  lastPlayedAt = now

  const audio = audioContext()
  if (!audio) return
  if (audio.state === 'suspended') {
    try {
      await audio.resume()
    } catch {
      return
    }
  }
  if (audio.state !== 'running') return
  scheduleChaChing(audio)
}

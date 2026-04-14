const PWM_CYCLE = 20 // ms per intensity modulation cycle
const MAX_PHASE_MS = 1000 // browser haptic window limit

// iOS haptic timing constants (checkbox switch toggle intervals)
const TOGGLE_MIN = 16 // ms at intensity 1 (every frame)
const TOGGLE_MAX = 184 // range above min (0.5 intensity ≈ 100ms)

const defaultPatterns = {
  success: { pattern: [{ duration: 30, intensity: 0.5 }, { delay: 60, duration: 40, intensity: 1 },], },
  warning: { pattern: [{ duration: 40, intensity: 0.8 }, { delay: 100, duration: 40, intensity: 0.6 },], },
  error: { pattern: [{ duration: 40, intensity: 0.7 }, { delay: 40, duration: 40, intensity: 0.7 }, { delay: 40, duration: 40, intensity: 0.9 }, { delay: 40, duration: 50, intensity: 0.6 },], },
  light: { pattern: [{ duration: 15, intensity: 0.4 }] },
  medium: { pattern: [{ duration: 25, intensity: 0.7 }] },
  heavy: { pattern: [{ duration: 35, intensity: 1 }] },
  soft: { pattern: [{ duration: 40, intensity: 0.5 }] },
  rigid: { pattern: [{ duration: 10, intensity: 1 }] },
  selection: { pattern: [{ duration: 8, intensity: 0.3 }] },
  nudge: { pattern: [{ duration: 80, intensity: 0.8 }, { delay: 80, duration: 50, intensity: 0.3 }] },
  buzz: { pattern: [{ duration: 1000, intensity: 1 }] },
}

/** PWM: simulate lower intensity by rapid on/off cycling within a single vibration. */
function modulateVibration(duration, intensity) {
  if (intensity >= 1) return [duration]
  if (intensity <= 0) return []

  const onTime = Math.max(1, Math.round(PWM_CYCLE * intensity))
  const offTime = PWM_CYCLE - onTime
  const result = []
  let remaining = duration

  while (remaining >= PWM_CYCLE) {
    result.push(onTime, offTime)
    remaining -= PWM_CYCLE
  }
  if (remaining > 0) {
    const remOn = Math.max(1, Math.round(remaining * intensity))
    result.push(remOn)
    const remOff = remaining - remOn
    if (remOff > 0) result.push(remOff)
  }
  return result
}

/** flatten vibration[] to a single number[] for navigator.vibrate(). */
function toVibratePattern(vibrations, defaultIntensity) {
  const result = []
  for (const vib of vibrations) {
    const intensity = Math.max(0, Math.min(1, vib.intensity ?? defaultIntensity))
    const delay = vib.delay ?? 0

    if (delay > 0) {
      if (result.length > 0 && result.length % 2 === 0) {
        result[result.length - 1] += delay
      } else {
        if (result.length === 0) result.push(0)
        result.push(delay)
      }
    }

    const modulated = modulateVibration(vib.duration, intensity)
    if (modulated.length === 0) {
      if (result.length > 0 && result.length % 2 === 0) {
        result[result.length - 1] += vib.duration
      } else if (vib.duration > 0) {
        result.push(0, vib.duration)
      }
      continue
    }
    for (const seg of modulated) result.push(seg)
  }
  return result
}

/** resolve any supported input shape into a Vibration[]. */
function normalizeInput(input) {
  if (typeof input === 'number') return [{ duration: input }]

  if (typeof input === 'string') {
    const preset = defaultPatterns[input]
    if (!preset) {
      console.warn(`[haptics] Unknown preset: "${input}"`)
      return null
    }
    return preset.pattern.map((v) => ({ ...v }))
  }

  if (Array.isArray(input)) {
    if (input.length === 0) return []
    if (typeof input[0] === 'number') {
      const vibrations = []
      for (let i = 0; i < input.length; i += 2) {
        const delay = i > 0 ? input[i - 1] : 0
        vibrations.push({ ...(delay > 0 && { delay }), duration: input[i] })
      }
      return vibrations
    }
    return input.map((v) => ({ ...v }))
  }

  if (input?.pattern) return input.pattern.map((v) => ({ ...v }))
  return null
}

const vibrateSupported = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'
const isSupported = vibrateSupported || typeof document !== 'undefined'

// --- iOS Taptic Engine via hidden switch checkbox ---
// toggling an <input type="checkbox" switch=""> triggers native haptic
// feedback on iOS Safari/WKWebView, even when the element is hidden.

let hapticLabel = null
let domInitialized = false
let rafId = null
let patternResolve = null

function ensureDOM() {
  if (domInitialized) return
  if (typeof document === 'undefined') return

  const id = 'web-haptics-inline'

  hapticLabel = document.createElement('label')
  hapticLabel.setAttribute('for', id)
  hapticLabel.style.position = 'fixed'
  hapticLabel.style.display = 'none'

  const checkbox = document.createElement('input')
  checkbox.type = 'checkbox'
  checkbox.setAttribute('switch', '')
  checkbox.id = id
  checkbox.style.all = 'initial'
  checkbox.style.appearance = 'auto'
  checkbox.style.display = 'none'

  hapticLabel.appendChild(checkbox)
  document.body.appendChild(hapticLabel)
  domInitialized = true
}

function stopPattern() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  if (patternResolve) {
    patternResolve()
    patternResolve = null
  }
}

function runPattern(vibrations, defaultIntensity, firstClickFired) {
  return new Promise((resolve) => {
    patternResolve = resolve

    const phases = []
    let cumulative = 0
    for (const vib of vibrations) {
      const intensity = Math.max(0, Math.min(1, vib.intensity ?? defaultIntensity))
      const delay = vib.delay ?? 0
      if (delay > 0) {
        cumulative += delay
        phases.push({ end: cumulative, isOn: false, intensity: 0 })
      }
      cumulative += vib.duration
      phases.push({ end: cumulative, isOn: true, intensity })
    }

    const totalDuration = cumulative
    let startTime = 0
    let lastToggleTime = -1

    const loop = (time) => {
      if (startTime === 0) startTime = time
      const elapsed = time - startTime

      if (elapsed >= totalDuration) {
        rafId = null
        patternResolve = null
        resolve()
        return
      }

      let phase = phases[0]
      for (const p of phases) {
        if (elapsed < p.end) {
          phase = p
          break
        }
      }

      if (phase.isOn) {
        const toggleInterval = TOGGLE_MIN + (1 - phase.intensity) * TOGGLE_MAX
        if (lastToggleTime === -1) {
          lastToggleTime = time
          if (!firstClickFired) {
            hapticLabel?.click()
            firstClickFired = true
          }
        } else if (time - lastToggleTime >= toggleInterval) {
          hapticLabel?.click()
          lastToggleTime = time
        }
      }

      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)
  })
}

/**
 * trigger a haptic vibration.
 *
 * @param {string|number|Array|Object} input - preset name, duration ms, pattern array, or preset object
 * @param {Object} [options]
 * @param {number} [options.intensity] - default intensity 0-1 (default 0.5)
 */
function trigger(input, options) {
  // default to medium impact when called with no arguments
  const resolvedInput = input ?? defaultPatterns.medium
  const vibrations = normalizeInput(resolvedInput)
  if (!vibrations || vibrations.length === 0) return

  const defaultIntensity = Math.max(0, Math.min(1, options?.intensity ?? 0.5))

  for (const vib of vibrations) {
    if (vib.duration > MAX_PHASE_MS) vib.duration = MAX_PHASE_MS
    if (!Number.isFinite(vib.duration) || vib.duration < 0) return
    if (vib.delay !== undefined && (!Number.isFinite(vib.delay) || vib.delay < 0)) return
  }

  // Android/Chrome: use Vibration API directly
  if (vibrateSupported) {
    navigator.vibrate(toVibratePattern(vibrations, defaultIntensity))
    return
  }

  // iOS: use hidden switch checkbox toggle to trigger Taptic Engine
  ensureDOM()
  if (!hapticLabel) return

  stopPattern()

  const firstDelay = vibrations[0]?.delay ?? 0
  const firstClickFired = firstDelay === 0

  // fire first click synchronously to stay within user gesture context
  if (firstClickFired) {
    hapticLabel.click()
  }

  runPattern(vibrations, defaultIntensity, firstClickFired)
}

/** cancel any in-progress vibration. */
function cancel() {
  stopPattern()
  if (vibrateSupported) navigator.vibrate(0)
}

export { trigger, cancel, defaultPatterns, isSupported }

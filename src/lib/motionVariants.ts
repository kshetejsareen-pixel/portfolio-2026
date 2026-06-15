export const EASE = [0.22, 1, 0.36, 1] as const

export const LIFT = {
  initial:  { opacity: 0, y: 22 },
  visible:  { opacity: 1, y: 0  },
}

// Transition with optional delay
export const tx = (delay = 0) => ({ duration: 0.65, ease: EASE, delay })

export const EASE = [0.22, 1, 0.36, 1] as const
export const HIDDEN = { opacity: 0, y: 20 } as const
export const VISIBLE = { opacity: 1, y: 0 } as const

// transition with optional delay
export const tx = (delay = 0) => ({ duration: 0.55, ease: EASE, delay })

// Shared ease and base transition
export const EASE = [0.22, 1, 0.36, 1] as const

// Inline-spread props for on-mount fade-up (hero elements)
export function mountReveal(delay = 0) {
  return {
    initial:    { opacity: 0, y: 22 },
    animate:    { opacity: 1, y: 0 },
    transition: { duration: 0.65, ease: EASE, delay },
  } as const
}

// Inline-spread props for scroll-triggered fade-up
export function scrollReveal(delay = 0, amount = 0.1) {
  return {
    initial:    { opacity: 0, y: 22 },
    whileInView: { opacity: 1, y: 0 },
    viewport:   { once: true, amount },
    transition: { duration: 0.65, ease: EASE, delay },
  } as const
}

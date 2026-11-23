// Per-frame values shared between scene components without React re-renders.
export const sim = {
  shower: 0, // 0..1 current rain intensity
  overcast: 0, // 0..1 sky blend
  interacting: false,
  lastInteract: 0,
}

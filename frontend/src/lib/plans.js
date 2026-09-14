// Predefined workout plans. Add a new plan by appending to PLANS[].
// Each plan: { id, name, emoji, desc, exCount, dayCount, dayLabels, routines(), customExercises() }
// dayLabels maps week-day indices to display labels (optional).
import { starterRoutines } from './starter.js'
import { fullBodyRoutines, CUSTOM_EXERCISES as FULLBODY_CX } from './starter-fullbody.js'
import { fav1Routines } from './starter-fav1.js'

export const PLANS = [
  {
    id: 'ppl',
    name: 'Push / Pull / Legs',
    emoji: '🏋️',
    desc: '3-day upper/lower split. Push, pull, and leg days with progressive overload.',
    exCount: 16, dayCount: 3,
    dayLabels: { 1: 'Push', 3: 'Pull', 5: 'Legs' },
    routines: starterRoutines,
    customExercises: () => [],
  },
  {
    id: 'fullbody',
    name: 'Full Body',
    emoji: '💪',
    desc: '3-day full body. Compound movements with rest times per exercise.',
    exCount: 20, dayCount: 3,
    dayLabels: { 1: 'Día 1', 3: 'Día 2', 5: 'Día 3' },
    routines: fullBodyRoutines,
    customExercises: () => FULLBODY_CX,
  },
  {
    id: 'fav1',
    name: 'Rutina fav 1',
    emoji: '💪',
    desc: '3-day split: Superior, Inferior, Full body.',
    exCount: 23, dayCount: 3,
    dayLabels: { 1: 'Superior', 3: 'Inferior', 5: 'Full' },
    routines: fav1Routines,
    customExercises: () => [],
  },
]

export const planById = id => PLANS.find(p => p.id === id)

// Flat library of every predefined routine, one entry per routine (not per plan),
// so users can load them individually instead of all-or-nothing per plan.
export const ROUTINE_LIBRARY = () => PLANS.flatMap(p => {
  const customs = p.customExercises()
  return p.routines().map(r => ({ ...r, plan: p, customs }))
})

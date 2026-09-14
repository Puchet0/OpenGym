// 3-day Routine fav 1 — Superior / Inferior / Full Body
// Exercise IDs from the wger-based catalog.
// [name, emoji, [[exerciseId, sets, reps], ...]]
import { uid } from './format.js'

const SPEC = [
  ['Favorito de la comunidad · Superior', '🏋️', [
    ['0314', 3, 10],  // dumbbell incline bench press
    ['1350', 3, 10],  // lever seated row
    ['0579', 3, 10],  // lever front pulldown
    ['0576', 3, 10],  // lever chest press
    ['0178', 3, 12],  // cable lateral raise
    ['0190', 3, 10],  // cable one arm curl
    ['0194', 3, 10],  // cable overhead triceps extension (rope attachment)
    ['0602', 3, 12],  // lever seated reverse fly
  ]],
  ['Favorito de la comunidad · Inferior', '🦵', [
    ['0743', 3, 8],   // sled hack squat
    ['0085', 3, 10],  // barbell romanian deadlift
    ['0099', 3, 10],  // barbell single leg split squat
    ['0599', 3, 10],  // lever seated leg curl
    ['0585', 3, 12],  // lever leg extension
    ['1372', 3, 15],  // barbell standing calf raise
    ['0175', 3, 12],  // cable kneeling crunch
  ]],
  ['Favorito de la comunidad · Full', '💪', [
    ['0739', 3, 10],  // sled 45° leg press
    ['0651', 3, 8],   // pull up (neutral grip)
    ['0576', 3, 10],  // lever chest press
    ['1350', 3, 10],  // lever seated row
    ['0599', 3, 10],  // lever seated leg curl
    ['0178', 3, 12],  // cable lateral raise
    ['0070', 3, 10],  // barbell preacher curl
    ['0201', 3, 12],  // cable pushdown
  ]]
]

export const fav1Routines = () =>
  SPEC.map(([name, emoji, list]) => ({ id: uid(), name, emoji, ex: list.map(([id, sets, reps]) => ({ id, sets, reps, weight: 0 })) }))

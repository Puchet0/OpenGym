// 3-day Full Body routine — predefined plan for all users.
// Exercise IDs from the wger-based catalog + 3 custom exercises (no GIF in DB).
// Rest times are per-exercise (seconds). The global restSec setting is the timer
// default; these values override it when the plan is loaded.
import { uid } from './format.js'

// Custom exercises not in the built-in catalog.
// Each needs at minimum { id, n, bp }. GIF won't display for these.
export const CUSTOM_EXERCISES = [
  { id: 'C001', n: 'barbell hip thrust', bp: 'upper legs', eq: 'barbell', tg: 'glutes',
    sm: ['hamstrings'], st: ['Sit on the floor with your upper back against a bench.', 'Roll a barbell over your hips (use a pad).', 'Drive your hips up until your body forms a straight line from shoulders to knees.', 'Squeeze your glutes at the top, then lower with control.'] },
  { id: 'C002', n: 'cable face pull', bp: 'shoulders', eq: 'cable', tg: 'rear deltoids',
    sm: ['rhomboids', 'rotator cuff'], st: ['Set a cable pulley to face height with a rope attachment.', 'Grip the rope with both hands, step back to create tension.', 'Pull the rope toward your face, spreading your hands apart at the end.', 'Squeeze your rear delts and upper back, then return with control.'] },
  { id: 'C003', n: 'crunch', bp: 'waist', eq: 'body weight', tg: 'abs',
    sm: ['obliques'], st: ['Lie on your back with knees bent and feet flat.', 'Place your hands behind your head or across your chest.', 'Engage your abs and lift your shoulder blades off the floor.', 'Pause at the top, then lower with control.'] },
]

// [name, emoji, [[exerciseId, sets, reps, restSeconds], ...]]
const SPEC = [
  ['Semana 1 · Día 1', '🏋️', [
    ['1436',  3, 6,  240],  // Sentadilla Trasera → barbell high bar squat
    ['0025',  3, 10, 180],  // Press Banca → barbell bench press
    ['0085',  3, 10, 180],  // Peso Muerto Rumano → barbell romanian deadlift
    ['2363',  3, 8,  120],  // Fondos en Paralelas → wide-grip chest dip on high parallel bars
    ['1372',  3, 10, 120],  // Elevación Gemelos de Pie → barbell standing calf raise
    ['1653',  3, 10, 90],   // Curl Bíceps Mancuerna → dumbbell bicep curl with stork stance
  ]],
  ['Semana 1 · Día 2', '💪', [
    ['0032',  3, 5,  240],  // Peso Muerto → barbell deadlift
    ['1457',  3, 8,  240],  // Press Militar → barbell standing wide military press
    ['1351',  3, 12, 150],  // Remo Barra T → lever t-bar reverse grip row
    ['0585',  3, 12, 90],   // Extensión Cuádriceps → lever leg extension
    ['0188',  3, 12, 90],   // Aperturas Polea → cable middle fly
    ['C003',  3, 12, 60],   // Crunch Abdominal → crunch (custom, body weight)
    ['0351',  3, 12, 90],   // Skull Crusher Mancuerna → dumbbell lying triceps extension
  ]],
  ['Semana 1 · Día 3', '🔥', [
    ['0336',  3, 10, 150],  // Zancada Mancuerna → dumbbell lunge
    ['0314',  3, 8,  150],  // Press Inclinado Mancuernas → dumbbell incline bench press
    ['0245',  3, 10, 150],  // Jalon Polea Supino → cable underhand pulldown
    ['C001',  3, 12, 150],  // Hip Thrust → barbell hip thrust (custom)
    ['C002',  3, 12, 90],   // Facepull Sentado → cable face pull (custom)
    ['0334',  3, 10, 90],   // Elevación Lateral → dumbbell lateral raise
    ['0586',  3, 10, 90],   // Curl Femoral → lever lying leg curl
  ]],
]

// Fresh routine objects (new ids) — [día1, día2, día3].
export const fullBodyRoutines = () =>
  SPEC.map(([name, emoji, list]) => ({
    id: uid(),
    name,
    emoji,
    ex: list.map(([id, sets, reps, rest]) => ({
      id,
      sets,
      reps,
      weight: 0,
      ...(rest ? { rest } : {}),
    })),
  }))

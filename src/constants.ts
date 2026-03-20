import type { Mood } from './types';

export const MOODS: ReadonlyArray<Mood> = [
  { score: 1, label: 'Terrible', emoji: '😞' },
  { score: 3, label: 'Low', emoji: '😕' },
  { score: 5, label: 'Okay', emoji: '😐' },
  { score: 7, label: 'Good', emoji: '🙂' },
  { score: 9, label: 'Great', emoji: '😄' },
  { score: 10, label: 'Euphoric', emoji: '🤩' },
];

export const ANXIETY_LABELS: ReadonlyArray<string> = [
  'Calm',
  'Mild',
  'Moderate',
  'Notable',
  'High',
  'Elevated',
  'Strong',
  'Intense',
  'Severe',
];

export const PRESETS: ReadonlyArray<string> = [
  'Nicotine',
  'Cannabis',
  'Caffeine',
  'Alcohol',
];

export const STORAGE_KEY = 'inner_log_v1';

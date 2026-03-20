export interface Mood {
  readonly score: number
  readonly label: string
  readonly emoji: string
}

export interface SubstanceEntry {
  readonly amount: string
  readonly unit: string
}

export interface Entry {
  readonly id: number
  readonly ts: number
  readonly mood: number
  readonly moodLabel: string
  readonly moodEmoji: string
  readonly anxiety: number
  readonly sleepH: number
  readonly sleepQ: number
  readonly substances: Readonly<Record<string, SubstanceEntry>>
  readonly note: string
}

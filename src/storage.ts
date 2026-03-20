import type { Entry } from './types'
import { STORAGE_KEY } from './constants'

export const loadEntries = (): ReadonlyArray<Entry> => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Entry[]
  } catch {
    return []
  }
}

export const saveEntries = (entries: ReadonlyArray<Entry>): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

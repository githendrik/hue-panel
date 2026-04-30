/**
 * Vacation timer storage utilities.
 *
 * Timers are persisted in Nitro's file-system storage under the key hue:timers.
 * Each timer specifies:
 *   - which lights / groups to control
 *   - a daily on-time and off-time (HH:mm, 24h)
 *   - active days of the week (0=Sun … 6=Sat)
 *   - enabled flag
 */

import { useStorage } from '#imports'

export interface VacationTimer {
  id: string
  name: string
  /** Light resource IDs (Hue API v2 /resource/light ids) */
  lightIds: string[]
  /** Group resource IDs (Hue API v2 /resource/room or /resource/zone ids) */
  groupIds: string[]
  onTime: string   // "HH:mm"
  offTime: string  // "HH:mm"
  /** 0=Sun, 1=Mon … 6=Sat */
  days: number[]
  enabled: boolean
  /** Optional ±minutes random offset to make lighting look natural */
  randomOffsetMinutes: number
}

export async function getTimers(): Promise<VacationTimer[]> {
  const storage = useStorage('fs')
  return (await storage.getItem<VacationTimer[]>('hue:timers')) ?? []
}

export async function saveTimers(timers: VacationTimer[]): Promise<void> {
  const storage = useStorage('fs')
  await storage.setItem('hue:timers', timers)
}

/** Apply a random ±offset to a HH:mm string, returns new HH:mm */
function applyOffset(hhmm: string, maxMinutes: number): string {
  if (maxMinutes === 0) return hhmm
  const [h, m] = hhmm.split(':').map(Number)
  const offset = Math.floor(Math.random() * maxMinutes * 2) - maxMinutes
  const total = ((h * 60 + m + offset) % 1440 + 1440) % 1440
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export async function upsertTimer(timer: VacationTimer): Promise<void> {
  const timers = await getTimers()
  // Bake the random offset into the stored on/off times so tick.ts
  // can do a plain string compare each minute with no runtime randomness.
  const stored: VacationTimer = {
    ...timer,
    onTime: applyOffset(timer.onTime, timer.randomOffsetMinutes),
    offTime: applyOffset(timer.offTime, timer.randomOffsetMinutes),
  }
  const idx = timers.findIndex(t => t.id === timer.id)
  if (idx >= 0) timers[idx] = stored
  else timers.push(stored)
  await saveTimers(timers)
}

export async function deleteTimer(id: string): Promise<void> {
  const timers = await getTimers()
  await saveTimers(timers.filter(t => t.id !== id))
}

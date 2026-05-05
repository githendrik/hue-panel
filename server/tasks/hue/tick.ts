/**
 * Nitro scheduled task: hue:tick
 * Runs every minute (registered in nuxt.config.ts scheduledTasks).
 *
 * Checks all enabled vacation timers against the current time and
 * turns lights on/off when the HH:mm matches (with optional random offset
 * baked in at save time — see timers.ts appliedOffset).
 */

import { getTimers } from '~/server/utils/timers'
import { getBridgeConfig } from '~/server/utils/hue'
import { insecureFetch } from '~/server/utils/fetch'

async function toggleLights(lightIds: string[], groupIds: string[], on: boolean, bridgeIp: string, apiKey: string) {
  const body = JSON.stringify({ on: { on } })
  const headers = {
    'hue-application-key': apiKey,
    'Content-Type': 'application/json',
  }

  await Promise.all([
    ...lightIds.map(id =>
      insecureFetch(`https://${bridgeIp}/clip/v2/resource/light/${id}`, {
        method: 'PUT', headers, body,
      }).catch(console.error)
    ),
    ...groupIds.map(id =>
      insecureFetch(`https://${bridgeIp}/clip/v2/resource/grouped_light/${id}`, {
        method: 'PUT', headers, body,
      }).catch(console.error)
    ),
  ])
}

export default defineTask({
  meta: {
    name: 'hue:tick',
    description: 'Check vacation timers and toggle lights',
  },
  async run() {
    const config = await getBridgeConfig()
    if (!config) return { result: 'bridge not configured' }

    const timers = await getTimers()
    const enabled = timers.filter(t => t.enabled)
    if (enabled.length === 0) return { result: 'no active timers' }

    const now = new Date()
    const currentDay = now.getDay()           // 0=Sun … 6=Sat
    const currentHHmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const today = now.toISOString().split('T')[0] // "YYYY-MM-DD"

    const fired: string[] = []

    for (const timer of enabled) {
      if (!timer.days.includes(currentDay)) continue

      if (timer.startDate && today < timer.startDate) continue
      if (timer.endDate && today > timer.endDate) continue

      if (timer.onTime === currentHHmm) {
        await toggleLights(timer.lightIds, timer.groupIds, true, config.ip, config.apiKey)
        fired.push(`${timer.name} ON`)
      } else if (timer.offTime === currentHHmm) {
        await toggleLights(timer.lightIds, timer.groupIds, false, config.ip, config.apiKey)
        fired.push(`${timer.name} OFF`)
      }
    }

    console.log(`[hue:tick] ${currentHHmm} — ${fired.length ? fired.join(', ') : 'nothing to fire'}`)
    return { result: fired.length ? fired.join(', ') : 'nothing to fire' }
  },
})

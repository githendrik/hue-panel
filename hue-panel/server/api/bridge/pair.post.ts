// POST /api/bridge/pair
// Body: { ip: string }
// User must press the bridge link button first.
import { pairBridge, saveBridgeConfig } from '~/server/utils/hue'

export default defineEventHandler(async (event) => {
  const { ip } = await readBody<{ ip: string }>(event)
  if (!ip) throw createError({ statusCode: 400, message: 'ip is required' })

  const apiKey = await pairBridge(ip.trim())
  await saveBridgeConfig({ ip: ip.trim(), apiKey })
  return { ok: true, ip: ip.trim() }
})

// GET /api/bridge  — return current config (ip only, never expose the key)
import { getBridgeConfig } from '~/server/utils/hue'

export default defineEventHandler(async () => {
  const config = await getBridgeConfig()
  if (!config) return { configured: false }
  return { configured: true, ip: config.ip }
})

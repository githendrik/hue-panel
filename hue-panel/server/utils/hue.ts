/**
 * Hue Bridge HTTP client using the local REST API v2.
 *
 * All requests go to  https://<bridge_ip>/clip/v2/...
 * The bridge uses a self-signed TLS cert — handled by insecureFetch.
 *
 * Auth: "hue-application-key" header (obtained via /api pairing endpoint v1).
 */

import { useStorage } from '#imports'
import { insecureFetch } from './fetch'

export interface BridgeConfig {
  ip: string
  apiKey: string
}

export async function getBridgeConfig(): Promise<BridgeConfig | null> {
  const storage = useStorage('fs')
  const config = await storage.getItem<BridgeConfig>('hue:bridge')
  return config ?? null
}

export async function saveBridgeConfig(config: BridgeConfig): Promise<void> {
  const storage = useStorage('fs')
  await storage.setItem('hue:bridge', config)
}

export async function hueGet<T = unknown>(path: string): Promise<T> {
  const config = await getBridgeConfig()
  if (!config) throw createError({ statusCode: 503, message: 'Bridge not configured' })

  const res = await insecureFetch(`https://${config.ip}/clip/v2${path}`, {
    headers: { 'hue-application-key': config.apiKey },
  })
  if (!res.ok) throw createError({ statusCode: res.status, message: await res.text() })
  return res.json() as Promise<T>
}

export async function huePut<T = unknown>(path: string, body: unknown): Promise<T> {
  const config = await getBridgeConfig()
  if (!config) throw createError({ statusCode: 503, message: 'Bridge not configured' })

  const res = await insecureFetch(`https://${config.ip}/clip/v2${path}`, {
    method: 'PUT',
    headers: {
      'hue-application-key': config.apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw createError({ statusCode: res.status, message: await res.text() })
  return res.json() as Promise<T>
}

/**
 * Pair with the bridge using the legacy v1 endpoint.
 * The user must press the physical link button first.
 */
export async function pairBridge(ip: string, deviceType = 'hue-panel'): Promise<string> {
  const res = await insecureFetch(`https://${ip}/api`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ devicetype: deviceType, generateclientkey: true }),
  })
  const json = (await res.json()) as Array<{ success?: { username: string }; error?: { description: string } }>
  if (json[0]?.error) throw createError({ statusCode: 403, message: json[0].error.description })
  if (!json[0]?.success?.username) throw createError({ statusCode: 500, message: 'Unexpected bridge response' })
  return json[0].success.username
}

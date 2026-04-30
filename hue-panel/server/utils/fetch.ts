/**
 * Fetch wrapper that skips TLS verification for local HTTPS calls to the
 * Hue bridge (which uses a self-signed certificate).
 *
 * Node's built-in fetch (undici under the hood) does NOT accept the legacy
 * `agent` option — we must use the undici `Agent` via `setGlobalDispatcher`
 * or pass it per-request through the internal dispatcher symbol.
 *
 * The cleanest portable approach: use node:https.request directly and wrap
 * the response in a fetch-compatible interface.
 */

import https from 'node:https'
import http from 'node:http'

const insecureAgent = new https.Agent({ rejectUnauthorized: false })

export function insecureFetch(
  url: string,
  options: {
    method?: string
    headers?: Record<string, string>
    body?: string
    timeoutMs?: number
  } = {}
): Promise<{ ok: boolean; status: number; text: () => Promise<string>; json: () => Promise<unknown> }> {
  return new Promise((resolve, reject) => {
    const { method = 'GET', headers = {}, body, timeoutMs = 5000 } = options
    const parsed = new URL(url)
    const isHttps = parsed.protocol === 'https:'

    const reqOptions: https.RequestOptions = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method,
      headers: {
        ...headers,
        ...(body ? { 'Content-Length': Buffer.byteLength(body).toString() } : {}),
      },
      agent: isHttps ? insecureAgent : undefined,
      timeout: timeoutMs,
    }

    const requester = isHttps ? https : http
    const req = requester.request(reqOptions, (res) => {
      const chunks: Buffer[] = []
      res.on('data', (chunk: Buffer) => chunks.push(chunk))
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf-8')
        const status = res.statusCode ?? 0
        resolve({
          ok: status >= 200 && status < 300,
          status,
          text: () => Promise.resolve(raw),
          json: () => Promise.resolve(JSON.parse(raw)),
        })
      })
    })

    req.on('timeout', () => {
      req.destroy()
      reject(new Error(`Request timed out: ${url}`))
    })

    req.on('error', reject)

    if (body) req.write(body)
    req.end()
  })
}

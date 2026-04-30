// GET /api/bridge/discover
// 1. Philips cloud (discovery.meethue.com)
// 2. mDNS multicast query for _hue._tcp.local
// 3. Probe common gateway IPs as last resort

import { insecureFetch } from '~/server/utils/fetch'

export default defineEventHandler(async () => {
  const results: { ip: string; id?: string; source: string }[] = []

  // ── 1. Philips cloud discovery ────────────────────────────────────────────
  try {
    const res = await fetch('https://discovery.meethue.com/', {
      signal: AbortSignal.timeout(4000),
    })
    if (res.ok) {
      const json = await res.json() as Array<{ internalipaddress: string; id?: string }>
      for (const entry of json) {
        if (entry.internalipaddress) {
          results.push({ ip: entry.internalipaddress, id: entry.id, source: 'cloud' })
        }
      }
    }
  } catch {
    // cloud unreachable — fall through
  }

  // ── 2. mDNS multicast ─────────────────────────────────────────────────────
  try {
    const mdnsIps = await queryMdns()
    for (const ip of mdnsIps) {
      if (!results.find(r => r.ip === ip)) {
        results.push({ ip, source: 'mdns' })
      }
    }
  } catch {
    // mDNS unavailable — ignore
  }

  // ── 3. Fallback: probe common gateway IPs ─────────────────────────────────
  if (results.length === 0) {
    const probed = await probeCommonIps()
    for (const ip of probed) {
      results.push({ ip, source: 'probe' })
    }
  }

  return results
})

// ── mDNS helper ──────────────────────────────────────────────────────────────
function queryMdns(): Promise<string[]> {
  return new Promise((resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const dgram = require('node:dgram')
    const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true })
    const found = new Set<string>()

    const MDNS_ADDR = '224.0.0.251'
    const MDNS_PORT = 5353

    // DNS PTR query for _hue._tcp.local
    const query = Buffer.from([
      0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x04, 0x5f, 0x68, 0x75, 0x65,             // _hue
      0x04, 0x5f, 0x74, 0x63, 0x70,             // _tcp
      0x05, 0x6c, 0x6f, 0x63, 0x61, 0x6c, 0x00, // local
      0x00, 0x0c, 0x00, 0x01,
    ])

    socket.on('message', (_msg: Buffer, rinfo: { address: string }) => {
      found.add(rinfo.address)
    })

    socket.on('error', () => {
      try { socket.close() } catch {}
      resolve([...found])
    })

    socket.bind(0, () => {
      try {
        socket.addMembership(MDNS_ADDR)
        socket.send(query, MDNS_PORT, MDNS_ADDR)
      } catch {
        socket.close()
        resolve([])
      }
    })

    setTimeout(() => {
      try { socket.close() } catch {}
      resolve([...found])
    }, 2000)
  })
}

// ── Common IP probe ───────────────────────────────────────────────────────────
async function probeCommonIps(): Promise<string[]> {
  const candidates = [
    '192.168.1.1', '192.168.0.1', '192.168.2.1',
    '10.0.0.1', '10.0.1.1',
  ]

  const results = await Promise.all(
    candidates.map(async (ip) => {
      try {
        const res = await insecureFetch(`https://${ip}/api/config`, { timeoutMs: 1500 })
        if (!res.ok) return null
        const json = await res.json() as { name?: string; modelid?: string }
        if (json.modelid?.startsWith('BSB') || json.name?.toLowerCase().includes('hue')) {
          return ip
        }
      } catch {
        return null
      }
      return null
    })
  )

  return results.filter(Boolean) as string[]
}
